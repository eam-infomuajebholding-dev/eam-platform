import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parseSiteEditPlan } from './siteEditCopilotParse.ts';

describe('parseSiteEditPlan', () => {
  it('parses raw JSON', () => {
    const plan = parseSiteEditPlan(
      '{"assistant_message":"ok","edits":[{"field_id":"home-hero-title","plain_text":"Hello"}]}',
    );
    assert.equal(plan?.edits[0]?.field_id, 'home-hero-title');
  });

  it('parses fenced JSON', () => {
    const plan = parseSiteEditPlan(
      'Here you go:\n```json\n{"assistant_message":"done","edits":[]}\n```',
    );
    assert.equal(plan?.assistant_message, 'done');
  });
});
