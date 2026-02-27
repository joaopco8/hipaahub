/**
 * Professional PDF Generator for HIPAA Breach Notification Letters
 * Creates legally compliant, professionally formatted PDF documents
 * Uses new design system: Cisco Navy (#0e274e) and Cisco Blue (#00bceb)
 */

interface PDFOptions {
  organizationName: string;
  documentTitle: string;
  content: string;
  recipientName?: string;
  breachId?: string;
  organization?: {
    legal_name?: string;
    dba?: string;
    address_street?: string;
    address_city?: string;
    address_state?: string;
    address_zip?: string;
    phone_number?: string;
    email_address?: string;
    website?: string;
    ein?: string;
    npi?: string;
    state_license_number?: string;
    privacy_officer_name?: string;
    privacy_officer_email?: string;
    privacy_officer_phone?: string;
    privacy_officer_role?: string;
  };
  breachDetails?: {
    discoveryDate?: string;
    incidentDate?: string;
    numberOfIndividuals?: number;
    breachType?: string;
  };
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

  // Color constants - New design system
  const CISCO_NAVY: [number, number, number] = [14, 39, 78]; // #0e274e
  const CISCO_BLUE: [number, number, number] = [0, 188, 235]; // #00bceb
  const GRAY_DARK: [number, number, number] = [60, 60, 60];
  const GRAY_MEDIUM: [number, number, number] = [100, 100, 100];
  const GRAY_LIGHT: [number, number, number] = [150, 150, 150];
  const WHITE: [number, number, number] = [255, 255, 255];

  // Helper function to add a section header
  const addSectionHeader = (text: string) => {
    checkPageBreak(15);
    yPosition += 8;
    addWrappedText(text, 14, true, CISCO_NAVY);
    yPosition += 3;
  };

  // Helper function to add a subsection
  const addSubsection = (title: string, content: string) => {
    checkPageBreak(20);
    yPosition += 5;
    addWrappedText(title, 11, true, CISCO_NAVY);
    yPosition += 2;
    addWrappedText(content, 10, false, GRAY_DARK);
    yPosition += 3;
  };

  // Helper function to format address
  const formatAddress = () => {
    if (!options.organization) return '';
    const org = options.organization;
    const parts: string[] = [];
    if (org.address_street) parts.push(org.address_street);
    if (org.address_city || org.address_state || org.address_zip) {
      const cityStateZip = [];
      if (org.address_city) cityStateZip.push(org.address_city);
      if (org.address_state) cityStateZip.push(org.address_state);
      if (org.address_zip) cityStateZip.push(org.address_zip);
      parts.push(cityStateZip.join(', '));
    }
    return parts.join('\n') || '';
  };

  // Page 1: Professional Letterhead
  // Top accent line (Cisco Blue)
  doc.setDrawColor(CISCO_BLUE[0], CISCO_BLUE[1], CISCO_BLUE[2]);
  doc.setLineWidth(3);
  doc.line(margin, margin, pageWidth - margin, margin);
  yPosition = margin + 12;

  // Organization name (large, Navy)
  const orgName = options.organization?.legal_name || options.organizationName;
  addWrappedText(orgName, 20, true, CISCO_NAVY);
  yPosition += 2;

  // DBA if exists
  if (options.organization?.dba) {
    addWrappedText(`DBA: ${options.organization.dba}`, 10, false, GRAY_MEDIUM);
    yPosition += 4;
  }

  // Organization address
  const address = formatAddress();
  if (address) {
    addWrappedText(address, 10, false, GRAY_DARK);
    yPosition += 4;
  }

  // Contact information
  const contactInfo: string[] = [];
  if (options.organization?.phone_number) {
    contactInfo.push(`Phone: ${options.organization.phone_number}`);
  }
  if (options.organization?.email_address) {
    contactInfo.push(`Email: ${options.organization.email_address}`);
  }
  if (options.organization?.website) {
    contactInfo.push(`Website: ${options.organization.website}`);
  }
  if (contactInfo.length > 0) {
    addWrappedText(contactInfo.join(' | '), 9, false, GRAY_MEDIUM);
    yPosition += 5;
  }

  // Organization identifiers
  const identifiers: string[] = [];
  if (options.organization?.ein) {
    identifiers.push(`EIN: ${options.organization.ein}`);
  }
  if (options.organization?.npi) {
    identifiers.push(`NPI: ${options.organization.npi}`);
  }
  if (options.organization?.state_license_number) {
    identifiers.push(`State License: ${options.organization.state_license_number}`);
  }
  if (identifiers.length > 0) {
    addWrappedText(identifiers.join(' | '), 9, false, GRAY_MEDIUM);
    yPosition += 6;
  }

  // Divider line
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 8;

  // Document title (Cisco Blue accent)
  addWrappedText(options.documentTitle, 16, true, CISCO_BLUE);
  yPosition += 3;

  // Legal reference
  addWrappedText('Required Notification - 45 CFR §164.404', 9, false, GRAY_MEDIUM);
  yPosition += 10;

  // Document metadata section (clean box)
  const metadataY = yPosition;
  doc.setDrawColor(230, 230, 230);
  doc.setLineWidth(0.5);
  doc.setFillColor(248, 249, 250);
  doc.roundedRect(margin, metadataY, contentWidth, 30, 2, 2, 'FD');
  
  yPosition = metadataY + 8;
  addWrappedText('Document Information', 10, true, CISCO_NAVY);
  yPosition += 5;
  
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  addWrappedText(`Generated: ${dateStr}`, 9, false, GRAY_DARK);
  yPosition += 4;
  
  if (options.breachId) {
    addWrappedText(`Breach ID: ${options.breachId}`, 9, false, GRAY_DARK);
    yPosition += 4;
  }

  if (options.breachDetails?.discoveryDate) {
    const discoveryDate = new Date(options.breachDetails.discoveryDate).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    addWrappedText(`Discovery Date: ${discoveryDate}`, 9, false, GRAY_DARK);
    yPosition += 4;
  }

  if (options.breachDetails?.numberOfIndividuals) {
    addWrappedText(`Individuals Affected: ${options.breachDetails.numberOfIndividuals}`, 9, false, GRAY_DARK);
  }
  
  yPosition = metadataY + 32;

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

  // Footer on each page (professional, minimal)
  const addFooter = () => {
    const pageCount = doc.getNumberOfPages();
    const orgName = options.organization?.legal_name || options.organizationName;
    
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Footer line
      doc.setDrawColor(230, 230, 230);
      doc.setLineWidth(0.5);
      doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
      
      // Footer text
      doc.setFontSize(8);
      doc.setTextColor(GRAY_LIGHT[0], GRAY_LIGHT[1], GRAY_LIGHT[2]);
      doc.setFont('helvetica', 'normal');
      
      const footerText = `Page ${i} of ${pageCount} | ${orgName} | Confidential - HIPAA Breach Notification`;
      doc.text(
        footerText,
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
