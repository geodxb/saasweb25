import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Send, 
  User, 
  Clock, 
  CheckCircle, 
  Loader2, 
  ArrowRight, 
  Mail, 
  Phone, 
  MapPin,
  HelpCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { APP_INFO } from '@/lib/config';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'support';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'read';
}

export default function ContactUs() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `Hello! Welcome to ${APP_INFO.name} support. How can I help you today?`,
      sender: 'support',
      timestamp: new Date(Date.now() - 60000),
      status: 'read',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
      status: 'sending',
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate sending message
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === userMessage.id ? { ...msg, status: 'sent' } : msg
        )
      );

      // Simulate support agent typing
      setTimeout(() => {
        // Add support response
        const supportResponses = [
          "Thanks for reaching out! I'd be happy to help with that. Could you provide more details?",
          "I understand your question. Let me check that for you right away.",
          "That's a great question about our Google Maps scraper. The feature allows you to search for businesses by keyword and location, then save them directly to your leads database.",
          "For your account settings, you can access those by clicking on your profile icon in the top right corner, then selecting 'Settings'.",
          "I can help troubleshoot that issue. Have you tried refreshing the page or clearing your browser cache?",
        ];

        const randomResponse = supportResponses[Math.floor(Math.random() * supportResponses.length)];

        const supportMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: randomResponse,
          sender: 'support',
          timestamp: new Date(),
          status: 'sent',
        };

        setMessages(prev => [...prev, supportMessage]);
        setIsTyping(false);
      }, 2000);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Support</h1>
        <p className="text-gray-600">
          Get help from our support team through live chat or email
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Live Chat */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card className="h-full flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback className="bg-blue-100 text-blue-800">
                      LS
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">Live Support</CardTitle>
                    <CardDescription>
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                        Online
                      </Badge>
                    </CardDescription>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Avg. response time: 2 min
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] ${message.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'} rounded-lg p-3`}>
                        <p>{message.content}</p>
                        <div className={`text-xs mt-1 flex items-center justify-end ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {message.sender === 'user' && message.status && (
                            <span className="ml-1">
                              {message.status === 'sending' ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : message.status === 'sent' ? (
                                <CheckCircle className="w-3 h-3" />
                              ) : null}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-gray-800 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                          </div>
                          <span className="text-sm text-gray-500">Support is typing...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              <div className="p-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <Textarea
                    placeholder="Type your message here..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="min-h-[60px] resize-none"
                  />
                  <Button onClick={handleSendMessage} disabled={!inputMessage.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Contact Info & Email Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium">Email Support</p>
                  <a href="mailto:support@locafyr.com" className="text-blue-600 hover:underline">
                    support@locafy.com
                  </a>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium">Phone Support</p>
                  <p className="text-gray-600">+971569599366</p>
                  <p className="text-xs text-gray-500">Mon-Fri, 9AM-5PM EST</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium">Headquarters</p>
                  <p className="text-gray-600">
                    Bussines Bay<br />
                    Dubai,<br />
                    UAE
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Email Support</CardTitle>
              <CardDescription>
                Send us a message and we'll get back to you within 24 hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.location.href = '/email-support'}
              >
                <Mail className="w-4 h-4 mr-2" />
                Go to Email Support
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Help Resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" onClick={() => window.location.href = '/help'}>
                <HelpCircle className="w-4 h-4 mr-2" />
                Help Center
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <User className="w-4 h-4 mr-2" />
                Account Settings
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}