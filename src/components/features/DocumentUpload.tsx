import React, { useState, useCallback, useRef } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { 
  Upload, 
  File, 
  FileText, 
  Image as ImageIcon, 
  X, 
  Check, 
  AlertCircle, 
  Eye,
  Download,
  Trash2,
  Plus,
  CloudUpload,
  Shield,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { useAuth } from '../../lib/auth';
import { saveDocumentMetadata, getUserDocuments, deleteDocument, type DocumentMetadata } from '../../lib/db';

interface DocumentUploadProps {
  applicationId?: string;
  maxFiles?: number;
  maxFileSize?: number; // in MB
  allowedTypes?: string[];
  onUploadComplete?: (documents: DocumentMetadata[]) => void;
  className?: string;
}

interface UploadFile {
  id: string;
  file: File;
  preview?: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  cloudinaryUrl?: string;
  documentId?: string;
}

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
];

const MAX_FILE_SIZE = 10; // MB

export function DocumentUpload({
  applicationId,
  maxFiles = 10,
  maxFileSize = MAX_FILE_SIZE,
  allowedTypes = ALLOWED_TYPES,
  onUploadComplete,
  className
}: DocumentUploadProps) {
  const { user } = useAuth();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [existingDocuments, setExistingDocuments] = useState<DocumentMetadata[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<DocumentMetadata | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing documents
  React.useEffect(() => {
    if (user) {
      loadExistingDocuments();
    }
  }, [user, applicationId]);

  const loadExistingDocuments = async () => {
    if (!user) return;
    try {
      const docs = await getUserDocuments(user.uid, applicationId);
      setExistingDocuments(docs);
    } catch (error) {
      console.error('Failed to load existing documents:', error);
      // Handle index building state gracefully
      if (error instanceof Error && error.message?.includes('index is currently building')) {
        toast.info('Database is optimizing. Document list will load shortly.');
      }
    }
  };

  const validateFile = (file: File): string | null => {
    if (!allowedTypes.includes(file.type)) {
      return `File type ${file.type} is not supported. Please upload PDF, DOC, DOCX, JPG, or PNG files.`;
    }
    
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size must be less than ${maxFileSize}MB. Current size: ${(file.size / 1024 / 1024).toFixed(1)}MB`;
    }
    
    return null;
  };

  const createFilePreview = (file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => resolve(undefined);
        reader.readAsDataURL(file);
      } else {
        resolve(undefined);
      }
    });
  };

  const handleFileSelect = useCallback(async (selectedFiles: FileList) => {
    const newFiles: UploadFile[] = [];
    
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const validationError = validateFile(file);
      
      if (validationError) {
        toast.error(validationError);
        continue;
      }
      
      if (files.length + newFiles.length >= maxFiles) {
        toast.error(`Maximum ${maxFiles} files allowed`);
        break;
      }
      
      const preview = await createFilePreview(file);
      
      newFiles.push({
        id: Math.random().toString(36).substring(7),
        file,
        preview,
        status: 'pending',
        progress: 0
      });
    }
    
    setFiles(prev => [...prev, ...newFiles]);
  }, [files.length, maxFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFileSelect(droppedFiles);
    }
  }, [handleFileSelect]);

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const uploadFile = async (uploadFile: UploadFile): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      // Update status to uploading
      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { ...f, status: 'uploading' as const, progress: 0 }
          : f
      ));

      // Upload to Cloudinary using ugs-documents preset
      console.log('Uploading to folder: ugs/documents');
      const result = await uploadToCloudinary(uploadFile.file, {
        folder: 'ugs/documents',
        resource_type: 'auto',
        public_id: `${user.uid}/${applicationId || 'general'}/${Date.now()}_${uploadFile.file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
        context: {
          userId: user.uid,
          applicationId: applicationId || '',
          originalName: uploadFile.file.name
        },
        onProgress: (progress) => {
          setFiles(prev => prev.map(f => 
            f.id === uploadFile.id 
              ? { ...f, progress }
              : f
          ));
        }
      });

      // Save metadata to Firebase
      const documentMetadata: Omit<DocumentMetadata, 'id'> = {
        userId: user.uid,
        applicationId: applicationId || '',
        fileName: uploadFile.file.name,
        fileType: uploadFile.file.type,
        fileSize: uploadFile.file.size,
        cloudinaryUrl: result.secure_url,
        cloudinaryPublicId: result.public_id,
        uploadedAt: new Date(),
        status: 'uploaded'
      };

      const documentId = await saveDocumentMetadata(documentMetadata);

      // Update file status
      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { 
              ...f, 
              status: 'success' as const, 
              progress: 100,
              cloudinaryUrl: result.secure_url,
              documentId
            }
          : f
      ));

      toast.success(`${uploadFile.file.name} uploaded successfully`);
      
    } catch (error: any) {
      console.error('Upload failed:', error);
      
      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { 
              ...f, 
              status: 'error' as const, 
              error: error.message || 'Upload failed'
            }
          : f
      ));
      
      toast.error(`Failed to upload ${uploadFile.file.name}: ${error.message}`);
    }
  };

  const uploadAllFiles = async () => {
    if (!user) {
      toast.error('Please sign in to upload documents');
      return;
    }

    const pendingFiles = files.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) return;

    setIsUploading(true);
    
    try {
      // Upload files sequentially to avoid overwhelming the server
      for (const file of pendingFiles) {
        await uploadFile(file);
      }
      
      // Reload existing documents
      await loadExistingDocuments();
      
      // Notify parent component with correct count
      const uploadedDocs = files
        .filter(f => f.status === 'success' && f.documentId)
        .map(f => ({
          id: f.documentId!,
          fileName: f.file.name,
          cloudinaryUrl: f.cloudinaryUrl!,
          uploadedAt: new Date()
        })) as DocumentMetadata[];
      
      if (uploadedDocs.length > 0) {
        onUploadComplete?.(uploadedDocs);
      }
      
    } finally {
      setIsUploading(false);
    }
  };

  const deleteExistingDocument = async (doc: DocumentMetadata) => {
    if (!user) return;
    
    try {
      await deleteDocument(doc.id, user.uid);
      setExistingDocuments(prev => prev.filter(d => d.id !== doc.id));
      toast.success('Document deleted successfully');
    } catch (error: any) {
      toast.error(`Failed to delete document: ${error.message}`);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
    if (fileType.includes('image')) return <ImageIcon className="w-5 h-5 text-blue-500" />;
    if (fileType.includes('word') || fileType.includes('document')) return <File className="w-5 h-5 text-blue-600" />;
    return <File className="w-5 h-5 text-gray-500" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-700';
      case 'uploading': return 'bg-blue-100 text-blue-700';
      case 'success': return 'bg-green-100 text-green-700';
      case 'error': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Upload Area */}
      <Card className="relative overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CloudUpload className="w-5 h-5 text-primary" />
            <span>Document Upload</span>
          </CardTitle>
          <CardDescription>
            Upload your visa documents securely. Supported formats: PDF, DOC, DOCX, JPG, PNG (max {maxFileSize}MB each)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              "border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300",
              isDragOver 
                ? "border-primary bg-primary/5 scale-105" 
                : "border-gray-300 dark:border-gray-600 hover:border-primary/50"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <motion.div
              animate={{ scale: isDragOver ? 1.05 : 1 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="w-16 h-16 mx-auto bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-white" />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  {isDragOver ? 'Drop files here' : 'Upload Documents'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  Drag and drop files here, or click to browse
                </p>
                
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                  disabled={isUploading}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Choose Files
                </Button>
              </div>
              
              <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Shield className="w-3 h-3" />
                  <span>Secure Upload</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>Auto-Save</span>
                </div>
              </div>
            </motion.div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={allowedTypes.join(',')}
            onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Upload Queue ({files.length})</CardTitle>
              <Button
                onClick={uploadAllFiles}
                disabled={isUploading || files.every(f => f.status !== 'pending')}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload All
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <AnimatePresence>
              {files.map((file) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex items-center space-x-4 p-4 border rounded-lg"
                >
                  {file.preview ? (
                    <img 
                      src={file.preview} 
                      alt={file.file.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                      {getFileIcon(file.file.type)}
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium truncate">{file.file.name}</p>
                      <Badge className={getStatusColor(file.status)}>
                        {file.status === 'uploading' && <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin mr-1" />}
                        {file.status === 'success' && <Check className="w-3 h-3 mr-1" />}
                        {file.status === 'error' && <AlertCircle className="w-3 h-3 mr-1" />}
                        {file.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {(file.file.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                    
                    {file.status === 'uploading' && (
                      <Progress value={file.progress} className="mt-2" />
                    )}
                    
                    {file.error && (
                      <p className="text-sm text-red-600 mt-1">{file.error}</p>
                    )}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    disabled={file.status === 'uploading'}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </CardContent>
        </Card>
      )}

      {/* Existing Documents */}
      {existingDocuments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Documents ({existingDocuments.length})</CardTitle>
            <CardDescription>
              Your previously uploaded documents for this application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {existingDocuments.map((doc) => (
              <div key={doc.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  {getFileIcon(doc.fileType)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{doc.fileName}</p>
                  <p className="text-sm text-muted-foreground">
                    {(doc.fileSize / 1024 / 1024).toFixed(1)} MB • 
                    Uploaded {doc.uploadedAt.toLocaleDateString()}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPreviewDocument(doc)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(doc.cloudinaryUrl, '_blank')}
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteExistingDocument(doc)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Document Preview Dialog */}
      <Dialog open={!!previewDocument} onOpenChange={() => setPreviewDocument(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{previewDocument?.fileName}</DialogTitle>
            <DialogDescription>
              Document preview • {previewDocument && (previewDocument.fileSize / 1024 / 1024).toFixed(1)} MB
            </DialogDescription>
          </DialogHeader>
          
          {previewDocument && (
            <div className="flex-1 overflow-auto">
              {previewDocument.fileType.startsWith('image/') ? (
                <img 
                  src={previewDocument.cloudinaryUrl} 
                  alt={previewDocument.fileName}
                  className="w-full h-auto rounded-lg"
                />
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">
                    Preview not available for this file type.
                  </p>
                  <Button
                    onClick={() => window.open(previewDocument.cloudinaryUrl, '_blank')}
                    className="mt-4"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download to View
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
