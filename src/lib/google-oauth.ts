import { google } from 'googleapis';

export const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google/callback`
);

export const SCOPES = {
    analytics: ['https://www.googleapis.com/auth/analytics.readonly'],
    searchConsole: ['https://www.googleapis.com/auth/webmasters.readonly'],
    ads: ['https://www.googleapis.com/auth/adwords']
};

export function getAuthUrl(service: 'analytics' | 'searchConsole' | 'ads', userId: string) {
    const scopes = SCOPES[service];

    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        state: JSON.stringify({ userId, service }),
        prompt: 'consent' // Force to get refresh token
    });
}
