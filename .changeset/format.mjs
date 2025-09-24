/**
 * @type {import('@changesets/types').GetReleaseLine}
 */
export async function getReleaseLine(changeset, type, changelogOpts) {
    const [firstLine, ...otherLines] = changeset.summary
        .trim()
        .split('\n')
        .map((l) => l.trimEnd());

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
