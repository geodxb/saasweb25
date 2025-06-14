// Configuration file for the application
// This centralizes all environment variables and configuration settings

// Google Maps API key
export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

// Rate limiting
export const RATE_LIMITS = {
  API_REQUESTS_PER_MINUTE: parseInt(import.meta.env.VITE_RATE_LIMIT_REQUESTS_PER_MINUTE || '60'),
  SCRAPING_PER_HOUR: parseInt(import.meta.env.VITE_RATE_LIMIT_SCRAPING_PER_HOUR || '100'),
};

// Firebase configuration
export const FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// App information
export const APP_INFO = {
  name: 'Locafy',
  description: 'Find local business leads using Google Maps',
  version: '1.0.0',
  logoUrl: '/logo.svg',
  faviconUrl: '/logo.svg',
};

// API endpoints
export const API_ENDPOINTS = {
  GOOGLE_MAPS_SEARCH: 'https://places.googleapis.com/v1/places:searchText',
  GOOGLE_MAPS_DETAILS: 'https://places.googleapis.com/v1/places',
  GOOGLE_MAPS_GEOCODE: 'https://maps.googleapis.com/maps/api/geocode/json',
};

// Feature flags
export const FEATURES = {
  ENABLE_AI_ASSISTANT: false,
  ENABLE_LEAD_SCRAPER: true,
  ENABLE_WORKFLOW_BUILDER: false,
  ENABLE_GOOGLE_MAPS_SCRAPER: false,
};