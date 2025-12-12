import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import * as React from 'react';
import { renderToString } from 'react-dom/server';

describe('Server-side rendering (SSR)', () => {
    it('can load @theoplayer/react-ui inside Node', async () => {
        const { DefaultUI } = await import('@theoplayer/react-ui');
        assert.notEqual(DefaultUI, undefined);
    });

    it('can render <DefaultUI> to string', async () => {
        const { DefaultUI, PlayButton, MuteButton, TimeRange } = await import('@theoplayer/react-ui');
        const actual = renderToString(
            React.createElement(DefaultUI, {
                // Properties are ignored during SSR
                configuration: { libraryLocation: 'foo', license: 'bar' },
                onReady: () => console.log('ready!'),
                // Slots are inserted as elements
                topControlBar: React.createElement(PlayButton),
                bottomControlBar: React.createElement(TimeRange),
                centeredChrome: React.createElement(MuteButton)
            })
        );
        const expected =
            '<theoplayer-default-ui>' +
            '<theoplayer-slot-container slot="top-control-bar"><theoplayer-play-button></theoplayer-play-button></theoplayer-slot-container>' +
            '<theoplayer-slot-container slot="bottom-control-bar"><theoplayer-time-range></theoplayer-time-range></theoplayer-slot-container>' +
            '<theoplayer-slot-container slot="centered-chrome"><theoplayer-mute-button></theoplayer-mute-button></theoplayer-slot-container>' +
            '</theoplayer-default-ui>';
        assert.equal(actual, expected);
    });

    it('can render <UIContainer> to string', async () => {
        const { UIContainer, PlayButton, TimeRange } = await import('@theoplayer/react-ui');
        const actual = renderToString(
            React.createElement(UIContainer, {
                // Properties are ignored during SSR
                configuration: { libraryLocation: 'foo', license: 'bar' },
                onReady: () => console.log('ready!'),
                // Slots are inserted as elements
                topChrome: React.createElement(PlayButton),
                bottomChrome: React.createElement(TimeRange)
            })
        );
        const expected =
            '<theoplayer-ui>' +
            '<theoplayer-slot-container slot="top-chrome"><theoplayer-play-button></theoplayer-play-button></theoplayer-slot-container>' +
            '<theoplayer-time-range></theoplayer-time-range>' +
            '</theoplayer-ui>';
        assert.equal(actual, expected);
    });

    it('can render <THEOliveDefaultUI> to string', async () => {
        const { THEOliveDefaultUI, PlayButton, TimeRange } = await import('@theoplayer/react-ui');
        const actual = renderToString(
            React.createElement(THEOliveDefaultUI, {
                // Properties are ignored during SSR
                configuration: { libraryLocation: 'foo', license: 'bar' },
                onReady: () => console.log('ready!'),
                // Slots are inserted as elements
                loadingAnnouncement: 'Loading',
                offlineAnnouncement: 'Offline'
            })
        );
        const expected =
            '<theolive-default-ui>' +
            '<theoplayer-slot-container slot="loading-announcement">Loading</theoplayer-slot-container>' +
            '<theoplayer-slot-container slot="offline-announcement">Offline</theoplayer-slot-container>' +
            '</theolive-default-ui>';
        assert.equal(actual, expected);
    });
});
