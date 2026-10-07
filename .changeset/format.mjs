/**
 * @type {import('@changesets/types').GetReleaseLine}
 */
export async function getReleaseLine(changeset, type, changelogOpts) {
    const repo = changelogOpts.repo;
    const [repoOwner, repoName] = repo.split('/');
    const issueOverrides = [];
    let hasIssueOverrides = false;
    let pullRequestOverride;
    const summary = changeset.summary
        .split('\n')
        .filter((line) => {
            const pullRequestMatch = line.match(/^\s*(?:pr|pull|pull\s+request):\s*#?(\d+)\s*$/i);
            if (pullRequestMatch) {
                if (pullRequestOverride !== undefined) {
                    throw new Error('A changeset summary can contain at most one PR override.');
                }
                pullRequestOverride = Number(pullRequestMatch[1]);
                return false;
            }

            const issueMatch = line.match(/^\s*issues?:\s*(.+)$/i);
            if (issueMatch) {
                hasIssueOverrides = true;
                for (const issue of issueMatch[1].split(/[,\s]+/).filter(Boolean)) {
                    const match = issue.match(/^(?:([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+))?#(\d+)$/);
                    if (!match) {
                        throw new Error(`Invalid issue reference in changeset summary: ${issue}`);
                    }
                    issueOverrides.push({
                        number: Number(match[2]),
                        repository: match[1] ?? repo,
                        url: `https://github.com/${match[1] ?? repo}/issues/${match[2]}`
                    });
                }
                return false;
            }

            return true;
        })
        .join('\n')
        .trim()
        .split('\n')
        .map((l) => l.trimEnd());

    let pullRequest;
    if (pullRequestOverride !== undefined || changeset.commit) {
        const token = process.env.GITHUB_TOKEN;
        if (!token) {
            throw new Error('GITHUB_TOKEN is required to look up PRs and issues.');
        }

        const query =
            pullRequestOverride !== undefined
                ? `query ($owner: String!, $name: String!, $number: Int!) {
                    repository(owner: $owner, name: $name) {
                        pullRequest(number: $number) {
                            number
                            url
                            closingIssuesReferences(first: 20) {
                                nodes {
                                    number
                                    url
                                    repository {
                                        nameWithOwner
                                    }
                                }
                            }
                        }
                    }
                }`
                : `query ($owner: String!, $name: String!, $sha: String!) {
                    repository(owner: $owner, name: $name) {
                        object(expression: $sha) {
                            ... on Commit {
                                associatedPullRequests(first: 50) {
                                    nodes {
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
                                    }
                                }
                            }
                        }
                    }
                }`;
        const variables =
            pullRequestOverride !== undefined
                ? { owner: repoOwner, name: repoName, number: pullRequestOverride }
                : { owner: repoOwner, name: repoName, sha: changeset.commit };
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

        if (pullRequestOverride !== undefined) {
            pullRequest = result.data.repository.pullRequest;
        } else {
            const pullRequests = result.data.repository.object?.associatedPullRequests.nodes ?? [];
            pullRequests.sort((a, b) => {
                if (a.mergedAt === null) return b.mergedAt === null ? 0 : 1;
                if (b.mergedAt === null) return -1;
                return new Date(a.mergedAt) - new Date(b.mergedAt);
            });
            pullRequest = pullRequests[0];
        }
    }

    const issues = hasIssueOverrides
        ? issueOverrides
        : (pullRequest?.closingIssuesReferences.nodes ?? []).map((issue) => ({
              number: issue.number,
              repository: issue.repository.nameWithOwner,
              url: issue.url
          }));
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

    if (links.length > 0) {
        summary[summary.length - 1] += ` (${links.join(', ')})`;
    }

    const [firstLine, ...otherLines] = summary;
    let result = `- ${firstLine}`;
    if (otherLines.length > 0) {
        result += `\n${otherLines.map((l) => `  ${l}`).join('\n')}`;
    }

    return result;
}

/**
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
