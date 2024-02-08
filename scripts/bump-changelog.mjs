import { readFileSync, writeFileSync } from 'node:fs';

const projectName = process.argv[2];
if (!projectName) {
    console.error('Missing required argument: projectName');
    process.exit(1);
}
const changelogPath = process.argv[3];
if (!changelogPath) {
    console.error('Missing required argument: changelogPath');
    process.exit(1);
}

const { version } = JSON.parse(readFileSync('package.json', 'utf-8'));

const now = new Date();
const year = String(now.getUTCFullYear());
const month = String(now.getUTCMonth() + 1).padStart(2, '0');
const day = String(now.getUTCDate()).padStart(2, '0');

let changelog = readFileSync(changelogPath, 'utf-8');
const headingStart = '\n\n## ';
const blocks = changelog.split(headingStart);

// Find "Unreleased" block, or create a new one
let newBlockIndex = blocks.findIndex((block) => block.startsWith('Unreleased'));
let newBlock;
if (newBlockIndex >= 0) {
    newBlock = blocks[newBlockIndex].trim();
} else {
    if (projectName === 'web-ui') {
        newBlock = `Unreleased\n\n-   No changes`;
    } else {
        newBlock = `Unreleased\n`;
    }
    newBlockIndex = 1;
    blocks.splice(newBlockIndex, 0, newBlock);
}

// Replace "Unreleased" with actual version number and release date
newBlock = newBlock.replace(/^Unreleased/, `v${version} (${year}-${month}-${day})`);

// Append "See Web UI" entry for other packages
const seeWebUiChangelog = `
-   🏠 See changes to [Open Video UI for Web v${version}](https://github.com/THEOplayer/web-ui/blob/v${version}/CHANGELOG.md)
`.trim();
if (projectName !== 'web-ui') {
    newBlock = `${newBlock}\n${seeWebUiChangelog}`;
}

blocks[newBlockIndex] = newBlock;
const newChangelog = blocks.join(headingStart).trimEnd() + '\n';
writeFileSync(changelogPath, newChangelog, 'utf-8');
