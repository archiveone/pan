'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface FileUploadProps {
  onUploadComplete: (fileUrl: string) => void;
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  folder?: string;
}

interface UploadingFile {
  file: File;
  progress: number;
  uploading: boolean;
  error?: string;
}

export function FileUpload({
  onUploadComplete,
  maxSize = 10 * 1024 * 1024, // 10MB default
  allowedTypes = ['image/*', 'application/pdf', '.doc', '.docx'],
  folder = 'general',
}: FileUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      progress: 0,
      uploading: true,
    }));

    setUploadingFiles(prev => [...prev, ...newFiles]);

    for (const fileData of newFiles) {
      try {
        // Get presigned URL
        const presignedRes = await fetch('/api/files/presigned', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fileName: fileData.file.name,
            fileType: fileData.file.type,
            folder,
          }),
        });

        if (!presignedRes.ok) throw new Error('Failed to get upload URL');
        
        const { url, fields } = await presignedRes.json();

        // Create form data
        const formData = new FormData();
        Object.entries(fields).forEach(([key, value]) => {
          formData.append(key, value as string);
        });
        formData.append('file', fileData.file);

        // Upload to S3
        const uploadRes = await fetch(url, {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) throw new Error('Upload failed');

        // Get final file URL
        const fileUrl = `${url}/${fields.key}`;
        
        // Update file status
        setUploadingFiles(prev =>
          prev.map(f =>
            f.file === fileData.file
              ? { ...f, uploading: false, progress: 100 }
              : f
          )
        );

        // Notify parent component
        onUploadComplete(fileUrl);

        // Remove from list after a delay
        setTimeout(() => {
          setUploadingFiles(prev =>
            prev.filter(f => f.file !== fileData.file)
          );
        }, 2000);

      } catch (error) {
        console.error('Upload error:', error);
        setUploadingFiles(prev =>
          prev.map(f =>
            f.file === fileData.file
              ? {
                  ...f,
                  uploading: false,
                  error: 'Upload failed',
                  progress: 0,
                }
              : f
          )
        );
        toast.error(`Failed to upload ${fileData.file.name}`);
      }
    }
  }, [folder, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize,
    accept: allowedTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
  });

  const removeFile = (file: File) => {
    setUploadingFiles(prev =>
      prev.filter(f => f.file !== file)
    );
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8
          text-center cursor-pointer transition-colors
          ${isDragActive
            ? 'border-primary bg-primary/10'
            : 'border-gray-300 hover:border-primary'
          }
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <Upload className="h-10 w-10 text-gray-400" />
          {isDragActive ? (
            <p>Drop files here...</p>
          ) : (
            <>
              <p className="text-lg font-medium">
                Drag & drop files here, or click to select
              </p>
              <p className="text-sm text-gray-500">
                Maximum file size: {maxSize / (1024 * 1024)}MB
              </p>
            </>
          )}
        </div>
      </div>

      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          {uploadingFiles.map(({ file, progress, uploading, error }) => (
            <div
              key={file.name}
              className="flex items-center gap-4 p-4 border rounded-lg"
            >
              <FileIcon className="h-8 w-8 flex-shrink-0 text-gray-400" />
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
                {uploading && (
                  <Progress value={progress} className="mt-2" />
                )}
                {error && (
                  <p className="text-xs text-red-500 mt-1">{error}</p>
                )}
              </div>

              {uploading ? (
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(file)}
                >
                  <X className="h-5 w-5" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}