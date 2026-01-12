declare module '*.css' {
    import type { CSSResult } from 'lit';
    const cssText: CSSResult;
    export default cssText;
}

declare module '*.html' {
    const htmlText: string;
    export default htmlText;
}

declare module '*.svg' {
    const svgText: string;
    export default svgText;
}

interface CommandEventInit extends EventInit {
    command?: string;
    source?: Element | null;
}

/**
 * The **`CommandEvent`** interface represents an event notifying the user when a HTMLButtonElement element with valid HTMLButtonElement.commandForElement and HTMLButtonElement.command attributes is about to invoke an interactive element.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CommandEvent)
 */
interface CommandEvent extends Event {
    /**
     * The **`command`** read-only property of the CommandEvent interface returns a string containing the value of the HTMLButtonElement.command property at the time the event was dispatched.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CommandEvent/command)
     */
    readonly command: string;
    /**
     * The **`source`** read-only property of the CommandEvent interface returns an EventTarget representing the control that invoked the given command.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CommandEvent/source)
     */
    readonly source: Element | null;
}

declare var CommandEvent: {
    prototype: CommandEvent;
    new (type: string, eventInitDict?: CommandEventInit): CommandEvent;
};
