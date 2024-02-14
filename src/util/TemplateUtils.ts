import * as shadyCss from '@webcomponents/shadycss';

export function createTemplate(customElementName: string, contents: string): () => HTMLTemplateElement {
    let template: HTMLTemplateElement | undefined;
    return () => {
        if (template === undefined) {
            template = document.createElement('template');
            template.innerHTML = contents;
            contents = undefined!;
            shadyCss.prepareTemplate(template, customElementName);
        }
        return template;
    };
}
