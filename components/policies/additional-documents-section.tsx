'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X, FileText, Loader2, Plus, Trash2 } from 'lucide-react';
import {
  uploadAdditionalDocument,
  deleteAdditionalDocument,
  getAdditionalDocuments,
  type AdditionalDocument,
} from '@/app/actions/policy-documents';
import { toast } from 'sonner';

export function AdditionalDocumentsSection() {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<AdditionalDocument[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const data = await getAdditionalDocuments();
      setDocuments(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 50 * 1024 * 1024) {
        toast.error('File size must be less than 50MB');
        return;
      }
      setFile(selectedFile);
      if (!name) {
        setName(selectedFile.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    if (!name.trim()) {
      toast.error('Please enter a document name');
      return;
    }

    setUploading(true);
    try {
      const tagsArray = tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      await uploadAdditionalDocument(
        file,
        name.trim(),
        description.trim() || undefined,
        category.trim() || undefined,
        tagsArray.length > 0 ? tagsArray : undefined
      );

      toast.success('Document uploaded successfully');
      setFile(null);
      setName('');
      setDescription('');
      setCategory('');
      setTags('');
      setOpen(false);
      await loadDocuments();
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await deleteAdditionalDocument(documentId);
      toast.success('Document deleted successfully');
      await loadDocuments();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete document');
    }
  };

  return (
    <Card className="border-0 shadow-sm bg-white rounded-none">
      <CardHeader className="border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-light text-[#0e274e]">Additional Documents</CardTitle>
            <CardDescription className="text-[#565656] font-light">
              Upload other compliance documents beyond the 9 required policies
            </CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-[#00bceb] text-white hover:bg-[#00bceb]/90 rounded-none font-bold">
                <Plus className="mr-2 h-4 w-4" />
                Add Document
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-none">
              <DialogHeader>
                <DialogTitle className="font-light text-[#0e274e]">Upload Additional Document</DialogTitle>
                <DialogDescription className="text-[#565656] font-light">
                  Upload any other compliance documents you need to organize (BAAs, training records, etc.)
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="file" className="text-[#0e274e] font-light">Select File *</Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                    onChange={handleFileSelect}
                    disabled={uploading}
                    className="border-gray-300 focus:border-[#00bceb] focus:ring-[#00bceb] rounded-none font-light"
                  />
                  <p className="text-xs text-[#565656] font-light">
                    Allowed: PDF, DOC, DOCX, TXT, PNG, JPEG, JPG (Max 50MB)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[#0e274e] font-light">Document Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., BAA with Vendor X, Training Certificate 2024"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={uploading}
                    className="border-gray-300 focus:border-[#00bceb] focus:ring-[#00bceb] rounded-none font-light"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-[#0e274e] font-light">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what this document is for..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    disabled={uploading}
                    className="border-gray-300 focus:border-[#00bceb] focus:ring-[#00bceb] rounded-none font-light"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-[#0e274e] font-light">Category (Optional)</Label>
                  <Input
                    id="category"
                    placeholder="e.g., BAAs, Training, Contracts"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    disabled={uploading}
                    className="border-gray-300 focus:border-[#00bceb] focus:ring-[#00bceb] rounded-none font-light"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags" className="text-[#0e274e] font-light">Tags (Optional, comma-separated)</Label>
                  <Input
                    id="tags"
                    placeholder="e.g., vendor, 2024, urgent"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    disabled={uploading}
                    className="border-gray-300 focus:border-[#00bceb] focus:ring-[#00bceb] rounded-none font-light"
                  />
                </div>

                {file && (
                  <div className="flex items-center gap-2 p-3 bg-[#f3f5f9] rounded-none border border-gray-200">
                    <FileText className="h-4 w-4 text-[#565656]" />
                    <span className="text-sm text-[#565656] flex-1 font-light">{file.name}</span>
                    <span className="text-xs text-[#565656] font-light">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFile(null)}
                      disabled={uploading}
                      className="rounded-none hover:bg-gray-200"
                    >
                      <X className="h-4 w-4 text-[#565656]" />
                    </Button>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)} disabled={uploading} className="border-gray-300 text-[#565656] hover:bg-gray-50 rounded-none font-light">
                  Cancel
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={!file || !name.trim() || uploading}
                  className="bg-[#00bceb] text-white hover:bg-[#00bceb]/90 rounded-none font-bold"
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
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-[#565656]" />
          </div>
        ) : documents.length === 0 ? (
          <p className="text-sm text-[#565656] text-center py-4 font-light">
            No additional documents yet. Click "Add Document" to upload one.
          </p>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-start gap-3 p-4 bg-[#f3f5f9] rounded-none border border-gray-200"
              >
                <FileText className="h-5 w-5 text-[#565656] shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-light text-[#0e274e]">{doc.name}</p>
                  {doc.description && (
                    <p className="text-xs text-[#565656] mt-1 font-light">{doc.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-[#565656] font-light">{doc.file_name}</span>
                    <span className="text-xs text-[#565656] font-light">
                      {(doc.file_size / 1024 / 1024).toFixed(2)} MB
                    </span>
                    {doc.category && (
                      <span className="text-xs bg-white text-[#565656] px-2 py-0.5 rounded-none border border-gray-200 font-light">
                        {doc.category}
                      </span>
                    )}
                    {doc.tags && doc.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {doc.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-white text-[#565656] px-2 py-0.5 rounded-none border border-gray-200 font-light"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-[#565656] mt-1 font-light">
                    Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(doc.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 shrink-0 rounded-none"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
