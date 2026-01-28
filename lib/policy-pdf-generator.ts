/**
 * Professional PDF Generator for HIPAA Policy Documents
 * Creates legally compliant, professionally formatted PDF documents
 * with proper legal formatting, page breaks, headers, and footers
 */

interface PolicyPDFOptions {
  documentTitle: string;
  content: string;
  organizationName: string;
  policyId?: string;
  generatedDate?: Date;
}

/**
 * Generate a professional PDF from policy document content
 * Uses jsPDF with proper legal formatting
 */
export async function generatePolicyPDF(options: PolicyPDFOptions): Promise<Blob> {
  try {
    // Dynamic import for Next.js compatibility
    const { default: jsPDF } = await import('jspdf');
    
    // Clean content before processing - remove separator lines and problematic characters
    const cleanedContent = options.content
      .split('\n')
      .filter(line => {
        const trimmed = line.trim();
        if (trimmed.length === 0) return true; // Keep empty lines for spacing
        // Remove lines that are only separator characters (═, -, _, =, etc.)
        // Match lines with 10+ repeated separator characters
        const separatorPattern = /^[═\-_=]{10,}$/;
        if (separatorPattern.test(trimmed)) {
          return false; // Remove separator lines
        }
        return true;
      })
      .map(line => {
        // Remove any problematic characters that cause jsPDF encoding issues
        return line
          .replace(/%P/g, '') // Remove %P characters
          .replace(/═/g, '') // Remove ═ characters (they cause %P in PDF)
          .trim();
      })
      .filter(line => line.length > 0 || line === '') // Keep empty lines but remove lines with only whitespace after cleaning
      .join('\n');
    
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 25; // 2.5cm margins (legal standard)
    const contentWidth = pageWidth - (margin * 2);
    let yPosition = margin;

    // Helper function to add a new page if needed
    const checkPageBreak = (requiredSpace: number): boolean => {
      if (yPosition + requiredSpace > pageHeight - margin - 20) { // 20mm for footer
        doc.addPage();
        yPosition = margin;
        addHeader(doc, pageWidth, margin, options.documentTitle);
        return true;
      }
      return false;
    };

    // Helper function to clean text before adding to PDF
    const cleanText = (text: string): string => {
      if (!text) return '';
      // Remove separator lines and special characters that cause issues
      return text
        .replace(/[═\-_=]{10,}/g, '') // Remove separator lines
        .replace(/%P/g, '') // Remove %P characters (jsPDF encoding issue)
        .replace(/═/g, '') // Remove ═ characters (they cause %P in PDF)
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
    };

    // Helper function to add text with word wrapping
    const addWrappedText = (
      text: string, 
      fontSize: number, 
      isBold: boolean = false, 
      color: [number, number, number] = [0, 0, 0],
      align: 'left' | 'center' | 'right' | 'justify' = 'left'
    ) => {
      // Clean text before processing
      const cleanedText = cleanText(text);
      if (!cleanedText) return; // Skip empty text
      
      doc.setFontSize(fontSize);
      doc.setTextColor(color[0], color[1], color[2]);
      if (isBold) {
        doc.setFont('times', 'bold');
      } else {
        doc.setFont('times', 'normal');
      }

      const lines = doc.splitTextToSize(cleanedText, contentWidth);
      const lineHeight = fontSize * 0.45;
      
      checkPageBreak(lines.length * lineHeight);
      
      lines.forEach((line: string) => {
        const cleanedLine = cleanText(line);
        if (cleanedLine) {
          doc.text(cleanedLine, margin, yPosition, { align });
          yPosition += lineHeight;
        }
      });
    };

    // Add header to first page
    addHeader(doc, pageWidth, margin, options.documentTitle);
    yPosition = margin + 30; // Space after header

    // Document title (centered, large, bold)
    checkPageBreak(20);
    doc.setFontSize(16);
    doc.setFont('times', 'bold');
    doc.setTextColor(0, 0, 0);
    const titleLines = doc.splitTextToSize(options.documentTitle.toUpperCase(), contentWidth);
    titleLines.forEach((line: string, index: number) => {
      if (index === 0) {
        checkPageBreak(20);
      }
      doc.text(line, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 8;
    });
    yPosition += 5;

    // Policy ID and metadata
    if (options.policyId) {
      checkPageBreak(10);
      doc.setFontSize(9);
      doc.setFont('times', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(`Policy ID: ${options.policyId}`, margin, yPosition);
      yPosition += 6;
    }

    // Confidential notice
    checkPageBreak(10);
    doc.setFontSize(9);
    doc.setFont('times', 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text('CONFIDENTIAL - Internal Use Only', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    // Horizontal line separator
    checkPageBreak(5);
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // Parse and format the content (use cleaned content)
    const sections = parsePolicyContent(cleanedContent);

    // Add each section
    sections.forEach((section, index) => {
      if (index > 0) {
        checkPageBreak(15);
        yPosition += 8;
      }

      // Section title (e.g., "1. INTRODUCTION")
      if (section.title) {
        checkPageBreak(12);
        doc.setFontSize(12);
        doc.setFont('times', 'bold');
        doc.setTextColor(0, 0, 0);
        const titleLines = doc.splitTextToSize(section.title, contentWidth);
        titleLines.forEach((line: string) => {
          checkPageBreak(8);
          doc.text(line, margin, yPosition);
          yPosition += 7;
        });
        yPosition += 3;
      }

      // Subsection titles (e.g., "1.1 Purpose")
      if (section.subsections && section.subsections.length > 0) {
        section.subsections.forEach((subsection) => {
          checkPageBreak(10);
          yPosition += 3;
          
          // Subsection title
          if (subsection.title) {
            doc.setFontSize(11);
            doc.setFont('times', 'bold');
            doc.setTextColor(0, 0, 0);
            const subTitleLines = doc.splitTextToSize(subsection.title, contentWidth);
            subTitleLines.forEach((line: string) => {
              checkPageBreak(7);
              doc.text(line, margin, yPosition);
              yPosition += 6;
            });
            yPosition += 2;
          }
          
          // Subsection content
          if (subsection.content) {
            addWrappedText(subsection.content, 10, false, [0, 0, 0], 'justify');
            yPosition += 3;
          }
        });
      } else if (section.content) {
        // Regular paragraph content
        addWrappedText(section.content, 10, false, [0, 0, 0], 'justify');
        yPosition += 3;
      }

      // Table content
      if (section.table) {
        checkPageBreak(20);
        yPosition += 5;
        addTable(doc, section.table, margin, yPosition, contentWidth);
        yPosition += section.table.rows.length * 8 + 5;
      }
    });

    // Add footer to all pages
    addFooter(doc, pageWidth, pageHeight, margin, options.organizationName, options.generatedDate || new Date());

    // Generate blob
    const pdfBlob = doc.output('blob');
    return pdfBlob;
  } catch (error) {
    console.error('Error in generatePolicyPDF:', error);
    throw error;
  }
}

/**
 * Add header to page (document title in header)
 */
function addHeader(doc: any, pageWidth: number, margin: number, documentTitle: string) {
  doc.setFontSize(9);
  doc.setFont('times', 'normal');
  doc.setTextColor(100, 100, 100);
  const headerText = doc.splitTextToSize(documentTitle, pageWidth - (margin * 2));
  if (headerText.length > 0) {
    doc.text(headerText[0], pageWidth / 2, margin - 10, { align: 'center' });
  }
}

/**
 * Add footer to all pages (page numbers, organization, date)
 */
function addFooter(
  doc: any, 
  pageWidth: number, 
  pageHeight: number, 
  margin: number,
  organizationName: string,
  generatedDate: Date
) {
  const pageCount = doc.getNumberOfPages();
  const dateStr = generatedDate.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.setFont('times', 'normal');
    
    // Page number (centered)
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    
    // Organization and date (left and right)
    doc.text(
      organizationName,
      margin,
      pageHeight - 10
    );
    
    doc.text(
      `Generated: ${dateStr}`,
      pageWidth - margin,
      pageHeight - 10,
      { align: 'right' }
    );
  }
}

/**
 * Add a table to the PDF
 */
function addTable(doc: any, table: { headers: string[]; rows: string[][] }, x: number, y: number, width: number) {
  const colWidth = width / table.headers.length;
  const rowHeight = 8;
  
  // Table headers
  doc.setFontSize(10);
  doc.setFont('times', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  
  table.headers.forEach((header, colIndex) => {
    doc.rect(x + (colIndex * colWidth), y, colWidth, rowHeight);
    doc.text(header, x + (colIndex * colWidth) + 2, y + 5);
  });
  
  // Table rows
  doc.setFont('times', 'normal');
  table.rows.forEach((row, rowIndex) => {
    const rowY = y + (rowIndex + 1) * rowHeight;
    row.forEach((cell, colIndex) => {
      doc.rect(x + (colIndex * colWidth), rowY, colWidth, rowHeight);
      const cellLines = doc.splitTextToSize(cell, colWidth - 4);
      cellLines.forEach((line: string, lineIndex: number) => {
        doc.text(line, x + (colIndex * colWidth) + 2, rowY + 5 + (lineIndex * 4));
      });
    });
  });
}

/**
 * Parse policy content into structured sections
 */
function parsePolicyContent(content: string): Array<{
  title?: string;
  content?: string;
  subsections?: Array<{ title: string; content: string }>;
  table?: { headers: string[]; rows: string[][] };
}> {
  const sections: Array<{
    title?: string;
    content?: string;
    subsections?: Array<{ title: string; content: string }>;
    table?: { headers: string[]; rows: string[][] };
  }> = [];

  // Content is already cleaned in generatePolicyPDF, but do additional cleaning here
  const cleanedContent = content
    .split('\n')
    .filter(line => {
      const trimmed = line.trim();
      // Remove lines that are only separator characters (═, -, _, =, etc.)
      if (trimmed.length === 0) return true; // Keep empty lines
      // Check if line is only separator characters (at least 10 characters of the same type)
      const separatorPattern = /^[═\-_=]{10,}$/;
      return !separatorPattern.test(trimmed);
    })
    .map(line => line.replace(/═/g, '').replace(/%P/g, '').trim())
    .join('\n');

  const lines = cleanedContent.split('\n');
  let currentSection: {
    title?: string;
    content?: string;
    subsections?: Array<{ title: string; content: string }>;
    table?: { headers: string[]; rows: string[][] };
  } = {};
  let currentContent: string[] = [];
  let currentSubsection: { title: string; content: string[] } | null = null;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    const nextLine = i < lines.length - 1 ? lines[i + 1]?.trim() : '';
    
    // Remove separator lines (lines with only special characters)
    const separatorPattern = /^[═\-_=]{10,}$/;
    if (separatorPattern.test(line)) {
      continue; // Skip separator lines
    }
    
    // Clean line of any remaining special characters that cause issues
    line = line
      .replace(/═/g, '') // Remove ═ characters (they cause %P in PDF)
      .replace(/%P/g, '') // Remove %P characters
      .trim();
    
    // Skip empty lines at the start
    if (line.length === 0 && currentContent.length === 0 && !currentSection.title) {
      continue;
    }
    
    // Detect main section headers (lines starting with numbers like "1.", "2.", "3.")
    // Pattern: "1. TITLE" or "POLICY 1: TITLE"
    const sectionMatch = line.match(/^(\d+\.|POLICY\s+\d+:)\s*(.+)$/i);
    if (sectionMatch) {
      // Save previous section
      if (currentSubsection) {
        if (!currentSection.subsections) {
          currentSection.subsections = [];
        }
        currentSection.subsections.push({
          title: currentSubsection.title,
          content: currentSubsection.content.join('\n').trim()
        });
        currentSubsection = null;
      }
      
      if (currentSection.title || currentContent.length > 0) {
        if (currentContent.length > 0) {
          currentSection.content = currentContent.join('\n').trim();
        }
        if (currentSection.title || currentSection.content || currentSection.subsections) {
          sections.push(currentSection);
        }
      }
      
      // Start new section
      currentSection = { title: sectionMatch[2].trim() };
      currentContent = [];
      currentSubsection = null;
      continue;
    }

    // Detect subsection headers (lines starting with numbers like "1.1", "2.3")
    const subsectionMatch = line.match(/^(\d+\.\d+)\s+(.+)$/);
    if (subsectionMatch) {
      // Save current subsection if exists
      if (currentSubsection) {
        if (!currentSection.subsections) {
          currentSection.subsections = [];
        }
        currentSection.subsections.push({
          title: currentSubsection.title,
          content: currentSubsection.content.join('\n').trim()
        });
      }
      
      // Start new subsection
      currentSubsection = {
        title: line,
        content: []
      };
      continue;
    }

    // Detect table headers (Field/Value pattern)
    if (line === 'Field' || line === 'Value' || line.includes('\t')) {
      // This might be a table - skip for now (can be enhanced later)
      continue;
    }

    // Add to current subsection or main content (only if line is not empty after cleaning)
    if (currentSubsection) {
      if (line.length > 0) {
        currentSubsection.content.push(line);
      }
    } else {
      if (line.length > 0 || currentContent.length > 0) {
        currentContent.push(line);
      }
    }
  }

  // Save last subsection
  if (currentSubsection) {
    if (!currentSection.subsections) {
      currentSection.subsections = [];
    }
    currentSection.subsections.push({
      title: currentSubsection.title,
      content: currentSubsection.content.join('\n').trim()
    });
  }

  // Save last section
  if (currentSection.title || currentContent.length > 0) {
    if (currentContent.length > 0) {
      currentSection.content = currentContent.join('\n').trim();
    }
    if (currentSection.title || currentSection.content || currentSection.subsections) {
      sections.push(currentSection);
    }
  }

  // If no sections were found, treat entire content as one section
  if (sections.length === 0) {
    // Clean content before adding
    const cleanedContent = content
      .split('\n')
      .filter(line => {
        const trimmed = line.trim();
        if (trimmed.length === 0) return true;
        const separatorPattern = /^[═\-_=]{10,}$/;
        return !separatorPattern.test(trimmed);
      })
      .map(line => line.replace(/═/g, '').replace(/%P/g, '').trim())
      .join('\n');
    
    sections.push({
      content: cleanedContent
    });
  }

  return sections;
}

/**
 * Download PDF file
 */
export function downloadPolicyPDF(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
