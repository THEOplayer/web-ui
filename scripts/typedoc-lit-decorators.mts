import * as typedoc from 'typedoc';
import { TypeScript as ts } from 'typedoc';

/**
 * Adds extra documentation tags from Lit decorators such as `@property()`
 */
export function load(app: typedoc.Application) {
    app.converter.on(typedoc.Converter.EVENT_CREATE_DECLARATION, onDeclaration);
    app.converter.on(typedoc.Converter.EVENT_CREATE_SIGNATURE, onSignature);
}

function onDeclaration(context: typedoc.Context, refl: typedoc.DeclarationReflection) {
    const symbol = context.project.getSymbolFromReflection(refl);
    if (!symbol) return;
    const declarations = symbol.declarations;
    if (!declarations) return;
    for (const declaration of declarations) {
        extractDecoratorInfo(context, refl, declaration);
    }
}

function onSignature(context: typedoc.Context, refl: typedoc.SignatureReflection) {
    const symbol = context.project.getSymbolFromReflection(refl.parent);
    if (!symbol) return;
    const declarations = symbol.declarations;
    if (!declarations) return;
    let declaration: ts.Declaration | undefined;
    switch (refl.kind) {
        case typedoc.ReflectionKind.GetSignature:
            declaration = declarations.find(ts.isGetAccessorDeclaration);
            break;
        case typedoc.ReflectionKind.SetSignature:
            declaration = declarations.find(ts.isSetAccessorDeclaration);
            break;
        case typedoc.ReflectionKind.IndexSignature:
            declaration = declarations.find(ts.isIndexSignatureDeclaration);
            break;
        case typedoc.ReflectionKind.CallSignature:
            declaration = declarations.find(ts.isCallSignatureDeclaration);
            break;
        case typedoc.ReflectionKind.ConstructorSignature:
            declaration = declarations.find(ts.isConstructSignatureDeclaration);
            break;
        default:
            return;
    }
    if (!declaration) return;
    extractDecoratorInfo(context, refl, declaration);
}

function extractDecoratorInfo(context: typedoc.Context, refl: typedoc.Reflection, declaration: ts.Declaration) {
    // Based on https://github.com/TypeStrong/typedoc/issues/2346#issuecomment-1656806051
    if (
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
            case 'property': {
                // Look for `attributeValue` in `@property({ attribute: attributeValue })`
                if (!ts.isObjectLiteralExpression(callArgument)) continue;
                const propertyAttribute = callArgument.properties.find(
                    (p): p is ts.PropertyAssignment => ts.isPropertyAssignment(p) && ts.isIdentifier(p.name) && p.name.text === 'attribute'
                );
                if (!propertyAttribute) continue;
                const attributeValue = propertyAttribute.initializer;
                if (ts.isLiteralTypeLiteral(attributeValue)) {
                    // e.g. `@property({ attribute: false })`
                    continue;
                }
                const comment = (refl.comment ??= new typedoc.Comment([]));
                comment.blockTags.push(new typedoc.CommentTag(`@attribute`, [{ kind: 'inline-tag', tag: '@link', text: attributeValue.getText() }]));
                break;
            }
        }
    }
}
