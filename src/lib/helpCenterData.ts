import { APP_INFO } from './config';

export interface HelpArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  updatedAt: string;
  readTime: string;
  views: number;
}

export const helpArticles: HelpArticle[] = [
  {
    id: 'how-to-scrape-leads',
    title: 'How to scrape leads from Google Maps',
    excerpt: 'Learn how to use the Google Maps Scraper to find and collect business leads in your target area.',
    content: `
      <h2>Getting Started with Google Maps Lead Scraping</h2>
      <p>The Google Maps Scraper is a powerful tool that allows you to find and collect business leads directly from Google Maps. This guide will walk you through the process step by step.</p>
      
      <h3>Step 1: Navigate to the Google Maps Scraper</h3>
      <p>From your dashboard, click on "Google Maps Scraper" in the left sidebar menu. This will take you to the scraper interface.</p>
      
      <h3>Step 2: Enter Search Parameters</h3>
      <p>In the search form, you'll need to provide:</p>
      <ul>
        <li><strong>Business Type or Keyword:</strong> Enter what type of business you're looking for (e.g., "restaurant", "dentist", "lawyer")</li>
        <li><strong>Location:</strong> Specify the area you want to search (e.g., "New York, NY" or "10001")</li>
        <li><strong>Search Radius:</strong> Select how far from the location you want to search (default is 5km)</li>
      </ul>
      
      <h3>Step 3: Run the Search</h3>
      <p>Click the "Search Google Maps" button to start the search. The system will query Google Maps and return a list of businesses that match your criteria.</p>
      
      <h3>Step 4: Review and Select Leads</h3>
      <p>Once the search is complete, you'll see a list of businesses with their details:</p>
      <ul>
        <li>Business name</li>
        <li>Address</li>
        <li>Phone number (if available)</li>
        <li>Website (if available)</li>
        <li>Rating and number of reviews</li>
        <li>Business type</li>
      </ul>
      <p>You can select individual businesses by clicking the checkbox next to them, or select all using the "Select All" checkbox at the top.</p>
      
      <h3>Step 5: Save Leads to Your CRM</h3>
      <p>After selecting the businesses you want to save, click the "Save as Lead" button for individual businesses or "Save Selected" for multiple selections. These businesses will be added to your leads database.</p>
      
      <h3>Step 6: Access Your Saved Leads</h3>
      <p>You can view and manage your saved leads by navigating to the "Leads" section in the sidebar. All leads scraped from Google Maps will have the "google-maps" tag for easy filtering.</p>
      
      <h2>Tips for Effective Lead Scraping</h2>
      <ul>
        <li><strong>Be specific with keywords:</strong> Instead of just "restaurant", try "italian restaurant" for more targeted results</li>
        <li><strong>Combine with location qualifiers:</strong> "luxury hotels in downtown" will give better results than just "hotels"</li>
        <li><strong>Adjust the radius:</strong> For dense urban areas, a smaller radius works better; for rural areas, use a larger radius</li>
        <li><strong>Save searches:</strong> Your recent searches are saved for quick access later</li>
        <li><strong>Export results:</strong> You can export your search results as CSV for use in other systems</li>
      </ul>
      
      <h2>Understanding Rate Limits</h2>
      <p>To ensure fair usage of the system, there are limits to how many searches you can perform:</p>
      <ul>
        <li>Free plan: 20 searches per hour</li>
        <li>Pro plan: 100 searches per hour</li>
        <li>Agency plan: 500 searches per hour</li>
      </ul>
      <p>Your current usage and remaining searches are displayed at the top of the scraper page.</p>
      
      <h2>Troubleshooting</h2>
      <h3>No Results Found</h3>
      <p>If your search returns no results, try:</p>
      <ul>
        <li>Broadening your search terms</li>
        <li>Increasing the search radius</li>
        <li>Checking for typos in location or keyword</li>
        <li>Using a different location format (e.g., city name instead of zip code)</li>
      </ul>
      
      <h3>Missing Contact Information</h3>
      <p>Some businesses may not have complete contact information available on Google Maps. In these cases, you can:</p>
      <ul>
        <li>Click "View on Google Maps" to see if more information is available on their Google listing</li>
        <li>Visit the business website if available</li>
        <li>Manually update the lead information after saving it to your CRM</li>
      </ul>
    `,
    category: 'google-maps-scraper',
    tags: ['lead-generation', 'google-maps', 'tutorial', 'scraping'],
    author: 'Sarah Johnson',
    updatedAt: 'May 15, 2025',
    readTime: '8 min read',
    views: 1245
  },
  {
    id: 'convert-leads-to-clients',
    title: 'Converting leads to clients',
    excerpt: 'Learn the process of converting your leads into paying clients with our streamlined workflow.',
    content: `
      <h2>Converting Leads to Clients in ${APP_INFO.name}</h2>
      <p>Converting leads into clients is a crucial step in your sales process. ${APP_INFO.name} makes this transition smooth and efficient with our built-in conversion tools.</p>
      
      <h3>When to Convert a Lead</h3>
      <p>A lead should be converted to a client when:</p>
      <ul>
        <li>They've signed a contract or agreement</li>
        <li>They've made their first payment</li>
        <li>They've formally agreed to work with you</li>
        <li>You've started providing services to them</li>
      </ul>
      
      <h3>The Conversion Process</h3>
      <h4>Method 1: From the Lead Detail View</h4>
      <ol>
        <li>Navigate to the Leads section in the sidebar</li>
        <li>Click on the lead you want to convert to open their details</li>
        <li>Click the "Convert to Client" button in the top right corner</li>
        <li>Review the information that will be transferred to the client record</li>
        <li>Click "Convert" to complete the process</li>
      </ol>
      
      <h4>Method 2: From the Kanban Board</h4>
      <ol>
        <li>Navigate to the Leads section and select the "Kanban" view</li>
        <li>Find the lead card you want to convert</li>
        <li>Click the three dots (⋮) menu on the card</li>
        <li>Select "Convert to Client" from the dropdown menu</li>
        <li>Review and confirm the conversion</li>
      </ol>
      
      <h4>Method 3: Bulk Conversion</h4>
      <ol>
        <li>Navigate to the Leads section and select the "Table" or "List" view</li>
        <li>Select multiple leads by checking the boxes next to them</li>
        <li>Click the "Actions" dropdown and select "Convert to Clients"</li>
        <li>Review and confirm the bulk conversion</li>
      </ol>
      
      <h3>What Happens During Conversion</h3>
      <p>When you convert a lead to a client, the following occurs:</p>
      <ul>
        <li>A new client record is created with information from the lead</li>
        <li>The lead's status is changed to "Converted"</li>
        <li>The lead and client records are linked for reference</li>
        <li>Any notes, tags, and custom fields are transferred to the client record</li>
        <li>The lead's value becomes the client's initial revenue amount</li>
      </ul>
      
      <h3>After Conversion</h3>
      <p>Once a lead is converted to a client, you can:</p>
      <ul>
        <li>Access the client from the Clients section in the sidebar</li>
        <li>Create projects associated with the client</li>
        <li>Generate invoices and track payments</li>
        <li>Set up recurring services or retainers</li>
        <li>Track client communication and activity</li>
      </ul>
      
      <h3>Best Practices for Lead Conversion</h3>
      <ul>
        <li><strong>Complete lead information:</strong> Ensure all important lead details are filled in before conversion</li>
        <li><strong>Use the notes field:</strong> Document the conversion reason and any special terms</li>
        <li><strong>Set up a welcome workflow:</strong> Trigger an automated onboarding sequence when a lead is converted</li>
        <li><strong>Update revenue information:</strong> Make sure the client's revenue value reflects your agreement</li>
        <li><strong>Tag appropriately:</strong> Add relevant tags to the new client for better organization</li>
      </ul>
      
      <h3>Troubleshooting</h3>
      <h4>Can't Convert a Lead?</h4>
      <p>If you're unable to convert a lead, check the following:</p>
      <ul>
        <li>Ensure you have the necessary permissions (Admin, Closer, or Agent roles)</li>
        <li>Verify that the lead has an email address (required for client records)</li>
        <li>Check if the lead has already been converted</li>
        <li>Make sure you haven't reached your plan's client limit</li>
      </ul>
      
      <h4>Need to Undo a Conversion?</h4>
      <p>If you accidentally converted a lead:</p>
      <ol>
        <li>Go to the Clients section and find the newly created client</li>
        <li>Click the three dots (⋮) menu and select "Convert back to lead"</li>
        <li>Confirm the action when prompted</li>
      </ol>
      <p>Note: This will preserve all information and move it back to the Leads section.</p>
    `,
    category: 'lead-management',
    tags: ['conversion', 'clients', 'sales-process', 'workflow'],
    author: 'Michael Chen',
    updatedAt: 'May 10, 2025',
    readTime: '6 min read',
    views: 987
  },
  {
    id: 'ai-prompt-templates',
    title: 'Using AI prompt templates effectively',
    excerpt: 'Learn how to get the most out of the AI Assistant with effective prompt templates and strategies.',
    content: `
      <h2>Mastering AI Prompt Templates in ${APP_INFO.name}</h2>
      <p>The AI Assistant in ${APP_INFO.name} is powered by advanced language models that can help you create compelling content, analyze leads, and automate repetitive writing tasks. This guide will help you get the most out of the AI Assistant using effective prompts and templates.</p>
      
      <h3>Understanding AI Prompts</h3>
      <p>A prompt is the instruction you give to the AI. The quality of your prompt directly affects the quality of the AI's response. Good prompts are:</p>
      <ul>
        <li><strong>Clear and specific</strong> - Tell the AI exactly what you want</li>
        <li><strong>Contextual</strong> - Provide relevant background information</li>
        <li><strong>Structured</strong> - Organize your request logically</li>
        <li><strong>Detailed</strong> - Include parameters like tone, length, and format</li>
      </ul>
      
      <h3>Using Built-in Prompt Templates</h3>
      <p>${APP_INFO.name} comes with several pre-built prompt templates for common tasks:</p>
      
      <h4>1. Lead Summary Template</h4>
      <p>This template analyzes lead information and provides insights:</p>
      <pre>
Please analyze this lead information and provide a concise, insightful summary that includes:
1. Key points about the lead
2. Potential value and fit for our business
3. Recommended approach or next steps

Lead Information:
Name: [Lead Name]
Company: [Company]
Title: [Title]
Email: [Email]
Phone: [Phone]
Industry: [Industry]
Source: [Source]
Status: [Status]
Tags: [Tags]
Notes: [Notes]
      </pre>
      
      <h4>2. Cold Email Template</h4>
      <p>Generate personalized cold emails based on lead information:</p>
      <pre>
Write a personalized, compelling cold email to the following lead:

Lead Information:
Name: [Lead Name]
Company: [Company]
Title: [Title]
Industry: [Industry]
Source: [Source]
Tags: [Tags]
Notes: [Notes]

The email should:
1. Be personalized based on the lead's information
2. Be concise (150-200 words)
3. Include a clear value proposition
4. End with a specific, low-friction call to action
5. Have a professional but conversational tone
6. Include a subject line at the top

Format the email with "Subject:" at the top, followed by the email body.
      </pre>
      
      <h4>3. Proposal Outline Template</h4>
      <p>Create a structured proposal outline for a potential client:</p>
      <pre>
Create a detailed proposal outline for a [PROJECT_TYPE] project. Include sections for:

1. Project overview
2. Scope of work
3. Timeline
4. Deliverables
5. Pricing structure
6. Terms

The client is [CLIENT_NAME] in the [INDUSTRY] industry.
Their main goals are [GOALS].
Their budget is approximately [BUDGET].
      </pre>
      
      <h3>Creating Custom Prompt Templates</h3>
      <p>You can create your own custom templates for recurring tasks:</p>
      <ol>
        <li>Go to the AI Assistant section</li>
        <li>Click on "Settings" and then "Manage Templates"</li>
        <li>Click "Create New Template"</li>
        <li>Give your template a name and description</li>
        <li>Write your prompt template, using [PLACEHOLDERS] for variable information</li>
        <li>Save your template</li>
      </ol>
      
      <h3>Best Practices for AI Prompts</h3>
      
      <h4>Do:</h4>
      <ul>
        <li><strong>Be specific about format</strong> - Specify if you want bullet points, paragraphs, or a specific structure</li>
        <li><strong>Provide context</strong> - Include relevant background information</li>
        <li><strong>Specify tone</strong> - Indicate if you want formal, conversational, persuasive, etc.</li>
        <li><strong>Include examples</strong> - When possible, show the AI what good output looks like</li>
        <li><strong>Use step-by-step instructions</strong> - Break complex requests into steps</li>
      </ul>
      
      <h4>Don't:</h4>
      <ul>
        <li><strong>Be vague</strong> - "Write something good" won't get good results</li>
        <li><strong>Overload with irrelevant details</strong> - Focus on what matters for the task</li>
        <li><strong>Expect perfect results every time</strong> - Sometimes you'll need to refine your prompt</li>
        <li><strong>Forget ethical guidelines</strong> - The AI won't generate inappropriate content</li>
      </ul>
      
      <h3>Advanced Techniques</h3>
      
      <h4>Chain of Thought Prompting</h4>
      <p>For complex tasks, guide the AI through a step-by-step thinking process:</p>
      <pre>
I need to create a marketing strategy for a new product launch. Let's think through this step by step:

1. First, analyze the target audience for [PRODUCT]
2. Then, identify the key value propositions
3. Next, suggest the best marketing channels
4. Finally, outline a 30-day launch plan with specific actions
      </pre>
      
      <h4>Role-Based Prompting</h4>
      <p>Ask the AI to adopt a specific perspective:</p>
      <pre>
As an experienced sales director with 15+ years in the [INDUSTRY] industry, review this lead information and suggest the best approach for closing this deal:

[LEAD DETAILS]
      </pre>
      
      <h3>Troubleshooting</h3>
      <p>If you're not getting the results you want:</p>
      <ul>
        <li><strong>Refine your prompt</strong> - Add more specific instructions</li>
        <li><strong>Break it down</strong> - Split complex requests into multiple simpler prompts</li>
        <li><strong>Provide examples</strong> - Show the AI what good output looks like</li>
        <li><strong>Use the feedback feature</strong> - This helps improve the AI over time</li>
      </ul>
      
      <h3>Usage Limits</h3>
      <p>Be aware of your plan's AI usage limits:</p>
      <ul>
        <li>Free plan: 10 AI prompts per month</li>
        <li>Pro plan: Unlimited AI prompts</li>
        <li>Agency plan: Unlimited AI prompts with priority processing</li>
      </ul>
      <p>You can view your current usage in the Settings page under "Usage & Limits".</p>
    `,
    category: 'ai-assistant',
    tags: ['ai', 'templates', 'prompts', 'content-generation'],
    author: 'Emily Rodriguez',
    updatedAt: 'May 5, 2025',
    readTime: '10 min read',
    views: 856
  },
  {
    id: 'workflow-automation-guide',
    title: 'Setting up your first automated workflow',
    excerpt: 'Learn how to create and implement automated workflows to streamline your client processes.',
    content: `
      <h2>Getting Started with Workflow Automation in ${APP_INFO.name}</h2>
      <p>Workflow automation is a powerful feature that allows you to streamline repetitive tasks and processes. This guide will walk you through creating your first automated workflow.</p>
      
      <h3>What is a Workflow?</h3>
      <p>A workflow is a series of automated steps that are triggered by specific events or conditions. For example, you might create a workflow that:</p>
      <ul>
        <li>Sends a welcome email when a lead is converted to a client</li>
        <li>Creates tasks for your team when a new project starts</li>
        <li>Sends follow-up emails at specific intervals</li>
        <li>Generates and sends invoices on a schedule</li>
      </ul>
      
      <h3>Step 1: Access the Workflow Builder</h3>
      <p>Navigate to the Workflow Builder by clicking on "Workflow Builder" in the left sidebar menu. This will take you to the workflow dashboard.</p>
      
      <h3>Step 2: Create a New Workflow</h3>
      <p>Click the "Create Workflow" button in the top right corner. You'll be prompted to either start from scratch or use a template.</p>
      
      <h4>Using a Template (Recommended for Beginners)</h4>
      <p>${APP_INFO.name} offers several pre-built templates for common workflows:</p>
      <ul>
        <li><strong>Client Onboarding</strong> - A sequence for welcoming and setting up new clients</li>
        <li><strong>Lead Nurturing</strong> - A series of touchpoints to convert leads to clients</li>
        <li><strong>Project Kickoff</strong> - Tasks and communications to start a new project</li>
        <li><strong>Follow-up Sequence</strong> - Automated follow-ups for non-responsive leads</li>
      </ul>
      <p>Select a template that matches your needs to get started quickly.</p>
      
      <h4>Starting from Scratch</h4>
      <p>If you prefer to build a custom workflow:</p>
      <ol>
        <li>Click "Create from Scratch"</li>
        <li>Give your workflow a name and description</li>
        <li>Select the trigger event (what starts the workflow)</li>
        <li>Begin adding steps (see below)</li>
      </ol>
      
      <h3>Step 3: Configure Workflow Settings</h3>
      <p>Before adding steps, configure the basic settings:</p>
      <ul>
        <li><strong>Workflow Name</strong> - A descriptive name for your workflow</li>
        <li><strong>Description</strong> - Details about what the workflow does</li>
        <li><strong>Trigger</strong> - The event that starts the workflow (e.g., "Lead Created", "Client Converted")</li>
        <li><strong>Conditions</strong> - Optional filters to determine when the workflow should run (e.g., only for leads with a specific tag)</li>
      </ul>
      
      <h3>Step 4: Add Workflow Steps</h3>
      <p>Now it's time to add steps to your workflow. Each step represents an action that will be performed automatically.</p>
      
      <h4>Available Step Types:</h4>
      <ul>
        <li><strong>Email</strong> - Send an automated email</li>
        <li><strong>Task</strong> - Create a task for yourself or a team member</li>
        <li><strong>Form</strong> - Send a form to collect information</li>
        <li><strong>Delay</strong> - Wait for a specified period before proceeding</li>
        <li><strong>Condition</strong> - Create branching logic based on conditions</li>
        <li><strong>Approval</strong> - Require manual approval before continuing</li>
        <li><strong>Update Record</strong> - Modify lead or client information</li>
        <li><strong>Notification</strong> - Send an in-app notification</li>
      </ul>
      
      <p>To add a step:</p>
      <ol>
        <li>Click the "+" button in the workflow builder</li>
        <li>Select the type of step you want to add</li>
        <li>Configure the step's settings (e.g., email content, task details)</li>
        <li>Set the timing (immediately or after a delay)</li>
        <li>Add conditions if needed (e.g., only if the lead has a specific tag)</li>
      </ol>
      
      <h4>Example: Adding an Email Step</h4>
      <ol>
        <li>Click "+" and select "Email"</li>
        <li>Choose an email template or create a new one</li>
        <li>Customize the subject and content using variables (e.g., {{lead.name}})</li>
        <li>Set when to send (immediately or after X days/hours)</li>
        <li>Add conditions if needed (e.g., only if previous email was opened)</li>
      </ol>
      
      <h3>Step 5: Arrange and Connect Steps</h3>
      <p>Use drag and drop to arrange your steps in the desired order. For complex workflows, you can create branches using condition steps.</p>
      
      <h4>Creating Branches</h4>
      <p>Condition steps allow you to create different paths based on specific criteria:</p>
      <ol>
        <li>Add a "Condition" step</li>
        <li>Define the condition (e.g., "If lead.status equals 'interested'")</li>
        <li>Add steps to the "Yes" path (what happens if condition is true)</li>
        <li>Add steps to the "No" path (what happens if condition is false)</li>
      </ol>
      
      <h3>Step 6: Test Your Workflow</h3>
      <p>Before activating your workflow, it's important to test it:</p>
      <ol>
        <li>Click the "Test" button in the top right</li>
        <li>Select a test lead or client to run the workflow against</li>
        <li>Review the test results to ensure everything works as expected</li>
        <li>Make adjustments as needed</li>
      </ol>
      
      <h3>Step 7: Activate Your Workflow</h3>
      <p>Once you're satisfied with your workflow:</p>
      <ol>
        <li>Click the "Activate" toggle in the top right</li>
        <li>Confirm that you want to activate the workflow</li>
        <li>Choose whether to apply the workflow to existing records or only new ones</li>
      </ol>
      
      <h3>Monitoring and Managing Workflows</h3>
      <p>After activating your workflow, you can monitor its performance:</p>
      <ul>
        <li><strong>Dashboard</strong> - View workflow metrics (runs, completion rate, average time)</li>
        <li><strong>History</strong> - See a log of all workflow runs and their outcomes</li>
        <li><strong>Edit</strong> - Make changes to your workflow at any time</li>
        <li><strong>Pause/Resume</strong> - Temporarily stop a workflow without deleting it</li>
        <li><strong>Duplicate</strong> - Create a copy of a workflow to use as a starting point</li>
      </ul>
      
      <h3>Best Practices</h3>
      <ul>
        <li><strong>Start simple</strong> - Begin with basic workflows and add complexity as you get comfortable</li>
        <li><strong>Use descriptive names</strong> - Make it clear what each workflow does</li>
        <li><strong>Test thoroughly</strong> - Always test workflows before activating them</li>
        <li><strong>Monitor performance</strong> - Regularly check your workflow metrics</li>
        <li><strong>Update as needed</strong> - Refine workflows based on results and feedback</li>
        <li><strong>Document your workflows</strong> - Keep notes on what each workflow does and why</li>
      </ul>
      
      <h3>Troubleshooting</h3>
      <h4>Workflow Not Starting</h4>
      <p>If your workflow isn't triggering:</p>
      <ul>
        <li>Verify that the workflow is activated</li>
        <li>Check that the trigger event is occurring</li>
        <li>Review any conditions to ensure they're being met</li>
        <li>Check your plan limits (some plans have workflow limits)</li>
      </ul>
      
      <h4>Steps Not Executing</h4>
      <p>If specific steps aren't running:</p>
      <ul>
        <li>Check the step conditions</li>
        <li>Verify that any required fields are populated</li>
        <li>Check for errors in the workflow history</li>
        <li>Ensure you have the necessary permissions</li>
      </ul>
    `,
    category: 'workflow-automation',
    tags: ['automation', 'workflows', 'productivity', 'tutorial'],
    author: 'David Kim',
    updatedAt: 'April 28, 2025',
    readTime: '12 min read',
    views: 742
  },
  {
    id: 'getting-started-guide',
    title: 'Getting Started with Locafyr',
    excerpt: 'A comprehensive guide to help new users set up and start using Locafyr effectively.',
    content: `
      <h2>Welcome to ${APP_INFO.name}!</h2>
      <p>This guide will help you get started with ${APP_INFO.name} and show you how to make the most of our platform to find, manage, and convert leads into clients.</p>
      
      <h3>Step 1: Complete Your Profile</h3>
      <p>Before you start using ${APP_INFO.name}, it's important to complete your profile:</p>
      <ol>
        <li>Click on your profile icon in the top right corner</li>
        <li>Select "Settings" from the dropdown menu</li>
        <li>Fill in your personal information, company details, and upload a profile picture</li>
        <li>Save your changes</li>
      </ol>
      <p>Having a complete profile helps personalize your experience and improves the quality of AI-generated content.</p>
      
      <h3>Step 2: Explore the Dashboard</h3>
      <p>The dashboard provides an overview of your activity and key metrics:</p>
      <ul>
        <li><strong>Metrics Cards:</strong> Shows your total leads, active clients, revenue, and conversion rate</li>
        <li><strong>Recent Activity:</strong> Displays your latest actions and updates</li>
        <li><strong>Quick Actions:</strong> Provides shortcuts to common tasks</li>
      </ul>
      <p>Take a moment to familiarize yourself with the dashboard layout and available information.</p>
      
      <h3>Step 3: Find Your First Leads</h3>
      <p>There are several ways to add leads to your account:</p>
      
      <h4>Using the Google Maps Scraper</h4>
      <ol>
        <li>Click on "Google Maps Scraper" in the sidebar</li>
        <li>Enter a business type (e.g., "dentist") and location (e.g., "Chicago, IL")</li>
        <li>Click "Search Google Maps"</li>
        <li>Select the businesses you want to save</li>
        <li>Click "Save as Lead" or "Save Selected"</li>
      </ol>
      
      <h4>Manual Lead Entry</h4>
      <ol>
        <li>Click on "Leads" in the sidebar</li>
        <li>Click the "Add Lead" button</li>
        <li>Fill in the lead information form</li>
        <li>Click "Add Lead" to save</li>
      </ol>
      
      <h4>Importing Leads</h4>
      <ol>
        <li>Click on "Leads" in the sidebar</li>
        <li>Click the "Import" button</li>
        <li>Download the template CSV file</li>
        <li>Fill in your leads information</li>
        <li>Upload the completed CSV file</li>
        <li>Map the columns and import</li>
      </ol>
      
      <h3>Step 4: Organize Your Leads</h3>
      <p>Keeping your leads organized will help you manage them effectively:</p>
      <ul>
        <li><strong>Tags:</strong> Add tags to categorize leads (e.g., "hot", "cold", "follow-up")</li>
        <li><strong>Status:</strong> Update lead status as they progress (new, contacted, proposal, converted, lost)</li>
        <li><strong>Notes:</strong> Add detailed notes about your interactions</li>
        <li><strong>Custom Fields:</strong> Create custom fields for industry-specific information</li>
      </ul>
      
      <h3>Step 5: Use the AI Assistant</h3>
      <p>The AI Assistant can help you generate content and analyze leads:</p>
      <ol>
        <li>Click on "AI Assistant" in the sidebar</li>
        <li>Select a quick prompt template or write your own prompt</li>
        <li>Provide the necessary context and information</li>
        <li>Click "Generate" to create content</li>
      </ol>
      <p>The AI Assistant can help with emails, proposals, follow-ups, and lead analysis.</p>
      
      <h3>Step 6: Set Up Your First Workflow</h3>
      <p>Automate repetitive tasks with workflows:</p>
      <ol>
        <li>Click on "Workflow Builder" in the sidebar</li>
        <li>Click "Create Workflow" or select a template</li>
        <li>Configure the workflow trigger and steps</li>
        <li>Test the workflow</li>
        <li>Activate it when ready</li>
      </ol>
      <p>Start with a simple workflow, such as a welcome email sequence for new leads.</p>
      
      <h3>Step 7: Convert Leads to Clients</h3>
      <p>When a lead becomes a client:</p>
      <ol>
        <li>Open the lead's details</li>
        <li>Click the "Convert to Client" button</li>
        <li>Review and confirm the information</li>
        <li>The lead will be moved to your Clients section</li>
      </ol>
      
      <h3>Step 8: Explore Advanced Features</h3>
      <p>As you become more comfortable with ${APP_INFO.name}, explore these advanced features:</p>
      <ul>
        <li><strong>Email Campaigns:</strong> Create and send targeted email campaigns</li>
        <li><strong>Form Builder:</strong> Create custom forms for lead capture</li>
        <li><strong>Reports:</strong> Generate detailed reports on your sales pipeline</li>
        <li><strong>Team Collaboration:</strong> Invite team members and assign leads</li>
        <li><strong>Integrations:</strong> Connect with other tools you use</li>
      </ul>
      
      <h3>Getting Help</h3>
      <p>If you need assistance at any point:</p>
      <ul>
        <li>Visit our <a href="/help">Help Center</a> for guides and tutorials</li>
        <li>Use the chat support by clicking the chat icon in the bottom right</li>
        <li>Email our support team at support@${APP_INFO.name.toLowerCase()}.com</li>
        <li>Check out our <a href="/blog">blog</a> for tips and best practices</li>
      </ul>
      
      <h3>Next Steps</h3>
      <p>Now that you're set up, we recommend:</p>
      <ol>
        <li>Finding at least 10 leads to start building your pipeline</li>
        <li>Setting up one automated workflow</li>
        <li>Exploring the AI Assistant capabilities</li>
        <li>Customizing your lead management views</li>
      </ol>
      
      <p>Welcome aboard! We're excited to help you grow your business with ${APP_INFO.name}.</p>
    `,
    category: 'getting-started',
    tags: ['onboarding', 'tutorial', 'basics', 'setup'],
    author: 'Alex Martinez',
    updatedAt: 'May 1, 2025',
    readTime: '15 min read',
    views: 2145
  },
  {
    id: 'account-settings-guide',
    title: 'Managing Your Account Settings',
    excerpt: 'Learn how to configure your account settings, manage your profile, and set up notifications.',
    content: `
      <h2>Managing Your Account Settings in ${APP_INFO.name}</h2>
      <p>This guide will walk you through the various account settings available in ${APP_INFO.name} and how to configure them to suit your needs.</p>
      
      <h3>Accessing Your Account Settings</h3>
      <p>There are two ways to access your account settings:</p>
      <ol>
        <li>Click on your profile picture in the top right corner, then select "Settings" from the dropdown menu</li>
        <li>Click on the "Settings" option in the left sidebar navigation</li>
      </ol>
      
      <h3>Profile Settings</h3>
      <p>The Profile tab allows you to manage your personal information:</p>
      <ul>
        <li><strong>Profile Picture:</strong> Upload or change your profile image</li>
        <li><strong>Display Name:</strong> Update your name as it appears throughout the platform</li>
        <li><strong>Email Address:</strong> View your account email (contact support to change)</li>
        <li><strong>Company:</strong> Enter or update your company name</li>
        <li><strong>Phone:</strong> Add or update your contact number</li>
        <li><strong>Timezone:</strong> Set your local timezone for accurate scheduling</li>
        <li><strong>Language:</strong> Choose your preferred language for the interface</li>
      </ul>
      
      <h3>Notification Preferences</h3>
      <p>Control how and when you receive notifications:</p>
      <ul>
        <li><strong>Email Notifications:</strong> Toggle email alerts for various events</li>
        <li><strong>Push Notifications:</strong> Enable or disable browser notifications</li>
        <li><strong>SMS Notifications:</strong> Set up text message alerts for critical updates</li>
        <li><strong>Weekly Summary:</strong> Receive a weekly digest of your activity</li>
        <li><strong>Marketing Communications:</strong> Opt in or out of product updates and tips</li>
        <li><strong>Security Alerts:</strong> Control notifications about account security</li>
      </ul>
      
      <h3>Security Settings</h3>
      <p>Manage your account security:</p>
      <ul>
        <li><strong>Password:</strong> Change your account password</li>
        <li><strong>Two-Factor Authentication:</strong> Enable 2FA for additional security</li>
        <li><strong>Login Sessions:</strong> View and manage active login sessions</li>
        <li><strong>API Keys:</strong> Generate and manage API keys for integrations</li>
      </ul>
      
      <h4>Setting Up Two-Factor Authentication</h4>
      <ol>
        <li>Go to the Security tab in Settings</li>
        <li>Click "Enable 2FA" under Two-Factor Authentication</li>
        <li>Choose your preferred method (Authenticator app or SMS)</li>
        <li>Follow the on-screen instructions to complete setup</li>
        <li>Save your backup codes in a secure location</li>
      </ol>
      
      <h3>Billing & Subscription</h3>
      <p>Manage your subscription and billing information:</p>
      <ul>
        <li><strong>Current Plan:</strong> View your current subscription plan</li>
        <li><strong>Payment Method:</strong> Add or update your payment information</li>
        <li><strong>Billing History:</strong> View past invoices and payment history</li>
        <li><strong>Usage & Limits:</strong> Monitor your feature usage against plan limits</li>
        <li><strong>Upgrade/Downgrade:</strong> Change your subscription plan</li>
        <li><strong>Billing Information:</strong> Update company name, address, and tax information</li>
      </ul>
      
      <h3>Integrations</h3>
      <p>Connect ${APP_INFO.name} with other services:</p>
      <ul>
        <li><strong>Connected Services:</strong> View and manage third-party integrations</li>
        <li><strong>API Keys:</strong> Generate and manage API keys for custom integrations</li>
        <li><strong>Webhooks:</strong> Set up webhooks to connect with other systems</li>
      </ul>
      
      <h4>Connecting a New Service</h4>
      <ol>
        <li>Go to the Integrations tab in Settings</li>
        <li>Find the service you want to connect</li>
        <li>Click the "Connect" button</li>
        <li>Follow the authentication process for that service</li>
        <li>Configure any additional settings</li>
      </ol>
      
      <h3>Team Settings</h3>
      <p>Manage team members and permissions (available on Agency plan):</p>
      <ul>
        <li><strong>Team Members:</strong> Invite, remove, or manage team members</li>
        <li><strong>Roles:</strong> Assign roles (Admin, Closer, Agent, Setter)</li>
        <li><strong>Permissions:</strong> Customize access levels for team members</li>
        <li><strong>Teams:</strong> Create and manage teams for larger organizations</li>
      </ul>
      
      <h4>Inviting a Team Member</h4>
      <ol>
        <li>Go to the Team tab in Settings</li>
        <li>Click "Invite Team Member"</li>
        <li>Enter their email address</li>
        <li>Select their role</li>
        <li>Customize their permissions if needed</li>
        <li>Click "Send Invitation"</li>
      </ol>
      
      <h3>Customization</h3>
      <p>Personalize your ${APP_INFO.name} experience:</p>
      <ul>
        <li><strong>Theme:</strong> Choose between light and dark mode</li>
        <li><strong>Dashboard Layout:</strong> Customize your dashboard widgets</li>
        <li><strong>Custom Fields:</strong> Create custom fields for leads and clients</li>
        <li><strong>Tags:</strong> Manage your tag library</li>
        <li><strong>Lead Statuses:</strong> Customize lead pipeline stages</li>
      </ul>
      
      <h3>Data Management</h3>
      <p>Manage your data:</p>
      <ul>
        <li><strong>Import:</strong> Import leads, clients, or other data</li>
        <li><strong>Export:</strong> Export your data for backup or migration</li>
        <li><strong>Data Cleanup:</strong> Tools to clean and organize your data</li>
        <li><strong>Backup:</strong> Configure automatic backups</li>
      </ul>
      
      <h3>Account Closure</h3>
      <p>If you need to close your account:</p>
      <ol>
        <li>Go to the "Danger Zone" tab in Settings</li>
        <li>Click "Export Account Data" to download all your data first</li>
        <li>Click "Delete Account"</li>
        <li>Follow the confirmation steps</li>
      </ol>
      <p>Note: Account deletion is permanent and cannot be undone.</p>
      
      <h3>Troubleshooting Common Issues</h3>
      
      <h4>Can't Update Email Address</h4>
      <p>For security reasons, email address changes require verification. Contact support to change your email address.</p>
      
      <h4>Two-Factor Authentication Issues</h4>
      <p>If you're having trouble with 2FA:</p>
      <ul>
        <li>Ensure your device's time is correctly synchronized</li>
        <li>Use your backup codes if you can't access your authentication app</li>
        <li>Contact support if you've lost access to both your authentication method and backup codes</li>
      </ul>
      
      <h4>Billing Issues</h4>
      <p>For payment or billing problems:</p>
      <ul>
        <li>Verify your payment method is current and has sufficient funds</li>
        <li>Check for any verification emails from your payment provider</li>
        <li>Contact support for assistance with failed payments or billing questions</li>
      </ul>
    `,
    category: 'account-billing',
    tags: ['account', 'settings', 'profile', 'security'],
    author: 'Lisa Thompson',
    updatedAt: 'April 20, 2025',
    readTime: '9 min read',
    views: 632
  }
];

// Categories for the help center
export const helpCategories = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Learn the basics and set up your account',
    icon: 'Book',
    color: 'bg-blue-100 text-blue-800',
  },
  {
    id: 'google-maps-scraper',
    title: 'Google Maps Scraper',
    description: 'Find and collect leads from Google Maps',
    icon: 'MapPin',
    color: 'bg-green-100 text-green-800',
  },
  {
    id: 'lead-management',
    title: 'Lead Management',
    description: 'Organize, track, and convert your leads',
    icon: 'Users',
    color: 'bg-purple-100 text-purple-800',
  },
  {
    id: 'ai-assistant',
    title: 'AI Assistant',
    description: 'Generate content and analyze leads with AI',
    icon: 'Brain',
    color: 'bg-orange-100 text-orange-800',
  },
  {
    id: 'workflow-automation',
    title: 'Workflow Automation',
    description: 'Create automated processes and workflows',
    icon: 'Workflow',
    color: 'bg-indigo-100 text-indigo-800',
  },
  {
    id: 'account-billing',
    title: 'Account & Billing',
    description: 'Manage your account, subscription, and billing',
    icon: 'CreditCard',
    color: 'bg-red-100 text-red-800',
  },
];

// FAQs for the help center
export const faqs = [
  {
    question: 'How do I get started with Locafyr?',
    answer: 'After signing up, you can start by exploring the Google Maps Scraper to find leads in your target area. Simply enter keywords and location, then save the results to your leads database. From there, you can manage and engage with your leads using our tools.',
    category: 'getting-started'
  },
  {
    question: 'Is there a limit to how many leads I can scrape?',
    answer: 'Yes, the number of leads you can scrape depends on your subscription plan. Free users can scrape up to 20 leads per month, while paid plans offer higher limits. You can view your current usage and limits in the Settings page.',
    category: 'google-maps-scraper'
  },
  {
    question: 'How does the AI Assistant work?',
    answer: 'Our AI Assistant uses advanced language models to help you generate content like emails, proposals, and follow-ups. Simply provide some basic information about your lead or project, and the AI will create personalized, professional content that you can use or modify.',
    category: 'ai-assistant'
  },
  {
    question: 'Can I export my leads to other systems?',
    answer: 'Yes, you can export your leads in CSV format, which can be imported into most CRM systems. Go to the Leads page, select the leads you want to export, and click the Export button.',
    category: 'lead-management'
  },
  {
    question: 'How do I set up automated workflows?',
    answer: 'Navigate to the Workflow Builder page, where you can create custom workflows or use our templates. Drag and drop different steps like emails, tasks, and approvals to create your workflow, then activate it to start automating your processes.',
    category: 'workflow-automation'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, American Express) and PayPal. For annual plans, we can also accommodate bank transfers or invoicing for enterprise customers.',
    category: 'account-billing'
  },
  {
    question: 'How do I convert a lead to a client?',
    answer: 'To convert a lead to a client, open the lead details, then click the "Convert to Client" button in the top right corner. Review the information and confirm the conversion. The lead will be moved to your Clients section with all their information intact.',
    category: 'lead-management'
  },
  {
    question: 'Can I customize the lead scraping parameters?',
    answer: 'Yes, you can customize your search by business type, location, and radius. For more targeted results, use specific keywords rather than general terms. You can also filter results by rating, business status, and other criteria before saving them as leads.',
    category: 'google-maps-scraper'
  },
  {
    question: 'How do I invite team members?',
    answer: 'Team collaboration is available on the Agency plan. To invite team members, go to Settings > Team, click "Invite Team Member," enter their email address, assign a role, and send the invitation. They\'ll receive an email with instructions to join your account.',
    category: 'account-billing'
  },
  {
    question: 'What\'s the difference between the various subscription plans?',
    answer: 'We offer three plans: Free (basic features, limited usage), Pro (advanced features, higher limits), and Agency (team collaboration, white-labeling, highest limits). You can compare plans in detail on our Pricing page or in the Billing section of Settings.',
    category: 'account-billing'
  },
  {
    question: 'How secure is my data?',
    answer: 'We take security seriously. All data is encrypted in transit and at rest, we use secure cloud infrastructure, implement strict access controls, and regularly audit our systems. We\'re compliant with GDPR and other privacy regulations. For more details, see our Security page.',
    category: 'account-billing'
  },
  {
    question: 'Can I use my own email to send outreach campaigns?',
    answer: 'Yes, you can connect your email account to send outreach campaigns from your own email address. This improves deliverability and maintains your brand identity. Go to Settings > Integrations to connect your email account.',
    category: 'lead-management'
  }
];

// Get articles by category
export const getArticlesByCategory = (categoryId: string) => {
  return helpArticles.filter(article => article.category === categoryId);
};

// Get popular articles
export const getPopularArticles = (limit: number = 4) => {
  return [...helpArticles].sort((a, b) => b.views - a.views).slice(0, limit);
};

// Get recent articles
export const getRecentArticles = (limit: number = 4) => {
  return [...helpArticles].sort((a, b) => {
    const dateA = new Date(a.updatedAt);
    const dateB = new Date(b.updatedAt);
    return dateB.getTime() - dateA.getTime();
  }).slice(0, limit);
};

// Get FAQs by category
export const getFaqsByCategory = (categoryId: string) => {
  return faqs.filter(faq => faq.category === categoryId);
};