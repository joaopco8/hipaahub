'use client';

import type { SideBySideRow } from '@/lib/policy-diff';

interface PolicyDiffViewerProps {
  policyId: string;
  versionA: { id: string; version_number: number };
  versionB: { id: string; version_number: number };
  rows: SideBySideRow[];
  stats: { added: number; removed: number; unchanged: number };
}

export function PolicyDiffViewer({
  versionA,
  versionB,
  rows,
  stats,
}: PolicyDiffViewerProps) {
  return (
    <div className="border-0 shadow-sm bg-white rounded-none">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-light text-[#0e274e]">
          v{versionA.version_number} &rarr; v{versionB.version_number}
        </h3>
        <div className="flex items-center gap-2 text-xs">
          <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-none font-light">
            +{stats.added} added
          </span>
          <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-none font-light">
            -{stats.removed} removed
          </span>
          <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-none font-light">
            {stats.unchanged} unchanged
          </span>
        </div>
      </div>

      {/* Side-by-side table */}
      <div className="max-h-[70vh] overflow-auto">
        <table className="w-full border-collapse text-xs font-mono table-fixed">
          <colgroup>
            <col style={{ width: '50%' }} />
            <col style={{ width: '50%' }} />
          </colgroup>
          <thead className="sticky top-0 z-10 bg-white border-b border-gray-100">
            <tr>
              <th className="text-left px-3 py-2 text-[#0e274e] font-light text-xs border-r border-gray-100">
                Version {versionA.version_number}
              </th>
              <th className="text-left px-3 py-2 text-[#0e274e] font-light text-xs">
                Version {versionB.version_number}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-4 py-8 text-center text-gray-400 text-xs font-light font-sans">
                  No differences found — the two versions are identical.
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => {
                const leftLine = row.left;
                const rightLine = row.right;

                // Determine cell styles
                let leftCellClass = 'px-2 py-0.5 align-top border-r border-gray-100 whitespace-pre-wrap break-words';
                let rightCellClass = 'px-2 py-0.5 align-top whitespace-pre-wrap break-words';
                let leftPrefix = '';
                let rightPrefix = '';
                let leftLineNum: number | null = null;
                let rightLineNum: number | null = null;
                let leftContent = '';
                let rightContent = '';

                if (leftLine === null) {
                  leftCellClass += ' bg-gray-50';
                } else if (leftLine.type === 'removed') {
                  leftCellClass += ' bg-red-50 text-red-700';
                  leftPrefix = '- ';
                  leftLineNum = leftLine.lineA;
                  leftContent = leftLine.content;
                } else {
                  // unchanged
                  leftLineNum = leftLine.lineA;
                  leftContent = leftLine.content;
                }

                if (rightLine === null) {
                  rightCellClass += ' bg-gray-50';
                } else if (rightLine.type === 'added') {
                  rightCellClass += ' bg-green-50 text-green-700';
                  rightPrefix = '+ ';
                  rightLineNum = rightLine.lineB;
                  rightContent = rightLine.content;
                } else {
                  // unchanged
                  rightLineNum = rightLine.lineB;
                  rightContent = rightLine.content;
                }

                return (
                  <tr key={idx} className="border-b border-gray-50">
                    <td className={leftCellClass}>
                      {leftLine !== null && (
                        <span>
                          <span className="text-gray-300 select-none mr-2 text-[10px]">
                            {leftLineNum}
                          </span>
                          {leftPrefix}{leftContent}
                        </span>
                      )}
                    </td>
                    <td className={rightCellClass}>
                      {rightLine !== null && (
                        <span>
                          <span className="text-gray-300 select-none mr-2 text-[10px]">
                            {rightLineNum}
                          </span>
                          {rightPrefix}{rightContent}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
