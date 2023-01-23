import * as shadyCss from '@webcomponents/shadycss';
import gestureReceiverCss from './GestureReceiver.css';
import { StateReceiverMixin } from './StateReceiverMixin';
import type { ChromelessPlayer } from 'theoplayer';

const template = document.createElement('template');
template.innerHTML = `<style>${gestureReceiverCss}</style>`;
shadyCss.prepareTemplate(template, 'theoplayer-gesture-receiver');

export class GestureReceiver extends StateReceiverMixin(HTMLElement, ['player']) {
    private _player: ChromelessPlayer | undefined;
    private _pointerType: string = '';

    constructor() {
        super();
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(template.content.cloneNode(true));
    }

    connectedCallback(): void {
        shadyCss.styleElement(this);

        this._upgradeProperty('player');

        this.setAttribute('tabindex', '-1');
        this.setAttribute('aria-hidden', 'true');
    }

    protected _upgradeProperty(prop: keyof this) {
        if (this.hasOwnProperty(prop)) {
            let value = this[prop];
            delete this[prop];
            this[prop] = value;
        }
    }

    get player(): ChromelessPlayer | undefined {
        return this._player;
    }

    set player(player: ChromelessPlayer | undefined) {
        if (this._player === player) {
            return;
        }
        if (this._player !== undefined) {
            this._player.element.removeEventListener('pointerdown', this._onPointerDown);
            this._player.element.removeEventListener('click', this._onClick);
        }
        this._player = player;
        if (this._player !== undefined) {
            this._player.element.addEventListener('pointerdown', this._onPointerDown);
            this._player.element.addEventListener('click', this._onClick);
        }
    }

    setPlayer(player: ChromelessPlayer | undefined): void {
        this.player = player;
    }

    private readonly _onPointerDown = (event: PointerEvent) => {
        this._pointerType = event.pointerType;
    };

    private readonly _onClick = (event: MouseEvent) => {
        // If the browser doesn't support yet `pointerType` on `click` events,
        // we use the type from the previous `pointerdown` event.
        const pointerType = (event as PointerEvent).pointerType ?? this._pointerType;
        if (pointerType === 'touch') {
            this.handleTap(event);
        } else if (pointerType === 'mouse') {
            this.handleMouseClick(event);
        }
    };

    handleTap(_event: MouseEvent): void {
        // Do nothing.
    }

    handleMouseClick(_event: MouseEvent): void {
        // Toggle play/pause.
        if (this._player !== undefined) {
            if (this._player.paused) {
                this._player.play();
            } else {
                this._player.pause();
            }
        }
    }
}

customElements.define('theoplayer-gesture-receiver', GestureReceiver);
