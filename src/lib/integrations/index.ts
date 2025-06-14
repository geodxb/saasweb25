// Simple placeholder file to prevent import errors
// This file exists only to satisfy imports in other files
// All actual integration functionality has been removed

export const checkIntegrationsSetup = async (): Promise<any> => {
  return {
    airtable: false,
    calendly: false,
    googleSheets: false,
    googleCalendar: false,
    gmail: false,
    zapier: false,
    n8n: false,
    make: false,
    pabbly: false,
    excel: false
  };
};