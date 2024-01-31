import { readFileSync, writeFileSync } from 'node:fs';

const changelogPath = process.argv[2];
if (!changelogPath) {
    console.error('Missing required argument: changelogPath');
    process.exit(1);
}

const { version } = JSON.parse(readFileSync('package.json', 'utf-8'));

const now = new Date();
const year = String(now.getUTCFullYear());
const month = String(now.getUTCMonth() + 1).padStart(2, '0');
const day = String(now.getUTCDate()).padStart(2, '0');
const versionHeading = `## v${version} (${year}-${month}-${day})`;

const unreleasedRegex = /## Unreleased/;
const emptyChangelog = `
-   No changes
`.trim();
let changelog = readFileSync(changelogPath, 'utf-8');
if (unreleasedRegex.test(changelog)) {
    changelog = changelog.replace(unreleasedRegex, versionHeading);
} else {
    changelog = changelog.replace(/## v/, `${versionHeading}\n\n${emptyChangelog}\n\n## v`);
}
writeFileSync(changelogPath, changelog, 'utf-8');
