import * as shadyCss from '@webcomponents/shadycss';

export function createTemplate(customElementName: string, contents: string): HTMLTemplateElement {
    const template = document.createElement('template');
    template.innerHTML = contents;
    shadyCss.prepareTemplate(template, customElementName);
    return template;
}
