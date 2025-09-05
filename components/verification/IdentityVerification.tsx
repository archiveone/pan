'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  Shield,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface IdentityVerificationProps {
  onComplete: (data: any) => void;
  onError: (error: Error) => void;
  className?: string;
}

type VerificationStep = 'prepare' | 'front' | 'back' | 'selfie' | 'processing' | 'complete';

export function IdentityVerification({
  onComplete,
  onError,
  className,
}: IdentityVerificationProps) {
  const [step, setStep] = useState<VerificationStep>('prepare');
  const [progress, setProgress] = useState(0);
  const [cameraReady, setCameraReady] = useState(false);
  const [capturedImages, setCapturedImages] = useState<{
    front?: string;
    back?: string;
    selfie?: string;
  }>({});
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Update progress based on step
    const progressMap: Record<VerificationStep, number> = {
      prepare: 0,
      front: 25,
      back: 50,
      selfie: 75,
      processing: 90,
      complete: 100,
    };
    setProgress(progressMap[step]);
  }, [step]);

  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraReady(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      onError(new Error('Camera access denied'));
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setCameraReady(false);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0);
      return canvas.toDataURL('image/jpeg');
    }
    return null;
  };

  const handleCapture = () => {
    const image = captureImage();
    if (image) {
      if (step === 'front') {
        setCapturedImages({ ...capturedImages, front: image });
        setStep('back');
      } else if (step === 'back') {
        setCapturedImages({ ...capturedImages, back: image });
        setStep('selfie');
      } else if (step === 'selfie') {
        setCapturedImages({ ...capturedImages, selfie: image });
        stopCamera();
        setStep('processing');
        processVerification();
      }
    }
  };

  const processVerification = async () => {
    try {
      // Simulate API call to process verification
      await new Promise(resolve => setTimeout(resolve, 3000));
      setStep('complete');
      onComplete(capturedImages);
    } catch (error) {
      onError(error as Error);
    }
  };

  const stepContent: Record<VerificationStep, JSX.Element> = {
    prepare: (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Camera className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-semibold">Let's Verify Your Identity</h2>
        <p className="mt-2 text-muted-foreground">
          We'll need to take photos of your ID and a selfie
        </p>
        
        <div className="mt-8 space-y-4">
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-medium">Before we start:</h3>
            <ul className="mt-2 space-y-2 text-sm">
              <li className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                Have your ID ready
              </li>
              <li className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                Ensure good lighting
              </li>
              <li className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                Remove any protective covers
              </li>
            </ul>
          </div>

          <Button
            size="lg"
            className="w-full"
            onClick={() => {
              initializeCamera();
              setStep('front');
            }}
          >
            Start Verification
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    ),

    front: (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4"
      >
        <div className="text-center">
          <h3 className="text-lg font-medium">Front of ID</h3>
          <p className="text-sm text-muted-foreground">
            Position the front of your ID within the frame
          </p>
        </div>

        <div className="relative aspect-[4/3] overflow-hidden rounded-lg border-2 border-dashed">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="h-full w-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />
          
          {/* Overlay guide */}
          <div className="absolute inset-4 border-2 border-white/50 rounded-lg" />
          
          {/* Corner guides */}
          <div className="absolute inset-0">
            <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-primary" />
            <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-primary" />
            <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-primary" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-primary" />
          </div>
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => {
              stopCamera();
              setStep('prepare');
            }}
          >
            Back
          </Button>
          <Button
            onClick={handleCapture}
            disabled={!cameraReady}
          >
            Capture Front
            <Camera className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    ),

    back: (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4"
      >
        <div className="text-center">
          <h3 className="text-lg font-medium">Back of ID</h3>
          <p className="text-sm text-muted-foreground">
            Now position the back of your ID within the frame
          </p>
        </div>

        <div className="relative aspect-[4/3] overflow-hidden rounded-lg border-2 border-dashed">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="h-full w-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />
          
          {/* Overlay guide */}
          <div className="absolute inset-4 border-2 border-white/50 rounded-lg" />
          
          {/* Corner guides */}
          <div className="absolute inset-0">
            <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-primary" />
            <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-primary" />
            <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-primary" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-primary" />
          </div>
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setStep('front')}
          >
            Retake Front
          </Button>
          <Button
            onClick={handleCapture}
            disabled={!cameraReady}
          >
            Capture Back
            <Camera className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    ),

    selfie: (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4"
      >
        <div className="text-center">
          <h3 className="text-lg font-medium">Take a Selfie</h3>
          <p className="text-sm text-muted-foreground">
            Position your face within the circle and look straight ahead
          </p>
        </div>

        <div className="relative aspect-square overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="h-full w-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />
          
          {/* Circular guide */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-64 rounded-full border-2 border-primary" />
          </div>
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setStep('back')}
          >
            Back
          </Button>
          <Button
            onClick={handleCapture}
            disabled={!cameraReady}
          >
            Take Selfie
            <Camera className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    ),

    processing: (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
        <h3 className="mt-4 text-lg font-medium">Processing Your Verification</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          This will only take a moment...
        </p>
        <Progress value={progress} className="mt-8" />
      </motion.div>
    ),

    complete: (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 10 }}
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100"
        >
          <CheckCircle className="h-8 w-8 text-green-600" />
        </motion.div>
        <h3 className="mt-4 text-lg font-medium">Verification Complete!</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Your identity has been successfully verified
        </p>
        <Button
          className="mt-8"
          onClick={() => onComplete(capturedImages)}
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </motion.div>
    ),
  };

  return (
    <div className={cn('max-w-md mx-auto', className)}>
      {/* Progress bar */}
      <div className="mb-8">
        <Progress value={progress} className="h-1" />
        <div className="mt-2 flex justify-between text-sm text-muted-foreground">
          <span>Verification Progress</span>
          <span>{progress}%</span>
        </div>
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        {stepContent[step]}
      </AnimatePresence>
    </div>
  );
}