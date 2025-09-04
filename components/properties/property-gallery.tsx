'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Grid, Maximize2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PropertyGalleryProps {
  images: string[];
  title: string;
}

export function PropertyGallery({ images, title }: PropertyGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [showAllImages, setShowAllImages] = useState(false);

  const handlePrevious = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentImageIndex((prev) => 
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (isLightboxOpen) {
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Escape') setIsLightboxOpen(false);
    }
  };

  // Add keyboard event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen]);

  return (
    <>
      {/* Main Gallery */}
      <div className="relative">
        {showAllImages ? (
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <motion.div
                  key={image}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="relative aspect-[4/3] cursor-pointer group"
                  onClick={() => {
                    setCurrentImageIndex(index);
                    setIsLightboxOpen(true);
                  }}
                >
                  <Image
                    src={image}
                    alt={`${title} - Image ${index + 1}`}
                    fill
                    className="object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors rounded-lg" />
                </motion.div>
              ))}
            </div>
            <Button
              variant="outline"
              className="mt-8 mx-auto block"
              onClick={() => setShowAllImages(false)}
            >
              Show Less
            </Button>
          </div>
        ) : (
          <div className="h-[600px] bg-gray-100 relative">
            <div className="grid grid-cols-4 h-full gap-2 p-2">
              {/* Main Image */}
              <div className="col-span-2 row-span-2 relative rounded-lg overflow-hidden">
                <Image
                  src={images[0]}
                  alt={`${title} - Main Image`}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>

              {/* Secondary Images */}
              {images.slice(1, 5).map((image, index) => (
                <div key={image} className="relative rounded-lg overflow-hidden">
                  <Image
                    src={image}
                    alt={`${title} - Image ${index + 2}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}

              {/* View All Button */}
              <Button
                variant="secondary"
                className="absolute bottom-6 right-6"
                onClick={() => setShowAllImages(true)}
              >
                <Grid className="w-4 h-4 mr-2" />
                View All Photos ({images.length})
              </Button>

              {/* Lightbox Button */}
              <Button
                variant="secondary"
                className="absolute top-6 right-6"
                onClick={() => setIsLightboxOpen(true)}
              >
                <Maximize2 className="w-4 h-4 mr-2" />
                Full Screen
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm"
          >
            <div className="absolute top-4 right-4 z-50">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => setIsLightboxOpen(false)}
              >
                <X className="w-6 h-6" />
              </Button>
            </div>

            <div className="relative h-full flex items-center justify-center">
              {/* Navigation Buttons */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 text-white hover:bg-white/20"
                onClick={handlePrevious}
              >
                <ChevronLeft className="w-8 h-8" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 text-white hover:bg-white/20"
                onClick={handleNext}
              >
                <ChevronRight className="w-8 h-8" />
              </Button>

              {/* Current Image */}
              <motion.div
                key={currentImageIndex}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="relative w-full h-full max-w-7xl max-h-[80vh] mx-4"
              >
                <Image
                  src={images[currentImageIndex]}
                  alt={`${title} - Image ${currentImageIndex + 1}`}
                  fill
                  className="object-contain"
                  quality={100}
                />
              </motion.div>

              {/* Image Counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
                {currentImageIndex + 1} / {images.length}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}