import fs from 'node:fs';
import path from 'node:path';
import pkg from '../package.json' with { type: 'json' };

for (const workspace of pkg.workspaces) {
    const changelogPath = path.join(import.meta.dirname, '..', workspace, 'CHANGELOG.md');
    if (!fs.existsSync(changelogPath)) continue;
    let changelog = fs.readFileSync(changelogPath, 'utf8');
    changelog = changelog
        .replace(/^### Major Changes/gm, '### 💥 Breaking Changes')
        .replace(/^### Minor Changes/gm, '### ✨ Features')
        .replace(/^### Patch Changes/gm, '### 🐛 Issues')
        // Remove empty sections
        .replace(/\n### ([^\n]+)\n\n###/g, '\n###');
    fs.writeFileSync(changelogPath, changelog);
}
