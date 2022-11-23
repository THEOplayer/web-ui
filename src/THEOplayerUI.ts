import { html, LitElement, PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { createRef, Ref, ref } from 'lit/directives/ref.js';
import { ChromelessPlayer, SourceDescription } from 'theoplayer';
import elementCss from './THEOplayerUI.css';

@customElement('theoplayer-ui')
export class THEOplayerUI extends LitElement {
    static styles = elementCss;

    private playerContainerRef: Ref<HTMLElement> = createRef();
    player: ChromelessPlayer | undefined = undefined;

    @property({ type: String, attribute: 'library-location' })
    libraryLocation: string = '';

    @property({ type: String, attribute: 'license' })
    license: string | undefined;

    @property({ type: String, attribute: 'license-url' })
    licenseUrl: string | undefined;

    @property({ attribute: 'source', converter: convertSourceDescription })
    source: SourceDescription | undefined;

    override render() {
        return html`
            <div part="layer media-layer" ${ref(this.playerContainerRef)}></div>
            <div part="layer poster-layer">
                <slot name="poster"></slot>
            </div>
            <div part="layer vertical-layer">
                <div part="top chrome">
                    <slot name="top-chrome"></slot>
                </div>
                <div part="middle chrome">
                    <slot name="middle-chrome"></slot>
                </div>
                <div part="layer centered-layer center centered chrome">
                    <slot name="centered-chrome"></slot>
                </div>
                <div part="bottom chrome">
                    <slot><!-- default, effectively "bottom-chrome" --></slot>
                </div>
            </div>
        `;
    }

    protected override firstUpdated(changedProperties: PropertyValues): void {
        super.firstUpdated(changedProperties);
        this.player = new ChromelessPlayer(this.playerContainerRef.value!, {
            libraryLocation: this.libraryLocation,
            license: this.license,
            licenseUrl: this.licenseUrl
        });
    }

    protected override updated(changedProperties: PropertyValues): void {
        super.updated(changedProperties);
        if (this.player !== undefined) {
            if (changedProperties.has('source')) {
                this.player.source = this.source;
            }
        }
    }
}

function convertSourceDescription(source: string | null): SourceDescription | undefined {
    return source ? JSON.parse(source) : undefined;
}
