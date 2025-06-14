import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Send,
  User,
  Copy,
  Download,
  RefreshCw,
  Sparkles,
  MessageSquare,
  FileText,
  Mail,
  DollarSign,
  Calendar,
  Users,
  Loader2,
  Check,
  Plus,
  History,
  Trash2,
  Settings,
  Zap,
  Brain,
  ChevronDown,
  Mic,
  Paperclip,
  MoreHorizontal,
  ArrowLeft,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { getCurrentUserId } from '@/lib/firestore';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

interface QuickPrompt {
  id: string;
  title: string;
  description: string;
  prompt: string;
  category: 'proposal' | 'email' | 'contract' | 'follow-up' | 'analysis';
  icon: any;
}

const quickPrompts: QuickPrompt[] = [
  {
    id: 'summarize-lead',
    title: 'Summarize Lead',
    description: 'Analyze and summarize lead information',
    prompt: 'Please analyze this lead information and provide a summary including their potential value, key interests, and recommended next steps: [PASTE LEAD INFO]',
    category: 'analysis',
    icon: Users,
  },
  {
    id: 'cold-email',
    title: 'Generate Cold Email',
    description: 'Create personalized cold outreach email',
    prompt: 'Write a personalized cold email for a potential client in the [INDUSTRY] industry. The email should introduce our [SERVICE] services and highlight how we can help them with [SPECIFIC_PAIN_POINT]. Keep it professional but friendly, under 150 words.',
    category: 'email',
    icon: Mail,
  },
  {
    id: 'proposal-outline',
    title: 'Proposal Outline',
    description: 'Create a project proposal structure',
    prompt: 'Create a detailed proposal outline for a [PROJECT_TYPE] project. Include sections for project overview, scope of work, timeline, deliverables, pricing structure, and terms. The client is [CLIENT_NAME] in the [INDUSTRY] industry.',
    category: 'proposal',
    icon: FileText,
  },
  {
    id: 'follow-up-sequence',
    title: 'Follow-up Sequence',
    description: 'Design email follow-up campaign',
    prompt: 'Create a 3-email follow-up sequence for prospects who haven\'t responded to our initial proposal. Each email should have a different angle: value reinforcement, social proof, and urgency. Keep each email under 100 words.',
    category: 'follow-up',
    icon: MessageSquare,
  },
  {
    id: 'contract-terms',
    title: 'Contract Terms',
    description: 'Generate contract clauses',
    prompt: 'Help me draft contract terms for a [SERVICE_TYPE] project. Include payment terms (50% upfront, 50% on completion), project timeline, scope limitations, revision policy, and cancellation terms. Make it client-friendly but protective.',
    category: 'contract',
    icon: FileText,
  },
  {
    id: 'pricing-strategy',
    title: 'Pricing Strategy',
    description: 'Analyze and suggest pricing',
    prompt: 'Help me develop a pricing strategy for [SERVICE_TYPE] services. Consider market rates, project complexity, timeline, and value delivered. Suggest both project-based and retainer pricing options.',
    category: 'analysis',
    icon: DollarSign,
  },
];

const categoryColors = {
  proposal: 'bg-blue-100 text-blue-800',
  email: 'bg-green-100 text-green-800',
  contract: 'bg-purple-100 text-purple-800',
  'follow-up': 'bg-orange-100 text-orange-800',
  analysis: 'bg-indigo-100 text-indigo-800',
};

export default function AIAssistant() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant. I can help you generate proposals, write emails, create contracts, analyze leads, and much more. What would you like to work on today?',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isNewChatDialogOpen, setIsNewChatDialogOpen] = useState(false);
  const [newChatTitle, setNewChatTitle] = useState('');
  const [isServiceAvailable, setIsServiceAvailable] = useState(true);
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check if Firebase Functions are available on component mount
  useEffect(() => {
    const checkServiceAvailability = async () => {
      try {
        const testFunction = httpsCallable(functions, 'generateChatResponse');
        // Try a minimal test call to see if the function exists
        await testFunction({ test: true });
      } catch (error: any) {
        console.warn('AI Assistant service check failed:', error);
        // If the function doesn't exist or there's a configuration error, mark as unavailable
        if (error.code === 'functions/not-found' || 
            error.code === 'functions/unauthenticated' ||
            error.message?.includes('internal') ||
            error.message?.includes('not-found')) {
          setIsServiceAvailable(false);
        }
      }
    };

    checkServiceAvailability();
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    // Check if service is available
    if (!isServiceAvailable) {
      setShowSetupDialog(true);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Add typing indicator
    const typingMessage: Message = {
      id: 'typing',
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isTyping: true,
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      // Prepare messages for API (exclude typing indicators and format properly)
      const apiMessages = [...messages, userMessage]
        .filter(msg => !msg.isTyping)
        .map(msg => ({
          role: msg.role,
          content: msg.content,
        }));

      // Use Firebase Cloud Function
      const generateChatResponse = httpsCallable(functions, 'generateChatResponse');
      const result = await generateChatResponse({
        messages: apiMessages,
        userId: getCurrentUserId(),
      });

      const data = result.data as any;
      
      if (!data.success || !data.response) {
        throw new Error(data.error || 'Invalid response from AI service');
      }
      
      // Remove typing indicator and add actual response
      setMessages(prev => {
        const withoutTyping = prev.filter(msg => msg.id !== 'typing');
        return [
          ...withoutTyping,
          {
            id: Date.now().toString(),
            role: 'assistant',
            content: data.response,
            timestamp: new Date(),
          },
        ];
      });
    } catch (error: any) {
      console.error('Error calling AI API:', error);
      
      // Remove typing indicator and show error
      setMessages(prev => {
        const withoutTyping = prev.filter(msg => msg.id !== 'typing');
        return [
          ...withoutTyping,
          {
            id: Date.now().toString(),
            role: 'assistant',
            content: 'I apologize, but I\'m having trouble connecting to the AI service right now. This appears to be a configuration issue with the Firebase Cloud Functions. Please check the setup instructions below.',
            timestamp: new Date(),
          },
        ];
      });
      
      // Handle specific error types
      if (error.code === 'functions/not-found') {
        setIsServiceAvailable(false);
        setShowSetupDialog(true);
        toast.error('AI service not found. Please deploy the Firebase Cloud Functions.');
      } else if (error.code === 'functions/unauthenticated') {
        setIsServiceAvailable(false);
        toast.error('Authentication error. Please check your Firebase configuration.');
      } else if (error.message?.includes('internal')) {
        setIsServiceAvailable(false);
        setShowSetupDialog(true);
        toast.error('AI service configuration error. Please check the setup guide.');
      } else {
        toast.error('Failed to get AI response. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickPrompt = (prompt: QuickPrompt) => {
    if (!isServiceAvailable) {
      setShowSetupDialog(true);
      return;
    }
    setInputValue(prompt.prompt);
    textareaRef.current?.focus();
  };

  const copyMessage = async (content: string) => {
    await navigator.clipboard.writeText(content);
    toast.success('Message copied to clipboard');
  };

  const downloadChat = () => {
    const chatContent = messages
      .filter(msg => !msg.isTyping)
      .map(msg => `${msg.role.toUpperCase()}: ${msg.content}`)
      .join('\n\n');
    
    const blob = new Blob([chatContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-chat-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Chat downloaded successfully');
  };

  const startNewChat = () => {
    if (newChatTitle.trim()) {
      const newSession: ChatSession = {
        id: Date.now().toString(),
        title: newChatTitle,
        messages: [{
          id: '1',
          role: 'assistant',
          content: 'Hello! I\'m your AI assistant. How can I help you today?',
          timestamp: new Date(),
        }],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setChatSessions(prev => [newSession, ...prev]);
      setCurrentSessionId(newSession.id);
      setMessages(newSession.messages);
      setNewChatTitle('');
      setIsNewChatDialogOpen(false);
      toast.success('New chat started');
    }
  };

  const clearChat = () => {
    setMessages([{
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant. How can I help you today?',
      timestamp: new Date(),
    }]);
    toast.success('Chat cleared');
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50">
      {/* Setup Dialog */}
      <Dialog open={showSetupDialog} onOpenChange={setShowSetupDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
              AI Assistant Setup Required
            </DialogTitle>
            <DialogDescription>
              The AI Assistant requires Firebase Cloud Functions to be deployed. Follow these steps to set it up:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 mb-2">Setup Instructions:</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-yellow-700">
                <li>Install Firebase CLI: <code className="bg-yellow-100 px-1 rounded">npm install -g firebase-tools</code></li>
                <li>Login to Firebase: <code className="bg-yellow-100 px-1 rounded">firebase login</code></li>
                <li>Navigate to the functions directory: <code className="bg-yellow-100 px-1 rounded">cd functions</code></li>
                <li>Install dependencies: <code className="bg-yellow-100 px-1 rounded">npm install</code></li>
                <li>Deploy functions: <code className="bg-yellow-100 px-1 rounded">firebase deploy --only functions</code></li>
                <li>Configure your OpenAI API key in Firebase Functions configuration</li>
              </ol>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">Need Help?</h4>
              <p className="text-sm text-blue-700 mb-2">
                Check the Firebase documentation for detailed setup instructions:
              </p>
              <Button variant="outline" size="sm" asChild>
                <a href="https://firebase.google.com/docs/functions/get-started" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Firebase Functions Guide
                </a>
              </Button>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowSetupDialog(false)}>
                Close
              </Button>
              <Button onClick={() => {
                setShowSetupDialog(false);
                // Retry service availability check
                setIsServiceAvailable(true);
              }}>
                I've Completed Setup
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">AI Assistant</h2>
                <p className="text-sm text-gray-500">
                  {isServiceAvailable ? 'Powered by GPT-4' : 'Setup Required'}
                </p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={downloadChat}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Chat
                </DropdownMenuItem>
                <DropdownMenuItem onClick={clearChat}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Clear Chat
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowSetupDialog(true)}>
                  <Settings className="w-4 h-4 mr-2" />
                  Setup Guide
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {!isServiceAvailable && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertCircle className="w-4 h-4 text-yellow-600 mr-2" />
                  <span className="text-sm text-yellow-800">Setup required</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowSetupDialog(true)}
                  className="text-yellow-700 hover:text-yellow-800"
                >
                  Fix
                </Button>
              </div>
            </div>
          )}
          
          <Dialog open={isNewChatDialogOpen} onOpenChange={setIsNewChatDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                New Chat
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Start New Chat</DialogTitle>
                <DialogDescription>
                  Give your new chat session a descriptive title
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="chatTitle">Chat Title</Label>
                  <Input
                    id="chatTitle"
                    value={newChatTitle}
                    onChange={(e) => setNewChatTitle(e.target.value)}
                    placeholder="e.g., Website Proposal for TechCorp"
                    onKeyPress={(e) => e.key === 'Enter' && startNewChat()}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsNewChatDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={startNewChat} disabled={!newChatTitle.trim()}>
                    Start Chat
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Quick Prompts */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Prompts</h3>
          <div className="space-y-2">
            {quickPrompts.slice(0, 4).map((prompt) => (
              <motion.button
                key={prompt.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleQuickPrompt(prompt)}
                className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <prompt.icon className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">{prompt.title}</div>
                    <div className="text-xs text-gray-500 truncate">{prompt.description}</div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full mt-2">
                <ChevronDown className="w-4 h-4 mr-2" />
                More Prompts
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80">
              {quickPrompts.slice(4).map((prompt) => (
                <DropdownMenuItem key={prompt.id} onClick={() => handleQuickPrompt(prompt)}>
                  <prompt.icon className="w-4 h-4 mr-2" />
                  <div>
                    <div className="font-medium">{prompt.title}</div>
                    <div className="text-xs text-gray-500">{prompt.description}</div>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-hidden">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Recent Chats</h3>
          </div>
          <ScrollArea className="flex-1 px-4">
            {chatSessions.length > 0 ? (
              <div className="space-y-2">
                {chatSessions.map((session) => (
                  <motion.button
                    key={session.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => {
                      setCurrentSessionId(session.id);
                      setMessages(session.messages);
                    }}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      currentSessionId === session.id
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {session.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {session.messages.length} messages
                        </div>
                        <div className="text-xs text-gray-400">
                          {session.updatedAt.toLocaleDateString()}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setChatSessions(prev => prev.filter(s => s.id !== session.id));
                          if (currentSessionId === session.id) {
                            setCurrentSessionId(null);
                            clearChat();
                          }
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <History className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No chat history yet</p>
              </div>
            )}
          </ScrollArea>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="sm" 
                className="mr-2" 
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">AI Assistant</h1>
                <p className="text-sm text-gray-500">
                  {isLoading ? 'AI is thinking...' : isServiceAvailable ? 'Ready to help' : 'Setup required'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className={isServiceAvailable ? "text-green-700 border-green-200" : "text-red-700 border-red-200"}>
                <div className={`w-2 h-2 ${isServiceAvailable ? 'bg-green-500' : 'bg-red-500'} rounded-full mr-2`}></div>
                {isServiceAvailable ? 'Online' : 'Offline'}
              </Badge>
              {!isServiceAvailable && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowSetupDialog(true)}
                >
                  Setup
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="max-w-4xl mx-auto space-y-6">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex space-x-3 max-w-3xl ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className={message.role === 'user' ? 'bg-blue-100' : 'bg-purple-100'}>
                        {message.role === 'user' ? (
                          <User className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Bot className="w-4 h-4 text-purple-600" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          {message.role === 'user' ? 'You' : 'AI Assistant'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      
                      <div className={`rounded-lg p-4 ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-gray-200'
                      }`}>
                        {message.isTyping ? (
                          <div className="flex items-center space-x-2">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                            <span className="text-sm text-gray-500">AI is typing...</span>
                          </div>
                        ) : (
                          <div className="prose prose-sm max-w-none">
                            <pre className="whitespace-pre-wrap font-sans text-sm">
                              {message.content}
                            </pre>
                          </div>
                        )}
                      </div>
                      
                      {!message.isTyping && message.role === 'assistant' && (
                        <div className="flex items-center space-x-2 mt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyMessage(message.content)}
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            Copy
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const blob = new Blob([message.content], { type: 'text/plain' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `ai-response-${Date.now()}.txt`;
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                              URL.revokeObjectURL(url);
                            }}
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="max-w-4xl mx-auto">
            {!isServiceAvailable && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertCircle className="w-4 h-4 text-yellow-600 mr-2" />
                    <span className="text-sm text-yellow-800">
                      AI Assistant requires Firebase Cloud Functions to be deployed.
                    </span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowSetupDialog(true)}
                    className="text-yellow-700 hover:text-yellow-800"
                  >
                    Setup Guide
                  </Button>
                </div>
              </div>
            )}
            <div className="flex items-end space-x-3">
              <div className="flex-1 relative">
                <Textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isServiceAvailable ? "Ask me anything... I can help with proposals, emails, contracts, and more!" : "Complete setup to start chatting with AI"}
                  className="min-h-12 max-h-32 resize-none pr-12"
                  disabled={isLoading}
                />
                <div className="absolute right-2 bottom-2 flex space-x-1">
                  <Button variant="ghost" size="sm" disabled>
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" disabled>
                    <Mic className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <span>Press Enter to send, Shift+Enter for new line</span>
              <span>{inputValue.length}/2000</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}