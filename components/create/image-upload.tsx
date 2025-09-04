'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Image as ImageIcon, X, Upload, AlertCircle, Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useListingCreation } from '@/contexts/listing-creation-context';
import { cn } from '@/lib/utils';

interface UploadState {
  file: File;
  preview: string;
  progress: number;
  error?: string;
}

export function ImageUpload() {
  const { state, updateData, nextStep } = useListingCreation();
  const [uploads, setUploads] = useState<UploadState[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [currentStep, setCurrentStep] = useState<'drop' | 'arrange'>('drop');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    // Filter out any files that would exceed the 10 image limit
    const availableSlots = 10 - uploads.length;
    const filesToProcess = acceptedFiles.slice(0, availableSlots);

    // Create preview URLs and initial states for accepted files
    const newUploads = filesToProcess.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      progress: 0,
    }));

    setUploads((prev) => [...prev, ...newUploads]);

    // Process each file
    for (const upload of newUploads) {
      try {
        setIsUploading(true);
        
        // Simulate upload progress
        for (let i = 0; i <= 100; i += 10) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          setUploads((prev) =>
            prev.map((u) =>
              u.file === upload.file ? { ...u, progress: i } : u
            )
          );
        }

        // Here you would actually upload the file to your storage
        // const response = await uploadToStorage(upload.file);
        // const url = response.url;

      } catch (error) {
        setUploads((prev) =>
          prev.map((u) =>
            u.file === upload.file
              ? { ...u, error: 'Failed to upload image' }
              : u
          )
        );
      }
    }

    setIsUploading(false);
    if (uploads.length > 0) {
      setCurrentStep('arrange');
    }
  }, [uploads.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    maxSize: 5242880, // 5MB
    disabled: isUploading || uploads.length >= 10,
  });

  const removeImage = (index: number) => {
    setUploads((prev) => {
      const newUploads = [...prev];
      URL.revokeObjectURL(newUploads[index].preview);
      newUploads.splice(index, 1);
      return newUploads;
    });
  };

  const moveImage = (from: number, to: number) => {
    setUploads((prev) => {
      const newUploads = [...prev];
      const [removed] = newUploads.splice(from, 1);
      newUploads.splice(to, 0, removed);
      return newUploads;
    });
  };

  const handleContinue = () => {
    // Save the image URLs to the listing data
    updateData({
      images: uploads.map((u) => u.preview), // Replace with actual uploaded URLs
    });
    nextStep();
  };

  return (
    <div className="max-w-3xl mx-auto">
      <AnimatePresence mode="wait">
        {currentStep === 'drop' ? (
          <motion.div
            key="drop"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold mb-2">
                Add photos to your listing
              </h2>
              <p className="text-muted-foreground">
                Add up to 10 photos. The first photo will be your cover image.
              </p>
            </div>

            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-lg p-8 transition-colors",
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25",
                isUploading && "opacity-50 cursor-not-allowed"
              )}
            >
              <input {...getInputProps()} />
              <div className="text-center">
                <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg mb-2">
                  {isDragActive
                    ? "Drop your images here"
                    : "Drag & drop images here"}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  or click to select files
                </p>
                <Button
                  type="button"
                  disabled={isUploading}
                  variant="outline"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Select Files
                </Button>
              </div>
            </div>

            {/* Upload Progress */}
            <div className="mt-8 space-y-4">
              {uploads.map((upload, index) => (
                <div
                  key={upload.preview}
                  className="bg-white rounded-lg p-4 shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <Image
                      src={upload.preview}
                      alt="Preview"
                      width={60}
                      height={60}
                      className="rounded-md object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium truncate">
                          {upload.file.name}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeImage(index)}
                          disabled={isUploading}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <Progress value={upload.progress} className="h-1" />
                    </div>
                  </div>
                  {upload.error && (
                    <div className="flex items-center gap-2 text-destructive text-sm mt-2">
                      <AlertCircle className="w-4 h-4" />
                      {upload.error}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Continue Button */}
            {uploads.length > 0 && !isUploading && (
              <div className="flex justify-end mt-8">
                <Button
                  onClick={() => setCurrentStep('arrange')}
                  className="bg-green-500 hover:bg-green-600"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Continue
                </Button>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="arrange"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold mb-2">
                Arrange your photos
              </h2>
              <p className="text-muted-foreground">
                Drag to reorder. The first photo will be your cover image.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {uploads.map((upload, index) => (
                <motion.div
                  key={upload.preview}
                  layoutId={upload.preview}
                  drag
                  dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                  className="relative aspect-square rounded-lg overflow-hidden cursor-move"
                >
                  <Image
                    src={upload.preview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
                    onClick={() => removeImage(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  {index === 0 && (
                    <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                      Cover Photo
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentStep('drop')}
              >
                Add More Photos
              </Button>
              <Button
                onClick={handleContinue}
                className="bg-green-500 hover:bg-green-600"
              >
                <Check className="w-4 h-4 mr-2" />
                Continue
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}