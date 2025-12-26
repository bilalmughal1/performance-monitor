import { google } from 'googleapis';
import crypto from 'crypto';

// Validate environment variables
const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
const stateSecret = process.env.GOOGLE_STATE_SECRET;

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

    const payload = JSON.stringify({ siteId, userId, service });

    let state = payload;
    if (stateSecret) {
        const sig = crypto.createHmac('sha256', stateSecret).update(payload).digest('hex');
        state = Buffer.from(JSON.stringify({ payload, sig })).toString('base64url');
    }

    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        state,
        prompt: 'consent' // Force to get refresh token
    });
}
