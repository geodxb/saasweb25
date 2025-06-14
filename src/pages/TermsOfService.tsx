import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { APP_INFO } from '@/lib/config';

export default function TermsOfService() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-indigo-600 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
              <p className="text-gray-600">Last updated: May 2025</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-8 prose prose-gray max-w-none">
              <h2>1. Acceptance of Terms</h2>
              <p>
                By accessing and using {APP_INFO.name} ("the Service"), you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these terms, please do not use our Service.
              </p>

              <h2>2. Description of Service</h2>
              <p>
                {APP_INFO.name} is a lead generation and business intelligence platform that helps users find and collect business leads from Google Maps and other sources. Our platform provides tools for lead management, outreach automation, and workflow optimization.
              </p>

              <h2>3. User Accounts</h2>
              <p>
                To access certain features of the Service, you must register for an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
              </p>

              <h2>4. Acceptable Use</h2>
              <p>You agree not to use the Service to:</p>
              <ul>
                <li>Violate any applicable laws, regulations, or third-party rights</li>
                <li>Collect or harvest data in violation of Google's Terms of Service or other platform policies</li>
                <li>Send spam, unsolicited communications, or engage in deceptive practices</li>
                <li>Interfere with or disrupt the integrity or performance of the Service</li>
                <li>Attempt to gain unauthorized access to the Service or related systems</li>
                <li>Transmit any viruses, malware, or other harmful code</li>
              </ul>

              <h2>5. Data Usage and Privacy</h2>
              <p>
                Our collection and use of personal information is governed by our <a href="/privacy" className="text-indigo-600 hover:text-indigo-800">Privacy Policy</a>, which is incorporated into these Terms. By using the Service, you consent to our data practices as described in the Privacy Policy.
              </p>

              <h2>6. Subscription and Billing</h2>
              <p>
                Some features of the Service require a paid subscription. Subscription fees are billed in advance on either a monthly or annual basis. You may cancel your subscription at any time, but we do not provide refunds for partial subscription periods.
              </p>

              <h2>7. Intellectual Property</h2>
              <p>
                The Service and its original content, features, and functionality are owned by {APP_INFO.name} and are protected by international copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, or create derivative works based on our Service without explicit permission.
              </p>

              <h2>8. Third-Party Services</h2>
              <p>
                The Service may integrate with or contain links to third-party services or websites. We are not responsible for the content or practices of these third parties, and you access them at your own risk.
              </p>

              <h2>9. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, {APP_INFO.name} shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use the Service, including but not limited to loss of profits, data, or business opportunities.
              </p>

              <h2>10. Termination</h2>
              <p>
                We reserve the right to suspend or terminate your account and access to the Service at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties, or for any other reason.
              </p>

              <h2>11. Changes to Terms</h2>
              <p>
                We may modify these Terms at any time. We will provide notice of material changes by posting the updated Terms on our website and updating the "Last Updated" date. Your continued use of the Service after such modifications constitutes your acceptance of the revised Terms.
              </p>

              <h2>12. Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.
              </p>

              <h2>13. Contact Information</h2>
              <p>
                If you have any questions about these Terms, please contact us at:
              </p>
              <ul>
                <li>Email: legal@{APP_INFO.name.toLowerCase()}.com</li>
                <li>Address: 123 Business Avenue, San Francisco, CA 94105, USA</li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}