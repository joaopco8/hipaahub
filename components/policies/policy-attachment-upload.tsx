'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Upload, X, FileText, Loader2, Trash2, Download, Plus } from 'lucide-react';
import { uploadPolicyAttachment, deletePolicyAttachment, getPolicyAttachments, getFileDownloadUrl, type PolicyAttachment } from '@/app/actions/policy-documents';
import { toast } from 'sonner';

interface PolicyAttachmentUploadProps {
  policyId: number;
  policyName: string;
}

export function PolicyAttachmentUpload({ policyId, policyName }: PolicyAttachmentUploadProps) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState<PolicyAttachment[]>([]);
  const [loadingAttachments, setLoadingAttachments] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadAttachments = async () => {
    setLoadingAttachments(true);
    try {
      const data = await getPolicyAttachments(policyId);
      setAttachments(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load attachments');
    } finally {
      setLoadingAttachments(false);
    }
  };

  const validateFile = (selectedFile: File): boolean => {
    if (selectedFile.size > 50 * 1024 * 1024) {
      toast.error('File size must be less than 50MB');
      return false;
    }
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/png',
      'image/jpeg',
      'image/jpg'
    ];
    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error('Invalid file type. Allowed: PDF, DOC, DOCX, TXT, PNG, JPEG, JPG');
      return false;
    }
    return true;
  };

  const handleFileSelect = (selectedFile: File) => {
    if (validateFile(selectedFile)) {
      setFile(selectedFile);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleDownload = async (attachment: PolicyAttachment) => {
    try {
      const url = await getFileDownloadUrl(attachment.storage_path, attachment.storage_bucket || 'documents');
      if (url) {
        window.open(url, '_blank');
      } else {
        toast.error('Failed to generate download link');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to download file');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    setUploading(true);
    try {
      await uploadPolicyAttachment(policyId, file, description || undefined);
      toast.success('Attachment uploaded successfully');
      setFile(null);
      setDescription('');
      setOpen(false);
      await loadAttachments();
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload attachment');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (attachmentId: string, fileName: string) => {
    if (!confirm(`Delete "${fileName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deletePolicyAttachment(attachmentId);
      toast.success('Document deleted');
      await loadAttachments();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete document');
    }
  };

  // Load attachments when dialog opens
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      loadAttachments();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full border-zinc-300 text-[#0c0b1d] hover:bg-[#f3f5f9] hover:border-zinc-400">
          <Upload className="mr-2 h-4 w-4" />
          Attach Document
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-xl font-semibold text-[#0c0b1d]">
            Attach Document
          </DialogTitle>
          <p className="text-sm text-zinc-600 mt-1">{policyName}</p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1">
          {/* Upload Section */}
          {!file && (
            <div
              className={`mt-6 border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging
                  ? 'border-[#1ad07a] bg-[#1ad07a]/5'
                  : 'border-zinc-300 bg-[#f3f5f9] hover:border-zinc-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="rounded-full bg-white p-4 border border-zinc-200">
                    <Upload className="h-6 w-6 text-[#0c0b1d]" />
                  </div>
                </div>
                <div>
                  <p className="text-base font-medium text-[#0c0b1d] mb-1">
                    {isDragging ? 'Drop file here' : 'Drag & drop your document'}
                  </p>
                  <p className="text-sm text-zinc-600 mb-4">or</p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="border-zinc-300 text-[#0c0b1d] hover:bg-[#f3f5f9] hover:border-zinc-400"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Browse Files
                  </Button>
                </div>
                <p className="text-xs text-zinc-500">
                  PDF, DOC, DOCX, TXT, PNG, JPEG, JPG • Max 50MB
                </p>
              </div>
              <Input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                onChange={handleInputChange}
                disabled={uploading}
                className="hidden"
              />
            </div>
          )}

          {/* Selected File Preview */}
          {file && (
            <div className="mt-6 space-y-4">
              <div className="bg-white border border-zinc-200 rounded-lg p-4">
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-[#f3f5f9] p-3">
                    <FileText className="h-5 w-5 text-[#0c0b1d]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#0c0b1d] truncate mb-1">
                      {file.name}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFile(null)}
                    disabled={uploading}
                    className="text-zinc-500 hover:text-zinc-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-[#0c0b1d]">
                  Description <span className="text-zinc-400 font-normal">(optional)</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Add notes about this document..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  disabled={uploading}
                  className="resize-none"
                />
              </div>

              <Button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full bg-[#1ad07a] text-[#0c0b1d] hover:bg-[#1ad07a]/90 h-11 font-medium"
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Document
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Existing Attachments */}
          {attachments.length > 0 && (
            <div className="mt-8 border-t pt-6">
              <h3 className="text-sm font-semibold text-[#0c0b1d] mb-4">
                Attached Documents ({attachments.length})
              </h3>
              <div className="space-y-2">
                {loadingAttachments ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
                  </div>
                ) : (
                  attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="bg-white border border-zinc-200 rounded-lg p-4 hover:border-zinc-300 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="rounded bg-[#f3f5f9] p-2 mt-0.5">
                          <FileText className="h-4 w-4 text-[#0c0b1d]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#0c0b1d] truncate">
                            {attachment.file_name}
                          </p>
                          {attachment.description && (
                            <p className="text-xs text-zinc-600 mt-1 line-clamp-1">
                              {attachment.description}
                            </p>
                          )}
                          <p className="text-xs text-zinc-400 mt-1">
                            {new Date(attachment.uploaded_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(attachment)}
                            className="h-8 w-8 p-0 text-zinc-600 hover:text-[#0c0b1d]"
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(attachment.id, attachment.file_name)}
                            className="h-8 w-8 p-0 text-zinc-400 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {!file && attachments.length === 0 && !loadingAttachments && (
            <div className="mt-8 text-center py-8">
              <FileText className="h-8 w-8 text-zinc-300 mx-auto mb-2" />
              <p className="text-sm text-zinc-500">No documents attached yet</p>
            </div>
          )}
        </div>

        <DialogFooter className="border-t pt-4 mt-4">
          <Button
            variant="outline"
            onClick={() => {
              setOpen(false);
              setFile(null);
              setDescription('');
            }}
            className="border-zinc-300 text-[#0c0b1d] hover:bg-[#f3f5f9] hover:border-zinc-400"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
