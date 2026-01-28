/**
 * Document Formatter
 * Formats HIPAA documents for professional A4 printing/PDF
 */

/**
 * Convert plain text document to formatted HTML for A4 printing
 */
export function formatDocumentForA4(
  documentText: string,
  documentTitle: string,
  policyId?: string
): string {
  // Safety: Remove any remaining placeholders before formatting
  let cleanedText = documentText;
  const placeholdersBefore = (cleanedText.match(/\{\{[^}]+\}\}/g) || []).length;
  if (placeholdersBefore > 0) {
    console.warn(`⚠️ formatDocumentForA4: Found ${placeholdersBefore} placeholders, removing...`);
    // Remove all placeholders
    cleanedText = cleanedText.replace(/\{\{[^}]+\}\}/g, '');
  }
  
  // Convert URLs to clickable links (format: [Download: URL] or plain URLs)
  cleanedText = cleanedText.replace(/\[Download:\s*([^\]]+)\]/g, (match, url) => {
    // Escape HTML in URL
    const safeUrl = url.trim().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="evidence-link">[Download]</a>`;
  });
  
  // Also convert plain HTTP/HTTPS URLs to links
  cleanedText = cleanedText.replace(/(https?:\/\/[^\s\)]+)/g, (match, url) => {
    const safeUrl = url.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="evidence-link">${url}</a>`;
  });
  
  // Split document into paragraphs and sections
  const lines = cleanedText.split('\n');
  const formattedLines: string[] = [];
  
  let currentSection = '';
  let inTable = false;
  let tableRows: string[] = [];
  let currentParagraph: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const nextLine = i < lines.length - 1 ? lines[i + 1].trim() : '';
    const prevLine = i > 0 ? lines[i - 1].trim() : '';
    
    // Skip empty lines at start
    if (formattedLines.length === 0 && !line) continue;
    
    // Detect main section headers (lines starting with numbers like "1.", "2.", "3.")
    // Also detect "POLICY 1:" style headers
    if ((line.match(/^[0-9]+\s+[A-Z]/) && !line.match(/^[0-9]+\.[0-9]/)) ||
        line.match(/^POLICY\s+[0-9]+:/i)) {
      // Close previous section
      if (currentParagraph.length > 0) {
        formattedLines.push(`<p class="document-paragraph">${currentParagraph.join(' ')}</p>`);
        currentParagraph = [];
      }
      if (inTable && tableRows.length > 0) {
        formattedLines.push(...tableRows);
        formattedLines.push('</table>');
        tableRows = [];
        inTable = false;
      }
      if (currentSection) {
        formattedLines.push('</section>');
      }
      formattedLines.push(`<section class="document-section">`);
      if (line.match(/^POLICY\s+[0-9]+:/i)) {
        formattedLines.push(`<h1 class="document-main-title">${escapeHtml(line)}</h1>`);
      } else {
        formattedLines.push(`<h2 class="section-title">${escapeHtml(line)}</h2>`);
      }
      currentSection = line;
      continue;
    }
    
    // Detect subsection headers (lines starting with numbers like "3.1", "4.2")
    if (line.match(/^[0-9]+\.[0-9]+\s+[A-Z]/)) {
      if (currentParagraph.length > 0) {
        formattedLines.push(`<p class="document-paragraph">${currentParagraph.join(' ')}</p>`);
        currentParagraph = [];
      }
      if (inTable && tableRows.length > 0) {
        formattedLines.push(...tableRows);
        formattedLines.push('</table>');
        tableRows = [];
        inTable = false;
      }
      formattedLines.push(`<h3 class="subsection-title">${escapeHtml(line)}</h3>`);
      continue;
    }
    
    // Detect "Document Control" or table headers
    if (line === 'Document Control' || line === 'Field' || line === 'Field\tValue' || line === 'Value') {
      if (currentParagraph.length > 0) {
        formattedLines.push(`<p class="document-paragraph">${currentParagraph.join(' ')}</p>`);
        currentParagraph = [];
      }
      if (line === 'Document Control') {
        formattedLines.push(`<h2 class="section-title">${escapeHtml(line)}</h2>`);
      }
      // Skip "Field" and "Value" header lines - we'll detect table rows below
      if (line === 'Field' || line === 'Value' || line === 'Field\tValue') {
        continue;
      }
    }
    
    // Detect table rows (Field/Value pairs)
    // Pattern: Field name on one line, value on next line (or tab-separated)
    // Field names are typically short, capitalized, and don't start with numbers
    const looksLikeFieldName = line && 
                               line.length > 0 && 
                               line.length < 80 &&
                               !line.match(/^[0-9]+\.[0-9]*\s+[A-Z]/) &&
                               !line.match(/^[A-Z][A-Z\s&:]+$/) &&
                               !line.match(/^[•\-\*]/) &&
                               !line.match(/^Pages:/) &&
                               (line.match(/^[A-Z]/) || line.includes('{{'));
    
    const looksLikeValue = nextLine && 
                          nextLine.length > 0 && 
                          nextLine.length < 200 &&
                          !nextLine.match(/^[0-9]+\.[0-9]*\s+[A-Z]/) &&
                          !nextLine.match(/^[A-Z][A-Z\s&:]+$/) &&
                          !nextLine.match(/^[•\-\*]/) &&
                          !nextLine.match(/^Pages:/) &&
                          (nextLine.match(/^[A-Z0-9@.\-\s()\/:{}\[\]"]+$/) || nextLine.includes('{{'));
    
    // Check if this looks like a field-value pair
    const isFieldValuePair = looksLikeFieldName && looksLikeValue && 
                            !prevLine.match(/^[0-9]+\.[0-9]*/) &&
                            !prevLine.match(/^[A-Z][A-Z\s&:]+$/) &&
                            prevLine !== 'Field' &&
                            prevLine !== 'Value';
    
    if (inTable || isFieldValuePair) {
      if (!inTable) {
        formattedLines.push('<table class="document-table">');
        inTable = true;
      }
      
      if (line.includes('\t')) {
        const parts = line.split('\t');
        if (parts.length >= 2) {
          tableRows.push(`<tr><td class="table-field">${escapeHtml(parts[0])}</td><td class="table-value">${escapeHtml(parts.slice(1).join(' '))}</td></tr>`);
        }
      } else if (isFieldValuePair) {
        // Field-value pair on separate lines
        const fieldName = line.replace(/[:\s]+$/, '').trim();
        tableRows.push(`<tr><td class="table-field">${escapeHtml(fieldName)}</td><td class="table-value">${escapeHtml(nextLine)}</td></tr>`);
        i++; // Skip next line
      } else {
        // Not a table row, close table
        if (tableRows.length > 0) {
          formattedLines.push(...tableRows);
          formattedLines.push('</table>');
          tableRows = [];
        }
        inTable = false;
        // Add as paragraph
        if (line) {
          currentParagraph.push(line);
        }
      }
      continue;
    }
    
    // Close table if we hit a new section or paragraph
    if (inTable && line && !line.match(/^[A-Z][a-z\s()]+$/) && 
        (line.match(/^[0-9]+\.[0-9]*/) || line.length > 50)) {
      if (tableRows.length > 0) {
        formattedLines.push(...tableRows);
        formattedLines.push('</table>');
        tableRows = [];
        inTable = false;
      }
    }
    
    // Regular paragraph content
    if (line) {
      // Check if line is a list item
      if (line.match(/^[•\-\*]\s/) || line.match(/^[0-9]+\.\s/)) {
        if (currentParagraph.length > 0) {
          formattedLines.push(`<p class="document-paragraph">${currentParagraph.join(' ')}</p>`);
          currentParagraph = [];
        }
        formattedLines.push(`<p class="document-list-item">${escapeHtml(line)}</p>`);
      } else if (line.length > 0) {
        // Add to current paragraph
        currentParagraph.push(line);
      }
    } else {
      // Empty line - finalize current paragraph
      if (currentParagraph.length > 0) {
        formattedLines.push(`<p class="document-paragraph">${currentParagraph.join(' ')}</p>`);
        currentParagraph = [];
      }
      // Close table if open
      if (inTable && tableRows.length > 0) {
        formattedLines.push(...tableRows);
        formattedLines.push('</table>');
        tableRows = [];
        inTable = false;
      }
    }
  }
  
  // Finalize any remaining content
  if (currentParagraph.length > 0) {
    formattedLines.push(`<p class="document-paragraph">${currentParagraph.join(' ')}</p>`);
  }
  if (inTable && tableRows.length > 0) {
    formattedLines.push(...tableRows);
    formattedLines.push('</table>');
  }
  if (currentSection) {
    formattedLines.push('</section>');
  }
  
  // Get current date for footer
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(documentTitle)}</title>
  <style>
    /* Reset and base styles */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    @page {
      size: A4;
      margin: 2.5cm 2cm 2.5cm 2cm;
      @bottom-center {
        content: "Page " counter(page) " of " counter(pages);
        font-family: 'Times New Roman', serif;
        font-size: 10pt;
        color: #666;
        margin-top: 1cm;
      }
      @top-center {
        content: "${escapeHtml(documentTitle)}";
        font-family: 'Times New Roman', serif;
        font-size: 9pt;
        color: #666;
        margin-bottom: 1cm;
      }
    }
    
    body {
      font-family: 'Times New Roman', serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #000;
      background: #fff;
      padding: 0;
      margin: 0;
    }
    
    .document-container {
      max-width: 100%;
      margin: 0 auto;
      padding: 0;
      background: white;
    }
    
    .document-header {
      text-align: center;
      margin-bottom: 2cm;
      padding-bottom: 1cm;
      border-bottom: 2px solid #000;
    }
    
    .document-title {
      font-size: 18pt;
      font-weight: bold;
      margin-bottom: 0.5cm;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .document-main-title {
      font-size: 16pt;
      font-weight: bold;
      margin-top: 1.5cm;
      margin-bottom: 1cm;
      text-align: center;
      text-transform: uppercase;
      page-break-after: avoid;
    }
    
    .document-subtitle {
      font-size: 12pt;
      color: #333;
      margin-bottom: 0.3cm;
    }
    
    .policy-id {
      font-size: 10pt;
      color: #666;
      font-weight: normal;
    }
    
    .document-section {
      margin-bottom: 1.2cm;
      page-break-inside: avoid;
    }
    
    .section-title {
      font-size: 14pt;
      font-weight: bold;
      margin-top: 1cm;
      margin-bottom: 0.6cm;
      page-break-after: avoid;
      color: #000;
    }
    
    .subsection-title {
      font-size: 12pt;
      font-weight: bold;
      margin-top: 0.8cm;
      margin-bottom: 0.4cm;
      page-break-after: avoid;
      color: #000;
    }
    
    .document-paragraph {
      margin-bottom: 0.5cm;
      text-align: justify;
      orphans: 3;
      widows: 3;
      page-break-inside: avoid;
    }
    
    .document-list-item {
      margin-bottom: 0.3cm;
      margin-left: 1cm;
      padding-left: 0.5cm;
      text-align: justify;
    }
    
    .document-table {
      width: 100%;
      border-collapse: collapse;
      margin: 0.8cm 0;
      page-break-inside: avoid;
    }
    
    .document-table tr {
      page-break-inside: avoid;
      page-break-after: auto;
    }
    
    .document-table td {
      padding: 0.4cm;
      border: 1px solid #ddd;
      vertical-align: top;
    }
    
    .table-field {
      font-weight: bold;
      width: 40%;
      background-color: #f9f9f9;
    }
    
    .table-value {
      width: 60%;
    }
    
    .document-footer {
      margin-top: 2cm;
      padding-top: 1cm;
      border-top: 1px solid #ddd;
      text-align: center;
      font-size: 9pt;
      color: #666;
    }
    
    /* Print controls */
    .print-controls {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
      display: flex;
      gap: 10px;
    }
    
    .print-button {
      background: #1ad07a;
      color: #0c0b1d;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      transition: all 0.2s;
    }
    
    .print-button:hover {
      background: #16b86a;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }
    
    .download-button {
      background: #0c0b1d;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      transition: all 0.2s;
    }
    
    .download-button:hover {
      background: #1a1a2e;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }
    
    /* Evidence links styling */
    .evidence-link {
      color: #1ad07a;
      text-decoration: underline;
      font-weight: 500;
      margin-left: 4px;
    }
    
    .evidence-link:hover {
      color: #16b86a;
      text-decoration: none;
    }
    
    @media print {
      .evidence-link {
        color: #000;
        text-decoration: underline;
      }
      
      .evidence-link::after {
        content: " (" attr(href) ")";
        font-size: 9pt;
        color: #666;
      }
    }
    
    /* Print-specific styles */
    @media print {
      .print-controls {
        display: none;
      }
      
      body {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
        background: white;
        padding: 0;
      }
      
      .document-container {
        box-shadow: none;
        padding: 0;
        margin: 0;
      }
      
      .document-section {
        page-break-inside: avoid;
      }
      
      .section-title,
      .subsection-title {
        page-break-after: avoid;
      }
      
      .document-paragraph {
        orphans: 3;
        widows: 3;
      }
      
      /* Avoid breaking tables across pages */
      .document-table {
        page-break-inside: avoid;
      }
      
      /* Ensure headers don't appear alone at bottom of page */
      h2, h3 {
        page-break-after: avoid;
      }
      
      /* Avoid breaking list items */
      .document-list-item {
        page-break-inside: avoid;
      }
    }
    
    /* Screen preview styles */
    @media screen {
      body {
        background: #f5f5f5;
        padding: 2cm;
      }
      
      .document-container {
        max-width: 21cm;
        margin: 0 auto;
        background: white;
        box-shadow: 0 0 20px rgba(0,0,0,0.1);
        padding: 2.5cm 2cm;
        min-height: 29.7cm;
      }
    }
  </style>
</head>
<body>
  <div class="print-controls">
    <button class="print-button" onclick="window.print()">🖨️ Print / Save as PDF</button>
    <button class="download-button" onclick="window.print()">📥 Download PDF</button>
  </div>
  <div class="document-container">
    <div class="document-header">
      <div class="document-title">${escapeHtml(documentTitle)}</div>
      ${policyId ? `<div class="policy-id">Policy ID: ${escapeHtml(policyId)}</div>` : ''}
      <div class="document-subtitle">CONFIDENTIAL - Internal Use Only</div>
    </div>
    
    ${formattedLines.join('\n')}
    
    <div class="document-footer">
      <p>Generated by HIPAA Hub on ${currentDate}</p>
      <p>This document is confidential and intended for internal use only.</p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
