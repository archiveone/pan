"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { reviewService } from '@/lib/services/review';
import { CreateReviewRequest } from '@/lib/types/review';
import {
  StarIcon,
  PhotoIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { toast } from 'sonner';

interface WriteReviewProps {
  bookingId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function WriteReview({
  bookingId,
  onSuccess,
  onCancel,
}: WriteReviewProps) {
  const { data: session } = useSession();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to upload photo');
        }

        const { url } = await response.json();
        uploadedUrls.push(url);
      }

      setPhotos((prev) => [...prev, ...uploadedUrls]);
      toast.success('Photos uploaded successfully');
    } catch (error) {
      console.error('Error uploading photos:', error);
      toast.error('Failed to upload photos');
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      toast.error('Please sign in to write a review');
      return;
    }

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (!title.trim() || !content.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);

      const reviewData: CreateReviewRequest = {
        bookingId,
        rating,
        title: title.trim(),
        content: content.trim(),
        photos,
      };

      await reviewService.createReview(reviewData);
      toast.success('Review submitted successfully');
      onSuccess?.();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating *
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                onMouseEnter={() => setHoverRating(value)}
                onMouseLeave={() => setHoverRating(0)}
                className="focus:outline-none"
              >
                {value <= (hoverRating || rating) ? (
                  <StarIconSolid className="h-8 w-8 text-yellow-400" />
                ) : (
                  <StarIcon className="h-8 w-8 text-gray-300" />
                )}
              </button>
            ))}
            <span className="ml-2 text-sm text-gray-600">
              {rating > 0 ? `${rating} out of 5 stars` : 'Select rating'}
            </span>
          </div>
        </div>

        {/* Title */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            Review Title *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summarize your experience"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            maxLength={100}
            required
          />
        </div>

        {/* Content */}
        <div>
          <label
            htmlFor="content"
            className="block text-sm font-medium text-gray-700"
          >
            Review Content *
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share the details of your experience"
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            maxLength={1000}
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            {content.length}/1000 characters
          </p>
        </div>

        {/* Photos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Photos (Optional)
          </label>
          <div className="space-y-4">
            {photos.length > 0 && (
              <div className="flex gap-4 overflow-x-auto py-2">
                {photos.map((photo, index) => (
                  <div key={index} className="relative">
                    <Image
                      src={photo}
                      alt={`Review photo ${index + 1}`}
                      width={120}
                      height={120}
                      className="rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(index)}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center justify-center">
              <label className="relative cursor-pointer">
                <input
                  type="file"
                  className="sr-only"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  disabled={uploading || photos.length >= 5}
                />
                <div className="flex items-center justify-center px-6 py-4 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400">
                  <div className="text-center">
                    <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-1 text-sm text-gray-600">
                      {uploading
                        ? 'Uploading...'
                        : photos.length >= 5
                        ? 'Maximum 5 photos allowed'
                        : 'Upload photos'}
                    </p>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-4 pt-4 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={submitting || uploading}
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </form>
    </div>
  );
}