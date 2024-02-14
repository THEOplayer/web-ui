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
        const { DefaultUI, PlayButton, TimeRange } = await import('@theoplayer/react-ui');
        const actual = renderToString(
            React.createElement(DefaultUI, {
                // Properties are ignored during SSR
                configuration: { libraryLocation: 'foo', license: 'bar' },
                onReady: () => console.log('ready!'),
                // Slots are inserted as elements
                topControlBar: React.createElement(PlayButton),
                bottomControlBar: React.createElement(TimeRange)
            })
        );
        const expected =
            '<theoplayer-default-ui>' +
            '<div slot="top-control-bar" style="display:contents"><theoplayer-play-button></theoplayer-play-button></div>' +
            '<div slot="bottom-control-bar" style="display:contents"><theoplayer-time-range></theoplayer-time-range></div>' +
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
            '<div slot="top-chrome" style="display:contents"><theoplayer-play-button></theoplayer-play-button></div>' +
            '<theoplayer-time-range></theoplayer-time-range>' +
            '</theoplayer-ui>';
        assert.equal(actual, expected);
    });
});
