import { prisma } from '@/lib/prisma';
import { Stripe } from 'stripe';
import { sendVerificationEmail } from '@/lib/email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export interface VerificationDocument {
  type: 'identity' | 'address' | 'professional' | 'business';
  status: 'pending' | 'approved' | 'rejected';
  documentType: string;
  documentNumber?: string;
  expiryDate?: Date;
  issuingCountry: string;
  documentFiles: string[];
  verificationDate?: Date;
  verifiedBy?: string;
  rejectionReason?: string;
}

export interface VerificationRequirement {
  type: 'identity' | 'address' | 'professional' | 'business';
  required: boolean;
  documentTypes: string[];
  description: string;
}

export interface VerificationLevel {
  level: number;
  name: string;
  requirements: VerificationRequirement[];
  benefits: string[];
}

export const VERIFICATION_LEVELS: VerificationLevel[] = [
  {
    level: 1,
    name: 'Basic Verification',
    requirements: [
      {
        type: 'identity',
        required: true,
        documentTypes: ['passport', 'driving_license', 'national_id'],
        description: 'Government-issued photo ID',
      },
      {
        type: 'address',
        required: true,
        documentTypes: ['utility_bill', 'bank_statement', 'council_tax'],
        description: 'Proof of address (less than 3 months old)',
      },
    ],
    benefits: [
      'Access to basic platform features',
      'Ability to message other users',
      'Save favorites and searches',
    ],
  },
  {
    level: 2,
    name: 'Professional Verification',
    requirements: [
      {
        type: 'professional',
        required: true,
        documentTypes: [
          'professional_license',
          'certification',
          'qualification',
        ],
        description: 'Professional qualifications or licenses',
      },
      {
        type: 'business',
        required: false,
        documentTypes: ['company_registration', 'tax_registration'],
        description: 'Business registration documents',
      },
    ],
    benefits: [
      'Professional badge on profile',
      'Access to professional tools',
      'Priority support',
      'Enhanced visibility in search results',
    ],
  },
];

export class VerificationService {
  static async initiateVerification(userId: string, level: number) {
    try {
      // Check if user already has verification in progress
      const existingVerification = await prisma.verification.findFirst({
        where: {
          userId,
          status: 'pending',
        },
      });

      if (existingVerification) {
        throw new Error('Verification already in progress');
      }

      // Create verification session
      const verificationSession = await prisma.verification.create({
        data: {
          userId,
          level,
          status: 'pending',
          startedAt: new Date(),
        },
      });

      // Create Stripe Identity verification session
      const stripeVerification = await stripe.identity.verificationSessions.create({
        type: 'document',
        metadata: {
          userId,
          verificationId: verificationSession.id,
        },
      });

      // Update verification session with Stripe details
      await prisma.verification.update({
        where: { id: verificationSession.id },
        data: {
          stripeVerificationId: stripeVerification.id,
          clientSecret: stripeVerification.client_secret,
        },
      });

      // Send verification email
      await sendVerificationEmail(userId, verificationSession.id);

      return {
        verificationId: verificationSession.id,
        clientSecret: stripeVerification.client_secret,
      };
    } catch (error) {
      console.error('Error initiating verification:', error);
      throw error;
    }
  }

  static async submitDocuments(
    userId: string,
    verificationId: string,
    documents: VerificationDocument[]
  ) {
    try {
      // Validate documents
      for (const doc of documents) {
        if (!this.validateDocument(doc)) {
          throw new Error(\`Invalid document: \${doc.documentType}\`);
        }
      }

      // Update verification session
      await prisma.verification.update({
        where: { id: verificationId },
        data: {
          documents: {
            create: documents.map((doc) => ({
              type: doc.type,
              status: 'pending',
              documentType: doc.documentType,
              documentNumber: doc.documentNumber,
              expiryDate: doc.expiryDate,
              issuingCountry: doc.issuingCountry,
              files: doc.documentFiles,
            })),
          },
          updatedAt: new Date(),
        },
      });

      // Trigger document review process
      await this.triggerDocumentReview(verificationId);

      return { success: true };
    } catch (error) {
      console.error('Error submitting documents:', error);
      throw error;
    }
  }

  static async checkVerificationStatus(userId: string, verificationId: string) {
    try {
      const verification = await prisma.verification.findFirst({
        where: {
          id: verificationId,
          userId,
        },
        include: {
          documents: true,
        },
      });

      if (!verification) {
        throw new Error('Verification not found');
      }

      // Check Stripe verification status if applicable
      if (verification.stripeVerificationId) {
        const stripeVerification = await stripe.identity.verificationSessions.retrieve(
          verification.stripeVerificationId
        );

        if (stripeVerification.status === 'verified') {
          await this.approveVerification(verificationId);
        } else if (stripeVerification.status === 'requires_input') {
          await this.requestAdditionalInformation(verificationId);
        }
      }

      return verification;
    } catch (error) {
      console.error('Error checking verification status:', error);
      throw error;
    }
  }

  static async approveVerification(verificationId: string) {
    try {
      const verification = await prisma.verification.update({
        where: { id: verificationId },
        data: {
          status: 'approved',
          completedAt: new Date(),
        },
        include: {
          user: true,
        },
      });

      // Update user verification level
      await prisma.user.update({
        where: { id: verification.userId },
        data: {
          verificationLevel: verification.level,
          verifiedAt: new Date(),
        },
      });

      // Send approval notification
      await this.sendVerificationNotification(
        verification.userId,
        'approved'
      );

      return verification;
    } catch (error) {
      console.error('Error approving verification:', error);
      throw error;
    }
  }

  static async rejectVerification(
    verificationId: string,
    reason: string
  ) {
    try {
      const verification = await prisma.verification.update({
        where: { id: verificationId },
        data: {
          status: 'rejected',
          rejectionReason: reason,
          completedAt: new Date(),
        },
      });

      // Send rejection notification
      await this.sendVerificationNotification(
        verification.userId,
        'rejected',
        reason
      );

      return verification;
    } catch (error) {
      console.error('Error rejecting verification:', error);
      throw error;
    }
  }

  private static validateDocument(document: VerificationDocument): boolean {
    // Implement document validation logic
    if (!document.type || !document.documentType || !document.issuingCountry) {
      return false;
    }

    if (document.documentFiles.length === 0) {
      return false;
    }

    if (document.expiryDate && new Date(document.expiryDate) < new Date()) {
      return false;
    }

    return true;
  }

  private static async triggerDocumentReview(verificationId: string) {
    // Implement document review workflow
    // This could involve manual review, automated checks, or both
    try {
      // Queue for automated checks
      await prisma.verificationReview.create({
        data: {
          verificationId,
          status: 'pending',
          startedAt: new Date(),
        },
      });

      // Trigger automated checks
      await this.runAutomatedChecks(verificationId);

    } catch (error) {
      console.error('Error triggering document review:', error);
      throw error;
    }
  }

  private static async runAutomatedChecks(verificationId: string) {
    // Implement automated document checks
    try {
      const verification = await prisma.verification.findUnique({
        where: { id: verificationId },
        include: {
          documents: true,
        },
      });

      if (!verification) {
        throw new Error('Verification not found');
      }

      // Run various checks (implement these based on requirements)
      const checks = [
        this.checkDocumentAuthenticity(verification),
        this.checkDocumentExpiry(verification),
        this.checkDocumentQuality(verification),
        // Add more checks as needed
      ];

      const results = await Promise.all(checks);
      const passed = results.every((result) => result.passed);

      if (passed) {
        await this.approveVerification(verificationId);
      } else {
        const failedChecks = results
          .filter((result) => !result.passed)
          .map((result) => result.reason)
          .join(', ');

        await this.rejectVerification(verificationId, failedChecks);
      }

    } catch (error) {
      console.error('Error running automated checks:', error);
      throw error;
    }
  }

  private static async checkDocumentAuthenticity(verification: any) {
    // Implement document authenticity checks
    // This could involve checking for tampering, verifying with issuing authorities, etc.
    return { passed: true };
  }

  private static async checkDocumentExpiry(verification: any) {
    // Check if documents are expired
    const now = new Date();
    const expired = verification.documents.some(
      (doc: any) => doc.expiryDate && new Date(doc.expiryDate) < now
    );

    return {
      passed: !expired,
      reason: expired ? 'One or more documents are expired' : undefined,
    };
  }

  private static async checkDocumentQuality(verification: any) {
    // Check document image quality, readability, etc.
    return { passed: true };
  }

  private static async sendVerificationNotification(
    userId: string,
    status: 'approved' | 'rejected',
    reason?: string
  ) {
    // Implement notification logic (email, in-app, etc.)
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Send email notification
      await sendVerificationEmail(userId, status, reason);

      // Create in-app notification
      await prisma.notification.create({
        data: {
          userId,
          type: 'verification',
          title: \`Verification \${status}\`,
          message: status === 'approved'
            ? 'Your verification has been approved!'
            : \`Your verification was rejected. Reason: \${reason}\`,
        },
      });

    } catch (error) {
      console.error('Error sending verification notification:', error);
      throw error;
    }
  }
}