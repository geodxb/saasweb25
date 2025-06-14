import { motion } from 'framer-motion';
import { 
  Shield, 
  Check, 
  FileText, 
  Download, 
  Globe, 
  Users, 
  Database, 
  Lock, 
  Key, 
  AlertTriangle 
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { APP_INFO } from '@/lib/config';

export default function Compliance() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-green-600 rounded-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">GDPR Compliance</h1>
            <p className="text-gray-600">How we comply with data protection regulations</p>
          </div>
        </div>
      </motion.div>

      <Tabs defaultValue="gdpr" className="space-y-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="gdpr">GDPR</TabsTrigger>
          <TabsTrigger value="ccpa">CCPA</TabsTrigger>
          <TabsTrigger value="data-processing">Data Processing</TabsTrigger>
        </TabsList>

        <TabsContent value="gdpr" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Data Protection Regulation (GDPR)</CardTitle>
              <CardDescription>
                How {APP_INFO.name} complies with the EU's data protection law
              </CardDescription>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <p>
                The General Data Protection Regulation (GDPR) is a regulation in EU law on data protection and privacy for all individuals within the European Union. 
                At {APP_INFO.name}, we are committed to GDPR compliance and protecting the privacy rights of our users.
              </p>
              
              <h3>Our GDPR Commitments</h3>
              <ul>
                <li>We process personal data lawfully, fairly, and transparently</li>
                <li>We collect data for specified, explicit, and legitimate purposes</li>
                <li>We limit data collection to what is necessary for our stated purposes</li>
                <li>We ensure data accuracy and keep information up to date</li>
                <li>We limit storage of personal data to what is necessary</li>
                <li>We ensure appropriate security, integrity, and confidentiality</li>
              </ul>
              
              <h3>Your Rights Under GDPR</h3>
              <p>
                As a user of {APP_INFO.name}, you have several rights under the GDPR, including:
              </p>
              <ul>
                <li>The right to be informed about how we use your personal data</li>
                <li>The right to access your personal data</li>
                <li>The right to rectification if your data is inaccurate or incomplete</li>
                <li>The right to erasure (the "right to be forgotten")</li>
                <li>The right to restrict processing of your data</li>
                <li>The right to data portability</li>
                <li>The right to object to how your data is used</li>
                <li>Rights related to automated decision making and profiling</li>
              </ul>
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
                    <Users className="w-5 h-5 mr-2" />
                    Data Subject Rights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Access & Portability</p>
                      <p className="text-sm text-gray-600">
                        You can request a copy of your personal data in a structured, commonly used format.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Rectification</p>
                      <p className="text-sm text-gray-600">
                        You can update or correct your personal information at any time.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Erasure</p>
                      <p className="text-sm text-gray-600">
                        You can request deletion of your personal data when it's no longer necessary.
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
                    <Database className="w-5 h-5 mr-2" />
                    Data Processing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Lawful Basis</p>
                      <p className="text-sm text-gray-600">
                        We process data based on consent, contractual necessity, legal obligations, or legitimate interests.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Data Minimization</p>
                      <p className="text-sm text-gray-600">
                        We only collect and process data that is necessary for our stated purposes.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Retention Limits</p>
                      <p className="text-sm text-gray-600">
                        We store personal data only as long as necessary for the purposes for which it was collected.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Data Protection Documentation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="w-6 h-6 text-gray-400" />
                  <div>
                    <p className="font-medium">Data Processing Agreement (DPA)</p>
                    <p className="text-sm text-gray-500">For business customers processing personal data</p>
                  </div>
                </div>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="w-6 h-6 text-gray-400" />
                  <div>
                    <p className="font-medium">GDPR Compliance Statement</p>
                    <p className="text-sm text-gray-500">Our official GDPR compliance documentation</p>
                  </div>
                </div>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="w-6 h-6 text-gray-400" />
                  <div>
                    <p className="font-medium">Data Subject Request Form</p>
                    <p className="text-sm text-gray-500">Form to submit data access, correction, or deletion requests</p>
                  </div>
                </div>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ccpa" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>California Consumer Privacy Act (CCPA)</CardTitle>
              <CardDescription>
                How {APP_INFO.name} complies with California's privacy law
              </CardDescription>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <p>
                The California Consumer Privacy Act (CCPA) provides California residents with specific rights regarding their personal information. 
                {APP_INFO.name} is committed to complying with the CCPA and respecting the privacy rights of California residents.
              </p>
              
              <h3>Your Rights Under CCPA</h3>
              <p>
                If you are a California resident, you have the following rights:
              </p>
              <ul>
                <li>The right to know what personal information we collect about you</li>
                <li>The right to know whether your personal information is sold or disclosed and to whom</li>
                <li>The right to say no to the sale of personal information</li>
                <li>The right to access your personal information</li>
                <li>The right to request deletion of your personal information</li>
                <li>The right to equal service and price, even if you exercise your privacy rights</li>
              </ul>
              
              <h3>How to Exercise Your Rights</h3>
              <p>
                To exercise your rights under the CCPA, you can:
              </p>
              <ul>
                <li>Submit a request through our <a href="/email-support" className="text-blue-600 hover:underline">contact form</a></li>
                <li>Email us at privacy@{APP_INFO.name.toLowerCase()}.com</li>
                <li>Call our toll-free number at 1-800-123-4567</li>
              </ul>
              <p>
                We will respond to your request within 45 days, as required by the CCPA.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data-processing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Processing Practices</CardTitle>
              <CardDescription>
                How {APP_INFO.name} processes and protects your data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Database className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="font-medium">Data Collection</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    We collect only the data necessary to provide our services, including:
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                      <Check className="w-4 h-4 text-green-600 mr-2 mt-0.5" />
                      <span>Account information (name, email, company)</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-4 h-4 text-green-600 mr-2 mt-0.5" />
                      <span>Lead data that you import or generate</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-4 h-4 text-green-600 mr-2 mt-0.5" />
                      <span>Usage data to improve our services</span>
                    </li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Lock className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="font-medium">Data Security</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    We implement robust security measures to protect your data:
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                      <Check className="w-4 h-4 text-green-600 mr-2 mt-0.5" />
                      <span>End-to-end encryption for sensitive data</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-4 h-4 text-green-600 mr-2 mt-0.5" />
                      <span>Regular security audits and penetration testing</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-4 h-4 text-green-600 mr-2 mt-0.5" />
                      <span>Strict access controls and authentication</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="font-medium">Data Processors</h3>
                <p className="text-sm text-gray-600">
                  We work with the following third-party service providers who may process your data:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { name: 'Google Cloud Platform', purpose: 'Cloud hosting' },
                    { name: 'Firebase', purpose: 'Database & authentication' },
                    { name: 'Stripe', purpose: 'Payment processing' },
                    { name: 'Sendgrid', purpose: 'Email delivery' },
                    { name: 'Intercom', purpose: 'Customer support' },
                    { name: 'Google Analytics', purpose: 'Analytics' },
                  ].map((processor, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <p className="font-medium">{processor.name}</p>
                      <p className="text-xs text-gray-500">{processor.purpose}</p>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-600">
                  All our data processors are GDPR-compliant and have signed Data Processing Agreements.
                </p>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-800">Data Processing Outside the EU</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Some of our services may process data outside the European Union. We ensure appropriate 
                      safeguards are in place through Standard Contractual Clauses and Privacy Shield certification.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8 text-center">
        <p className="text-gray-600 mb-4">
          For any questions regarding our compliance with data protection regulations, please contact our Data Protection Officer:
        </p>
        <a href="mailto:dpo@locafyr.com" className="text-blue-600 hover:underline">
          dpo@locafyr.com
        </a>
      </div>
    </div>
  );
}