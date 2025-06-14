import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Book, 
  UserPlus, 
  Users, 
  Brain, 
  Workflow, 
  Settings, 
  CheckCircle, 
  ArrowRight, 
  HelpCircle 
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { APP_INFO } from '@/lib/config';

export default function GettingStartedGuide() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-4" 
          onClick={() => navigate('/help')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Help Center
        </Button>
        
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Book className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Getting Started Guide</h1>
            <p className="text-gray-600">A comprehensive guide to help you get up and running with {APP_INFO.name}</p>
          </div>
        </div>
      </motion.div>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Welcome to {APP_INFO.name}!</CardTitle>
            <CardDescription>
              This guide will help you get started and make the most of our platform
            </CardDescription>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Welcome aboard! {APP_INFO.name} is designed to help you find, manage, and convert leads into clients with powerful tools like Google Maps scraping, AI assistance, and workflow automation. This guide will walk you through the essential steps to get started.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Step 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Badge className="bg-blue-100 text-blue-800">Step 1</Badge>
                  <CardTitle className="text-base">Complete Your Profile</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Before you start using {APP_INFO.name}, it's important to complete your profile information. This helps personalize your experience and improves the quality of AI-generated content.
                </p>
                
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium mb-2">How to complete your profile:</h3>
                  <ol className="space-y-2 text-xs text-gray-600 list-decimal list-inside">
                    <li>Click on your profile icon in the top right corner</li>
                    <li>Select "Settings" from the dropdown menu</li>
                    <li>Fill in your personal information, company details, and upload a profile picture</li>
                    <li>Save your changes</li>
                  </ol>
                </div>
                
                <div className="flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => navigate('/settings?tab=profile')}>
                    Go to Profile Settings
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Step 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Badge className="bg-blue-100 text-blue-800">Step 2</Badge>
                  <CardTitle className="text-base">Find Your First Leads</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  The Google Maps Scraper is the fastest way to find potential clients in your target area. You can search for businesses by type and location, then save them directly to your leads database.
                </p>
                
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium mb-2">How to use the Google Maps Scraper:</h3>
                  <ol className="space-y-2 text-xs text-gray-600 list-decimal list-inside">
                    <li>Click on "Google Maps Scraper" in the sidebar</li>
                    <li>Enter a business type (e.g., "dentist") and location (e.g., "Chicago, IL")</li>
                    <li>Click "Search Google Maps"</li>
                    <li>Select the businesses you want to save</li>
                    <li>Click "Save as Lead" or "Save Selected"</li>
                  </ol>
                </div>
                
                <div className="flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => navigate('/google-maps-scraper')}>
                    Go to Google Maps Scraper
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Step 3 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Badge className="bg-blue-100 text-blue-800">Step 3</Badge>
                  <CardTitle className="text-base">Organize Your Leads</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Keeping your leads organized will help you manage them effectively. Use tags, statuses, and notes to track your progress with each lead.
                </p>
                
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium mb-2">Lead organization tips:</h3>
                  <ul className="space-y-2 text-xs text-gray-600">
                    <li className="flex items-start">
                      <CheckCircle className="w-3 h-3 text-green-600 mr-2 mt-0.5" />
                      <span><strong>Tags:</strong> Add tags to categorize leads (e.g., "hot", "cold", "follow-up")</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-3 h-3 text-green-600 mr-2 mt-0.5" />
                      <span><strong>Status:</strong> Update lead status as they progress (new, contacted, proposal, converted, lost)</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-3 h-3 text-green-600 mr-2 mt-0.5" />
                      <span><strong>Notes:</strong> Add detailed notes about your interactions</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-3 h-3 text-green-600 mr-2 mt-0.5" />
                      <span><strong>Kanban View:</strong> Use the Kanban board to visualize your sales pipeline</span>
                    </li>
                  </ul>
                </div>
                
                <div className="flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => navigate('/leads')}>
                    Go to Leads Management
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Step 4 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Badge className="bg-blue-100 text-blue-800">Step 4</Badge>
                  <CardTitle className="text-base">Use the AI Assistant</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  The AI Assistant can help you generate content and analyze leads. Use it to create personalized emails, proposals, and follow-ups.
                </p>
                
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium mb-2">How to use the AI Assistant:</h3>
                  <ol className="space-y-2 text-xs text-gray-600 list-decimal list-inside">
                    <li>Click on "AI Assistant" in the sidebar</li>
                    <li>Select a quick prompt template or write your own prompt</li>
                    <li>Provide the necessary context and information</li>
                    <li>Click "Generate" to create content</li>
                  </ol>
                </div>
                
                <div className="flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => navigate('/ai-assistant')}>
                    Go to AI Assistant
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Step 5 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Badge className="bg-blue-100 text-blue-800">Step 5</Badge>
                  <CardTitle className="text-base">Set Up Your First Workflow</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Workflows help you automate repetitive tasks and processes. Start with a simple workflow, such as a welcome email sequence for new leads.
                </p>
                
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium mb-2">How to create a workflow:</h3>
                  <ol className="space-y-2 text-xs text-gray-600 list-decimal list-inside">
                    <li>Click on "Workflow Builder" in the sidebar</li>
                    <li>Click "Create Workflow" or select a template</li>
                    <li>Configure the workflow trigger and steps</li>
                    <li>Test the workflow</li>
                    <li>Activate it when ready</li>
                  </ol>
                </div>
                
                <div className="flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => navigate('/workflow-builder')}>
                    Go to Workflow Builder
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Next Steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Now that you're set up, here are some recommended next steps:
            </p>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <UserPlus className="w-4 h-4 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Find at least 10 leads</p>
                  <p className="text-xs text-gray-600">Start building your pipeline with potential clients</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Workflow className="w-4 h-4 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Set up one automated workflow</p>
                  <p className="text-xs text-gray-600">Automate a repetitive process to save time</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Brain className="w-4 h-4 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Try the AI Assistant</p>
                  <p className="text-xs text-gray-600">Generate an email or proposal for one of your leads</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Settings className="w-4 h-4 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Customize your dashboard</p>
                  <p className="text-xs text-gray-600">Arrange your dashboard to show the metrics that matter to you</p>
                </div>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">Need more help?</p>
                <p className="text-xs text-gray-600">Our support team is here for you</p>
              </div>
              <Button size="sm" onClick={() => navigate('/contact')}>
                <HelpCircle className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}