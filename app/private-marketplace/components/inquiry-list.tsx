'use client';

import { useState } from 'react';
import { Listing, ListingEnquiry } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ExtendedListing extends Listing {
  _count: {
    enquiries: number;
  };
  enquiries?: Array<ExtendedEnquiry>;
}

interface ExtendedEnquiry extends ListingEnquiry {
  user: {
    id: string;
    name: string | null;
    image: string | null;
    isVerified: boolean;
  };
}

interface InquiryListProps {
  listing: ExtendedListing;
  onSelectAgent: (inquiryId: string, listingId: string) => void;
  onClose: () => void;
}

export default function InquiryList({
  listing,
  onSelectAgent,
  onClose,
}: InquiryListProps) {
  const [selectedInquiry, setSelectedInquiry] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleConfirmSelection = async () => {
    if (selectedInquiry) {
      await onSelectAgent(selectedInquiry, listing.id);
      setShowConfirmDialog(false);
      onClose();
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Agent Inquiries for {listing.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {listing.enquiries?.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No inquiries received yet
            </p>
          ) : (
            listing.enquiries?.map((inquiry) => (
              <Card key={inquiry.id} className="p-4">
                <div className="flex items-start gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={inquiry.user.image || undefined} />
                    <AvatarFallback>
                      {inquiry.user.name?.charAt(0) || 'A'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">
                        {inquiry.user.name}
                      </h3>
                      {inquiry.user.isVerified && (
                        <Badge variant="secondary">Verified Agent</Badge>
                      )}
                    </div>

                    <p className="text-sm text-gray-500 mb-2">
                      Submitted: {new Date(inquiry.createdAt).toLocaleDateString()}
                    </p>

                    <div className="bg-gray-50 p-3 rounded-md mb-3">
                      {inquiry.message}
                    </div>

                    {inquiry.status === 'PENDING' && (
                      <Button
                        onClick={() => {
                          setSelectedInquiry(inquiry.id);
                          setShowConfirmDialog(true);
                        }}
                      >
                        Select Agent
                      </Button>
                    )}

                    {inquiry.status === 'ACCEPTED' && (
                      <Badge variant="success">Selected Agent</Badge>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </DialogContent>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Agent Selection</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to select this agent? They will represent your property
              and GREIA will take a 5% commission from their fee. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSelection}>
              Confirm Selection
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}