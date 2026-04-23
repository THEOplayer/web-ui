import * as typedoc from 'typedoc';
import { TypeScript as ts } from 'typedoc';

/**
 * Adds extra documentation tags from Lit decorators such as `@property()`
 */
export function load(app: typedoc.Application) {
    app.converter.on(typedoc.Converter.EVENT_CREATE_DECLARATION, onDeclaration);
}

function onDeclaration(context: typedoc.Context, refl: typedoc.DeclarationReflection) {
    const symbol = context.getSymbolFromReflection(refl);
    if (!symbol) return;
    const declarations = symbol.declarations;
    if (!declarations) return;
    for (const declaration of declarations) {
        extractDecoratorInfo(context, refl, declaration);
    }
}

function extractDecoratorInfo(context: typedoc.Context, refl: typedoc.Reflection, declaration: ts.Declaration) {
    // Based on https://github.com/TypeStrong/typedoc/issues/2346#issuecomment-1656806051
    if (
        !ts.isClassDeclaration(declaration) &&
        !ts.isPropertyDeclaration(declaration) &&
        !ts.isMethodDeclaration(declaration) &&
        !ts.isGetAccessorDeclaration(declaration) &&
        !ts.isSetAccessorDeclaration(declaration)
    ) {
        return;
    }

    const decorators = declaration.modifiers?.filter(ts.isDecorator);
    if (!decorators) return;

    for (const decorator of decorators) {
        // Look for `@decoratorName()`
        const callExpression = decorator.expression;
        if (!ts.isCallExpression(callExpression)) continue;
        const callIdentifier = callExpression.expression;
        const callArgument = callExpression.arguments[0];
        if (!ts.isIdentifier(callIdentifier)) continue;
        const decoratorName = callIdentifier.text;
        switch (decoratorName) {
            case 'customElement': {
                // Look for `tagName` in `@customElement(tagName)`
                if (!ts.isLiteralExpression(callArgument)) continue;
                const tagName = callArgument.text;
                const comment = (refl.comment ??= new typedoc.Comment([]));
                comment.blockTags.unshift(new typedoc.CommentTag(`@customElement`, [{ kind: 'code', text: `\`<${tagName}>\`` }]));
                comment.blockTags.unshift(new typedoc.CommentTag(`@group`, [{ kind: 'text', text: 'Components' }]));
                break;
            }
            case 'property': {
                // Look for `attributeName` in `@property({ attribute: attributeName })`
                if (!ts.isObjectLiteralExpression(callArgument)) continue;
                const propertyAttribute = callArgument.properties.find(
                    (p): p is ts.PropertyAssignment => ts.isPropertyAssignment(p) && ts.isIdentifier(p.name) && p.name.text === 'attribute'
                );
                if (!propertyAttribute) continue;
                const attributeInitializer = propertyAttribute.initializer;
                let attributeNamePart: typedoc.CommentDisplayPart;
                if (ts.isLiteralTypeLiteral(attributeInitializer)) {
                    if (ts.isStringLiteral(attributeInitializer)) {
                        // e.g. `@property({ attribute: "fluid" })`
                        const attributeName = attributeInitializer.text;
                        attributeNamePart = { kind: 'text', text: `\`${attributeName}\`` };
                    } else if (attributeInitializer.kind === ts.SyntaxKind.FalseKeyword) {
                        // e.g. `@property({ attribute: false })`
                        continue;
                    } else {
                        console.warn(`Unexpected attribute in @property: ${attributeInitializer.getText()}`);
                        continue;
                    }
                } else if (ts.isPropertyAccessExpression(attributeInitializer)) {
                    // e.g. `@property({ attribute: Attribute.FLUID })`
                    const attributeLink = attributeInitializer.getText();
                    const attributeName = attributeInitializer.name.text.toLowerCase().replace(/_/g, '-');
                    attributeNamePart = { kind: 'inline-tag', tag: '@link', text: `${attributeLink} | \`${attributeName}\`` };
                } else {
                    console.warn(`Unexpected attribute in @property: ${attributeInitializer.getText()}`);
                    continue;
                }
                const comment = (refl.comment ??= new typedoc.Comment([]));
                comment.blockTags.unshift(new typedoc.CommentTag(`@attribute`, [attributeNamePart]));
                break;
            }
        }
    }
}
