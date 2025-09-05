import { LegalLayout } from '@/components/layout/LegalLayout';

export default function CookiePolicyPage() {
  return (
    <LegalLayout
      title="Cookie Policy"
      description="GDPR-Compliant Cookie Policy for Ireland and EU Users"
      lastUpdated="September 5, 2025"
      version="1.5.0"
    >
      <div className="prose prose-gray max-w-none">
        <h2>1. Introduction</h2>
        <p>
          This Cookie Policy explains how GREIA ("we", "our", "us") uses cookies and similar technologies on our website and applications. This policy is compliant with the ePrivacy Directive, GDPR, and Irish Data Protection Act 2018.
        </p>

        <h2>2. What Are Cookies?</h2>
        <p>
          Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience and allow certain features to work.
        </p>

        <h2>3. Types of Cookies We Use</h2>
        
        <h3>3.1 Essential Cookies (Strictly Necessary)</h3>
        <p>These cookies are necessary for the website to function and cannot be switched off in our systems.</p>
        <table className="w-full border-collapse border">
          <thead>
            <tr>
              <th className="border p-2">Cookie Name</th>
              <th className="border p-2">Purpose</th>
              <th className="border p-2">Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2">session_id</td>
              <td className="border p-2">Maintains your session</td>
              <td className="border p-2">Session</td>
            </tr>
            <tr>
              <td className="border p-2">csrf_token</td>
              <td className="border p-2">Security token</td>
              <td className="border p-2">Session</td>
            </tr>
          </tbody>
        </table>

        <h3>3.2 Performance Cookies (Analytics)</h3>
        <p>These cookies allow us to count visits and traffic sources to measure and improve our site's performance.</p>
        <table className="w-full border-collapse border">
          <thead>
            <tr>
              <th className="border p-2">Cookie Name</th>
              <th className="border p-2">Purpose</th>
              <th className="border p-2">Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2">_ga</td>
              <td className="border p-2">Google Analytics</td>
              <td className="border p-2">2 years</td>
            </tr>
            <tr>
              <td className="border p-2">_gid</td>
              <td className="border p-2">Google Analytics</td>
              <td className="border p-2">24 hours</td>
            </tr>
          </tbody>
        </table>

        <h3>3.3 Functional Cookies</h3>
        <p>These cookies enable enhanced functionality and personalization.</p>
        <table className="w-full border-collapse border">
          <thead>
            <tr>
              <th className="border p-2">Cookie Name</th>
              <th className="border p-2">Purpose</th>
              <th className="border p-2">Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2">language</td>
              <td className="border p-2">Stores language preference</td>
              <td className="border p-2">1 year</td>
            </tr>
            <tr>
              <td className="border p-2">theme</td>
              <td className="border p-2">Stores theme preference</td>
              <td className="border p-2">1 year</td>
            </tr>
          </tbody>
        </table>

        <h3>3.4 Targeting Cookies</h3>
        <p>These cookies may be set through our site by our advertising partners.</p>
        <table className="w-full border-collapse border">
          <thead>
            <tr>
              <th className="border p-2">Cookie Name</th>
              <th className="border p-2">Purpose</th>
              <th className="border p-2">Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2">_fbp</td>
              <td className="border p-2">Facebook Pixel</td>
              <td className="border p-2">3 months</td>
            </tr>
          </tbody>
        </table>

        <h2>4. Cookie Consent</h2>
        <p>
          When you first visit our website, we will present you with a cookie consent banner. You can:
        </p>
        <ul>
          <li>Accept all cookies</li>
          <li>Reject non-essential cookies</li>
          <li>Customize your preferences</li>
        </ul>

        <h2>5. Managing Cookies</h2>
        <p>You can manage cookies through:</p>
        <ul>
          <li>Our cookie preferences center</li>
          <li>Your browser settings</li>
          <li>Third-party opt-out tools</li>
        </ul>

        <h3>Browser Settings</h3>
        <p>
          You can control cookies through your browser settings. Here's how to do it in common browsers:
        </p>
        <ul>
          <li>Chrome: Settings → Privacy and Security → Cookies</li>
          <li>Firefox: Options → Privacy & Security → Cookies</li>
          <li>Safari: Preferences → Privacy → Cookies</li>
          <li>Edge: Settings → Privacy & Security → Cookies</li>
        </ul>

        <h2>6. Third-Party Cookies</h2>
        <p>
          We use services from these third parties that may set cookies:
        </p>
        <ul>
          <li>Google Analytics (analytics)</li>
          <li>Stripe (payments)</li>
          <li>Facebook (social media)</li>
          <li>Twilio (messaging)</li>
        </ul>

        <h2>7. Cookie Policy Updates</h2>
        <p>
          We may update this Cookie Policy from time to time. The latest version will always be available on our website.
        </p>

        <h2>8. Data Protection Rights</h2>
        <p>
          Under GDPR, you have various rights regarding your personal data, including data collected through cookies. See our Privacy Policy for more details.
        </p>

        <h2>9. Contact Information</h2>
        <p>
          If you have questions about our use of cookies:
        </p>
        <ul>
          <li>Email: privacy@greia.com</li>
          <li>Address: [Irish Business Address]</li>
          <li>Phone: [Irish Phone Number]</li>
        </ul>

        <h2>10. Supervisory Authority</h2>
        <p>
          You have the right to lodge a complaint with the Data Protection Commission (DPC) in Ireland:
        </p>
        <ul>
          <li>Website: www.dataprotection.ie</li>
          <li>Email: info@dataprotection.ie</li>
          <li>Phone: +353 (0)761 104 800</li>
        </ul>
      </div>
    </LegalLayout>
  );
}