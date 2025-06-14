import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { analytics, AnalyticsEvents } from '@/lib/analytics';
import { encrypt, decrypt } from '@/lib/encryption';
import { toast } from 'sonner';
import { getCurrentUserId } from './firestore';

// Gmail API scopes needed for sending emails
const SCOPES = ['https://www.googleapis.com/auth/gmail.send', 'https://www.googleapis.com/auth/gmail.readonly'];

// Gmail API client configuration
interface GmailConfig {
  apiKey: string;
  clientId: string;
  discoveryDocs: string[];
  redirectUri: string;
}

const GMAIL_CONFIG: GmailConfig = {
  apiKey: import.meta.env.VITE_GOOGLE_API_KEY || '',
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest'],
  redirectUri: window.location.origin
};

// Gmail token storage interface
interface GmailToken {
  access_token: string;
  expires_at: number;
  scope: string;
  token_type: string;
  id_token?: string;
}

// Gmail service class
export class GmailService {
  private static instance: GmailService;
  private isInitialized = false;
  private isAuthorized = false;
  private tokenClient: any = null;
  private token: GmailToken | null = null;
  
  static getInstance(): GmailService {
    if (!GmailService.instance) {
      GmailService.instance = new GmailService();
    }
    return GmailService.instance;
  }
  
  /**
   * UTF-8 safe base64 encoding
   */
  private utf8ToBase64(str: string): string {
    try {
      // Convert string to UTF-8 bytes, then to base64
      const utf8Bytes = new TextEncoder().encode(str);
      let binary = '';
      utf8Bytes.forEach(byte => {
        binary += String.fromCharCode(byte);
      });
      return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    } catch (error) {
      console.error('Error encoding to base64:', error);
      // Fallback: try to encode without special characters
      const cleanStr = str.replace(/[^\x00-\xFF]/g, '?'); // Replace non-Latin1 chars with ?
      return btoa(cleanStr).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }
  }
  
  /**
   * Check if Gmail configuration is valid
   */
  private isConfigValid(): boolean {
    const hasApiKey = !!GMAIL_CONFIG.apiKey;
    const hasClientId = !!GMAIL_CONFIG.clientId;
    
    // Check for placeholder values
    const isApiKeyPlaceholder = GMAIL_CONFIG.apiKey === 'your_google_api_key' || 
                               GMAIL_CONFIG.apiKey === 'your_api_key' ||
                               GMAIL_CONFIG.apiKey.startsWith('your_');
    
    const isClientIdPlaceholder = GMAIL_CONFIG.clientId === 'your_google_client_id' ||
                                 GMAIL_CONFIG.clientId === 'your_client_id' ||
                                 GMAIL_CONFIG.clientId.startsWith('your_');
    
    return hasApiKey && hasClientId && !isApiKeyPlaceholder && !isClientIdPlaceholder;
  }
  
  /**
   * Initialize the Gmail API client
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;
    
    // Check if configuration is valid
    if (!this.isConfigValid()) {
      const hasApiKey = !!GMAIL_CONFIG.apiKey;
      const hasClientId = !!GMAIL_CONFIG.clientId;
      const isApiKeyPlaceholder = GMAIL_CONFIG.apiKey === 'your_google_api_key' || 
                                 GMAIL_CONFIG.apiKey === 'your_api_key' ||
                                 GMAIL_CONFIG.apiKey.startsWith('your_');
      const isClientIdPlaceholder = GMAIL_CONFIG.clientId === 'your_google_client_id' ||
                                   GMAIL_CONFIG.clientId === 'your_client_id' ||
                                   GMAIL_CONFIG.clientId.startsWith('your_');
      
      console.warn('Gmail API configuration is incomplete or contains placeholder values:', {
        hasApiKey,
        hasClientId,
        isApiKeyPlaceholder,
        isClientIdPlaceholder,
      });
      
      let errorMessage = 'Gmail API configuration is incomplete. ';
      
      if (!hasApiKey || isApiKeyPlaceholder) {
        errorMessage += 'Please set a valid VITE_GOOGLE_API_KEY in your environment variables. ';
      }
      
      if (!hasClientId || isClientIdPlaceholder) {
        errorMessage += 'Please set a valid VITE_GOOGLE_CLIENT_ID in your environment variables. ';
      }
      
      errorMessage += 'You can get these from the Google Cloud Console at https://console.cloud.google.com/apis/credentials';
      
      throw new Error(errorMessage);
    }
    
    try {
      // Load the Google API client library
      await this.loadGapiClient();
      
      // Initialize the tokenClient
      await this.initTokenClient();
      
      // Load token from storage
      await this.loadToken();
      
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Error initializing Gmail API:', error);
      throw error;
    }
  }
  
  /**
   * Load the Google API client library
   */
  private async loadGapiClient(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if gapi is already loaded
      if (window.gapi && window.gapi.client) {
        resolve();
        return;
      }
      
      // Load the Google API client library
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        window.gapi.load('client', async () => {
          try {
            // Initialize with just the API key first
            await window.gapi.client.init({
              apiKey: GMAIL_CONFIG.apiKey,
            });
            
            // Try to load the Gmail API directly instead of using discovery docs
            try {
              await window.gapi.client.load('gmail', 'v1');
              resolve();
            } catch (discoveryError: any) {
              console.warn('Failed to load Gmail API via discovery, trying alternative method:', discoveryError);
              
              // Alternative: Initialize without discovery docs and load Gmail API manually
              try {
                await window.gapi.client.init({
                  apiKey: GMAIL_CONFIG.apiKey,
                });
                
                // Manually load the Gmail API
                await new Promise<void>((resolveLoad, rejectLoad) => {
                  window.gapi.load('client:auth2', () => {
                    window.gapi.client.load('gmail', 'v1', () => {
                      resolveLoad();
                    });
                  });
                });
                
                resolve();
              } catch (alternativeError: any) {
                console.error('Alternative Gmail API loading failed:', alternativeError);
                this.handleGapiError(alternativeError, reject);
              }
            }
          } catch (error: any) {
            console.error('Gmail API client initialization error:', error);
            this.handleGapiError(error, reject);
          }
        });
      };
      
      script.onerror = (error) => {
        reject(new Error('Failed to load Google API client library. Please check your internet connection.'));
      };
      
      document.body.appendChild(script);
    });
  }
  
  /**
   * Handle GAPI errors with detailed error messages
   */
  private handleGapiError(error: any, reject: (reason?: any) => void): void {
    // Safely extract error information
    let errorMessage = 'Failed to initialize Gmail API';
    let errorCode = null;
    
    if (error && typeof error === 'object') {
      // Handle gapi client error format
      if (error.result && error.result.error) {
        errorCode = error.result.error.code;
        errorMessage = error.result.error.message || errorMessage;
      } else if (error.error && typeof error.error === 'object') {
        errorCode = error.error.code;
        errorMessage = error.error.message || errorMessage;
      } else if (error.message && typeof error.message === 'string') {
        errorMessage = error.message;
      }
      
      // Handle status codes
      if (error.status) {
        errorCode = error.status;
      }
    }
    
    // Handle specific Gmail API errors with more detailed messages
    if (errorCode === 403) {
      if (errorMessage.toLowerCase().includes('blocked') || 
          errorMessage.toLowerCase().includes('permission_denied') ||
          errorMessage.toLowerCase().includes('api_key_service_blocked')) {
        const specificError = 'Gmail API access is blocked. This usually means:\n\n' +
          '1. The Gmail API is not enabled in your Google Cloud Project\n' +
          '2. Your API key does not have permission to access the Gmail API\n' +
          '3. Your API key has restrictions that block Gmail API access\n\n' +
          'Please check your Google Cloud Console:\n' +
          '• Enable Gmail API: https://console.cloud.google.com/apis/library/gmail.googleapis.com\n' +
          '• Check API key restrictions: https://console.cloud.google.com/apis/credentials\n' +
          '• Ensure your API key allows "Gmail API" access';
        console.error('Gmail API Permission Error:', specificError);
        reject(new Error(specificError));
      } else {
        const specificError = 'Access denied to Gmail API. Please check:\n\n' +
          '1. Your API key permissions in Google Cloud Console\n' +
          '2. Ensure the Gmail API is enabled for your project\n' +
          '3. Check that your API key is not restricted from accessing Gmail API\n' +
          '4. Verify your API key belongs to the same project where Gmail API is enabled';
        console.error('Gmail API Access Error:', specificError);
        reject(new Error(specificError));
      }
    } else if (errorCode === 400 || (errorMessage && errorMessage.toLowerCase().includes('api key'))) {
      const specificError = 'Invalid Google API key. Please check:\n\n' +
        '1. Your VITE_GOOGLE_API_KEY is correctly set in .env file\n' +
        '2. The API key is valid and not expired\n' +
        '3. The API key belongs to a project with Gmail API enabled\n' +
        '4. There are no extra spaces or characters in the API key\n\n' +
        'Get a valid API key from: https://console.cloud.google.com/apis/credentials';
      console.error('Gmail API Key Error:', specificError);
      reject(new Error(specificError));
    } else if (errorCode === 404) {
      const specificError = 'Gmail API endpoint not found. This may indicate:\n\n' +
        '1. The Gmail API is not enabled in your Google Cloud Project\n' +
        '2. Your API configuration is incorrect\n' +
        '3. Network connectivity issues\n\n' +
        'Please verify Gmail API is enabled: https://console.cloud.google.com/apis/library/gmail.googleapis.com';
      console.error('Gmail API Endpoint Error:', specificError);
      reject(new Error(specificError));
    } else {
      reject(new Error(errorMessage));
    }
  }
  
  /**
   * Initialize the token client for authentication
   */
  private async initTokenClient(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if gsi is already loaded
      if (window.google && window.google.accounts && window.google.accounts.oauth2) {
        this.setupTokenClient();
        resolve();
        return;
      }
      
      // Load the Google Identity Services library
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        this.setupTokenClient();
        resolve();
      };
      
      script.onerror = (error) => {
        reject(new Error('Failed to load Google Identity Services library. Please check your internet connection.'));
      };
      
      document.body.appendChild(script);
    });
  }
  
  /**
   * Set up the token client for authentication
   */
  private setupTokenClient(): void {
    this.tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: GMAIL_CONFIG.clientId,
      scope: SCOPES.join(' '),
      redirect_uri: GMAIL_CONFIG.redirectUri,
      callback: (response: any) => {
        if (response.error) {
          this.isAuthorized = false;
          console.error('Error during authentication:', response);
          
          // Handle specific authentication errors with better user guidance
          if (response.error === 'popup_blocked_by_browser') {
            toast.error('Popup blocked by browser. Please allow popups for this site in your browser settings and try again.');
          } else if (response.error === 'access_denied') {
            toast.error('Access denied. Gmail integration requires permission to send emails on your behalf.');
          } else if (response.error === 'popup_closed_by_user') {
            toast.error('Authentication cancelled. Please try again to connect Gmail.');
          } else if (response.error === 'redirect_uri_mismatch') {
            toast.error('Authentication failed: Redirect URI mismatch. Please check your Google Cloud Console configuration.');
            console.error('Redirect URI mismatch. Current URI:', GMAIL_CONFIG.redirectUri);
          } else {
            toast.error(`Gmail authentication failed: ${response.error}. Please try again.`);
          }
        } else {
          this.isAuthorized = true;
          
          // Create token object, only including id_token if it's defined
          const tokenData: GmailToken = {
            access_token: response.access_token,
            expires_at: Date.now() + (response.expires_in * 1000),
            scope: response.scope,
            token_type: response.token_type,
          };
          
          // Only add id_token if it's defined (not undefined)
          if (response.id_token !== undefined) {
            tokenData.id_token = response.id_token;
          }
          
          this.token = tokenData;
          
          // Save token to storage
          this.saveToken();
          toast.success('Gmail connected successfully!');
        }
      },
    });
  }
  
  /**
   * Save token to Firestore
   */
  private async saveToken(): Promise<void> {
    if (!this.token) return;
    
    const userId = getCurrentUserId();
    if (!userId) return;
    
    try {
      const tokenRef = doc(db, 'user_api_keys', userId);
      const docSnap = await getDoc(tokenRef);
      
      if (docSnap.exists()) {
        // Update existing document
        await updateDoc(tokenRef, {
          gmailToken: this.token,
          updatedAt: serverTimestamp(),
        });
      } else {
        // Create new document
        await setDoc(tokenRef, {
          uid: userId,
          gmailToken: this.token,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('Error saving Gmail token:', error);
    }
  }
  
  /**
   * Load token from Firestore
   */
  private async loadToken(): Promise<void> {
    const userId = getCurrentUserId();
    if (!userId) return;
    
    try {
      const tokenRef = doc(db, 'user_api_keys', userId);
      const docSnap = await getDoc(tokenRef);
      
      if (docSnap.exists() && docSnap.data().gmailToken) {
        this.token = docSnap.data().gmailToken;
        
        // Check if token is expired
        if (this.token && this.token.expires_at < Date.now()) {
          this.token = null;
          this.isAuthorized = false;
        } else {
          this.isAuthorized = true;
        }
      }
    } catch (error) {
      console.error('Error loading Gmail token:', error);
    }
  }
  
  /**
   * Check if the user is authorized
   */
  isUserAuthorized(): boolean {
    return this.isAuthorized && !!this.token && this.token.expires_at > Date.now();
  }
  
  /**
   * Check Gmail API status with improved error handling
   */
  async checkGmailStatus(): Promise<{ available: boolean; error?: string; errorType?: string }> {
    if (!this.isConfigValid()) {
      const hasApiKey = !!GMAIL_CONFIG.apiKey;
      const hasClientId = !!GMAIL_CONFIG.clientId;
      const isApiKeyPlaceholder = GMAIL_CONFIG.apiKey === 'your_google_api_key' || 
                                 GMAIL_CONFIG.apiKey === 'your_api_key' ||
                                 GMAIL_CONFIG.apiKey.startsWith('your_');
      const isClientIdPlaceholder = GMAIL_CONFIG.clientId === 'your_google_client_id' ||
                                   GMAIL_CONFIG.clientId === 'your_client_id' ||
                                   GMAIL_CONFIG.clientId.startsWith('your_');
      
      let errorMessage = 'Gmail integration is not configured. ';
      
      if (!hasApiKey) {
        errorMessage += 'Missing VITE_GOOGLE_API_KEY environment variable. ';
      } else if (isApiKeyPlaceholder) {
        errorMessage += 'VITE_GOOGLE_API_KEY contains a placeholder value. ';
      }
      
      if (!hasClientId) {
        errorMessage += 'Missing VITE_GOOGLE_CLIENT_ID environment variable. ';
      } else if (isClientIdPlaceholder) {
        errorMessage += 'VITE_GOOGLE_CLIENT_ID contains a placeholder value. ';
      }
      
      errorMessage += 'Please set up your Google API credentials in your environment variables.';
      
      return {
        available: false,
        error: errorMessage,
        errorType: 'configuration'
      };
    }
    
    try {
      // Check Gmail API status first
      const status = await this.checkGmailStatus();
      
      if (!status.available) {
        setStatusError(status.error || 'Gmail API is not available');
        setErrorType(status.errorType || 'unknown');
        toast.error(status.error || 'Gmail API is not available');
        return;
      }
      
      // Initialize Gmail service
      await this.initialize();
      
      // Authorize Gmail
      const authorized = await this.authorize();
      setIsGmailAuthorized(authorized);
      
      if (authorized) {
        toast.success('Successfully connected to Gmail');
        setStatusError(null);
        setErrorType(null);
      } else {
        toast.error('Failed to connect to Gmail');
      }
    } catch (error) {
      console.error('Error connecting to Gmail:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error connecting to Gmail';
      toast.error(errorMessage);
      setStatusError(errorMessage);
      setErrorType('connection_error');
    } finally {
      setIsConnecting(false);
    }
  }
  
  /**
   * Authorize the user to use the Gmail API with improved popup handling
   */
  async authorize(): Promise<boolean> {
    if (!this.isConfigValid()) {
      toast.error('Gmail integration is not configured. Please contact support.');
      return false;
    }
    
    if (!this.isInitialized) {
      try {
        const initialized = await this.initialize();
        if (!initialized) return false;
      } catch (error: any) {
        // Safely extract error message
        let errorMessage = 'Failed to initialize Gmail API';
        if (error && typeof error.message === 'string') {
          errorMessage = error.message;
        }
        
        if (errorMessage.toLowerCase().includes('gmail api access is blocked') || 
            errorMessage.toLowerCase().includes('blocked') ||
            errorMessage.toLowerCase().includes('permission_denied')) {
          toast.error('Gmail API access is blocked. Please check your Google Cloud Console configuration and API key permissions.');
        } else if (errorMessage.toLowerCase().includes('api key')) {
          toast.error('Invalid API key. Please verify your Gmail API configuration in Google Cloud Console.');
        } else if (errorMessage.toLowerCase().includes('redirect_uri_mismatch')) {
          toast.error(`Redirect URI mismatch. Please add "${GMAIL_CONFIG.redirectUri}" to your authorized redirect URIs in Google Cloud Console.`);
          console.error('Current redirect URI:', GMAIL_CONFIG.redirectUri);
        } else {
          toast.error('Failed to initialize Gmail API. Please check your configuration.');
        }
        return false;
      }
    }
    
    return new Promise((resolve) => {
      // Show user-friendly message about popup and browser requirements
      toast.info('Opening Gmail authorization window. Please allow popups if prompted by your browser.');
      
      this.tokenClient.callback = (response: any) => {
        if (response.error) {
          this.isAuthorized = false;
          
          // Handle specific errors with actionable guidance
          if (response.error === 'popup_blocked_by_browser') {
            toast.error('Popup was blocked. Please allow popups for this site in your browser settings and try again.');
          } else if (response.error === 'access_denied') {
            toast.error('Access denied. Gmail integration requires permission to send emails on your behalf.');
          } else if (response.error === 'popup_closed_by_user') {
            toast.error('Authorization window was closed. Please try again to connect Gmail.');
          } else if (response.error === 'invalid_client') {
            toast.error('Invalid OAuth client configuration. Please check your Google Cloud Console settings.');
          } else if (response.error === 'redirect_uri_mismatch') {
            toast.error(`Redirect URI mismatch. Please add "${GMAIL_CONFIG.redirectUri}" to your authorized redirect URIs in Google Cloud Console.`);
            console.error('Current redirect URI:', GMAIL_CONFIG.redirectUri);
          } else {
            toast.error(`Gmail authorization failed: ${response.error}. Please try again.`);
          }
          resolve(false);
        } else {
          this.isAuthorized = true;
          
          // Create token object, only including id_token if it's defined
          const tokenData: GmailToken = {
            access_token: response.access_token,
            expires_at: Date.now() + (response.expires_in * 1000),
            scope: response.scope,
            token_type: response.token_type,
          };
          
          // Only add id_token if it's defined (not undefined)
          if (response.id_token !== undefined) {
            tokenData.id_token = response.id_token;
          }
          
          this.token = tokenData;
          
          // Save token to storage
          this.saveToken();
          resolve(true);
        }
      };
      
      try {
        // Check if popups are likely to be blocked
        const testPopup = window.open('', '_blank', 'width=1,height=1');
        if (!testPopup || testPopup.closed || typeof testPopup.closed === 'undefined') {
          toast.error('Popups appear to be blocked. Please enable popups for this site and try again.');
          resolve(false);
          return;
        }
        testPopup.close();
        
        // Prompt the user to select a Google account and authorize the application
        this.tokenClient.requestAccessToken({ prompt: 'consent' });
      } catch (error: any) {
        console.error('Error requesting access token:', error);
        toast.error('Failed to open authorization popup. Please check your browser settings and allow popups for this site.');
        resolve(false);
      }
    });
  }
  
  /**
   * Revoke the Gmail authorization
   */
  async revokeAuthorization(): Promise<boolean> {
    if (!this.token) return true;
    
    try {
      // Revoke the token
      const revokeEndpoint = `https://oauth2.googleapis.com/revoke?token=${this.token.access_token}`;
      await fetch(revokeEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      // Clear token from storage
      this.token = null;
      this.isAuthorized = false;
      
      // Remove token from Firestore
      const userId = getCurrentUserId();
      if (userId) {
        const tokenRef = doc(db, 'user_api_keys', userId);
        await updateDoc(tokenRef, {
          gmailToken: null,
          updatedAt: serverTimestamp(),
        });
      }
      
      toast.success('Gmail disconnected successfully');
      return true;
    } catch (error) {
      console.error('Error revoking Gmail authorization:', error);
      toast.error('Failed to disconnect Gmail. Please try again.');
      return false;
    }
  }
  
  /**
   * Send an email using the Gmail API
   */
  async sendEmail(
    params: {
      to: string;
      subject: string;
      body: string;
      attachments?: File[];
      leadId?: string;
      cc?: string;
      bcc?: string;
      replyTo?: string;
      fromName?: string;
    }
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.isConfigValid()) {
      return {
        success: false,
        error: 'Gmail integration is not configured',
      };
    }
    
    if (!this.isInitialized || !this.isAuthorized || !this.token) {
      const authorized = await this.authorize();
      if (!authorized) {
        return {
          success: false,
          error: 'Not authorized to use Gmail API',
        };
      }
    }
    
    try {
      // Create the email content with attachments if provided
      const email = await this.createEmailWithAttachments(
        params.to, 
        params.subject, 
        params.body, 
        params.attachments || [],
        { 
          cc: params.cc, 
          bcc: params.bcc, 
          replyTo: params.replyTo, 
          fromName: params.fromName 
        }
      );
      
      // Send the email using the REST API directly
      const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          raw: email
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP error ${response.status}`);
      }
      
      const data = await response.json();
      
      return {
        success: true,
        messageId: data.id,
      };
    } catch (error: any) {
      console.error('Error sending email:', error);
      
      // Check for token expiration
      if (error.status === 401) {
        this.token = null;
        this.isAuthorized = false;
        
        return {
          success: false,
          error: 'Gmail authorization expired. Please reconnect your Gmail account.',
        };
      }
      
      // Check for quota errors
      if (error.status === 429 || (error.result && error.result.error && error.result.error.code === 429)) {
        return {
          success: false,
          error: 'Gmail sending quota exceeded. Please try again later.',
        };
      }
      
      // Check for API not enabled error
      if (error.status === 403 || (error.result && error.result.error && error.result.error.code === 403)) {
        return {
          success: false,
          error: 'Gmail API is not enabled. Please enable it in your Google Cloud Console.',
        };
      }
      
      return {
        success: false,
        error: error.message || 'Unknown error sending email',
      };
    }
  }
  
  /**
   * Create an email in base64 format (simple text email without attachments)
   */
  private createEmail(
    to: string,
    subject: string,
    body: string,
    options?: {
      cc?: string;
      bcc?: string;
      replyTo?: string;
      fromName?: string;
    }
  ): string {
    const headers = [
      `To: ${to}`,
      `Subject: ${subject}`,
      'Content-Type: text/plain; charset="UTF-8"',
    ];
    
    if (options?.cc) {
      headers.push(`Cc: ${options.cc}`);
    }
    
    if (options?.bcc) {
      headers.push(`Bcc: ${options.bcc}`);
    }
    
    if (options?.replyTo) {
      headers.push(`Reply-To: ${options.replyTo}`);
    }
    
    if (options?.fromName) {
      headers.push(`From: ${options.fromName}`);
    }
    
    const email = `${headers.join('\r\n')}\r\n\r\n${body}`;
    
    // Use UTF-8 safe base64 encoding
    return this.utf8ToBase64(email);
  }
  
  /**
   * Create an email with attachments in base64 format
   */
  private async createEmailWithAttachments(
    to: string,
    subject: string,
    body: string,
    attachments: File[],
    options?: {
      cc?: string;
      bcc?: string;
      replyTo?: string;
      fromName?: string;
    }
  ): Promise<string> {
    // If no attachments, use the simple email format
    if (!attachments || attachments.length === 0) {
      return this.createEmail(to, subject, body, options);
    }
    
    // Generate a boundary for the multipart message
    const boundary = `boundary_${Date.now().toString(16)}`;
    
    // Create email headers
    const headers = [
      `To: ${to}`,
      `Subject: ${subject}`,
      `Content-Type: multipart/mixed; boundary="${boundary}"`,
      'MIME-Version: 1.0',
    ];
    
    if (options?.cc) {
      headers.push(`Cc: ${options.cc}`);
    }
    
    if (options?.bcc) {
      headers.push(`Bcc: ${options.bcc}`);
    }
    
    if (options?.replyTo) {
      headers.push(`Reply-To: ${options.replyTo}`);
    }
    
    if (options?.fromName) {
      headers.push(`From: ${options.fromName}`);
    }
    
    // Start building the email content
    let emailContent = headers.join('\r\n') + '\r\n\r\n';
    
    // Add the email body as the first part
    emailContent += `--${boundary}\r\n`;
    emailContent += 'Content-Type: text/plain; charset="UTF-8"\r\n';
    emailContent += 'Content-Transfer-Encoding: 7bit\r\n\r\n';
    emailContent += body + '\r\n\r\n';
    
    // Add each attachment
    for (const file of attachments) {
      const base64Data = await this.fileToBase64(file);
      const contentType = file.type || 'application/octet-stream';
      
      emailContent += `--${boundary}\r\n`;
      emailContent += `Content-Type: ${contentType}\r\n`;
      emailContent += 'Content-Transfer-Encoding: base64\r\n';
      emailContent += `Content-Disposition: attachment; filename="${file.name}"\r\n\r\n`;
      emailContent += this.chunkBase64(base64Data) + '\r\n\r\n';
    }
    
    // Close the boundary
    emailContent += `--${boundary}--`;
    
    // Use UTF-8 safe base64 encoding
    return this.utf8ToBase64(emailContent);
  }
  
  /**
   * Convert a file to base64
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        let base64 = reader.result as string;
        // Remove the data URL prefix (e.g., "data:image/png;base64,")
        base64 = base64.split(',')[1];
        resolve(base64);
      };
      reader.onerror = (error) => {
        reject(error);
      };
    });
  }
  
  /**
   * Chunk base64 data into lines of appropriate length
   * This is important for MIME compliance
   */
  private chunkBase64(base64: string): string {
    const chunkSize = 76; // Standard line length for base64 in MIME
    let chunked = '';
    
    for (let i = 0; i < base64.length; i += chunkSize) {
      chunked += base64.substring(i, i + chunkSize) + '\r\n';
    }
    
    return chunked.trim();
  }

  /**
   * Get messages from Gmail inbox
   * This is used to check for replies to sent emails
   */
  async getMessages(query: string = '', maxResults: number = 10): Promise<any[]> {
    if (!this.isInitialized || !this.isAuthorized || !this.token) {
      const authorized = await this.authorize();
      if (!authorized) {
        throw new Error('Not authorized to use Gmail API');
      }
    }

    try {
      // Build the query URL
      let url = 'https://gmail.googleapis.com/gmail/v1/users/me/messages';
      const params = new URLSearchParams();
      
      if (query) {
        params.append('q', query);
      }
      
      params.append('maxResults', maxResults.toString());
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      // Make the request
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token?.access_token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP error ${response.status}`);
      }
      
      const data = await response.json();
      
      // If no messages, return empty array
      if (!data.messages) {
        return [];
      }
      
      // Fetch details for each message
      const messages = await Promise.all(
        data.messages.map(async (message: { id: string }) => {
          const messageResponse = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${this.token?.access_token}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (!messageResponse.ok) {
            return null;
          }
          
          return await messageResponse.json();
        })
      );
      
      return messages.filter(message => message !== null);
    } catch (error) {
      console.error('Error getting Gmail messages:', error);
      throw error;
    }
  }

  /**
   * Check for replies to a specific email thread
   */
  async checkForReplies(threadId: string): Promise<boolean> {
    try {
      const messages = await this.getMessages(`thread:${threadId}`);
      
      // If there's more than one message in the thread, there's a reply
      return messages.length > 1;
    } catch (error) {
      console.error('Error checking for replies:', error);
      return false;
    }
  }
}

// Singleton instance
export const gmailService = GmailService.getInstance();

// Email service for lead outreach
export class EmailService {
  /**
   * Send an email to a lead
   */
  async sendEmailToLead(
    lead: Lead,
    emailContent: { subject: string; body: string; attachments?: File[] },
    userId: string,
    options?: {
      replyTo?: string;
      fromName?: string;
    }
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Check if Gmail API is authorized
      if (!gmailService.isUserAuthorized()) {
        const authorized = await gmailService.authorize();
        if (!authorized) {
          return {
            success: false,
            error: 'Not authorized to use Gmail API',
          };
        }
      }
      
      // Send the email
      const result = await gmailService.sendEmail({
        to: lead.email,
        subject: emailContent.subject,
        body: emailContent.body,
        attachments: emailContent.attachments,
        leadId: lead.id,
        replyTo: options?.replyTo,
        fromName: options?.fromName
      });
      
      if (result.success) {
        // Track in analytics
        analytics.track({
          name: AnalyticsEvents.FEATURE_DISCOVERED,
          properties: { 
            feature: 'gmail_email_sent',
            leadId: lead.id,
            leadSource: lead.source,
            hasAttachments: emailContent.attachments && emailContent.attachments.length > 0
          },
          userId: lead.ownerId,
        });
        
        toast.success(`Email sent to ${lead.name}`);
        
        // Save email to lead_emails collection (optional)
        this.saveEmailToHistory(lead.id, emailContent, userId, result.messageId);
      }
      
      return result;
    } catch (error) {
      console.error('Error sending email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error sending email'
      };
    }
  }
  
  /**
   * Save email to lead_emails collection
   */
  private async saveEmailToHistory(
    leadId: string,
    emailContent: { subject: string; body: string; attachments?: File[] },
    userId: string,
    messageId?: string
  ): Promise<void> {
    try {
      // In a real implementation, this would store to Firestore
      // For demo, just log
      console.log('Saving email to history:', {
        leadId,
        subject: emailContent.subject,
        sentBy: userId,
        messageId,
        hasAttachments: emailContent.attachments && emailContent.attachments.length > 0
      });
    } catch (error) {
      console.error('Error saving email to history:', error);
      // Don't throw error, just log it
    }
  }
}

// Singleton instance
export const emailService = new EmailService();

// Add Gmail API types
declare global {
  interface Window {
    gapi: {
      load: (api: string, callback: () => void) => void;
      client: {
        init: (config: any) => Promise<void>;
        load: (api: string, version: string) => Promise<void>;
        gmail: {
          users: {
            messages: {
              send: (params: any) => Promise<any>;
              list: (params: any) => Promise<any>;
              get: (params: any) => Promise<any>;
            };
            threads: {
              get: (params: any) => Promise<any>;
            };
          };
        };
      };
    };
    google: {
      accounts: {
        oauth2: {
          initTokenClient: (config: any) => any;
        };
      };
    };
  }
}