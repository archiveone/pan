import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Mail, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Show success animation
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#2B59FF', '#BB2BFF', '#FF2B2B']
      });

      setIsSuccess(true);
    } catch (error) {
      console.error('Password reset request failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Gradient Header */}
      <div className="h-2 bg-gradient-to-r from-[#2B59FF] via-[#BB2BFF] to-[#FF2B2B]" />

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8 text-center"
          >
            <Link href="/">
              <div className="relative h-12 w-40 mx-auto">
                <Image
                  src="/images/greia-logo-gradient.svg"
                  alt="GREIA"
                  fill
                  className="object-contain"
                />
              </div>
            </Link>
          </motion.div>

          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.div
                key="request"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Forgot your password? 🔑</CardTitle>
                    <CardDescription>
                      No worries! Enter your email and we'll send you reset instructions.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="email">Email address</Label>
                        <div className="relative mt-1">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          'Send Reset Instructions'
                        )}
                      </Button>
                    </form>
                  </CardContent>
                  <CardFooter>
                    <Link
                      href="/auth/signin"
                      className="text-sm text-muted-foreground hover:text-foreground flex items-center"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to sign in
                    </Link>
                  </CardFooter>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 10
                      }}
                      className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4"
                    >
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    </motion.div>
                    <CardTitle className="text-center">Check your email</CardTitle>
                    <CardDescription className="text-center">
                      We've sent password reset instructions to {email}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                      Didn't receive the email? Check your spam folder or try again.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setIsSuccess(false)}
                    >
                      Try another email
                    </Button>
                  </CardContent>
                  <CardFooter className="justify-center">
                    <Link
                      href="/auth/signin"
                      className="text-sm text-muted-foreground hover:text-foreground flex items-center"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to sign in
                    </Link>
                  </CardFooter>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}