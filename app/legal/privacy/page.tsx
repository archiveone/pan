import { LegalLayout } from '@/components/layout/LegalLayout';

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      description="GDPR-Compliant Privacy Policy for Ireland and EU Users"
      lastUpdated="September 5, 2025"
      version="2.0.0"
    >
      <div className="prose prose-gray max-w-none">
        <h2>1. Introduction</h2>
        <p>
          GREIA ("we", "our", "us") is committed to protecting and respecting your privacy. This policy explains how we collect, use, and protect your personal data in accordance with the General Data Protection Regulation (GDPR) and Irish Data Protection Act 2018.
        </p>

        <h2>2. Data Controller</h2>
        <p>
          GREIA is the data controller and we are responsible for your personal data. We are registered with the Data Protection Commission (DPC) in Ireland.
        </p>

        <h2>3. Personal Data We Collect</h2>
        <h3>3.1 Information you provide us:</h3>
        <ul>
          <li>Name and contact details</li>
          <li>Account login information</li>
          <li>Profile information</li>
          <li>Property and listing details</li>
          <li>Messages and communication content</li>
          <li>Payment and transaction information</li>
        </ul>

        <h3>3.2 Information we automatically collect:</h3>
        <ul>
          <li>Device and browser information</li>
          <li>IP address and location data</li>
          <li>Usage data and analytics</li>
          <li>Cookies and similar technologies</li>
        </ul>

        <h2>4. Legal Basis for Processing</h2>
        <p>We process your personal data on the following legal bases:</p>
        <ul>
          <li>Contract performance (Article 6(1)(b) GDPR)</li>
          <li>Legal obligations (Article 6(1)(c) GDPR)</li>
          <li>Legitimate interests (Article 6(1)(f) GDPR)</li>
          <li>Consent (Article 6(1)(a) GDPR)</li>
        </ul>

        <h2>5. How We Use Your Data</h2>
        <ul>
          <li>To provide and maintain our services</li>
          <li>To process transactions and payments</li>
          <li>To communicate with you</li>
          <li>To improve our services</li>
          <li>To comply with legal obligations</li>
          <li>To prevent fraud and abuse</li>
        </ul>

        <h2>6. Data Sharing and Transfers</h2>
        <p>
          We may share your personal data with:
        </p>
        <ul>
          <li>Service providers and processors</li>
          <li>Professional advisers</li>
          <li>Law enforcement when required</li>
        </ul>
        <p>
          For transfers outside the EEA, we implement appropriate safeguards including Standard Contractual Clauses.
        </p>

        <h2>7. Data Retention</h2>
        <p>
          We retain your personal data only for as long as necessary to fulfill the purposes for which it was collected, including legal and compliance obligations.
        </p>

        <h2>8. Your Rights</h2>
        <p>Under GDPR, you have the right to:</p>
        <ul>
          <li>Access your personal data</li>
          <li>Rectify inaccurate data</li>
          <li>Erase your data ("right to be forgotten")</li>
          <li>Restrict processing</li>
          <li>Data portability</li>
          <li>Object to processing</li>
          <li>Withdraw consent</li>
        </ul>

        <h2>9. Security Measures</h2>
        <p>
          We implement appropriate technical and organizational measures to ensure the security of your personal data, including:
        </p>
        <ul>
          <li>Encryption of data in transit and at rest</li>
          <li>Regular security assessments</li>
          <li>Access controls and authentication</li>
          <li>Staff training and awareness</li>
        </ul>

        <h2>10. Cookies and Tracking</h2>
        <p>
          We use cookies and similar technologies to improve your experience. You can manage your cookie preferences through your browser settings.
        </p>

        <h2>11. Children's Privacy</h2>
        <p>
          Our services are not intended for children under 16. We do not knowingly collect data from children under 16.
        </p>

        <h2>12. Changes to This Policy</h2>
        <p>
          We may update this policy from time to time. We will notify you of any significant changes.
        </p>

        <h2>13. Contact Information</h2>
        <p>
          For privacy-related inquiries or to exercise your rights, contact our Data Protection Officer:
        </p>
        <ul>
          <li>Email: privacy@greia.com</li>
          <li>Address: [Irish Business Address]</li>
          <li>Phone: [Irish Phone Number]</li>
        </ul>

        <p>
          You have the right to lodge a complaint with the Data Protection Commission (DPC):
        </p>
        <ul>
          <li>Website: www.dataprotection.ie</li>
          <li>Phone: +353 (0)761 104 800</li>
          <li>Email: info@dataprotection.ie</li>
        </ul>

        <h2>14. Specific Processing Activities</h2>
        
        <h3>14.1 Property Listings</h3>
        <p>
          When you create property listings, we process:
        </p>
        <ul>
          <li>Property details and images</li>
          <li>Location data</li>
          <li>Pricing information</li>
          <li>Contact details</li>
        </ul>

        <h3>14.2 Messaging and Communications</h3>
        <p>
          For our messaging system, we process:
        </p>
        <ul>
          <li>Message content</li>
          <li>Timestamps</li>
          <li>Participant information</li>
          <li>Attachments</li>
        </ul>

        <h3>14.3 Video Calls</h3>
        <p>
          For video calls, we process:
        </p>
        <ul>
          <li>Audio and video streams</li>
          <li>Connection data</li>
          <li>Technical metadata</li>
        </ul>

        <h3>14.4 Payments</h3>
        <p>
          For payment processing, we:
        </p>
        <ul>
          <li>Use secure payment processors</li>
          <li>Do not store full payment details</li>
          <li>Maintain transaction records as required by law</li>
        </ul>

        <h2>15. Data Protection Impact Assessment</h2>
        <p>
          We conduct Data Protection Impact Assessments (DPIAs) for high-risk processing activities and implement appropriate measures to address risks.
        </p>

        <h2>16. International Operations</h2>
        <p>
          While we operate from Ireland, our services are available internationally. We ensure appropriate safeguards for international data transfers through:
        </p>
        <ul>
          <li>Standard Contractual Clauses</li>
          <li>Adequacy decisions</li>
          <li>Binding Corporate Rules where applicable</li>
        </ul>
      </div>
    </LegalLayout>
  );
}