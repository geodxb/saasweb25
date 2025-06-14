import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Zap, 
  Check, 
  ArrowRight, 
  Users, 
  Target, 
  Brain, 
  Workflow, 
  Mail, 
  ChevronDown, 
  Star, 
  MessageSquare, 
  Shield, 
  Crown, 
  Download,
  ArrowUpRight,
  CheckCircle,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { analytics, AnalyticsEvents } from '@/lib/analytics';
import { toast } from 'sonner';
import { APP_INFO } from '@/lib/config';

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('monthly');

  const handleLeadCapture = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real implementation, send to your backend
      // await fetch('/api/capture-lead', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, source: 'landing_page' }),
      // });
      
      // Track lead capture
      analytics.track({
        name: AnalyticsEvents.LEAD_CAPTURED,
        properties: { source: 'landing_page' }
      });
      
      // For demo, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Thanks! Check your email for your free guide.');
      setEmail('');
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const plans = [
    {
      name: 'Free',
      price: { monthly: '$0', annually: '$0' },
      description: 'For individuals just getting started',
      features: [
        '20 leads per month',
        '10 AI prompts',
        'Basic lead management',
        'Email support',
        '1GB storage'
      ],
      cta: 'Get Started',
      popular: false,
      color: 'border-gray-200 hover:border-gray-300'
    },
    {
      name: 'Pro',
      price: { monthly: '$29', annually: '$290' },
      description: 'For growing businesses and professionals',
      features: [
        '300 leads per month',
        'Unlimited AI prompts',
        'Advanced lead management',
        'Priority support',
        '10GB storage',
        'Lead scraping',
        'Basic workflows'
      ],
      cta: 'Start 7-Day Free Trial',
      popular: true,
      color: 'border-amber-200 hover:border-amber-300'
    },
    {
      name: 'Agency',
      price: { monthly: '$79', annually: '$790' },
      description: 'For teams and agencies',
      features: [
        '2000 leads per month',
        'Unlimited AI prompts',
        'Outreach automation',
        'Team support',
        '50GB storage',
        'Advanced workflows',
        'Custom integrations',
        'White-label options',
        'Dedicated support'
      ],
      cta: 'Contact Sales',
      popular: false,
      color: 'border-gray-200 hover:border-gray-300 bg-gradient-to-br from-gray-50 to-amber-50'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Marketing Director',
      company: 'TechStart Inc',
      content: `${APP_INFO.name} has transformed how we manage leads. The AI assistant saves us hours every week on outreach, and the workflow automation keeps our team on the same page.`,
      avatar: 'https://randomuser.me/api/portraits/women/32.jpg',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Agency Owner',
      company: 'Growth Partners',
      content: `As an agency owner, I needed a solution that could scale with my team. ${APP_INFO.name}'s Agency plan gives us everything we need to manage clients efficiently and grow our business.`,
      avatar: 'https://randomuser.me/api/portraits/men/46.jpg',
      rating: 5
    },
    {
      name: 'Emily Rodriguez',
      role: 'Freelance Consultant',
      company: 'Independent',
      content: `The lead scraper feature alone is worth the price. I've generated more qualified leads in one month than I did all last quarter. The ROI is incredible.`,
      avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
      rating: 4
    }
  ];

  const faqs = [
    {
      question: 'How does the free trial work?',
      answer: 'Our 7-day free trial gives you full access to all Pro plan features. No credit card required to start. At the end of your trial, you can choose to upgrade to a paid plan or continue with our Free plan.'
    },
    {
      question: 'Can I upgrade or downgrade my plan later?',
      answer: 'Yes, you can upgrade or downgrade your plan at any time. When upgrading, you\'ll get immediate access to new features. When downgrading, your current plan will remain active until the end of your billing cycle.'
    },
    {
      question: 'What happens if I exceed my monthly lead limit?',
      answer: `If you reach your monthly lead limit, you'll be notified in the app. You can continue using all other features, but won't be able to add new leads until your limit resets or you upgrade your plan.`
    },
    {
      question: 'Is there a limit to how many team members I can add?',
      answer: 'The Free and Pro plans are for individual users. The Agency plan includes support for up to 5 team members, with the option to add more for an additional fee.'
    },
    {
      question: 'How does the referral program work?',
      answer: 'When you refer a friend who signs up and subscribes to a paid plan, you\'ll receive one month of your current plan for free. There\'s no limit to how many referrals you can make.'
    },
    {
      question: 'Can I export my data if I decide to cancel?',
      answer: 'Yes, you can export all your data at any time, including after cancellation. We provide exports in CSV and JSON formats for easy migration.'
    }
  ];

  const features = [
    {
      title: 'AI-Powered Lead Generation',
      description: 'Find and collect leads from Google Maps and company websites with our intelligent scraper.',
      icon: Target,
      color: 'bg-amber-500'
    },
    {
      title: 'Smart Outreach Campaigns',
      description: 'Create personalized outreach sequences that adapt based on recipient engagement.',
      icon: Mail,
      color: 'bg-black'
    },
    {
      title: 'Workflow Automation',
      description: 'Build custom workflows to automate your client acquisition and onboarding processes.',
      icon: Workflow,
      color: 'bg-amber-500'
    },
    {
      title: 'AI Assistant',
      description: 'Generate proposals, emails, and content with our powerful AI assistant trained on sales best practices.',
      icon: Brain,
      color: 'bg-black'
    },
    {
      title: 'Team Collaboration',
      description: 'Work seamlessly with your team with role-based permissions and shared pipelines.',
      icon: Users,
      color: 'bg-amber-500'
    },
    {
      title: 'Advanced Analytics',
      description: 'Track performance metrics and get insights to optimize your lead generation and conversion.',
      icon: Zap,
      color: 'bg-black'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      {/* Header */}
      <header className="w-full py-4 px-6 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img 
              src="/logo.svg" 
              alt="Locafy Logo" 
              className="h-auto w-[100px]"
              onError={(e) => {
                // Fallback if image fails to load
                const target = e.target as HTMLImageElement;
                target.onerror = null; // Prevent infinite loop
                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNGMEI0MjkiLz48L3N2Zz4=';
              }}
            />
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
            <a href="#testimonials" className="text-gray-600 hover:text-gray-900">Testimonials</a>
            <a href="#faq" className="text-gray-600 hover:text-gray-900">FAQ</a>
          </nav>
          
          <div className="flex items-center space-x-4">
            <Link to="/login">
              <Button variant="ghost">Log In</Button>
            </Link>
            <Link to="/signup">
              <Button>Sign Up Free</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="w-full py-20 bg-gradient-to-br from-amber-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge className="mb-4 bg-amber-100 text-amber-800 hover:bg-amber-200">
                <Zap className="w-3 h-3 mr-1" />
                New: AI-Powered Lead Generation
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Find Local Business <span className="text-amber-500">Leads</span> with Google Maps
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-lg">
                {APP_INFO.name} helps you discover, collect, and engage with local business leads using the power of Google Maps and AI.
              </p>
              
              <form onSubmit={handleLeadCapture} className="flex flex-col sm:flex-row gap-3 mb-8">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full sm:w-auto sm:flex-1"
                />
                <Button type="submit" disabled={isSubmitting} className="bg-amber-500 hover:bg-amber-600 text-white">
                  {isSubmitting ? 'Sending...' : 'Get Started Free'}
                </Button>
              </form>
              
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Check className="w-4 h-4 text-green-500" />
                <span>No credit card required</span>
                <span className="mx-2">•</span>
                <Check className="w-4 h-4 text-green-500" />
                <span>Free 7-day Pro trial</span>
                <span className="mx-2">•</span>
                <Check className="w-4 h-4 text-green-500" />
                <span>Cancel anytime</span>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-black/5 rounded-xl transform rotate-3"></div>
              <div className="relative rounded-xl overflow-hidden shadow-2xl border border-gray-200">
                <img 
                  src="https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                  alt="Locafy Dashboard" 
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end">
                  <div className="p-6 text-white">
                    <p className="font-medium">{APP_INFO.name} Dashboard</p>
                    <p className="text-sm opacity-80">AI-powered lead management and automation</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute -bottom-6 -right-6 bg-white rounded-lg shadow-lg p-4 border border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                    <Target className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Lead Generation</p>
                    <p className="text-xs text-gray-500">73 new leads this week</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="w-full py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-8">
            <p className="text-gray-600">Trusted by 2,500+ businesses worldwide</p>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {['TechCorp', 'GrowthAgency', 'StartupInc', 'DesignStudio', 'MarketingPro'].map((company, index) => (
              <div key={index} className="text-gray-400 font-semibold text-lg">
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="w-full py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="mb-4">Powerful Features</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Grow Your Business
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {APP_INFO.name} combines powerful tools for lead generation, outreach, and client management in one platform.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Lead Magnet */}
      <section className="w-full py-20 bg-gradient-to-br from-amber-500 to-black text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-white/20 text-white hover:bg-white/30">
                <Download className="w-3 h-3 mr-1" />
                Free Resource
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                Download Our Free Guide: "50 Proven Lead Generation Strategies for 2025"
              </h2>
              <p className="text-xl text-white opacity-90 mb-8">
                Learn the exact strategies our top clients use to generate high-quality leads consistently.
              </p>
              
              <form onSubmit={handleLeadCapture} className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full sm:w-auto sm:flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                />
                <Button type="submit" disabled={isSubmitting} className="bg-white text-amber-600 hover:bg-white/90">
                  {isSubmitting ? 'Sending...' : 'Get Free Guide'}
                </Button>
              </form>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-white/5 rounded-2xl transform rotate-3"></div>
              <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl">
                <h3 className="text-2xl font-bold mb-4 text-white">What You'll Learn:</h3>
                <ul className="space-y-3 text-white">
                  {[
                    'How to scrape leads from Google Maps and LinkedIn',
                    'Email templates that get 40%+ open rates',
                    'Automation workflows that save 15+ hours per week',
                    'AI prompts for generating personalized outreach',
                    'How to qualify leads faster with scoring algorithms'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start text-white">
                      <CheckCircle className="w-5 h-5 text-amber-400 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-white">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="w-full py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="mb-4">Simple Pricing</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Choose the Plan That's Right for You
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              No hidden fees or long-term commitments. Start free and upgrade as you grow.
            </p>
            
            <div className="flex items-center justify-center mt-8">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-xs">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                  <TabsTrigger value="annually">
                    Annually
                    <Badge className="ml-2 bg-green-100 text-green-800">Save 20%</Badge>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <Badge className="bg-amber-500 text-white">Most Popular</Badge>
                  </div>
                )}
                
                <Card className={`h-full border-2 ${plan.color} ${plan.popular ? 'shadow-lg' : ''}`}>
                  <CardContent className="p-6">
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                      <p className="text-gray-600 mb-4">{plan.description}</p>
                      <div className="text-4xl font-bold text-gray-900">
                        {activeTab === 'monthly' ? plan.price.monthly : plan.price.annually}
                        <span className="text-base font-normal text-gray-600">
                          {plan.name !== 'Free' && `/${activeTab === 'monthly' ? 'mo' : 'yr'}`}
                        </span>
                      </div>
                    </div>
                    
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start">
                          <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      className={`w-full ${plan.popular ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}`}
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      {plan.cta}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="w-full py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="mb-4">Testimonials</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of satisfied users who have transformed their lead generation and client management.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${i < testimonial.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                    
                    <p className="text-gray-700 mb-6">"{testimonial.content}"</p>
                    
                    <div className="flex items-center space-x-3">
                      <img 
                        src={testimonial.avatar} 
                        alt={testimonial.name} 
                        className="w-12 h-12 rounded-full"
                      />
                      <div>
                        <p className="font-medium">{testimonial.name}</p>
                        <p className="text-sm text-gray-600">{testimonial.role}, {testimonial.company}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="w-full py-20 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="mb-4">FAQ</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about {APP_INFO.name}
            </p>
          </div>
          
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">Still have questions?</p>
            <Button variant="outline">
              <MessageSquare className="w-4 h-4 mr-2" />
              Contact Support
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="w-full py-20 bg-gradient-to-br from-amber-500 to-black text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Ready to Supercharge Your Lead Generation?
          </h2>
          <p className="text-xl text-white opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses using {APP_INFO.name} to find, engage, and convert more leads.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/signup">
              <Button size="lg" className="bg-white text-amber-600 hover:bg-white/90">
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Schedule Demo
            </Button>
          </div>
          
          <p className="mt-6 text-sm text-white opacity-80">
            No credit card required • Free 7-day Pro trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-12 bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <img 
                  src="/logo.svg" 
                  alt="Locafy Logo" 
                  className="h-auto w-[100px]"
                  onError={(e) => {
                    // Fallback if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.onerror = null; // Prevent infinite loop
                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNGMEI0MjkiLz48L3N2Zz4=';
                  }}
                />
              </div>
              <p className="text-gray-400 mb-4">
                The all-in-one platform for lead generation, outreach, and client management.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.51 0 10-4.48 10-10S17.51 2 12 2zm6.605 4.61a8.502 8.502 0 011.93 5.314c-.281-.054-3.101-.629-5.943-.271-.065-.141-.12-.293-.184-.445a25.416 25.416 0 00-.564-1.236c3.145-1.28 4.577-3.124 4.761-3.362zM12 3.475c2.17 0 4.154.813 5.662 2.148-.152.216-1.443 1.941-4.48 3.08-1.399-2.57-2.95-4.675-3.189-5A8.687 8.687 0 0112 3.475zm-3.633.803a53.896 53.896 0 013.167 4.935c-3.992 1.063-7.517 1.04-7.896 1.04a8.581 8.581 0 014.729-5.975zM3.453 12.01v-.26c.37.01 4.512.065 8.775-1.215.25.477.477.965.694 1.453-.109.033-.228.065-.336.098-4.404 1.42-6.747 5.303-6.942 5.629a8.522 8.522 0 01-2.19-5.705zM12 20.547a8.482 8.482 0 01-5.239-1.8c.152-.315 1.888-3.656 6.703-5.337.022-.01.033-.01.054-.022a35.318 35.318 0 011.823 6.475 8.4 8.4 0 01-3.341.684zm4.761-1.465c-.086-.52-.542-3.015-1.659-6.084 2.679-.423 5.022.271 5.314.369a8.468 8.468 0 01-3.655 5.715z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Integrations</a></li>
                <li><a href="#" className="hover:text-white">Roadmap</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="/blog" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">Guides</a></li>
                <li><a href="#" className="hover:text-white">Support</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="/terms" className="hover:text-white">Terms of Service</a></li>
                <li><a href="/privacy" className="hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm">© {new Date().getFullYear()} {APP_INFO.name}. All rights reserved.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="/terms" className="text-sm hover:text-white">Terms</a>
              <a href="/privacy" className="text-sm hover:text-white">Privacy</a>
              <a href="#" className="text-sm hover:text-white">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}