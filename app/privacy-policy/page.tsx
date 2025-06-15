import PublicNavbar from '@/components/PublicNavbar'
import { Card, CardContent } from '@/components/ui/card'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white">
      <PublicNavbar />
      
      <main className="max-w-4xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-lg text-gray-600">Last updated: December 2024</p>
        </div>

        <Card>
          <CardContent className="p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                TeamDesk ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our project management platform and related services (the "Service"). TeamDesk provides utilization tracking, project pipeline management, team optimization, and AI-powered consulting tools for businesses and consulting teams.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">2.1 Information You Provide</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Account information (name, email address, company details)</li>
                <li>Profile information for team members and consultants</li>
                <li>Project data (project names, descriptions, timelines, budgets)</li>
                <li>Utilization and performance metrics</li>
                <li>Skills and competency information</li>
                <li>Communication and collaboration data within the platform</li>
                <li>Payment and billing information (processed securely through third-party providers)</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3">2.2 Automatically Collected Information</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Usage data and platform analytics</li>
                <li>Device information and browser details</li>
                <li>IP address and location data</li>
                <li>Cookies and similar tracking technologies</li>
                <li>Log files and system performance data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Provide and maintain the TeamDesk platform and services</li>
                <li>Generate utilization reports and performance analytics</li>
                <li>Enable project pipeline management and team optimization features</li>
                <li>Power AI-driven staffing suggestions and project optimization</li>
                <li>Process payments and manage billing</li>
                <li>Send service-related communications and updates</li>
                <li>Improve our services and develop new features</li>
                <li>Ensure platform security and prevent fraud</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Information Sharing and Disclosure</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We do not sell, trade, or otherwise transfer your personal information to third parties except in the following circumstances:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>With Your Consent:</strong> When you explicitly authorize us to share information</li>
                <li><strong>Service Providers:</strong> With trusted third-party providers who assist in operating our platform (cloud hosting, payment processing, analytics)</li>
                <li><strong>Legal Requirements:</strong> When required by law, court order, or to protect our rights and safety</li>
                <li><strong>Business Transfers:</strong> In connection with mergers, acquisitions, or asset sales</li>
                <li><strong>Within Your Organization:</strong> With other users in your organization as necessary for the platform's functionality</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
              <p className="text-gray-700 leading-relaxed">
                We implement industry-standard security measures to protect your information, including encryption in transit and at rest, secure data centers, regular security audits, access controls, and employee training. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Retention</h2>
              <p className="text-gray-700 leading-relaxed">
                We retain your information for as long as necessary to provide our services, comply with legal obligations, resolve disputes, and enforce our agreements. Project data and utilization metrics may be retained for historical reporting purposes. You may request deletion of your data subject to our legal and contractual obligations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Your Rights and Choices</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Depending on your location, you may have the following rights:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Access and review your personal information</li>
                <li>Correct inaccurate or incomplete data</li>
                <li>Request deletion of your personal information</li>
                <li>Object to or restrict certain processing activities</li>
                <li>Data portability (receive your data in a structured format)</li>
                <li>Withdraw consent where processing is based on consent</li>
                <li>Opt-out of marketing communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. International Data Transfers</h2>
              <p className="text-gray-700 leading-relaxed">
                Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for international transfers, including standard contractual clauses and adequacy decisions where applicable.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Children's Privacy</h2>
              <p className="text-gray-700 leading-relaxed">
                TeamDesk is designed for business use and is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Updates to This Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on our website and updating the "Last updated" date. Your continued use of the Service after such changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact Us</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">
                  <strong>TeamDesk</strong><br />
                  Email: alex@teamdesk.app<br />
                  Subject: Privacy Policy Inquiry
                </p>
              </div>
            </section>
          </CardContent>
        </Card>
      </main>

      <footer className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            © 2024 TeamDesk. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
} 