import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { clearedValueAfterCut, mergePasteValue } from './editorClipboard.ts';

describe('mergePasteValue', () => {
  it('copies image url and layout', () => {
    const merged = mergePasteValue(
      { type: 'image', url: '/old.png', layout: { x: 1 } },
      { type: 'image', url: '/new.png', layout: { x: 9 } },
    );
    assert.deepEqual(merged, { type: 'image', url: '/new.png', layout: { x: 9 } });
  });

  it('pastes plain text into markdown', () => {
    const merged = mergePasteValue(
      { type: 'markdown', markdown: '## old' },
      { type: 'plain', text: 'hello' },
    );
    assert.equal(merged?.type, 'markdown');
    assert.equal(merged && merged.type === 'markdown' ? merged.markdown : '', 'hello');
  });

  it('rejects incompatible types without layout fallback', () => {
    const merged = mergePasteValue({ type: 'video', url: '/v.mp4' }, { type: 'plain', text: 'x' });
    assert.equal(merged, null);
  });
});

describe('clearedValueAfterCut', () => {
  it('clears text fields', () => {
    assert.deepEqual(
      clearedValueAfterCut(
        { type: 'plain', text: 'copy me', layout: { scale: 1 } },
        { type: 'plain', text: 'baseline' },
      ),
      { type: 'plain', text: '', layout: { scale: 1 } },
    );
  });

  it('restores image baseline after cut', () => {
    assert.deepEqual(
      clearedValueAfterCut(
        { type: 'image', url: '/edited.png' },
        { type: 'image', url: '/default.png' },
      ),
      { type: 'image', url: '/default.png', layout: undefined },
    );
  });
});
