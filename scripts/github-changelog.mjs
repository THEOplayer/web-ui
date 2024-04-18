import { readFileSync } from 'node:fs';
import path from 'node:path';

const { version, workspaces } = JSON.parse(readFileSync('package.json', 'utf-8'));

function getChangelog(dir) {
    const { name } = JSON.parse(readFileSync(path.join(dir, 'package.json'), 'utf-8'));
    const changelog = readFileSync(path.join(dir, 'CHANGELOG.md'), 'utf-8');
    const headingStart = '## ';
    // Find block with current version
    const block = changelog
        .split(headingStart)
        .find((block) => block.startsWith(`v${version}`))
        .trim();
    let lines = block.split('\n');
    // Replace title with package name
    lines[0] = `${headingStart}\`${name}\``;
    // Remove "See changes to Open Video UI for Web"
    lines = lines.filter((line) => !line.includes(`🏠 See changes`));
    return lines.join('\n');
}

const changelog = workspaces.map(getChangelog).join('\n\n');
console.log(changelog);
