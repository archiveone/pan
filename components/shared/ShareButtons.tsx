'use client';

import { useState } from 'react';
import {
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  Link as LinkIcon,
  Printer,
  WhatsApp,
  Copy,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/use-toast';

interface ShareButtonsProps {
  title: string;
  description: string;
  url: string;
  image?: string;
  type: 'property' | 'service' | 'leisure' | 'profile';
}

export function ShareButtons({
  title,
  description,
  url,
  image,
  type,
}: ShareButtonsProps) {
  const [isCopied, setIsCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDescription}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${url}`,
  };

  const handleShare = async (platform: string) => {
    if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(url);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
        toast({
          title: 'Link copied to clipboard',
          description: 'You can now share it anywhere!',
        });
      } catch (err) {
        toast({
          title: 'Failed to copy link',
          description: 'Please try again',
          variant: 'destructive',
        });
      }
      return;
    }

    if (platform === 'print') {
      window.print();
      return;
    }

    const shareUrl = shareLinks[platform as keyof typeof shareLinks];
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  // Generate print-friendly version
  const generatePrintVersion = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              padding: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              max-width: 200px;
              margin-bottom: 20px;
            }
            .content {
              max-width: 800px;
              margin: 0 auto;
            }
            .image {
              max-width: 100%;
              height: auto;
              margin: 20px 0;
            }
            .details {
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 50px;
              padding-top: 20px;
              border-top: 1px solid #ccc;
            }
            @media print {
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="/images/logo.svg" alt="GREIA Logo" class="logo" />
            <h1>${title}</h1>
          </div>
          <div class="content">
            ${image ? `<img src="${image}" alt="${title}" class="image" />` : ''}
            <div class="details">
              ${description}
            </div>
            <div class="footer">
              <p>Generated from GREIA - Life's Operating System</p>
              <p>${url}</p>
              <p>Printed on ${new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => handleShare('facebook')}
        className="hover:bg-blue-100"
      >
        <Facebook className="h-4 w-4 text-blue-600" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => handleShare('twitter')}
        className="hover:bg-sky-100"
      >
        <Twitter className="h-4 w-4 text-sky-500" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => handleShare('linkedin')}
        className="hover:bg-blue-100"
      >
        <Linkedin className="h-4 w-4 text-blue-700" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => handleShare('whatsapp')}
        className="hover:bg-green-100"
      >
        <WhatsApp className="h-4 w-4 text-green-600" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => handleShare('email')}
        className="hover:bg-gray-100"
      >
        <Mail className="h-4 w-4 text-gray-600" />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleShare('copy')}>
            <div className="flex items-center">
              {isCopied ? (
                <Check className="h-4 w-4 mr-2" />
              ) : (
                <Copy className="h-4 w-4 mr-2" />
              )}
              {isCopied ? 'Copied!' : 'Copy link'}
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              generatePrintVersion();
              handleShare('print');
            }}
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}