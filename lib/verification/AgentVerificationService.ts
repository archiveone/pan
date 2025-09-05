import { prisma } from '@/lib/prisma';
import { VerificationService, VerificationLevel } from './VerificationService';
import { sendAgentVerificationEmail } from '@/lib/email';

export interface AgentLicense {
  type: string;
  number: string;
  issuingAuthority: string;
  issuingCountry: string;
  issueDate: Date;
  expiryDate: Date;
  status: 'active' | 'expired' | 'suspended' | 'revoked';
}

export interface AgencyVerification {
  companyName: string;
  registrationNumber: string;
  vatNumber?: string;
  address: {
    street: string;
    city: string;
    postcode: string;
    country: string;
  };
  contactDetails: {
    phone: string;
    email: string;
    website?: string;
  };
  documents: {
    type: string;
    file: string;
  }[];
}

export interface InsuranceDetails {
  provider: string;
  policyNumber: string;
  type: 'professional_indemnity' | 'public_liability' | 'other';
  coverageAmount: number;
  currency: string;
  startDate: Date;
  expiryDate: Date;
  documents: string[];
}

export const AGENT_VERIFICATION_LEVELS: VerificationLevel[] = [
  {
    level: 3,
    name: 'Licensed Agent',
    requirements: [
      {
        type: 'identity',
        required: true,
        documentTypes: ['passport', 'driving_license', 'national_id'],
        description: 'Government-issued photo ID',
      },
      {
        type: 'professional',
        required: true,
        documentTypes: ['real_estate_license', 'broker_license'],
        description: 'Valid real estate license',
      },
      {
        type: 'business',
        required: true,
        documentTypes: [
          'company_registration',
          'vat_registration',
          'insurance_certificate',
        ],
        description: 'Business and insurance documentation',
      },
    ],
    benefits: [
      'Verified Agent badge',
      'Priority listing placement',
      'Access to premium tools',
      'Client review management',
      'Featured agent profile',
    ],
  },
  {
    level: 4,
    name: 'Premium Agent',
    requirements: [
      {
        type: 'professional',
        required: true,
        documentTypes: [
          'advanced_certifications',
          'specialization_certificates',
        ],
        description: 'Advanced real estate certifications',
      },
      {
        type: 'business',
        required: true,
        documentTypes: [
          'enhanced_insurance',
          'financial_statements',
          'quality_certifications',
        ],
        description: 'Enhanced business credentials',
      },
    ],
    benefits: [
      'Premium Agent badge',
      'Top listing placement',
      'Advanced analytics',
      'Premium support',
      'Marketing tools access',
      'Exclusive event access',
    ],
  },
];

export class AgentVerificationService extends VerificationService {
  static async initiateAgentVerification(
    userId: string,
    level: number,
    agentDetails: {
      license: AgentLicense;
      agency?: AgencyVerification;
      insurance: InsuranceDetails;
    }
  ) {
    try {
      // Validate agent license
      if (!this.validateAgentLicense(agentDetails.license)) {
        throw new Error('Invalid or expired agent license');
      }

      // Validate insurance
      if (!this.validateInsurance(agentDetails.insurance)) {
        throw new Error('Invalid or expired insurance');
      }

      // Create agent profile if it doesn't exist
      const agentProfile = await prisma.agentProfile.upsert({
        where: { userId },
        update: {
          license: agentDetails.license,
          insurance: agentDetails.insurance,
          agency: agentDetails.agency,
          updatedAt: new Date(),
        },
        create: {
          userId,
          license: agentDetails.license,
          insurance: agentDetails.insurance,
          agency: agentDetails.agency,
          status: 'pending',
        },
      });

      // Initiate base verification
      const verification = await super.initiateVerification(userId, level);

      // Create agent verification record
      await prisma.agentVerification.create({
        data: {
          agentProfileId: agentProfile.id,
          verificationId: verification.verificationId,
          level,
          status: 'pending',
          startedAt: new Date(),
        },
      });

      // Send agent verification email
      await sendAgentVerificationEmail(userId, verification.verificationId);

      return {
        ...verification,
        agentProfileId: agentProfile.id,
      };
    } catch (error) {
      console.error('Error initiating agent verification:', error);
      throw error;
    }
  }

  static async verifyAgentCredentials(
    verificationId: string,
    agentProfileId: string
  ) {
    try {
      const agentProfile = await prisma.agentProfile.findUnique({
        where: { id: agentProfileId },
        include: {
          verification: true,
        },
      });

      if (!agentProfile) {
        throw new Error('Agent profile not found');
      }

      // Perform license verification
      const licenseVerified = await this.verifyLicenseWithAuthority(
        agentProfile.license
      );

      // Verify insurance
      const insuranceVerified = await this.verifyInsuranceWithProvider(
        agentProfile.insurance
      );

      // Verify agency if provided
      let agencyVerified = true;
      if (agentProfile.agency) {
        agencyVerified = await this.verifyAgencyDetails(
          agentProfile.agency
        );
      }

      // Update verification status
      if (licenseVerified && insuranceVerified && agencyVerified) {
        await this.approveAgentVerification(verificationId, agentProfileId);
      } else {
        const reasons = [];
        if (!licenseVerified) reasons.push('License verification failed');
        if (!insuranceVerified) reasons.push('Insurance verification failed');
        if (!agencyVerified) reasons.push('Agency verification failed');

        await this.rejectAgentVerification(
          verificationId,
          agentProfileId,
          reasons.join(', ')
        );
      }

      return {
        success: licenseVerified && insuranceVerified && agencyVerified,
        licenseVerified,
        insuranceVerified,
        agencyVerified,
      };
    } catch (error) {
      console.error('Error verifying agent credentials:', error);
      throw error;
    }
  }

  static async approveAgentVerification(
    verificationId: string,
    agentProfileId: string
  ) {
    try {
      // Approve base verification
      await super.approveVerification(verificationId);

      // Update agent profile
      await prisma.agentProfile.update({
        where: { id: agentProfileId },
        data: {
          status: 'verified',
          verifiedAt: new Date(),
        },
      });

      // Update agent verification
      await prisma.agentVerification.update({
        where: {
          verificationId_agentProfileId: {
            verificationId,
            agentProfileId,
          },
        },
        data: {
          status: 'approved',
          completedAt: new Date(),
        },
      });

      // Send approval notification
      await this.sendAgentVerificationNotification(
        agentProfileId,
        'approved'
      );

      return { success: true };
    } catch (error) {
      console.error('Error approving agent verification:', error);
      throw error;
    }
  }

  static async rejectAgentVerification(
    verificationId: string,
    agentProfileId: string,
    reason: string
  ) {
    try {
      // Reject base verification
      await super.rejectVerification(verificationId, reason);

      // Update agent profile
      await prisma.agentProfile.update({
        where: { id: agentProfileId },
        data: {
          status: 'rejected',
          rejectionReason: reason,
        },
      });

      // Update agent verification
      await prisma.agentVerification.update({
        where: {
          verificationId_agentProfileId: {
            verificationId,
            agentProfileId,
          },
        },
        data: {
          status: 'rejected',
          rejectionReason: reason,
          completedAt: new Date(),
        },
      });

      // Send rejection notification
      await this.sendAgentVerificationNotification(
        agentProfileId,
        'rejected',
        reason
      );

      return { success: true };
    } catch (error) {
      console.error('Error rejecting agent verification:', error);
      throw error;
    }
  }

  private static async verifyLicenseWithAuthority(
    license: AgentLicense
  ): Promise<boolean> {
    try {
      // Implement license verification with relevant authority
      // This could involve API calls to licensing bodies, database checks, etc.
      
      // Example implementation:
      const response = await fetch(
        \`\${process.env.LICENSE_VERIFICATION_API}/verify\`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': \`Bearer \${process.env.LICENSE_API_KEY}\`,
          },
          body: JSON.stringify({
            licenseNumber: license.number,
            licenseType: license.type,
            issuingAuthority: license.issuingAuthority,
          }),
        }
      );

      const data = await response.json();
      return data.verified && data.status === 'active';
    } catch (error) {
      console.error('Error verifying license:', error);
      return false;
    }
  }

  private static async verifyInsuranceWithProvider(
    insurance: InsuranceDetails
  ): Promise<boolean> {
    try {
      // Implement insurance verification with provider
      // This could involve API calls to insurance providers, database checks, etc.
      
      // Example implementation:
      const response = await fetch(
        \`\${process.env.INSURANCE_VERIFICATION_API}/verify\`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': \`Bearer \${process.env.INSURANCE_API_KEY}\`,
          },
          body: JSON.stringify({
            policyNumber: insurance.policyNumber,
            provider: insurance.provider,
            type: insurance.type,
          }),
        }
      );

      const data = await response.json();
      return data.verified && new Date(insurance.expiryDate) > new Date();
    } catch (error) {
      console.error('Error verifying insurance:', error);
      return false;
    }
  }

  private static async verifyAgencyDetails(
    agency: AgencyVerification
  ): Promise<boolean> {
    try {
      // Implement agency verification
      // This could involve company registry checks, VAT number validation, etc.
      
      // Example implementation:
      const response = await fetch(
        \`\${process.env.COMPANY_VERIFICATION_API}/verify\`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': \`Bearer \${process.env.COMPANY_API_KEY}\`,
          },
          body: JSON.stringify({
            registrationNumber: agency.registrationNumber,
            companyName: agency.companyName,
            vatNumber: agency.vatNumber,
          }),
        }
      );

      const data = await response.json();
      return data.verified;
    } catch (error) {
      console.error('Error verifying agency:', error);
      return false;
    }
  }

  private static validateAgentLicense(license: AgentLicense): boolean {
    const now = new Date();
    
    // Check if license is expired
    if (new Date(license.expiryDate) < now) {
      return false;
    }

    // Check if license is active
    if (license.status !== 'active') {
      return false;
    }

    // Check required fields
    if (
      !license.number ||
      !license.type ||
      !license.issuingAuthority ||
      !license.issuingCountry
    ) {
      return false;
    }

    return true;
  }

  private static validateInsurance(insurance: InsuranceDetails): boolean {
    const now = new Date();

    // Check if insurance is expired
    if (new Date(insurance.expiryDate) < now) {
      return false;
    }

    // Check coverage amount
    if (insurance.coverageAmount <= 0) {
      return false;
    }

    // Check required fields
    if (
      !insurance.provider ||
      !insurance.policyNumber ||
      !insurance.type ||
      !insurance.documents?.length
    ) {
      return false;
    }

    return true;
  }

  private static async sendAgentVerificationNotification(
    agentProfileId: string,
    status: 'approved' | 'rejected',
    reason?: string
  ) {
    try {
      const agentProfile = await prisma.agentProfile.findUnique({
        where: { id: agentProfileId },
        include: {
          user: true,
        },
      });

      if (!agentProfile) {
        throw new Error('Agent profile not found');
      }

      // Send email notification
      await sendAgentVerificationEmail(
        agentProfile.userId,
        status,
        reason
      );

      // Create in-app notification
      await prisma.notification.create({
        data: {
          userId: agentProfile.userId,
          type: 'agent_verification',
          title: \`Agent Verification \${status}\`,
          message: status === 'approved'
            ? 'Your agent verification has been approved!'
            : \`Your agent verification was rejected. Reason: \${reason}\`,
        },
      });

    } catch (error) {
      console.error('Error sending agent verification notification:', error);
      throw error;
    }
  }
}