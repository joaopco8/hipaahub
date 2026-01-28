/**
 * Professional PDF Generator for HIPAA Breach Notification Letters
 * Creates legally compliant, professionally formatted PDF documents
 */

interface PDFOptions {
  organizationName: string;
  documentTitle: string;
  content: string;
  recipientName?: string;
  breachId?: string;
}

/**
 * Generate a professional PDF from Patient Notification Letter content
 */
export async function generatePatientNotificationPDF(options: PDFOptions): Promise<Blob> {
  try {
    // Dynamic import for Next.js compatibility
    const { default: jsPDF } = await import('jspdf');
    
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'letter'
    });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let yPosition = margin;

  // Helper function to add a new page if needed
  const checkPageBreak = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // Helper function to add text with word wrapping
  const addWrappedText = (text: string, fontSize: number, isBold: boolean = false, color: [number, number, number] = [0, 0, 0]) => {
    doc.setFontSize(fontSize);
    doc.setTextColor(color[0], color[1], color[2]);
    if (isBold) {
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setFont('helvetica', 'normal');
    }

    const lines = doc.splitTextToSize(text, contentWidth);
    const lineHeight = fontSize * 0.4;
    
    checkPageBreak(lines.length * lineHeight);
    
    lines.forEach((line: string) => {
      doc.text(line, margin, yPosition);
      yPosition += lineHeight;
    });
  };

  // Helper function to add a section header
  const addSectionHeader = (text: string) => {
    checkPageBreak(15);
    yPosition += 8;
    addWrappedText(text, 14, true, [12, 11, 29]); // #0c0b1d
    yPosition += 3;
  };

  // Helper function to add a subsection
  const addSubsection = (title: string, content: string) => {
    checkPageBreak(20);
    yPosition += 5;
    addWrappedText(title, 11, true, [12, 11, 29]);
    yPosition += 2;
    addWrappedText(content, 10, false, [60, 60, 60]);
    yPosition += 3;
  };

  // Page 1: Cover/Header
  // Top border line
  doc.setDrawColor(26, 208, 122); // #1ad07a
  doc.setLineWidth(2);
  doc.line(margin, margin, pageWidth - margin, margin);
  yPosition = margin + 8;

  // Organization name (large)
  addWrappedText(options.organizationName, 18, true, [12, 11, 29]);
  yPosition += 5;

  // Document title
  addWrappedText(options.documentTitle, 16, true, [26, 208, 122]);
  yPosition += 8;

  // Legal reference
  addWrappedText('Required for all breaches (45 CFR §164.404)', 9, false, [100, 100, 100]);
  yPosition += 10;

  // Document metadata box
  const metadataY = yPosition;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.rect(margin, metadataY, contentWidth, 25);
  
  yPosition = metadataY + 8;
  addWrappedText('Document Information', 10, true, [12, 11, 29]);
  yPosition += 5;
  
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  addWrappedText(`Generated: ${dateStr}`, 9, false, [100, 100, 100]);
  yPosition += 4;
  
  if (options.breachId) {
    addWrappedText(`Breach ID: ${options.breachId}`, 9, false, [100, 100, 100]);
    yPosition += 4;
  }
  
  yPosition = metadataY + 28;

  // Parse and format the content
  const sections = parseLetterContent(options.content);

  // Add each section
  sections.forEach((section, index) => {
    if (index > 0) {
      checkPageBreak(15);
      yPosition += 10;
    }

    if (section.title) {
      addSectionHeader(section.title);
    }

    if (section.subsections && section.subsections.length > 0) {
      section.subsections.forEach((subsection) => {
        addSubsection(subsection.title, subsection.content);
      });
    } else if (section.content) {
      addWrappedText(section.content, 10, false, [60, 60, 60]);
      yPosition += 3;
    }
  });

  // Footer on each page
  const addFooter = () => {
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Page ${i} of ${pageCount} | ${options.organizationName} | Confidential - HIPAA Breach Notification`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }
  };

  addFooter();

  // Generate blob
  const pdfBlob = doc.output('blob');
  return pdfBlob;
  } catch (error) {
    console.error('Error in generatePatientNotificationPDF:', error);
    throw error;
  }
}

/**
 * Parse letter content into structured sections
 */
function parseLetterContent(content: string): Array<{
  title?: string;
  content?: string;
  subsections?: Array<{ title: string; content: string }>;
}> {
  const sections: Array<{
    title?: string;
    content?: string;
    subsections?: Array<{ title: string; content: string }>;
  }> = [];

  const lines = content.split('\n');
  let currentSection: {
    title?: string;
    content?: string;
    subsections?: Array<{ title: string; content: string }>;
  } = {};
  let currentContent: string[] = [];
  let currentSubsection: { title: string; content: string[] } | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines at the start
    if (line.length === 0 && currentContent.length === 0 && !currentSection.title) {
      continue;
    }
    
    // Check if this is a SECTION header
    const sectionMatch = line.match(/^SECTION\s+\d+:\s*(.+)$/i);
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
        if (currentSection.title || currentSection.content) {
          sections.push(currentSection);
        }
      }
      
      // Start new section
      currentSection = { title: sectionMatch[1].trim() };
      currentContent = [];
      currentSubsection = null;
      continue;
    }

    // Check if this looks like a subsection title (short line, possibly with colon, followed by content)
    const isPotentialSubsectionTitle = line.length > 0 && 
                                       line.length < 80 && 
                                       !line.includes('.') && 
                                       (line.endsWith(':') || 
                                        (i < lines.length - 1 && 
                                         lines[i + 1]?.trim().length > 20 &&
                                         !lines[i + 1]?.trim().match(/^SECTION\s+\d+:/i)));

    if (isPotentialSubsectionTitle) {
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
        title: line.replace(/:/g, '').trim(),
        content: []
      };
      continue;
    }

    // Add to current subsection or main content
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
    sections.push({
      content: content
    });
  }

  return sections;
}

/**
 * Download PDF file
 */
export function downloadPDF(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
