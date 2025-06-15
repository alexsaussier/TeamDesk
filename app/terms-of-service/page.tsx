import PublicNavbar from '@/components/PublicNavbar'
import { Card, CardContent } from '@/components/ui/card'

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white">
      <PublicNavbar />
      
      <main className="max-w-4xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-lg text-gray-600">Last updated: December 2024</p>
        </div>

        <Card>
          <CardContent className="p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing or using TeamDesk&apos;s project management platform and related services (the &quot;Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you disagree with any part of these terms, you may not access the Service. TeamDesk provides utilization tracking, project pipeline management, team optimization, and AI-powered consulting tools for businesses and consulting teams.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                TeamDesk is a comprehensive project management platform that offers:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Utilization data insights and tracking against targets</li>
                <li>Project pipeline management and visualization</li>
                <li>Consultant and team management tools</li>
                <li>AI-powered staffing suggestions and project optimization</li>
                <li>Real-time utilization tracking and KPI dashboards</li>
                <li>Project timeline overview and Kanban board management</li>
                <li>Team skills and performance visualization</li>
                <li>AI tools for RFP responses and project structure optimization (coming soon)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts and Registration</h2>
              <h3 className="text-xl font-medium text-gray-800 mb-3">3.1 Account Creation</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                To use our Service, you must create an account and provide accurate, current, and complete information. You are responsible for maintaining the confidentiality of your account credentials.
              </p>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">3.2 Account Responsibility</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>You are responsible for all activities that occur under your account</li>
                <li>You must notify us immediately of any unauthorized use of your account</li>
                <li>You must be at least 18 years old to create an account</li>
                <li>You may only create one account unless expressly permitted by us</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Acceptable Use Policy</h2>
              <h3 className="text-xl font-medium text-gray-800 mb-3">4.1 Permitted Use</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                You may use TeamDesk for legitimate business purposes related to project management, team optimization, and consulting operations.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3">4.2 Prohibited Activities</h3>
              <p className="text-gray-700 leading-relaxed mb-4">You agree not to:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Use the Service for any unlawful purpose or in violation of applicable laws</li>
                <li>Interfere with or disrupt the Service or servers connected to the Service</li>
                <li>Attempt to gain unauthorized access to any part of the Service</li>
                <li>Upload, post, or transmit any malicious code, viruses, or harmful content</li>
                <li>Reverse engineer, decompile, or attempt to extract source code</li>
                <li>Use automated systems to access the Service without permission</li>
                <li>Share your account credentials with unauthorized third parties</li>
                <li>Use the Service to store or transmit illegal, harmful, or offensive content</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Subscription and Payment Terms</h2>
              <h3 className="text-xl font-medium text-gray-800 mb-3">5.1 Subscription Plans</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                TeamDesk offers various subscription plans. Free trial periods may be available for new users to evaluate the Service.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3">5.2 Payment and Billing</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Subscription fees are billed in advance on a recurring basis</li>
                <li>All fees are non-refundable unless otherwise stated</li>
                <li>You authorize us to charge your payment method for all applicable fees</li>
                <li>Prices may change with 30 days&apos; notice to existing subscribers</li>
                <li>Failed payments may result in service suspension or termination</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data and Privacy</h2>
              <h3 className="text-xl font-medium text-gray-800 mb-3">6.1 Your Data</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                You retain ownership of all data, content, and information you upload or input into the Service (&quot;Customer Data&quot;). We will process Customer Data in accordance with our Privacy Policy.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3">6.2 Data Security</h3>
              <p className="text-gray-700 leading-relaxed">
                We implement appropriate technical and organizational measures to protect Customer Data, but you acknowledge that no system is completely secure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Intellectual Property</h2>
              <h3 className="text-xl font-medium text-gray-800 mb-3">7.1 Our Intellectual Property</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                The Service, including its design, functionality, AI algorithms, and all related intellectual property, is owned by TeamDesk and protected by copyright, trademark, and other laws.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3">7.2 License to Use</h3>
              <p className="text-gray-700 leading-relaxed">
                We grant you a limited, non-exclusive, non-transferable license to use the Service in accordance with these Terms during your subscription period.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Service Availability and Support</h2>
              <h3 className="text-xl font-medium text-gray-800 mb-3">8.1 Service Availability</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We strive to maintain high service availability but do not guarantee uninterrupted access. We may perform maintenance that temporarily affects service availability.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3">8.2 Support</h3>
              <p className="text-gray-700 leading-relaxed">
                Support is provided based on your subscription plan. We aim to respond to support requests promptly during business hours.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Termination</h2>
              <h3 className="text-xl font-medium text-gray-800 mb-3">9.1 Termination by You</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                You may terminate your account at any time through your account settings or by contacting us. Termination does not entitle you to a refund of prepaid fees.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3">9.2 Termination by Us</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may suspend or terminate your account if you violate these Terms, fail to pay fees, or for other legitimate business reasons.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3">9.3 Effect of Termination</h3>
              <p className="text-gray-700 leading-relaxed">
                Upon termination, your access to the Service will cease, and we may delete your data after a reasonable period unless legally required to retain it.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Disclaimers and Limitations of Liability</h2>
              <h3 className="text-xl font-medium text-gray-800 mb-3">10.1 Service Disclaimer</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DISCLAIM ALL WARRANTIES, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3">10.2 Limitation of Liability</h3>
              <p className="text-gray-700 leading-relaxed">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, OUR LIABILITY FOR ANY CLAIMS RELATED TO THE SERVICE SHALL NOT EXCEED THE AMOUNT YOU PAID FOR THE SERVICE IN THE 12 MONTHS PRECEDING THE CLAIM.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Indemnification</h2>
              <p className="text-gray-700 leading-relaxed">
                You agree to indemnify and hold harmless TeamDesk from any claims, damages, losses, and expenses arising from your use of the Service, violation of these Terms, or infringement of any third-party rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. General Provisions</h2>
              <h3 className="text-xl font-medium text-gray-800 mb-3">12.1 Governing Law</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                These Terms are governed by the laws of [Your Jurisdiction] without regard to conflict of law principles.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3">12.2 Dispute Resolution</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Any disputes arising from these Terms shall be resolved through binding arbitration, except for claims that may be brought in small claims court.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3">12.3 Modifications</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may modify these Terms at any time. Material changes will be communicated with 30 days&apos; notice. Continued use of the Service constitutes acceptance of modified Terms.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3">12.4 Severability</h3>
              <p className="text-gray-700 leading-relaxed">
                If any provision of these Terms is found unenforceable, the remaining provisions will continue in full force and effect.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed">
                For questions about these Terms of Service, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">
                  <strong>TeamDesk</strong><br />
                  Email: alex@teamdesk.app<br />
                  Subject: Terms of Service Inquiry
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