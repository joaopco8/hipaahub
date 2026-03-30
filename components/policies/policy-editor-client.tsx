'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import Placeholder from '@tiptap/extension-placeholder';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3, Pilcrow,
  List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight,
  ArrowLeft, Save, CheckCircle, Download, History,
  Archive, AlertTriangle, Eye, Clock, User, Calendar, RotateCcw,
  ChevronRight, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ActionGate } from '@/components/action-gate';
import { saveEditorDraft, activatePolicyWithSignature, archivePolicy } from '@/app/actions/policy-editor';
import { getPolicyVersionHistory, getPolicyVersionContent } from '@/app/actions/policy-documents';
import { useSubscription } from '@/contexts/subscription-context';
import jsPDF from 'jspdf';

/* ─── Types ────────────────────────────────────────────────────────────────── */

interface GenStatus {
  policyStatus: string;
  signatureName: string | null;
  signedAt: string | null;
  nextReviewDate: string | null;
  generationCount: number;
  lastGeneratedAt: string | null;
}

interface OrgData {
  name?: string;
  legal_name?: string;
  address_street?: string;
  address_city?: string;
  address_state?: string;
  address_zip?: string;
  privacy_officer_name?: string;
  privacy_officer_email?: string;
  compliance_contact_phone?: string;
  security_officer_name?: string;
  security_officer_email?: string;
}

interface PolicyEditorClientProps {
  policyId: number;
  policyName: string;
  initialContent: string;
  isLocked: boolean;
  orgData: OrgData;
  genStatus: GenStatus | null;
  currentVersionNumber: number;
  userId: string;
  userFullName: string;
}

/* ─── Helpers ───────────────────────────────────────────────────────────────── */

const PLACEHOLDER_LABELS: Record<string, string> = {
  ORGANIZATION_NAME: 'Organization Name',
  ORGANIZATION_LEGAL_NAME: 'Legal Name',
  ORGANIZATION_ADDRESS: 'Organization Address',
  PRIVACY_OFFICER_NAME: 'Privacy Officer Name',
  PRIVACY_OFFICER_EMAIL: 'Privacy Officer Email',
  PRIVACY_OFFICER_PHONE: 'Privacy Officer Phone',
  SECURITY_OFFICER_NAME: 'Security Officer Name',
  SECURITY_OFFICER_EMAIL: 'Security Officer Email',
  EFFECTIVE_DATE: 'Effective Date',
  REVIEW_DATE: 'Review Date',
};

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-[#71bc48]/10 text-[#71bc48] border-0',
  in_review: 'bg-amber-50 text-amber-600 border-0',
  archived: 'bg-gray-100 text-gray-500 border-0',
  draft: 'bg-[#00bceb]/10 text-[#00bceb] border-0',
};
const STATUS_LABELS: Record<string, string> = {
  active: 'Active', in_review: 'In Review', archived: 'Archived', draft: 'Draft',
};

function extractPlaceholders(html: string): string[] {
  const matches = html.match(/\{\{([A-Z_]+)\}\}/g) || [];
  const unique: string[] = [];
  matches.forEach((m) => {
    const key = m.replace(/\{\{|\}\}/g, '');
    if (!unique.includes(key)) unique.push(key);
  });
  return unique;
}

/* ─── Toolbar Button ─────────────────────────────────────────────────────────── */

function ToolbarBtn({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      title={title}
      className={`flex h-8 w-8 items-center justify-center rounded text-sm transition-colors ${
        active
          ? 'bg-[#00bceb] text-white'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      {children}
    </button>
  );
}

/* ─── Signature Modal ─────────────────────────────────────────────────────────── */

function SignatureModal({
  policyName,
  onConfirm,
  onClose,
}: {
  policyName: string;
  onConfirm: (name: string) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md bg-white shadow-xl rounded-none p-6 mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-light text-[#0e274e]">Activate {policyName}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-sm text-gray-500 font-light mb-6">
          By activating this policy, you confirm that it has been reviewed, approved, and is ready
          to be enforced across your organization.
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Type your full name to confirm</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full border border-gray-200 rounded-none px-3 py-2 text-sm focus:outline-none focus:border-[#00bceb]"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Date</label>
            <input
              type="text"
              value={today}
              readOnly
              className="w-full border border-gray-100 rounded-none px-3 py-2 text-sm bg-gray-50 text-gray-500"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <Button
            onClick={() => name.trim() && onConfirm(name.trim())}
            disabled={!name.trim()}
            className="flex-1 bg-[#00bceb] hover:bg-[#00a0c9] text-white rounded-none font-light"
          >
            Activate Policy
          </Button>
          <Button variant="outline" onClick={onClose} className="rounded-none border-gray-200">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Archive Confirm Modal ──────────────────────────────────────────────────── */

function ArchiveModal({
  policyName,
  onConfirm,
  onClose,
}: {
  policyName: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md bg-white shadow-xl rounded-none p-6 mx-4">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <h3 className="text-lg font-light text-[#0e274e]">Archive {policyName}?</h3>
        </div>
        <p className="text-sm text-gray-500 font-light mb-6">
          This policy will be archived and removed from active enforcement. You can restore it by
          creating a new draft. Version history will be preserved.
        </p>
        <div className="flex gap-3">
          <Button
            onClick={onConfirm}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-none font-light"
          >
            Archive Policy
          </Button>
          <Button variant="outline" onClick={onClose} className="rounded-none border-gray-200">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Version History Panel ──────────────────────────────────────────────────── */

function VersionHistoryPanel({
  policyId,
  policyName,
  onRestore,
  onClose,
}: {
  policyId: number;
  policyName: string;
  onRestore: (content: string, versionNumber: number) => void;
  onClose: () => void;
}) {
  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewVersion, setPreviewVersion] = useState<{ id: string; content: string; number: number } | null>(null);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    getPolicyVersionHistory(policyId).then((v) => {
      setVersions(v);
      setLoading(false);
    });
  }, [policyId]);

  const handlePreview = async (versionId: string, versionNumber: number) => {
    const data = await getPolicyVersionContent(versionId);
    if (data) {
      setPreviewVersion({ id: versionId, content: data.content_snapshot, number: versionNumber });
    }
  };

  const handleRestore = async () => {
    if (!previewVersion) return;
    setRestoring(true);
    onRestore(previewVersion.content, previewVersion.number);
    setRestoring(false);
    setPreviewVersion(null);
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white shadow-2xl flex flex-col h-full overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-[#00bceb]" />
            <h3 className="font-light text-[#0e274e]">Version History</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        {previewVersion ? (
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 bg-amber-50 border-b">
              <Eye className="h-3.5 w-3.5 text-amber-600" />
              <span className="text-xs text-amber-700">Previewing v{previewVersion.number}</span>
              <button
                onClick={() => setPreviewVersion(null)}
                className="ml-auto text-amber-600 hover:text-amber-800 text-xs"
              >
                ← Back to list
              </button>
            </div>
            <div
              className="flex-1 overflow-y-auto p-5 prose prose-sm max-w-none text-xs leading-relaxed"
              dangerouslySetInnerHTML={{ __html: previewVersion.content }}
            />
            <div className="p-4 border-t bg-gray-50">
              <Button
                onClick={handleRestore}
                disabled={restoring}
                className="w-full bg-[#00bceb] hover:bg-[#00a0c9] text-white rounded-none font-light text-sm"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-2" />
                Restore v{previewVersion.number} as new draft
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-gray-400 text-sm">
                Loading versions...
              </div>
            ) : versions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <History className="h-10 w-10 mb-3 text-gray-200" />
                <p className="text-sm">No saved versions yet</p>
              </div>
            ) : (
              <div className="divide-y">
                {versions.map((v: any, idx: number) => (
                  <div key={v.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="flex items-center justify-center h-7 w-7 rounded-full bg-[#f3f5f9] text-[#0e274e] text-xs font-light shrink-0">
                          v{v.version_number}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <Badge className={`${STATUS_STYLES[v.status] || STATUS_STYLES.draft} rounded-none font-normal text-[10px]`}>
                              {STATUS_LABELS[v.status] || v.status}
                            </Badge>
                            {idx === 0 && (
                              <Badge className="bg-[#0e274e]/5 text-[#0e274e] border-0 rounded-none font-normal text-[10px]">
                                Latest
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 font-light mt-1">
                            {new Date(v.created_at).toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric', year: 'numeric',
                              hour: '2-digit', minute: '2-digit',
                            })}
                          </p>
                          {v.notes && (
                            <p className="text-xs text-gray-400 mt-1 italic">{v.notes}</p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handlePreview(v.id, v.version_number)}
                        className="text-xs text-[#00bceb] hover:text-[#0098c0] shrink-0 ml-2"
                      >
                        Preview
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Main Editor ────────────────────────────────────────────────────────────── */

export function PolicyEditorClient({
  policyId,
  policyName,
  initialContent,
  isLocked,
  orgData,
  genStatus,
  currentVersionNumber,
  userId,
  userFullName,
}: PolicyEditorClientProps) {
  const router = useRouter();
  const { subscriptionStatus } = useSubscription();

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'failed'>('idle');
  const [currentStatus, setCurrentStatus] = useState(genStatus?.policyStatus ?? 'draft');
  const [currentVersion, setCurrentVersion] = useState(currentVersionNumber);
  const [currentSignatureName, setCurrentSignatureName] = useState(genStatus?.signatureName ?? null);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // for mobile
  const [detectedPlaceholders, setDetectedPlaceholders] = useState<string[]>([]);

  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);
  const lastSavedContent = useRef<string>(initialContent);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight.configure({ multicolor: false }),
      Typography,
      Placeholder.configure({
        placeholder: 'Start editing your policy...',
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class:
          'min-h-[60vh] focus:outline-none prose prose-sm max-w-none text-[#0e274e] text-sm leading-relaxed [&_h1]:text-2xl [&_h1]:font-light [&_h1]:text-[#0e274e] [&_h1]:mb-4 [&_h2]:text-lg [&_h2]:font-light [&_h2]:text-[#0e274e] [&_h2]:mt-6 [&_h2]:mb-2 [&_h3]:text-base [&_h3]:font-normal [&_h3]:text-[#0e274e] [&_h3]:mt-4 [&_h3]:mb-1 [&_p]:text-gray-700 [&_p]:mb-3 [&_ul]:pl-5 [&_ol]:pl-5 [&_li]:mb-1',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // Update detected placeholders in real time
      setDetectedPlaceholders(extractPlaceholders(html));

      // Reset auto-save timer
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = setTimeout(() => {
        doAutoSave(html);
      }, 60_000);
    },
  });

  // Detect initial placeholders
  useEffect(() => {
    setDetectedPlaceholders(extractPlaceholders(initialContent));
  }, [initialContent]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, []);

  const doAutoSave = useCallback(
    async (html: string) => {
      if (html === lastSavedContent.current) return;
      setSaveStatus('saving');
      try {
        const result = await saveEditorDraft(policyId, policyName, html);
        lastSavedContent.current = html;
        setCurrentVersion(result.versionNumber);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } catch {
        setSaveStatus('failed');
      }
    },
    [policyId, policyName]
  );

  const handleSaveDraft = async () => {
    if (!editor) return;
    setSaveStatus('saving');
    try {
      const html = editor.getHTML();
      const result = await saveEditorDraft(policyId, policyName, html);
      lastSavedContent.current = html;
      setCurrentVersion(result.versionNumber);
      setSaveStatus('saved');
      toast.success('Draft saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch {
      setSaveStatus('failed');
      toast.error('Failed to save draft');
    }
  };

  const handleActivate = async (signatureName: string) => {
    setShowSignatureModal(false);
    try {
      // First save current content
      if (editor) {
        const html = editor.getHTML();
        await saveEditorDraft(policyId, policyName, html);
        lastSavedContent.current = html;
      }
      await activatePolicyWithSignature(policyId, policyName, signatureName);
      setCurrentStatus('active');
      setCurrentSignatureName(signatureName);
      toast.success(`${policyName} activated`);
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to activate policy');
    }
  };

  const handleArchive = async () => {
    setShowArchiveModal(false);
    try {
      await archivePolicy(policyId);
      setCurrentStatus('archived');
      toast.success('Policy archived');
      router.refresh();
    } catch {
      toast.error('Failed to archive policy');
    }
  };

  const handleDownloadPDF = () => {
    if (!editor) return;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 25;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    const today = new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
    const version = currentVersion > 0 ? currentVersion : 1;

    // Helper: add header to each page
    const addHeader = () => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`${orgData.name || 'Organization'} | ${policyName} | v${version}`, margin, 12);
      doc.setDrawColor(220, 220, 220);
      doc.line(margin, 14, pageWidth - margin, 14);
    };

    // Helper: add footer
    const addFooter = (pageNum: number, totalPages: number) => {
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Confidential — ${orgData.name || 'Organization'} HIPAA Compliance Documentation | Generated by HIPAA Hub`,
        margin,
        pageHeight - 10
      );
      doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - margin - 20, pageHeight - 10);
    };

    addHeader();

    // Cover section
    y = 30;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(14, 39, 78);
    const orgName = orgData.name || '{{ORGANIZATION_NAME}}';
    doc.text(orgName.toUpperCase(), margin, y);
    y += 12;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    const titleLines = doc.splitTextToSize(policyName, contentWidth);
    doc.text(titleLines, margin, y);
    y += titleLines.length * 7 + 6;

    doc.setFontSize(10);
    doc.setTextColor(86, 86, 86);
    const metaLines = [
      `Version: v${version}`,
      `Effective Date: ${today}`,
      genStatus?.nextReviewDate
        ? `Review Date: ${new Date(genStatus.nextReviewDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`
        : '',
      currentSignatureName
        ? `Approved by: ${currentSignatureName}`
        : '',
      'Classification: Confidential',
    ].filter(Boolean);

    for (const line of metaLines) {
      doc.text(line, margin, y);
      y += 6;
    }

    y += 8;
    doc.setDrawColor(0, 188, 235);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    // Parse the editor HTML and add body content
    const html = editor.getHTML();
    const parser = new DOMParser();
    const domDoc = parser.parseFromString(html, 'text/html');
    const body = domDoc.body;

    const checkPage = (neededHeight: number) => {
      if (y + neededHeight > pageHeight - 20) {
        doc.addPage();
        addHeader();
        y = 22;
      }
    };

    const processNode = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) return;
      const el = node as Element;
      const tag = el.tagName?.toLowerCase();
      const text = el.textContent?.replace(/\s+/g, ' ').trim() || '';
      if (!text && tag !== 'ul' && tag !== 'ol') return;

      if (tag === 'h1') {
        checkPage(16);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(14, 39, 78);
        const lines = doc.splitTextToSize(text, contentWidth);
        doc.text(lines, margin, y);
        y += lines.length * 7 + 4;
      } else if (tag === 'h2') {
        checkPage(12);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(14, 39, 78);
        const lines = doc.splitTextToSize(text, contentWidth);
        doc.text(lines, margin, y);
        y += lines.length * 6 + 3;
      } else if (tag === 'h3') {
        checkPage(10);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(86, 86, 86);
        const lines = doc.splitTextToSize(text, contentWidth);
        doc.text(lines, margin, y);
        y += lines.length * 5.5 + 2;
      } else if (tag === 'p') {
        checkPage(10);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        const lines = doc.splitTextToSize(text, contentWidth);
        doc.text(lines, margin, y);
        y += lines.length * 5 + 3;
      } else if (tag === 'ul' || tag === 'ol') {
        const items = Array.from(el.querySelectorAll('li'));
        items.forEach((li, idx) => {
          checkPage(8);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          doc.setTextColor(60, 60, 60);
          const bullet = tag === 'ol' ? `${idx + 1}.` : '•';
          const liText = (li.textContent || '').replace(/\s+/g, ' ').trim();
          const lines = doc.splitTextToSize(liText, contentWidth - 8);
          doc.text(bullet, margin + 2, y);
          doc.text(lines, margin + 8, y);
          y += lines.length * 5 + 2;
        });
        y += 2;
      } else {
        // recurse into children
        el.childNodes.forEach(processNode);
      }
    };

    body.childNodes.forEach(processNode);

    // Add footers to all pages
    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      addFooter(i, totalPages);
    }

    const safeTitle = policyName.replace(/[^a-zA-Z0-9]/g, '_');
    const dateStr = new Date().toISOString().split('T')[0];
    doc.save(`${safeTitle}_v${version}_${dateStr}.pdf`);
  };

  const handleRestoreVersion = useCallback(
    async (content: string, versionNumber: number) => {
      if (!editor) return;
      if (
        !window.confirm(
          `This will create a new version as a copy of v${versionNumber}. Your current draft will be preserved. Continue?`
        )
      )
        return;

      editor.commands.setContent(content);
      setShowVersionHistory(false);
      // Auto-save restored content
      setSaveStatus('saving');
      try {
        const result = await saveEditorDraft(policyId, policyName, content);
        lastSavedContent.current = content;
        setCurrentVersion(result.versionNumber);
        setSaveStatus('saved');
        toast.success(`Restored v${versionNumber} as new draft v${result.versionNumber}`);
        setTimeout(() => setSaveStatus('idle'), 3000);
      } catch {
        setSaveStatus('failed');
        toast.error('Restore failed — please save manually');
      }
    },
    [editor, policyId, policyName]
  );

  if (!editor) return null;

  const statusStyle = STATUS_STYLES[currentStatus] || STATUS_STYLES.draft;
  const statusLabel = STATUS_LABELS[currentStatus] || currentStatus;

  // Build placeholder list for sidebar
  const orgFillMap: Record<string, string> = {
    ORGANIZATION_NAME: orgData.name || '',
    ORGANIZATION_LEGAL_NAME: orgData.legal_name || orgData.name || '',
    ORGANIZATION_ADDRESS: [
      orgData.address_street,
      orgData.address_city,
      orgData.address_state,
      orgData.address_zip,
    ]
      .filter(Boolean)
      .join(', '),
    PRIVACY_OFFICER_NAME: orgData.privacy_officer_name || '',
    PRIVACY_OFFICER_EMAIL: orgData.privacy_officer_email || '',
    PRIVACY_OFFICER_PHONE: orgData.compliance_contact_phone || '',
    SECURITY_OFFICER_NAME: orgData.security_officer_name || '',
    SECURITY_OFFICER_EMAIL: orgData.security_officer_email || '',
    EFFECTIVE_DATE: 'Auto-filled',
    REVIEW_DATE: 'Auto-filled',
  };

  const missingFields = detectedPlaceholders.filter((p) => !orgFillMap[p]);
  const filledInDoc = detectedPlaceholders.filter((p) => orgFillMap[p]);

  return (
    <>
      {/* ── Toolbar ─────────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 flex items-center gap-1 border-b border-gray-200 bg-white px-3 py-1.5 shadow-sm -mx-4 sm:-mx-8 mb-4 px-4 sm:px-8">
        {/* Left — text formatting */}
        <div className="flex items-center gap-0.5 border-r border-gray-200 pr-2 mr-1">
          <ToolbarBtn
            active={editor.isActive('bold')}
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Bold"
          >
            <Bold className="h-3.5 w-3.5" />
          </ToolbarBtn>
          <ToolbarBtn
            active={editor.isActive('italic')}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Italic"
          >
            <Italic className="h-3.5 w-3.5" />
          </ToolbarBtn>
          <ToolbarBtn
            active={editor.isActive('underline')}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            title="Underline"
          >
            <UnderlineIcon className="h-3.5 w-3.5" />
          </ToolbarBtn>
          <ToolbarBtn
            active={editor.isActive('strike')}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            title="Strikethrough"
          >
            <Strikethrough className="h-3.5 w-3.5" />
          </ToolbarBtn>
        </div>

        {/* Center — structure */}
        <div className="flex items-center gap-0.5 border-r border-gray-200 pr-2 mr-1">
          <ToolbarBtn
            active={editor.isActive('heading', { level: 1 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            title="Heading 1"
          >
            <Heading1 className="h-3.5 w-3.5" />
          </ToolbarBtn>
          <ToolbarBtn
            active={editor.isActive('heading', { level: 2 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            title="Heading 2"
          >
            <Heading2 className="h-3.5 w-3.5" />
          </ToolbarBtn>
          <ToolbarBtn
            active={editor.isActive('heading', { level: 3 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            title="Heading 3"
          >
            <Heading3 className="h-3.5 w-3.5" />
          </ToolbarBtn>
          <ToolbarBtn
            active={editor.isActive('paragraph')}
            onClick={() => editor.chain().focus().setParagraph().run()}
            title="Paragraph"
          >
            <Pilcrow className="h-3.5 w-3.5" />
          </ToolbarBtn>
          <ToolbarBtn
            active={editor.isActive('bulletList')}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="Bullet list"
          >
            <List className="h-3.5 w-3.5" />
          </ToolbarBtn>
          <ToolbarBtn
            active={editor.isActive('orderedList')}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="Numbered list"
          >
            <ListOrdered className="h-3.5 w-3.5" />
          </ToolbarBtn>
        </div>

        {/* Alignment */}
        <div className="flex items-center gap-0.5 border-r border-gray-200 pr-2 mr-1">
          <ToolbarBtn
            active={editor.isActive({ textAlign: 'left' })}
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            title="Align left"
          >
            <AlignLeft className="h-3.5 w-3.5" />
          </ToolbarBtn>
          <ToolbarBtn
            active={editor.isActive({ textAlign: 'center' })}
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            title="Align center"
          >
            <AlignCenter className="h-3.5 w-3.5" />
          </ToolbarBtn>
          <ToolbarBtn
            active={editor.isActive({ textAlign: 'right' })}
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            title="Align right"
          >
            <AlignRight className="h-3.5 w-3.5" />
          </ToolbarBtn>
        </div>

        {/* Right — actions */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Save indicator */}
          <span
            className={`text-xs font-light transition-colors ${
              saveStatus === 'saving'
                ? 'text-gray-400'
                : saveStatus === 'saved'
                ? 'text-[#71bc48]'
                : saveStatus === 'failed'
                ? 'text-red-500 cursor-pointer'
                : 'text-transparent'
            }`}
            onClick={saveStatus === 'failed' ? handleSaveDraft : undefined}
            title={saveStatus === 'failed' ? 'Click to retry' : undefined}
          >
            {saveStatus === 'saving' && 'Saving...'}
            {saveStatus === 'saved' && 'Saved ✓'}
            {saveStatus === 'failed' && 'Save failed — click to retry'}
          </span>

          <Button
            size="sm"
            variant="outline"
            onClick={handleSaveDraft}
            disabled={saveStatus === 'saving'}
            className="h-7 rounded-none border-gray-200 text-gray-600 hover:text-[#00bceb] text-xs"
          >
            <Save className="h-3 w-3 mr-1.5" />
            Save Draft
          </Button>

          <Link href="/dashboard/policies">
            <Button
              size="sm"
              variant="outline"
              className="h-7 rounded-none border-gray-200 text-gray-500 text-xs"
            >
              <ArrowLeft className="h-3 w-3 mr-1.5" />
              Policies
            </Button>
          </Link>

          {/* Mobile sidebar toggle */}
          <button
            className="lg:hidden flex items-center gap-1 text-xs text-gray-500 border border-gray-200 px-2 py-1"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <ChevronRight className={`h-3 w-3 transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
            Info
          </button>
        </div>
      </div>

      {/* ── Main layout ─────────────────────────────────────────────────────── */}
      <div className="flex w-full gap-0 items-start">
        {/* ── Editor area ───────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 bg-white border border-gray-200 shadow-sm">
          <div className="max-w-4xl mx-auto px-8 py-8 pb-24">
            <EditorContent editor={editor} />
          </div>
        </div>

        {/* ── Sidebar ───────────────────────────────────────────────────────── */}
        <aside
          className={`
            w-full lg:w-72 xl:w-80 shrink-0 border border-gray-200 bg-white lg:ml-4 shadow-sm
            flex flex-col lg:sticky lg:top-14
            ${sidebarOpen ? 'block mt-4' : 'hidden lg:flex'}
          `}
        >
          {/* Section 1: Policy Info */}
          <div className="p-5 border-b border-gray-200">
            <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
              Policy Info
            </h4>
            <p className="text-sm font-light text-[#0e274e] mb-2 leading-snug">{policyName}</p>
            <Badge className={`${statusStyle} rounded-none font-normal text-xs mb-3`}>
              {statusLabel}
            </Badge>

            {currentVersion > 0 && (
              <div className="text-xs text-gray-400 font-light space-y-1">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  Version v{currentVersion}
                </div>
                {genStatus?.lastGeneratedAt && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3" />
                    Last saved{' '}
                    {new Date(genStatus.lastGeneratedAt).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </div>
                )}
                {currentSignatureName && (
                  <div className="flex items-center gap-1.5 text-[#71bc48]">
                    <CheckCircle className="h-3 w-3" />
                    Signed by {currentSignatureName}
                  </div>
                )}
                {genStatus?.nextReviewDate && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />
                    Review{' '}
                    {new Date(genStatus.nextReviewDate).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 2: Placeholders */}
          <div className="p-5 border-b border-gray-200">
            <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
              Placeholders
            </h4>
            {detectedPlaceholders.length === 0 ? (
              <p className="text-xs text-[#71bc48] font-light flex items-center gap-1.5">
                <CheckCircle className="h-3 w-3" />
                All fields filled
              </p>
            ) : (
              <div className="space-y-1.5">
                {detectedPlaceholders.map((p) => {
                  const isFilled = !!orgFillMap[p];
                  return (
                    <div key={p} className="flex items-center justify-between gap-2">
                      <span className="text-xs text-gray-600 font-light truncate">
                        {PLACEHOLDER_LABELS[p] || p}
                      </span>
                      {isFilled ? (
                        <span className="text-[#71bc48] text-xs shrink-0">✓</span>
                      ) : (
                        <span className="text-amber-500 text-xs shrink-0">⚠</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            {missingFields.length > 0 && (
              <div className="mt-3 p-2.5 bg-amber-50 rounded-none">
                <p className="text-xs text-amber-700 font-light mb-1.5">
                  {missingFields.length} field{missingFields.length !== 1 ? 's' : ''} missing.
                  Update your organization profile to auto-fill.
                </p>
                <Link
                  href="/dashboard/organization"
                  className="text-xs text-[#00bceb] hover:underline"
                >
                  Update Organization Profile →
                </Link>
              </div>
            )}
          </div>

          {/* Section 3: Actions */}
          <div className="p-5 flex flex-col gap-2">
            <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
              Actions
            </h4>

            {/* Save Draft — always available */}
            <Button
              onClick={handleSaveDraft}
              disabled={saveStatus === 'saving'}
              className="w-full bg-[#00bceb] hover:bg-[#00a0c9] text-white rounded-none font-light text-sm h-9"
            >
              <Save className="h-3.5 w-3.5 mr-2" />
              Save Draft
            </Button>

            {/* Activate — ActionGate locked on trial */}
            {currentStatus !== 'active' && currentStatus !== 'archived' && (
              <ActionGate isLocked={isLocked} documentType="policy activation">
                <Button
                  onClick={() => setShowSignatureModal(true)}
                  variant="outline"
                  className="w-full rounded-none border-[#71bc48] text-[#71bc48] hover:bg-[#71bc48]/5 font-light text-sm h-9"
                >
                  <CheckCircle className="h-3.5 w-3.5 mr-2" />
                  Activate Policy
                </Button>
              </ActionGate>
            )}

            {/* Download PDF — ActionGate locked on trial */}
            <ActionGate isLocked={isLocked} documentType="policy PDF">
              <Button
                onClick={handleDownloadPDF}
                variant="outline"
                className="w-full rounded-none border-gray-200 text-gray-600 hover:text-[#00bceb] font-light text-sm h-9"
              >
                <Download className="h-3.5 w-3.5 mr-2" />
                Download PDF
              </Button>
            </ActionGate>

            {/* Version History */}
            <Button
              onClick={() => setShowVersionHistory(true)}
              variant="outline"
              className="w-full rounded-none border-gray-200 text-gray-600 hover:text-[#00bceb] font-light text-sm h-9"
            >
              <History className="h-3.5 w-3.5 mr-2" />
              Version History
            </Button>

            {/* Archive — only if active */}
            {currentStatus === 'active' && (
              <>
                <div className="border-t border-gray-200 my-1" />
                <Button
                  onClick={() => setShowArchiveModal(true)}
                  variant="outline"
                  className="w-full rounded-none border-red-200 text-red-500 hover:bg-red-50 font-light text-sm h-9"
                >
                  <Archive className="h-3.5 w-3.5 mr-2" />
                  Archive Policy
                </Button>
              </>
            )}

            {/* Back to preview */}
            <div className="border-t border-gray-200 mt-1 pt-2">
              <Link href={`/dashboard/policies/${policyId}/preview`}>
                <Button
                  variant="ghost"
                  className="w-full rounded-none text-gray-400 hover:text-[#0e274e] font-light text-xs h-8"
                >
                  <Eye className="h-3 w-3 mr-1.5" />
                  View Preview
                </Button>
              </Link>
            </div>
          </div>
        </aside>
      </div>

      {/* ── Modals ────────────────────────────────────────────────────────────── */}
      {showSignatureModal && (
        <SignatureModal
          policyName={policyName}
          onConfirm={handleActivate}
          onClose={() => setShowSignatureModal(false)}
        />
      )}

      {showArchiveModal && (
        <ArchiveModal
          policyName={policyName}
          onConfirm={handleArchive}
          onClose={() => setShowArchiveModal(false)}
        />
      )}

      {showVersionHistory && (
        <VersionHistoryPanel
          policyId={policyId}
          policyName={policyName}
          onRestore={handleRestoreVersion}
          onClose={() => setShowVersionHistory(false)}
        />
      )}
    </>
  );
}
