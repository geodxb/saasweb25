# Airtable Base Setup Guide for Locafyr Integration

This guide will help you set up your Airtable base correctly to work with the Locafyr lead export functionality.

## Step 1: Create a New Base in Airtable

1. Log in to your Airtable account
2. Click "Add a base" and select "Start from scratch"
3. Name your base "Locafyr Leads"

## Step 2: Set Up the Table Structure

1. Rename the default table to "Leads"
2. Add the following fields to your table:

| Field Name | Field Type | Description | Required Options |
|------------|------------|-------------|------------------|
| `Name` | Single line text | Lead's full name | - |
| `Email` | Email | Lead's email address | - |
| `Phone` | Phone number | Lead's phone number | - |
| `Company` | Single line text | Company name | - |
| `Source` | Single line text | Where the lead came from | - |
| `Status` | **Single select** | Lead status | **REQUIRED: new, contacted, proposal, converted, lost** |
| `Tags` | Multiple select | Tags associated with the lead | - |
| `Industry` | Single line text | Lead's industry | - |
| `Notes` | Long text | Notes about the lead | - |
| `Address` | Long text | Lead's address | - |
| `Website` | URL | Lead's website | - |
| `LocafyrId` | Single line text | Unique ID from Locafyr (IMPORTANT: do not remove) | - |
| `CreatedAt` | Date | When the lead was created | - |

### ⚠️ CRITICAL: Status Field Configuration

The `Status` field **MUST** be configured as a **Single select** field type with the following exact options:

1. **new** (lowercase)
2. **contacted** (lowercase)
3. **proposal** (lowercase)
4. **converted** (lowercase)
5. **lost** (lowercase)

**How to configure the Status field:**
1. Click on the Status field header
2. Select "Single select" as the field type
3. Add each option exactly as listed above (case-sensitive)
4. Assign colors to each option if desired
5. Save the field configuration

**Common Error:** If you see an error like "Insufficient permissions to create new select option", it means the Status field is not properly configured with predefined options.

## Step 3: Custom Fields for Google Maps Leads

If you're using the Google Maps scraper, add these additional fields:

| Field Name | Field Type | Description |
|------------|------------|-------------|
| `Rating` | Number (decimal) | Google Maps rating |
| `TotalRatings` | Number (integer) | Number of ratings on Google Maps |
| `BusinessTypes` | Multiple select | Business categories from Google Maps |
| `Latitude` | Number (decimal) | Geographic latitude |
| `Longitude` | Number (decimal) | Geographic longitude |
| `MapsUrl` | URL | Link to Google Maps listing |
| `OpenNow` | Checkbox | Whether business is currently open |
| `PlaceId` | Single line text | Google Maps place ID |

## Step 4: Get Your Airtable API Credentials

To connect Locafyr with your Airtable base, you'll need:

1. **Personal Access Token (PAT)**:
   - Go to your [Airtable account page](https://airtable.com/account)
   - In the API section, create a new Personal Access Token
   - Give it a name like "Locafyr Integration"
   - **IMPORTANT:** Set the following permissions:
     - `data.records:read` - Read records
     - `data.records:write` - Create and update records
     - `schema.bases:write` - **REQUIRED** for creating select options
   - Copy the token (you won't be able to see it again)

2. **Base ID**:
   - Open your Airtable base
   - Look at the URL: `https://airtable.com/appXXXXXXXXXXXXXX/...`
   - The Base ID is the part that starts with "app" (e.g., "appXXXXXXXXXXXXXX")

3. **Table Name**:
   - This is simply "Leads" if you followed this guide

## Step 5: Configure Locafyr

1. In Locafyr, go to Settings > Integrations
2. Find the Airtable section
3. Enter your Personal Access Token, Base ID, and Table Name
4. Click "Test Connection" to verify everything works
5. Save your settings

## Important Notes

- The field names in Airtable must exactly match the ones listed above (case-sensitive)
- The `Status` field **MUST** be a Single select field with predefined options
- The `LocafyrId` field is critical for syncing - it prevents duplicate records
- Your PAT must have `schema.bases:write` permission to work properly
- If you add custom fields in Locafyr, you'll need to add matching fields in Airtable
- When exporting leads, Locafyr will create new records or update existing ones based on the `LocafyrId`

## Troubleshooting

### Error: "Insufficient permissions to create new select option"

**Cause:** The Status field is not configured as a Single select field with predefined options, or your PAT lacks schema permissions.

**Solution:**
1. Ensure the Status field is configured as "Single select" with options: new, contacted, proposal, converted, lost
2. Update your PAT permissions to include `schema.bases:write`
3. Test the connection again

### Error: "Unknown field name"

**Cause:** Field names don't match exactly between Locafyr and Airtable.

**Solution:**
1. Check that your field names match exactly (including capitalization)
2. Ensure you've created all the required fields listed above
3. Verify the field types are appropriate for the data being exported

### Error: "Insufficient permissions"

**Cause:** Your PAT doesn't have the required permissions.

**Solution:**
1. Go to [airtable.com/account](https://airtable.com/account)
2. Edit your PAT and ensure it has:
   - `data.records:read`
   - `data.records:write`
   - `schema.bases:write`
3. Copy the updated token and update it in Locafyr

For additional help, contact Locafyr support at support@locafyr.com