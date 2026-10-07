/**
 * @typedef {{ number: number, repository: string, url: string }} Issue
 * @typedef {{ number: number, url: string, repository: { nameWithOwner: string } }} PullRequestIssue
 * @typedef {{ number: number, url: string, mergedAt: string | null, closingIssuesReferences: { nodes: PullRequestIssue[] } }} PullRequest
 */

const pullRequestFields = `fragment PullRequestFields on PullRequest {
    number
    url
    mergedAt
    closingIssuesReferences(first: 20) {
        nodes {
            number
            url
            repository {
                nameWithOwner
            }
        }
    }
}`;

/**
 * Parses a comma- or whitespace-separated list of issue references (`#123` or `owner/repo#123`).
 * @param {string} text
 * @param {string} repo
 * @returns {Issue[]}
 */
function parseIssueReferences(text, repo) {
    return text
        .split(/[,\s]+/)
        .filter(Boolean)
        .map((issue) => {
            const match = issue.match(/^(?:([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+))?#(\d+)$/);
            if (!match) {
                throw new Error(`Invalid issue reference in changeset summary: ${issue}`);
            }
            return {
                number: Number(match[2]),
                repository: match[1] ?? repo,
                url: `https://github.com/${match[1] ?? repo}/issues/${match[2]}`
            };
        });
}

/**
 * Splits a changeset summary into lines, and extracts any `pr:` and `issue:` override lines.
 * @param {string} summary
 * @param {string} repo
 * @returns {{ lines: string[], pullRequestNumber: number | undefined, issues: Issue[] | undefined }}
 */
function parseSummary(summary, repo) {
    let pullRequestNumber;
    let issues;
    const lines = summary
        .split('\n')
        .filter((line) => {
            const pullRequestMatch = line.match(/^\s*(?:pr|pull|pull\s+request):\s*#?(\d+)\s*$/i);
            if (pullRequestMatch) {
                if (pullRequestNumber !== undefined) {
                    throw new Error('A changeset summary can contain at most one PR override.');
                }
                pullRequestNumber = Number(pullRequestMatch[1]);
                return false;
            }

            const issueMatch = line.match(/^\s*issues?:\s*(.+)$/i);
            if (issueMatch) {
                issues ??= [];
                issues.push(...parseIssueReferences(issueMatch[1], repo));
                return false;
            }

            return true;
        })
        .join('\n')
        .trim()
        .split('\n')
        .map((line) => line.trimEnd());

    return { lines, pullRequestNumber, issues };
}

/**
 * Sends a query to the GitHub GraphQL API, authenticated with `GITHUB_TOKEN`.
 * @param {string} query
 * @param {Record<string, string | number>} variables
 * @returns {Promise<any>}
 */
async function queryGitHub(query, variables) {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
        throw new Error('GITHUB_TOKEN is required to look up PRs and issues.');
    }

    const response = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query, variables })
    });
    const result = await response.json();
    if (result.errors) {
        throw new Error(JSON.stringify(result.errors));
    }
    if (!response.ok) {
        throw new Error(`GitHub GraphQL request failed with status ${response.status}.`);
    }
    return result.data;
}

/**
 * Looks up a pull request by its number.
 * @param {string} repo
 * @param {number} number
 * @returns {Promise<PullRequest | undefined>}
 */
async function getPullRequestByNumber(repo, number) {
    const [owner, name] = repo.split('/');
    const query = `query ($owner: String!, $name: String!, $number: Int!) {
        repository(owner: $owner, name: $name) {
            pullRequest(number: $number) {
                ...PullRequestFields
            }
        }
    }
    ${pullRequestFields}`;
    const data = await queryGitHub(query, { owner, name, number });
    return data.repository?.pullRequest ?? undefined;
}

/**
 * Looks up the pull request associated with a commit, preferring the earliest merged one.
 * @param {string} repo
 * @param {string} commit
 * @returns {Promise<PullRequest | undefined>}
 */
async function getPullRequestForCommit(repo, commit) {
    const [owner, name] = repo.split('/');
    const query = `query ($owner: String!, $name: String!, $sha: String!) {
        repository(owner: $owner, name: $name) {
            object(expression: $sha) {
                ... on Commit {
                    associatedPullRequests(first: 50) {
                        nodes {
                            ...PullRequestFields
                        }
                    }
                }
            }
        }
    }
    ${pullRequestFields}`;
    const data = await queryGitHub(query, { owner, name, sha: commit });
    const pullRequests = data.repository.object?.associatedPullRequests.nodes ?? [];
    pullRequests.sort((a, b) => {
        if (a.mergedAt === null) return b.mergedAt === null ? 0 : 1;
        if (b.mergedAt === null) return -1;
        return new Date(a.mergedAt) - new Date(b.mergedAt);
    });
    return pullRequests[0];
}

/**
 * Returns the issues that a pull request will close.
 * @param {PullRequest | undefined} pullRequest
 * @returns {Issue[]}
 */
function getIssues(pullRequest) {
    return (pullRequest?.closingIssuesReferences.nodes ?? []).map((issue) => ({
        number: issue.number,
        repository: issue.repository.nameWithOwner,
        url: issue.url
    }));
}

/**
 * Formats Markdown links to the given issues (without duplicates), followed by the pull request.
 * @param {Issue[]} issues
 * @param {PullRequest | undefined} pullRequest
 * @param {string} repo
 * @returns {string[]}
 */
function formatLinks(issues, pullRequest, repo) {
    const seenIssues = new Set();
    const uniqueIssues = issues.filter((issue) => {
        const key = `${issue.repository.toLowerCase()}#${issue.number}`;
        if (seenIssues.has(key)) return false;
        seenIssues.add(key);
        return true;
    });
    const links = uniqueIssues.map((issue) => {
        const issueLabel = issue.repository.toLowerCase() === repo.toLowerCase() ? `#${issue.number}` : `${issue.repository}#${issue.number}`;
        return `[${issueLabel}](${issue.url})`;
    });
    if (pullRequest) {
        links.push(`[#${pullRequest.number}](${pullRequest.url})`);
    }
    return links;
}

/**
 * Formats a changelog entry for a changeset, with links to its issues and pull request at the end.
 * @type {import('@changesets/types').GetReleaseLine}
 */
export async function getReleaseLine(changeset, type, changelogOpts) {
    const repo = changelogOpts.repo;
    const { lines, pullRequestNumber, issues: issueOverrides } = parseSummary(changeset.summary, repo);
    const pullRequest =
        pullRequestNumber !== undefined
            ? await getPullRequestByNumber(repo, pullRequestNumber)
            : changeset.commit
              ? await getPullRequestForCommit(repo, changeset.commit)
              : undefined;
    const links = formatLinks(issueOverrides ?? getIssues(pullRequest), pullRequest, repo);
    if (links.length > 0) {
        lines[lines.length - 1] += ` (${links.join(', ')})`;
    }

    const [firstLine, ...otherLines] = lines;
    let result = `- ${firstLine}`;
    if (otherLines.length > 0) {
        result += `\n${otherLines.map((line) => `  ${line}`).join('\n')}`;
    }

    return result;
}

/**
 * Formats a changelog entry for updated dependencies.
 * @type {import('@changesets/types').GetDependencyReleaseLine}
 */
export async function getDependencyReleaseLine(changesets, dependenciesUpdated, changelogOpts) {
    if (dependenciesUpdated.length === 0) return '';

    const updatedDependenciesList = dependenciesUpdated.map((dependency) => {
        if (dependency.name === '@theoplayer/web-ui') {
            const tagName = `${dependency.name}@${dependency.newVersion}`;
            const changelogUrl = `https://github.com/THEOplayer/web-ui/blob/${encodeURIComponent(tagName)}/CHANGELOG.md`;
            return `- See changes to [Open Video UI for Web v${dependency.newVersion}](${changelogUrl})`;
        } else {
            return `- Updated ${dependency.name} to version ${dependency.newVersion}`;
        }
    });
    return `\n### 📦 Dependency Updates\n\n${updatedDependenciesList.join('\n')}`;
}
