/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'lh3.googleusercontent.com', // For Google OAuth profile pictures
      'res.cloudinary.com', // For uploaded images
      'stripe.com', // For Stripe-related assets
    ],
  },
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig