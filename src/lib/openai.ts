// OpenAI API client for direct API calls
export interface EmailGenerationRequest {
  lead: {
    name?: string;
    company?: string;
    title?: string;
    industry?: string;
    email?: string;
  };
  tone?: 'friendly' | 'professional' | 'persuasive' | 'concise';
  emailGoal?: 'book_call' | 'follow_up' | 'introduction' | 'demo_pitch';
}

export interface EmailGenerationResponse {
  success: boolean;
  email?: {
    subject: string;
    body: string;
  };
  error?: string;
}

export async function generateEmailWithAI(request: EmailGenerationRequest): Promise<EmailGenerationResponse> {
  try {
    // For demo purposes, we'll simulate an AI response
    // In a real implementation, you would call OpenAI API with your API key
    
    const { lead, tone = 'professional', emailGoal = 'introduction' } = request;
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Map email goals to human-readable descriptions
    const goalDescriptions = {
      book_call: 'schedule a call or meeting',
      follow_up: 'follow up on a previous conversation',
      introduction: 'introduce our services',
      demo_pitch: 'pitch a product demo'
    };
    
    // Map tones to style descriptions
    const toneDescriptions = {
      friendly: 'warm and conversational',
      professional: 'formal and business-like',
      persuasive: 'compelling and convincing',
      concise: 'brief and to the point'
    };
    
    // Generate a personalized email based on lead data, tone, and goal
    const subject = generateSubject(lead, tone, emailGoal);
    const body = generateBody(lead, tone, emailGoal);

    return {
      success: true,
      email: {
        subject,
        body
      }
    };
  } catch (error) {
    console.error('Error generating AI email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// Helper function to generate subject line
function generateSubject(
  lead: EmailGenerationRequest['lead'], 
  tone: EmailGenerationRequest['tone'], 
  emailGoal: EmailGenerationRequest['emailGoal']
): string {
  const businessName = lead.company || 'your business';
  
  switch (emailGoal) {
    case 'book_call':
      return tone === 'concise' 
        ? `Quick call about ${businessName}'s growth?` 
        : `Let's discuss how we can help ${businessName} grow`;
    
    case 'follow_up':
      return tone === 'concise' 
        ? `Following up on our conversation` 
        : `Following up on our discussion about ${businessName}`;
    
    case 'introduction':
      return tone === 'concise' 
        ? `Introducing our services to ${businessName}` 
        : `How we can help ${businessName} achieve better results`;
    
    case 'demo_pitch':
      return tone === 'concise' 
        ? `Product demo for ${businessName}` 
        : `Exclusive demo opportunity for ${businessName}`;
    
    default:
      return `Connecting with ${businessName}`;
  }
}

// Helper function to generate email body
function generateBody(
  lead: EmailGenerationRequest['lead'], 
  tone: EmailGenerationRequest['tone'], 
  emailGoal: EmailGenerationRequest['emailGoal']
): string {
  const name = lead.name || 'there';
  const company = lead.company || 'your company';
  const industry = lead.industry || 'your industry';
  
  // Base greeting based on tone
  let greeting = '';
  switch (tone) {
    case 'friendly':
      greeting = `Hi ${name},\n\n`;
      break;
    case 'professional':
      greeting = `Dear ${name},\n\n`;
      break;
    case 'persuasive':
    case 'concise':
    default:
      greeting = `Hello ${name},\n\n`;
      break;
  }
  
  // Body content based on email goal and tone
  let content = '';
  switch (emailGoal) {
    case 'book_call':
      if (tone === 'concise') {
        content = `I'd like to schedule a brief call to discuss how our lead generation platform can help ${company} grow.\n\nWould you be available for a 15-minute call this week? I have openings on Tuesday at 10am or Thursday at 2pm.\n\n`;
      } else if (tone === 'persuasive') {
        content = `I've been researching ${company} and believe we could significantly impact your growth trajectory through our specialized lead generation solutions for the ${industry} sector.\n\nMany of our clients in similar industries have seen a 30-40% increase in qualified leads within the first 60 days.\n\nI'd love to schedule a brief 15-minute call to explore if our approach might be valuable for ${company}. Would you have availability this week for a quick discussion?\n\n`;
      } else if (tone === 'friendly') {
        content = `I hope this email finds you well! I've been following ${company}'s journey and I'm really impressed with what you're doing in the ${industry} space.\n\nI work with companies like yours to boost their lead generation efforts, and I'd love to chat about how we might be able to help you too. Nothing salesy, just a friendly conversation to see if there might be a fit.\n\nDo you have 15 minutes to spare this week for a quick call?\n\n`;
      } else { // professional
        content = `I'm reaching out regarding potential opportunities to enhance ${company}'s lead generation strategy.\n\nOur platform specializes in helping businesses in the ${industry} sector optimize their customer acquisition process through data-driven approaches and automation.\n\nI would appreciate the opportunity to schedule a brief 15-minute call to discuss how our solutions might align with your objectives. Please let me know if you have availability this week.\n\n`;
      }
      break;
      
    case 'follow_up':
      if (tone === 'concise') {
        content = `I'm following up on my previous message about our lead generation platform.\n\nAre you still interested in learning how we can help ${company} increase qualified leads?\n\n`;
      } else if (tone === 'persuasive') {
        content = `I wanted to follow up on my previous message about how our lead generation platform could benefit ${company}.\n\nSince we last connected, we've helped several companies in the ${industry} space achieve remarkable results - including one that increased their qualified lead flow by 45% in just two months.\n\nI'm confident we could deliver similar outcomes for ${company}. Would it make sense to have a quick conversation about your specific goals?\n\n`;
      } else if (tone === 'friendly') {
        content = `I hope you've been having a great week! I just wanted to check in since I hadn't heard back from you about our lead generation platform.\n\nNo pressure at all - I know how busy things can get! I'm still excited about the possibility of helping ${company} grow, so just let me know if you'd like to chat.\n\n`;
      } else { // professional
        content = `I'm following up regarding my previous correspondence about our lead generation solutions for ${company}.\n\nUnderstanding that you maintain a busy schedule, I wanted to ensure this opportunity remained on your radar. Our platform continues to deliver significant results for organizations in the ${industry} sector.\n\nPlease let me know if you would be interested in discussing how these solutions might benefit your specific business objectives.\n\n`;
      }
      break;
      
    case 'introduction':
      if (tone === 'concise') {
        content = `I'm reaching out to introduce our lead generation platform that specializes in the ${industry} industry.\n\nWe help businesses like ${company} find and convert more qualified prospects through our AI-powered tools.\n\n`;
      } else if (tone === 'persuasive') {
        content = `I'm reaching out because we've developed a lead generation platform that's delivering exceptional results for companies in the ${industry} space, and I believe ${company} could benefit significantly.\n\nOur clients typically see a 30% increase in qualified leads and a 25% reduction in customer acquisition costs within the first 90 days of implementation.\n\nWhat makes our approach different is our focus on quality over quantity - ensuring you're connecting with prospects who are genuinely interested in your offerings.\n\n`;
      } else if (tone === 'friendly') {
        content = `I hope your week is going well! I wanted to introduce myself and our company, which specializes in helping businesses like ${company} generate more high-quality leads.\n\nWe've worked with several companies in the ${industry} space, and they've loved how our platform makes lead generation so much easier and more effective. It's like having an extra team member who works 24/7 finding perfect prospects for you!\n\nI'd love to share more about how we might be able to help ${company} grow.\n\n`;
      } else { // professional
        content = `I am writing to introduce our lead generation platform, which has been specifically designed to address the unique challenges faced by organizations in the ${industry} sector.\n\nOur solution integrates advanced analytics, automation, and industry-specific insights to help businesses like ${company} identify and engage with high-value prospects more effectively.\n\nWe currently serve numerous clients within your industry who have experienced significant improvements in their lead generation metrics and overall sales efficiency.\n\n`;
      }
      break;
      
    case 'demo_pitch':
      if (tone === 'concise') {
        content = `I'd like to offer you a personalized demo of our lead generation platform, tailored specifically for ${company}.\n\nThe demo takes just 20 minutes and will show you how to increase your qualified leads by up to 30%.\n\n`;
      } else if (tone === 'persuasive') {
        content = `I'd like to invite you to an exclusive, personalized demo of our lead generation platform that we've customized for companies in the ${industry} space.\n\nDuring this brief 20-minute session, I'll show you exactly how ${company} can:\n\n- Identify and target your ideal prospects with precision\n- Automate personalized outreach at scale\n- Track and optimize your entire lead generation funnel\n\nOur recent clients have seen an average increase of 35% in qualified leads within 60 days of implementation. I'm confident we can achieve similar results for ${company}.\n\n`;
      } else if (tone === 'friendly') {
        content = `I hope you're having a great day! I wanted to invite you to a quick, no-pressure demo of our lead generation platform that I think could be a game-changer for ${company}.\n\nI've prepared a special demo that focuses specifically on the ${industry} industry, so everything you'll see is directly relevant to your business. It only takes about 20 minutes, and I promise to make it worth your time!\n\nWould you be interested in seeing how our platform works? I'm happy to schedule it whenever works best for you.\n\n`;
      } else { // professional
        content = `I would like to extend an invitation for a personalized demonstration of our lead generation platform, specifically configured to address the needs of organizations in the ${industry} sector.\n\nThis concise 20-minute presentation will illustrate how our solution can enhance ${company}'s lead acquisition strategy through:\n\n- Industry-specific targeting parameters\n- Automated engagement sequences\n- Comprehensive analytics and optimization tools\n\nThe demonstration can be scheduled at your convenience and requires no prior preparation on your part.\n\n`;
      }
      break;
      
    default:
      content = `I noticed that ${company} has been making waves in the ${industry} industry, and I wanted to reach out to introduce our lead generation platform.\n\nWe specialize in helping businesses like yours find and convert more qualified leads, resulting in increased revenue and growth.\n\nI'd be happy to share more details about how we might be able to help ${company} achieve its goals.\n\n`;
  }
  
  // Closing based on tone
  let closing = '';
  switch (tone) {
    case 'friendly':
      closing = `Looking forward to connecting!\n\nCheers,\n[Your Name]`;
      break;
    case 'professional':
      closing = `Thank you for your consideration. I look forward to your response.\n\nBest regards,\n[Your Name]`;
      break;
    case 'persuasive':
      closing = `I'm excited about the potential opportunity to help ${company} achieve significant growth. Let's connect soon.\n\nBest regards,\n[Your Name]`;
      break;
    case 'concise':
      closing = `Let me know if you're interested.\n\nRegards,\n[Your Name]`;
      break;
    default:
      closing = `Looking forward to connecting.\n\nBest regards,\n[Your Name]`;
  }
  
  return greeting + content + closing;
}