import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { APP_INFO } from '@/lib/config';

export default function PrivacyPolicy() {
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
            <div className="p-3 bg-green-600 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
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
              <h2>1. Introduction</h2>
              <p>
                At {APP_INFO.name}, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform. Please read this policy carefully to understand our practices regarding your personal data.
              </p>

              <h2>2. Information We Collect</h2>
              <p>We collect several types of information, including:</p>
              <ul>
                <li><strong>Account Information:</strong> When you register, we collect your name, email address, company name, and other profile details.</li>
                <li><strong>Usage Data:</strong> Information about how you interact with our platform, including features used, time spent, and actions taken.</li>
                <li><strong>Lead and Client Data:</strong> Information you input or import about your leads and clients.</li>
                <li><strong>Payment Information:</strong> When you subscribe to our paid services, we collect billing details and payment method information.</li>
                <li><strong>Communication Data:</strong> Records of your interactions with our support team and communications preferences.</li>
              </ul>

              <h2>3. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul>
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Respond to your comments, questions, and requests</li>
                <li>Send technical notices, updates, and support messages</li>
                <li>Monitor and analyze usage patterns and trends</li>
                <li>Personalize your experience and deliver relevant content</li>
                <li>Protect against, identify, and prevent fraud and other illegal activities</li>
              </ul>

              <h2>4. Data Sharing and Disclosure</h2>
              <p>
                We do not sell your personal information. We may share your information in the following circumstances:
              </p>
              <ul>
                <li><strong>Service Providers:</strong> With third-party vendors who help us operate our business and provide services.</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets.</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety.</li>
                <li><strong>With Your Consent:</strong> In other cases with your explicit consent.</li>
              </ul>

              <h2>5. Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
              </p>
              <ul>
                <li>Encryption of sensitive data in transit and at rest</li>
                <li>Regular security assessments and penetration testing</li>
                <li>Access controls and authentication requirements</li>
                <li>Continuous monitoring for suspicious activities</li>
              </ul>

              <h2>6. Your Rights and Choices</h2>
              <p>Depending on your location, you may have certain rights regarding your personal information:</p>
              <ul>
                <li>Access and update your personal information</li>
                <li>Request deletion of your data</li>
                <li>Object to or restrict certain processing activities</li>
                <li>Data portability (receiving your data in a structured format)</li>
                <li>Withdraw consent where processing is based on consent</li>
              </ul>

              <h2>7. Cookies and Tracking Technologies</h2>
              <p>
                We use cookies and similar technologies to enhance your experience, analyze usage patterns, and deliver personalized content. You can control cookie settings through your browser preferences.
              </p>

              <h2>8. International Data Transfers</h2>
              <p>
                Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data during such transfers.
              </p>

              <h2>9. Children's Privacy</h2>
              <p>
                Our Service is not intended for children under 16. We do not knowingly collect personal information from children under 16. If you become aware that a child has provided us with personal information, please contact us.
              </p>

              <h2>10. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date.
              </p>

              <h2>11. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy or our data practices, please contact us at:
              </p>
              <ul>
                <li>Email: privacy@{APP_INFO.name.toLowerCase()}.com</li>
                <li>Address: 123 Business Avenue, San Francisco, CA 94105, USA</li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}