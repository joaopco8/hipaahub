export type DiffLineType = 'added' | 'removed' | 'unchanged';

export interface DiffLine {
  type: DiffLineType;
  content: string;
  lineA: number | null; // 1-indexed, null for added lines
  lineB: number | null; // 1-indexed, null for removed lines
}

export interface DiffResult {
  lines: DiffLine[];
  added: string[];    // lines only in B
  removed: string[];  // lines only in A
  stats: { added: number; removed: number; unchanged: number };
}

export interface SideBySideRow {
  left: DiffLine | null;  // null = empty spacer
  right: DiffLine | null;
}

/**
 * Build LCS table using iterative dynamic programming (O(m*n)).
 * Returns the dp table.
 */
function buildLCS(a: string[], b: string[]): number[][] {
  const m = a.length;
  const n = b.length;
  // Use a 2D array: dp[i][j] = length of LCS of a[0..i-1] and b[0..j-1]
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  return dp;
}

/**
 * Backtrack the LCS table iteratively to produce diff operations.
 */
function backtrack(
  dp: number[][],
  a: string[],
  b: string[]
): Array<{ op: 'unchanged' | 'removed' | 'added'; line: string }> {
  const ops: Array<{ op: 'unchanged' | 'removed' | 'added'; line: string }> = [];
  let i = a.length;
  let j = b.length;

  // Collect in reverse, then reverse at end
  const reversedOps: Array<{ op: 'unchanged' | 'removed' | 'added'; line: string }> = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      reversedOps.push({ op: 'unchanged', line: a[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      reversedOps.push({ op: 'added', line: b[j - 1] });
      j--;
    } else {
      reversedOps.push({ op: 'removed', line: a[i - 1] });
      i--;
    }
  }

  // Reverse to get correct order
  for (let k = reversedOps.length - 1; k >= 0; k--) {
    ops.push(reversedOps[k]);
  }

  return ops;
}

export function diffTexts(textA: string, textB: string): DiffResult {
  const linesA = textA === '' ? [] : textA.split('\n');
  const linesB = textB === '' ? [] : textB.split('\n');

  if (linesA.length === 0 && linesB.length === 0) {
    return {
      lines: [],
      added: [],
      removed: [],
      stats: { added: 0, removed: 0, unchanged: 0 },
    };
  }

  const dp = buildLCS(linesA, linesB);
  const ops = backtrack(dp, linesA, linesB);

  const diffLines: DiffLine[] = [];
  const added: string[] = [];
  const removed: string[] = [];
  let countAdded = 0;
  let countRemoved = 0;
  let countUnchanged = 0;
  let lineA = 0;
  let lineB = 0;

  for (const { op, line } of ops) {
    if (op === 'unchanged') {
      lineA++;
      lineB++;
      diffLines.push({ type: 'unchanged', content: line, lineA, lineB });
      countUnchanged++;
    } else if (op === 'removed') {
      lineA++;
      diffLines.push({ type: 'removed', content: line, lineA, lineB: null });
      removed.push(line);
      countRemoved++;
    } else {
      lineB++;
      diffLines.push({ type: 'added', content: line, lineA: null, lineB });
      added.push(line);
      countAdded++;
    }
  }

  return {
    lines: diffLines,
    added,
    removed,
    stats: { added: countAdded, removed: countRemoved, unchanged: countUnchanged },
  };
}

/**
 * Build side-by-side rows from a flat DiffLine array.
 * Groups consecutive removed+added hunks and pairs them up,
 * using null spacers for the shorter side.
 */
export function buildSideBySideRows(lines: DiffLine[]): SideBySideRow[] {
  const rows: SideBySideRow[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.type === 'unchanged') {
      rows.push({ left: line, right: line });
      i++;
      continue;
    }

    // Collect a hunk of consecutive removed and/or added lines
    const removedLines: DiffLine[] = [];
    const addedLines: DiffLine[] = [];

    while (i < lines.length && lines[i].type !== 'unchanged') {
      if (lines[i].type === 'removed') {
        removedLines.push(lines[i]);
      } else {
        addedLines.push(lines[i]);
      }
      i++;
    }

    // Pair them up
    const maxLen = Math.max(removedLines.length, addedLines.length);
    for (let k = 0; k < maxLen; k++) {
      const left = k < removedLines.length ? removedLines[k] : null;
      const right = k < addedLines.length ? addedLines[k] : null;
      rows.push({ left, right });
    }
  }

  return rows;
}
