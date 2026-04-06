'use client';

import Link from 'next/link';

interface DocumentViewerProps {
  content: string;
  title: string;
  isLocked?: boolean;
}

/**
 * Professional Document Viewer Component
 * Displays documents in a PDF-like format with professional styling
 */
export function DocumentViewer({ content, title, isLocked = false }: DocumentViewerProps) {
  // Simple line-by-line rendering with proper formatting
  const renderContent = () => {
    const lines = content.split('\n');
    const elements: JSX.Element[] = [];
    let currentParagraph: string[] = [];
    let inTable = false;
    let tableRows: Array<{ field: string; value: string }> = [];
    let currentList: string[] = [];

    const flushParagraph = () => {
      if (currentParagraph.length > 0) {
        const text = currentParagraph.join(' ').trim();
        if (text) {
          elements.push(
            <p key={`p-${elements.length}`} className="text-sm text-zinc-700 leading-relaxed mt-3 mb-3">
              {text}
            </p>
          );
        }
        currentParagraph = [];
      }
    };

    const flushList = () => {
      if (currentList.length > 0) {
        elements.push(
          <ul key={`ul-${elements.length}`} className="list-disc list-outside ml-6 mt-3 mb-3 space-y-1 text-zinc-700">
            {currentList.map((item, i) => (
              <li key={i} className="text-sm leading-relaxed">
                {item.replace(/^[•\-]\s*/, '').trim()}
              </li>
            ))}
          </ul>
        );
        currentList = [];
      }
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      // Skip empty lines
      if (!trimmed) {
        flushParagraph();
        flushList();
        return;
      }

      // Document Control Table - Parse field/value pairs
      // Structure: Field\nValue\nPolicy ID\nMST-001\nTitle\n...
      if (trimmed === 'Document Control') {
        flushParagraph();
        flushList();
        inTable = true;
        tableRows = [];
        let currentField: string | null = null;
        let tableStartIndex = index;
        
        // Process table lines
        for (let i = index + 1; i < lines.length; i++) {
          const tableLine = lines[i]?.trim();
          if (!tableLine) continue;
          
          // Skip header
          if (tableLine === 'Field' || tableLine === 'Value') {
            continue;
          }
          
          // Check if this is the start of a numbered section (end of table)
          if (tableLine.match(/^\d+\.\s/)) {
            inTable = false;
            break;
          }
          
          // Known field names
          const fieldNames = [
            'Policy ID', 'Title', 'Effective Date', 'Last Reviewed', 'Next Review Date',
            'Policy Owner', 'Approval Authority', 'Legal Basis', 'Document Classification', 'Distribution'
          ];
          
          const isFieldName = fieldNames.some(field => tableLine === field);
          
          if (isFieldName) {
            // This is a field name, next line should be the value
            currentField = tableLine;
            const nextTableLine = lines[i + 1]?.trim();
            if (nextTableLine && !fieldNames.some(f => nextTableLine === f)) {
              tableRows.push({ field: currentField, value: nextTableLine });
              i++; // Skip the value line
              currentField = null;
            }
          }
        }
        
        // Render table if we have rows
        if (tableRows.length > 0) {
          elements.push(
            <div key={`table-${elements.length}`} className="my-6">
              <h3 className="text-lg font-semibold text-zinc-900 mb-3">Document Control</h3>
              <div className="border border-zinc-300 rounded overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-100">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold text-zinc-900 border-b border-zinc-300">Field</th>
                      <th className="px-4 py-2 text-left font-semibold text-zinc-900 border-b border-zinc-300">Value</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {tableRows.map((row, i) => (
                      <tr key={i} className="border-b border-zinc-200">
                        <td className="px-4 py-2 font-medium text-zinc-900">{row.field}</td>
                        <td className="px-4 py-2 text-zinc-700">{row.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        }
        
        // Skip all lines until we're out of table mode
        // Find the next numbered section
        let skipUntil = index;
        for (let i = index + 1; i < lines.length; i++) {
          if (lines[i]?.trim().match(/^\d+\.\s/)) {
            skipUntil = i - 1;
            break;
          }
        }
        
        // Skip lines that were part of the table
        if (index < skipUntil) {
          return;
        }
        
        inTable = false;
      }

      // Main title (POLICY 1: ...)
      if (trimmed.startsWith('POLICY') || trimmed.match(/^Pages:/)) {
        flushParagraph();
        flushList();
        if (trimmed.startsWith('POLICY')) {
          elements.push(
            <h1 key={`title-${index}`} className="text-2xl font-light text-[#0e274e] mt-8 mb-4">
              {trimmed}
            </h1>
          );
        }
        return;
      }

      // Numbered sections (1., 2., etc.)
      if (trimmed.match(/^\d+\.\s/)) {
        flushParagraph();
        flushList();
        elements.push(
          <h2 key={`heading-${index}`} className="text-xl font-bold text-zinc-900 mt-6 mb-3">
            {trimmed}
          </h2>
        );
        return;
      }

      // Subsections (4.1, 4.2, etc.)
      if (trimmed.match(/^\d+\.\d+\s/)) {
        flushParagraph();
        flushList();
        elements.push(
          <h3 key={`subheading-${index}`} className="text-lg font-semibold text-zinc-800 mt-4 mb-2">
            {trimmed}
          </h3>
        );
        return;
      }

      // List items
      if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
        flushParagraph();
        currentList.push(trimmed);
        return;
      }

      // Regular text
      currentParagraph.push(trimmed);
    });

    flushParagraph();
    flushList();

    return elements;
  };

  const allElements = renderContent();
  // Split: show first 1/3 normally, blur last 2/3 when locked
  const splitAt = isLocked ? Math.ceil(allElements.length / 3) : allElements.length;
  const visibleElements = allElements.slice(0, splitAt);
  const lockedElements = allElements.slice(splitAt);

  return (
    <div
      className="w-full"
      onCopy={isLocked ? (e) => e.preventDefault() : undefined}
      onCut={isLocked ? (e) => e.preventDefault() : undefined}
    >
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body { background: white; }
          .no-print { display: none !important; }
          .document-container {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}</style>

      {/* Document Container - Professional PDF-like styling */}
      <div
        className={`document-container bg-white shadow-lg border border-zinc-200 rounded-lg p-12 max-w-5xl mx-auto${isLocked ? ' select-none' : ''}`}
        style={isLocked ? { WebkitUserSelect: 'none', MozUserSelect: 'none', userSelect: 'none' } as React.CSSProperties : undefined}
      >
        {/* Document Header */}
        <div className="mb-8 pb-6 border-b-2 border-zinc-300">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 mb-2">{title}</h1>
              <p className="text-sm text-zinc-600">Policy ID: MST-001</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-zinc-500">CONFIDENTIAL</p>
              <p className="text-xs text-zinc-500">Internal Use Only</p>
            </div>
          </div>
        </div>

        {/* Visible first 1/3 */}
        <div className="prose prose-sm max-w-none">
          {visibleElements}
        </div>

        {/* Blurred last 2/3 — only rendered when locked */}
        {isLocked && lockedElements.length > 0 && (
          <div className="relative mt-4">
            {/* Blurred content */}
            <div
              className="prose prose-sm max-w-none pointer-events-none"
              style={{ filter: 'blur(6px)', userSelect: 'none', WebkitUserSelect: 'none' } as React.CSSProperties}
              aria-hidden="true"
            >
              {lockedElements}
            </div>

            {/* Gradient fade at the top of blur zone */}
            <div
              className="absolute inset-x-0 top-0 h-24 pointer-events-none"
              style={{ background: 'linear-gradient(to bottom, white 0%, transparent 100%)' }}
            />

            {/* Upgrade CTA overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="bg-white border border-gray-200 shadow-xl px-8 py-6 max-w-sm w-full text-center">
                <div className="w-10 h-10 bg-[#0e274e]/5 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-5 h-5 text-[#0e274e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <p className="text-sm font-light text-[#0e274e] mb-1">
                  This policy is{' '}
                  <span className="font-normal">18–25 pages</span> long.
                </p>
                <p className="text-xs text-gray-500 font-light mb-4">
                  Subscribe to unlock the full document, PDF export, and all 9 HIPAA policies.
                </p>
                <Link
                  href="/select-plan"
                  className="block w-full bg-[#00bceb] text-white text-sm font-light py-2.5 hover:bg-[#0e274e] transition-colors"
                >
                  Unlock Full Access
                </Link>
                <p className="text-[11px] text-gray-400 font-light mt-2">Cancel anytime · BAA included</p>
              </div>
            </div>
          </div>
        )}

        {/* Document Footer — only when not locked */}
        {!isLocked && (
          <div className="mt-12 pt-6 border-t border-zinc-300">
            <div className="flex justify-between text-xs text-zinc-500">
              <div>
                <p>{title}</p>
                <p>Page 1 of 1</p>
              </div>
              <div className="text-right">
                <p>Generated by HIPAA Hub</p>
                <p suppressHydrationWarning>{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
