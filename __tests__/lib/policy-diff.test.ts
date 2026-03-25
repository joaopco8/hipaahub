import { describe, it, expect } from 'vitest';
import { diffTexts, buildSideBySideRows, type DiffLine } from '@/lib/policy-diff';

describe('diffTexts', () => {
  it('empty both → stats 0/0/0, lines empty', () => {
    const result = diffTexts('', '');
    expect(result.lines).toEqual([]);
    expect(result.added).toEqual([]);
    expect(result.removed).toEqual([]);
    expect(result.stats).toEqual({ added: 0, removed: 0, unchanged: 0 });
  });

  it('same text → all unchanged, added=[], removed=[]', () => {
    const text = 'line1\nline2\nline3';
    const result = diffTexts(text, text);
    expect(result.added).toEqual([]);
    expect(result.removed).toEqual([]);
    expect(result.stats.added).toBe(0);
    expect(result.stats.removed).toBe(0);
    expect(result.stats.unchanged).toBe(3);
    expect(result.lines.every(l => l.type === 'unchanged')).toBe(true);
  });

  it('A empty, B has lines → all added, removed=[]', () => {
    const result = diffTexts('', 'a\nb\nc');
    expect(result.removed).toEqual([]);
    expect(result.added).toEqual(['a', 'b', 'c']);
    expect(result.stats.added).toBe(3);
    expect(result.stats.removed).toBe(0);
    expect(result.stats.unchanged).toBe(0);
    expect(result.lines.every(l => l.type === 'added')).toBe(true);
    // lineA should be null for added lines
    expect(result.lines.every(l => l.lineA === null)).toBe(true);
  });

  it('A has lines, B empty → all removed, added=[]', () => {
    const result = diffTexts('x\ny', '');
    expect(result.added).toEqual([]);
    expect(result.removed).toEqual(['x', 'y']);
    expect(result.stats.added).toBe(0);
    expect(result.stats.removed).toBe(2);
    expect(result.stats.unchanged).toBe(0);
    expect(result.lines.every(l => l.type === 'removed')).toBe(true);
    // lineB should be null for removed lines
    expect(result.lines.every(l => l.lineB === null)).toBe(true);
  });

  it('A=line1\\nline2, B=line1\\nline3 → line1 unchanged, line2 removed, line3 added', () => {
    const result = diffTexts('line1\nline2', 'line1\nline3');
    expect(result.stats.unchanged).toBe(1);
    expect(result.stats.removed).toBe(1);
    expect(result.stats.added).toBe(1);
    const unchanged = result.lines.filter(l => l.type === 'unchanged');
    const removed = result.lines.filter(l => l.type === 'removed');
    const added = result.lines.filter(l => l.type === 'added');
    expect(unchanged[0].content).toBe('line1');
    expect(removed[0].content).toBe('line2');
    expect(added[0].content).toBe('line3');
  });

  it("A='a\\nb\\nc', B='a\\nc' → a unchanged, b removed, c unchanged", () => {
    const result = diffTexts('a\nb\nc', 'a\nc');
    expect(result.stats.unchanged).toBe(2);
    expect(result.stats.removed).toBe(1);
    expect(result.stats.added).toBe(0);
    const removed = result.lines.filter(l => l.type === 'removed');
    expect(removed[0].content).toBe('b');
    expect(result.removed).toEqual(['b']);
  });

  it("A='a\\nc', B='a\\nb\\nc' → a unchanged, b added, c unchanged", () => {
    const result = diffTexts('a\nc', 'a\nb\nc');
    expect(result.stats.unchanged).toBe(2);
    expect(result.stats.removed).toBe(0);
    expect(result.stats.added).toBe(1);
    const added = result.lines.filter(l => l.type === 'added');
    expect(added[0].content).toBe('b');
    expect(result.added).toEqual(['b']);
  });

  it('added/removed arrays contain correct strings', () => {
    const result = diffTexts('alpha\nbeta\ngamma', 'alpha\ndelta\ngamma');
    expect(result.removed).toContain('beta');
    expect(result.added).toContain('delta');
    expect(result.removed).not.toContain('alpha');
    expect(result.removed).not.toContain('gamma');
  });

  it('stats counts are correct for a larger case', () => {
    const a = 'a\nb\nc\nd\ne';
    const b = 'a\nc\nd\nf\ng';
    const result = diffTexts(a, b);
    expect(result.stats.unchanged).toBe(3); // a, c, d
    expect(result.stats.removed).toBe(2);   // b, e
    expect(result.stats.added).toBe(2);     // f, g
    expect(result.stats.added + result.stats.removed + result.stats.unchanged).toBe(
      result.lines.length
    );
  });

  it('line numbers are 1-indexed and correctly assigned', () => {
    const result = diffTexts('x\ny', 'x\nz');
    const unchangedLine = result.lines.find(l => l.type === 'unchanged');
    const removedLine = result.lines.find(l => l.type === 'removed');
    const addedLine = result.lines.find(l => l.type === 'added');

    expect(unchangedLine?.lineA).toBe(1);
    expect(unchangedLine?.lineB).toBe(1);
    expect(removedLine?.lineA).toBe(2);
    expect(removedLine?.lineB).toBeNull();
    expect(addedLine?.lineA).toBeNull();
    expect(addedLine?.lineB).toBe(2);
  });
});

describe('buildSideBySideRows', () => {
  it('all unchanged → left and right both non-null, same content', () => {
    const lines: DiffLine[] = [
      { type: 'unchanged', content: 'a', lineA: 1, lineB: 1 },
      { type: 'unchanged', content: 'b', lineA: 2, lineB: 2 },
    ];
    const rows = buildSideBySideRows(lines);
    expect(rows).toHaveLength(2);
    expect(rows[0].left).toEqual(lines[0]);
    expect(rows[0].right).toEqual(lines[0]);
    expect(rows[1].left).toEqual(lines[1]);
    expect(rows[1].right).toEqual(lines[1]);
  });

  it('removed only → left non-null (removed), right null', () => {
    const lines: DiffLine[] = [
      { type: 'removed', content: 'old line', lineA: 1, lineB: null },
    ];
    const rows = buildSideBySideRows(lines);
    expect(rows).toHaveLength(1);
    expect(rows[0].left).toEqual(lines[0]);
    expect(rows[0].right).toBeNull();
  });

  it('added only → left null, right non-null (added)', () => {
    const lines: DiffLine[] = [
      { type: 'added', content: 'new line', lineA: null, lineB: 1 },
    ];
    const rows = buildSideBySideRows(lines);
    expect(rows).toHaveLength(1);
    expect(rows[0].left).toBeNull();
    expect(rows[0].right).toEqual(lines[0]);
  });

  it('removed then added (replace) → pairs them up', () => {
    const lines: DiffLine[] = [
      { type: 'removed', content: 'old', lineA: 1, lineB: null },
      { type: 'added', content: 'new', lineA: null, lineB: 1 },
    ];
    const rows = buildSideBySideRows(lines);
    expect(rows).toHaveLength(1);
    expect(rows[0].left?.content).toBe('old');
    expect(rows[0].right?.content).toBe('new');
  });

  it('2 removed, 1 added → 2 rows, second row right is null', () => {
    const lines: DiffLine[] = [
      { type: 'removed', content: 'old1', lineA: 1, lineB: null },
      { type: 'removed', content: 'old2', lineA: 2, lineB: null },
      { type: 'added', content: 'new1', lineA: null, lineB: 1 },
    ];
    const rows = buildSideBySideRows(lines);
    expect(rows).toHaveLength(2);
    expect(rows[0].left?.content).toBe('old1');
    expect(rows[0].right?.content).toBe('new1');
    expect(rows[1].left?.content).toBe('old2');
    expect(rows[1].right).toBeNull();
  });

  it('1 removed, 2 added → 2 rows, second row left is null', () => {
    const lines: DiffLine[] = [
      { type: 'removed', content: 'old1', lineA: 1, lineB: null },
      { type: 'added', content: 'new1', lineA: null, lineB: 1 },
      { type: 'added', content: 'new2', lineA: null, lineB: 2 },
    ];
    const rows = buildSideBySideRows(lines);
    expect(rows).toHaveLength(2);
    expect(rows[0].left?.content).toBe('old1');
    expect(rows[0].right?.content).toBe('new1');
    expect(rows[1].left).toBeNull();
    expect(rows[1].right?.content).toBe('new2');
  });

  it('complex mixed: unchanged → removed+added hunk → unchanged', () => {
    const lines: DiffLine[] = [
      { type: 'unchanged', content: 'header', lineA: 1, lineB: 1 },
      { type: 'removed', content: 'old body', lineA: 2, lineB: null },
      { type: 'added', content: 'new body', lineA: null, lineB: 2 },
      { type: 'unchanged', content: 'footer', lineA: 3, lineB: 3 },
    ];
    const rows = buildSideBySideRows(lines);
    expect(rows).toHaveLength(3); // 1 unchanged + 1 replace pair + 1 unchanged
    expect(rows[0].left?.content).toBe('header');
    expect(rows[0].right?.content).toBe('header');
    expect(rows[1].left?.content).toBe('old body');
    expect(rows[1].right?.content).toBe('new body');
    expect(rows[2].left?.content).toBe('footer');
    expect(rows[2].right?.content).toBe('footer');
  });

  it('empty input → empty rows', () => {
    const rows = buildSideBySideRows([]);
    expect(rows).toEqual([]);
  });
});
