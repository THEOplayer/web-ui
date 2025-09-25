import { html, type HTMLTemplateResult, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import gestureReceiverCss from './GestureReceiver.css';
import { stateReceiver } from './StateReceiverMixin';
import type { ChromelessPlayer } from 'theoplayer/chromeless';
import type { DeviceType } from '../util/DeviceType';

/**
 * An overlay that receives and handles gestures on the player.
 *
 * On desktop devices, this plays or pauses the player whenever it is clicked.
 * On mobile devices, this currently does nothing.
 *
 * @group Components
 */
@customElement('theoplayer-gesture-receiver')
@stateReceiver(['player', 'deviceType'])
export class GestureReceiver extends LitElement {
    static override styles = [gestureReceiverCss];

    private _player: ChromelessPlayer | undefined;
    private _playerElement: HTMLElement | undefined;
    private _pointerType: string = '';

    connectedCallback(): void {
        super.connectedCallback();

        this.setAttribute('tabindex', '-1');
        this.setAttribute('aria-hidden', 'true');
    }

    get player(): ChromelessPlayer | undefined {
        return this._player;
    }

    @property({ reflect: false, attribute: false })
    set player(player: ChromelessPlayer | undefined) {
        if (this._player === player) {
            return;
        }
        if (this._playerElement !== undefined) {
            this._playerElement.removeEventListener('pointerdown', this._onPointerDown);
            this._playerElement.removeEventListener('click', this._onClick);
        }
        this._player = player;
        this._playerElement = player?.element;
        if (this._playerElement !== undefined) {
            this._playerElement.addEventListener('pointerdown', this._onPointerDown);
            this._playerElement.addEventListener('click', this._onClick);
        }
    }

    @property({ reflect: false, attribute: false })
    accessor deviceType: DeviceType = 'desktop';

    private readonly _onPointerDown = (event: PointerEvent) => {
        this._pointerType = event.pointerType;
    };

    private readonly _onClick = (event: MouseEvent) => {
        // If the browser doesn't yet support `pointerType` on `click` events,
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
        if (this.deviceType !== 'desktop') return;
        // Toggle play/pause.
        if (this._player !== undefined) {
            if (this._player.source === undefined) {
                // Do nothing if the player has no source.
                return;
            }
            if (this._player.ads?.playing) {
                // Clicking during a linear ad should open the ad's clickthrough URL instead.
                return;
            }
            if (this._player.paused) {
                this._player.play();
            } else {
                this._player.pause();
            }
        }
    }

    protected override render(): HTMLTemplateResult {
        return html``;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'theoplayer-gesture-receiver': GestureReceiver;
    }
}
