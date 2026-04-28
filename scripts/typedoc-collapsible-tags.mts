import { Application, type CommentDisplayPart, CommentTag, DefaultThemeRenderContext, i18n, JSX, translateTagName } from 'typedoc';
import htm from 'htm';

const html = htm.bind(JSX.createElement);

type CollapsibleTag = { tag: `@${string}`; heading: string; columnHeading: string };

const collapsibleTags: ReadonlyArray<CollapsibleTag> = [
    { tag: '@attribute', heading: 'Attributes', columnHeading: 'Attribute' },
    { tag: '@slot', heading: 'Slots', columnHeading: 'Slot' },
    { tag: '@cssproperty', heading: 'CSS Custom Properties', columnHeading: 'Property' }
];

/**
 * Render all `commentTags` as a single `<table>`.
 */
function commentTagTable(context: DefaultThemeRenderContext, tag: CollapsibleTag, commentTags: CommentTag[]) {
    const tagName = translateTagName(tag.tag);
    const anchor = context.slugger.slug(tagName);
    return html`<div class=${`tsd-tag-${tag.tag.substring(1)}`}>
        <h4 class="tsd-anchor-link" id="${anchor}">${tag.heading} ${anchorIcon(context, anchor)}</h4>
        <table>
            <thead>
                <tr>
                    <th>${tag.columnHeading}</th>
                    <th>Description</th>
                </tr>
            </thead>
            <tbody>
                ${commentTags.map((t) => {
                    const { name, description } = parseNamedRow(t.content);
                    return html`
                        <tr>
                            <td><${JSX.Raw} html=${context.markdown(name)} /></td>
                            <td><${JSX.Raw} html=${context.markdown(description)} /></td>
                        </tr>
                    `;
                })}
            </tbody>
        </table>
    </div>`;
}

// https://github.com/TypeStrong/typedoc/blob/v0.28.19/src/lib/output/themes/default/partials/anchor-icon.tsx
function anchorIcon(context: DefaultThemeRenderContext, anchor: string | undefined) {
    if (!anchor) return html``;
    return html`<a href=${`#${anchor}`} aria-label=${i18n.theme_permalink()} class="tsd-anchor-icon">${context.icons.anchor()}</a>`;
}

/**
 * Parses a block tag's content into a `name` and `description` pair, preserving the
 * original display parts (including inline tags) in each.
 */
function parseNamedRow(parts: ReadonlyArray<CommentDisplayPart>): {
    name: CommentDisplayPart[];
    description: CommentDisplayPart[];
} {
    const name: CommentDisplayPart[] = [];
    const description: CommentDisplayPart[] = [];
    let inDescription = false;
    for (const part of parts) {
        if (inDescription) {
            description.push(part);
            continue;
        }
        if (part.kind === 'text') {
            const match = part.text.match(/\s+-\s+/);
            if (match) {
                const { 0: matchedString, index: matchIndex } = match;
                const before = part.text.substring(0, matchIndex!);
                const after = part.text.substring(matchIndex! + matchedString.length);
                if (before) name.push({ kind: 'text', text: before });
                if (after) description.push({ kind: 'text', text: after });
                inDescription = true;
                continue;
            }
        }
        name.push(part);
    }
    return { name, description };
}

export function load(app: Application) {
    app.renderer.hooks.on('comment.afterTags', (context, comment, _props) => {
        const tables: JSX.Element[] = [];
        for (const tag of collapsibleTags) {
            const commentTags = comment.blockTags.filter((t) => t.tag === tag.tag);
            if (commentTags.length < 2) {
                // Keep single entries as-is for simplicity.
            } else {
                // Take over rendering for these tags.
                commentTags.forEach((t) => (t.skipRendering = true));
                // Render them all as a single table.
                tables.push(commentTagTable(context, tag, commentTags));
            }
        }
        return tables.length === 0
            ? JSX.createElement(JSX.Fragment, null)
            : JSX.createElement('div', { class: 'tsd-comment tsd-typography' }, tables);
    });
}
