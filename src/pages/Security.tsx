import { motion } from 'framer-motion';
import { 
  Shield, 
  Lock, 
  Key, 
  Server, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Database, 
  Globe, 
  Users,
  Mail
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { APP_INFO } from '@/lib/config';

export default function Security() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-blue-600 rounded-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Security</h1>
            <p className="text-gray-600">How we protect your data and privacy</p>
          </div>
        </div>
      </motion.div>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Our Security Commitment</CardTitle>
            <CardDescription>
              At {APP_INFO.name}, we take the security of your data seriously
            </CardDescription>
          </CardHeader>
          <CardContent className="prose prose-gray max-w-none">
            <p>
              We understand that you trust us with your business data, and we're committed to maintaining that trust. 
              Our security practices are designed to ensure the confidentiality, integrity, and availability of your information.
            </p>
            <p>
              We employ industry-standard security measures and best practices to protect your data from unauthorized access, 
              disclosure, alteration, and destruction. Our security program is continuously reviewed and updated to address 
              emerging threats and vulnerabilities.
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="w-5 h-5 mr-2" />
                  Data Protection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Encryption at Rest</p>
                    <p className="text-sm text-gray-600">
                      All data stored in our systems is encrypted using AES-256 encryption.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Encryption in Transit</p>
                    <p className="text-sm text-gray-600">
                      All data transmitted between your browser and our servers is encrypted using TLS 1.3.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Secure Data Backups</p>
                    <p className="text-sm text-gray-600">
                      Regular encrypted backups with strict access controls.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Key className="w-5 h-5 mr-2" />
                  Access Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Multi-Factor Authentication</p>
                    <p className="text-sm text-gray-600">
                      Optional MFA for all user accounts to prevent unauthorized access.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Role-Based Access Control</p>
                    <p className="text-sm text-gray-600">
                      Granular permissions ensure users only access what they need.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Session Management</p>
                    <p className="text-sm text-gray-600">
                      Automatic session timeouts and secure session handling.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Infrastructure Security</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto">
                    <Server className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-medium">Secure Cloud Infrastructure</h3>
                  <p className="text-sm text-gray-600">
                    Hosted on Google Cloud Platform with industry-leading security controls.
                  </p>
                </div>
                <div className="space-y-2 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto">
                    <Database className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-medium">Database Security</h3>
                  <p className="text-sm text-gray-600">
                    Isolated database instances with encryption and regular security audits.
                  </p>
                </div>
                <div className="space-y-2 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto">
                    <Globe className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-medium">Network Protection</h3>
                  <p className="text-sm text-gray-600">
                    DDoS protection, WAF, and regular penetration testing.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Compliance & Certifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <Badge className="bg-green-100 text-green-800">Compliant</Badge>
                    <h3 className="font-medium">GDPR</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    We comply with the General Data Protection Regulation for EU users, providing data portability, 
                    the right to be forgotten, and transparent data processing.
                  </p>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <Badge className="bg-green-100 text-green-800">Compliant</Badge>
                    <h3 className="font-medium">CCPA</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    We comply with the California Consumer Privacy Act, respecting California residents' 
                    rights regarding their personal information.
                  </p>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
                    <h3 className="font-medium">SOC 2</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    We are in the process of obtaining SOC 2 certification to demonstrate our commitment 
                    to security, availability, and confidentiality.
                  </p>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <Badge className="bg-green-100 text-green-800">Compliant</Badge>
                    <h3 className="font-medium">Privacy Shield</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    We adhere to Privacy Shield principles for the transfer of personal data between 
                    the EU and the United States.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Security Best Practices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium">Recommendations for Your Account</p>
                  <ul className="text-sm text-gray-600 space-y-2 mt-2">
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5" />
                      <span>Enable two-factor authentication for your account</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5" />
                      <span>Use a strong, unique password</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5" />
                      <span>Regularly review account activity and team access</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5" />
                      <span>Keep your contact information up to date</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Security Contacts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                If you have any security concerns or would like to report a vulnerability, please contact our security team:
              </p>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <a href="mailto:security@locafyr.com" className="text-blue-600 hover:underline">
                  security@locafyr.com
                </a>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Responsible Disclosure Program</p>
                  <p className="text-sm text-gray-600">
                    We appreciate the work of security researchers
                  </p>
                </div>
                <Button variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  View Policy
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}