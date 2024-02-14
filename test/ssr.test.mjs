import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';

describe('Server-side rendering (SSR)', () => {
    it('can load @theoplayer/web-ui inside Node', async () => {
        const { DefaultUI } = await import('@theoplayer/web-ui');
        assert.notEqual(DefaultUI, undefined);
    });
});
