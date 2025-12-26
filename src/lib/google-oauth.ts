import { google } from 'googleapis';

// Validate environment variables
const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

if (!clientId || !clientSecret || !baseUrl) {
    console.error('Missing Google OAuth credentials:', {
        hasClientId: !!clientId,
        hasClientSecret: !!clientSecret,
        hasBaseUrl: !!baseUrl
    });
}

export const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    `${baseUrl}/api/auth/google/callback`
);

export const SCOPES = {
    analytics: ['https://www.googleapis.com/auth/analytics.readonly'],
    searchConsole: ['https://www.googleapis.com/auth/webmasters.readonly'],
    ads: ['https://www.googleapis.com/auth/adwords']
};

export function getAuthUrl(
    service: 'analytics' | 'searchConsole' | 'ads',
    siteId: string,
    userId: string
) {
    const scopes = SCOPES[service];

    if (!clientId) {
        throw new Error('GOOGLE_CLIENT_ID not configured');
    }

    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        state: JSON.stringify({ siteId, userId, service }),
        prompt: 'consent' // Force to get refresh token
    });
}
