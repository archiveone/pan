import { Metadata } from "next"
import Link from "next/link"
import { MarketingLayout } from "@/components/layout/MarketingLayout"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Icons } from "@/components/ui/Icons"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card"
import { Checkbox } from "@/components/ui/Checkbox"

export const metadata: Metadata = {
  title: "Login - GREIA",
  description: "Login to your GREIA account",
}

export default function LoginPage() {
  return (
    <MarketingLayout>
      <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
          <div className="absolute inset-0 bg-primary" />
          <div className="relative z-20 flex items-center text-lg font-medium">
            <img src="/logo.svg" alt="GREIA" className="mr-2 h-6 w-6" />
            GREIA
          </div>
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg">
                "GREIA has revolutionized how I manage my property portfolio and connect with clients. It's the only platform I need."
              </p>
              <footer className="text-sm">Michael Chen, Property Agent</footer>
            </blockquote>
          </div>
        </div>
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
                <CardDescription className="text-center">
                  Sign in to your GREIA account
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      href="/reset-password"
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" />
                  <label
                    htmlFor="remember"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Remember me
                  </label>
                </div>
                <Button className="w-full">
                  Sign In
                </Button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="w-full">
                    <Icons.google className="mr-2 h-4 w-4" />
                    Google
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Icons.apple className="mr-2 h-4 w-4" />
                    Apple
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <div className="text-sm text-muted-foreground text-center">
                  Don't have an account?{" "}
                  <Link
                    href="/signup"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    Sign up
                  </Link>
                </div>
                <div className="text-xs text-muted-foreground text-center">
                  By signing in, you agree to our{" "}
                  <Link
                    href="/terms"
                    className="underline underline-offset-4 hover:text-primary"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="underline underline-offset-4 hover:text-primary"
                  >
                    Privacy Policy
                  </Link>
                  .
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </MarketingLayout>
  )
}