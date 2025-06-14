import { rateLimiter, RATE_LIMITS, getUserIdentifier } from './rateLimiter';
import { ErrorHandler, ClientFlowError } from './errorHandler';
import { Lead } from './firestore';

export interface ScrapingSource {
  id: string;
  name: string;
  description: string;
  icon: string;
  isAvailable: boolean;
  requiresAuth: boolean;
  rateLimitPerHour: number;
}

export interface ScrapingParams {
  source: string;
  keywords: string;
  location?: string;
  industry?: string;
  companySize?: string;
  jobTitle?: string;
  maxResults?: number;
  filters?: Record<string, any>;
}

export interface ScrapedLead {
  id: string;
  name: string;
  title?: string;
  company?: string;
  email?: string;
  phone?: string;
  location?: string;
  profileUrl?: string;
  platform: string;
  score: number;
  industry?: string;
  companySize?: string;
  verified: boolean;
  lastActive?: string;
  connections?: number;
  description?: string;
  website?: string;
  socialProfiles?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
}

export interface ScrapingResult {
  leads: ScrapedLead[];
  totalResults: number;
  nextPage?: string;
  source: string;
  query: string;
  timestamp: Date;
}

class LeadScraper {
  private sources: ScrapingSource[] = [
    {
      id: 'linkedin',
      name: 'LinkedIn',
      description: 'Professional network',
      icon: 'linkedin',
      isAvailable: true,
      requiresAuth: true,
      rateLimitPerHour: 50,
    },
    {
      id: 'company-website',
      name: 'Company Websites',
      description: 'Extract from company websites',
      icon: 'globe',
      isAvailable: true,
      requiresAuth: false,
      rateLimitPerHour: 200,
    },
  ];

  getSources(): ScrapingSource[] {
    return this.sources;
  }

  async scrapeLeads(params: ScrapingParams, userId?: string): Promise<ScrapingResult> {
    // Check rate limits
    const identifier = getUserIdentifier(userId);
    const rateLimitResult = rateLimiter.check({
      maxRequests: RATE_LIMITS.SCRAPING_PER_HOUR,
      windowMs: 60 * 60 * 1000, // 1 hour
      identifier: `lead_scraping:${identifier}`,
    });

    if (!rateLimitResult.allowed) {
      throw new ClientFlowError(
        'SCRAPING_LIMIT_EXCEEDED',
        'Lead scraping rate limit exceeded',
        {
          retryable: true,
          retryAfter: rateLimitResult.retryAfter,
        }
      );
    }

    try {
      switch (params.source) {
        case 'linkedin':
          return await this.scrapeLinkedIn(params, userId);
        case 'company-website':
          return await this.scrapeCompanyWebsites(params, userId);
        default:
          throw new ClientFlowError(
            'INVALID_DATA',
            'Invalid scraping source',
            { retryable: false }
          );
      }
    } catch (error) {
      if (error instanceof ClientFlowError) {
        throw error;
      }
      
      throw ErrorHandler.handle(error, 'lead_scraping');
    }
  }

  private async scrapeLinkedIn(params: ScrapingParams, userId?: string): Promise<ScrapingResult> {
    // In a real implementation, this would use LinkedIn's API or a scraping service
    // For demo purposes, we'll return mock data
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate mock leads based on search parameters
    const mockLeads: ScrapedLead[] = Array.from({ length: 5 }, (_, i) => {
      const industries = ['Technology', 'Marketing', 'Finance', 'Healthcare', 'Education', 'Retail'];
      const companySizes = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];
      const titles = ['CEO', 'CTO', 'Marketing Director', 'Sales Manager', 'VP of Operations'];
      
      const industry = params.industry || industries[Math.floor(Math.random() * industries.length)];
      const companySize = params.companySize || companySizes[Math.floor(Math.random() * companySizes.length)];
      const title = params.jobTitle || titles[Math.floor(Math.random() * titles.length)];
      
      const firstName = ['John', 'Sarah', 'Michael', 'Emily', 'David'][Math.floor(Math.random() * 5)];
      const lastName = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'][Math.floor(Math.random() * 5)];
      const name = `${firstName} ${lastName}`;
      
      const company = `${industry} Solutions ${i + 1}`;
      const location = params.location || 'United States';
      
      return {
        id: `li-${Date.now()}-${i}`,
        name,
        title,
        company,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${company.toLowerCase().replace(/\s+/g, '')}.com`,
        location,
        profileUrl: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}-${Math.floor(Math.random() * 100000)}`,
        platform: 'linkedin',
        score: 70 + Math.floor(Math.random() * 30),
        industry,
        companySize: `${companySize} employees`,
        verified: Math.random() > 0.3,
        lastActive: ['1 day ago', '3 days ago', '1 week ago', '2 weeks ago'][Math.floor(Math.random() * 4)],
        connections: 500 + Math.floor(Math.random() * 1500),
        description: `${title} at ${company}. Experienced professional in the ${industry} industry.`,
        socialProfiles: {
          linkedin: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}-${Math.floor(Math.random() * 100000)}`,
        },
      };
    });

    return {
      leads: mockLeads,
      totalResults: mockLeads.length,
      source: 'linkedin',
      query: params.keywords,
      timestamp: new Date(),
    };
  }

  private async scrapeCompanyWebsites(params: ScrapingParams, userId?: string): Promise<ScrapingResult> {
    // In a real implementation, this would use a web scraping service or API
    // For demo purposes, we'll return mock data
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate mock leads based on search parameters
    const mockLeads: ScrapedLead[] = Array.from({ length: 3 }, (_, i) => {
      const industries = ['Technology', 'Marketing', 'Finance', 'Healthcare', 'Education', 'Retail'];
      const companySizes = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];
      
      const industry = params.industry || industries[Math.floor(Math.random() * industries.length)];
      const companySize = params.companySize || companySizes[Math.floor(Math.random() * companySizes.length)];
      
      const companyNames = ['Acme Corp', 'TechSolutions', 'Global Enterprises', 'Innovative Inc', 'Future Systems'];
      const company = companyNames[Math.floor(Math.random() * companyNames.length)];
      
      const contactTitles = ['Contact Us', 'About Us', 'Our Team'];
      const contactTitle = contactTitles[Math.floor(Math.random() * contactTitles.length)];
      
      return {
        id: `web-${Date.now()}-${i}`,
        name: 'Contact Form',
        title: contactTitle,
        company,
        email: `info@${company.toLowerCase().replace(/\s+/g, '')}.com`,
        location: params.location || 'United States',
        profileUrl: `https://${company.toLowerCase().replace(/\s+/g, '')}.com/contact`,
        platform: 'company-website',
        score: 60 + Math.floor(Math.random() * 30),
        industry,
        companySize: `${companySize} employees`,
        verified: Math.random() > 0.5,
        website: `https://${company.toLowerCase().replace(/\s+/g, '')}.com`,
        description: `Contact information found on ${company} website.`,
      };
    });

    return {
      leads: mockLeads,
      totalResults: mockLeads.length,
      source: 'company-website',
      query: params.keywords,
      timestamp: new Date(),
    };
  }

  // Convert scraped leads to CRM leads
  convertToCRMLeads(scrapedLeads: ScrapedLead[], userId: string): Partial<Lead>[] {
    return scrapedLeads.map(lead => ({
      name: lead.name,
      email: lead.email || '',
      phone: lead.phone || '',
      company: lead.company || '',
      value: '$0', // Default value, to be updated by user
      source: `Scraper (${lead.platform})`,
      status: 'new',
      tags: [lead.platform, lead.industry?.toLowerCase() || 'unknown'],
      ownerId: userId,
      assignedTo: userId,
      priority: 'medium',
      industry: lead.industry,
      website: lead.website,
      address: lead.location,
      socialProfiles: lead.socialProfiles || null,
      customFields: {
        scrapedFrom: lead.platform,
        originalUrl: lead.profileUrl,
        score: lead.score,
        lastScraped: new Date().toISOString(),
      },
      notes: lead.description,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  }
}

export const leadScraper = new LeadScraper();