/**
 * Meta Conversations API (CAPI) — Vercel Serverless Function
 * POST /api/meta-capi
 *
 * Sends server-side conversion events to Meta's Graph API.
 * All PII (email, phone) is SHA-256 hashed before transmission.
 * Supports deduplication via eventId (matched with browser pixel eventID).
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as crypto from 'crypto';

// Meta Graph API version
const META_API_VERSION = 'v21.0';
const META_CAPI_ENDPOINT = (pixelId: string) =>
  `https://graph.facebook.com/${META_API_VERSION}/${pixelId}/events`;

// ─── Helpers ────────────────────────────────────────────────────────────────

/** SHA-256 hash a value (for PII normalization as required by Meta) */
function sha256(value: string): string {
  return crypto.createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
}

/** Hash phone: strip non-digits, normalize */
function hashPhone(phone: string): string {
  const normalized = phone.replace(/[^0-9]/g, '');
  return sha256(normalized);
}

/** Hash email: lowercase + trim */
function hashEmail(email: string): string {
  return sha256(email.trim().toLowerCase());
}

/** Derive client IP from Vercel request headers */
function getClientIp(req: VercelRequest): string | undefined {
  const forwarded = req.headers['x-forwarded-for'];
  if (Array.isArray(forwarded)) return forwarded[0]?.split(',')[0]?.trim();
  if (typeof forwarded === 'string') return forwarded.split(',')[0]?.trim();
  return undefined;
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface CAPIUserData {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  country?: string;
  externalId?: string;
  clientIpAddress?: string;
  clientUserAgent?: string;
  fbp?: string;  // Facebook browser cookie (_fbp)
  fbc?: string;  // Facebook click ID cookie (_fbc)
}

interface CAPIEvent {
  eventName: string;      // e.g. "Purchase", "AddToCart", "PageView"
  eventId: string;        // Unique ID for deduplication with browser pixel
  eventTime?: number;     // Unix timestamp; defaults to now
  eventSourceUrl?: string;
  userData?: CAPIUserData;
  customData?: Record<string, any>;
}

interface CAPIRequestBody {
  pixelId: string;
  accessToken: string;
  testEventCode?: string;
  events: CAPIEvent[];
}

// ─── Handler ─────────────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers — allow frontend origin
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const body: CAPIRequestBody = req.body;

    // ── Validate required fields ──
    if (!body?.pixelId) {
      return res.status(400).json({ error: 'Missing required field: pixelId' });
    }
    if (!body?.accessToken) {
      return res.status(400).json({ error: 'Missing required field: accessToken' });
    }
    if (!body?.events || !Array.isArray(body.events) || body.events.length === 0) {
      return res.status(400).json({ error: 'Missing or empty events array' });
    }

    const clientIp   = getClientIp(req);
    const userAgent  = req.headers['user-agent'];

    // ── Build CAPI payload ──
    const capiEvents = body.events.map((evt: CAPIEvent) => {
      const ud = evt.userData || {};

      // Build hashed user_data object
      const user_data: Record<string, any> = {};

      if (ud.email)      user_data['em']  = hashEmail(ud.email);
      if (ud.phone)      user_data['ph']  = hashPhone(ud.phone);
      if (ud.firstName)  user_data['fn']  = sha256(ud.firstName);
      if (ud.lastName)   user_data['ln']  = sha256(ud.lastName);
      if (ud.city)       user_data['ct']  = sha256(ud.city);
      if (ud.country)    user_data['country'] = sha256(ud.country);
      if (ud.externalId) user_data['external_id'] = sha256(ud.externalId);

      // Non-hashed fields
      user_data['client_ip_address'] = ud.clientIpAddress || clientIp || '0.0.0.0';
      user_data['client_user_agent'] = ud.clientUserAgent || userAgent || 'Unknown';

      // Facebook cookies (browser-side signals — NOT hashed)
      if (ud.fbp) user_data['fbp'] = ud.fbp;
      if (ud.fbc) user_data['fbc'] = ud.fbc;

      const capiEvent: Record<string, any> = {
        event_name:        evt.eventName,
        event_id:          evt.eventId,
        event_time:        evt.eventTime || Math.floor(Date.now() / 1000),
        event_source_url:  evt.eventSourceUrl || '',
        action_source:     'website',
        user_data,
      };

      if (evt.customData && Object.keys(evt.customData).length > 0) {
        capiEvent['custom_data'] = evt.customData;
      }

      return capiEvent;
    });

    const requestPayload: Record<string, any> = {
      data:         capiEvents,
      access_token: body.accessToken,
    };

    if (body.testEventCode) {
      requestPayload['test_event_code'] = body.testEventCode;
    }

    // ── Fire to Meta Graph API ──
    const metaResponse = await fetch(META_CAPI_ENDPOINT(body.pixelId), {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(requestPayload),
    });

    const metaData = await metaResponse.json() as any;

    if (!metaResponse.ok) {
      console.error('[CAPI] Meta API error:', metaData);
      return res.status(metaResponse.status).json({
        success:  false,
        error:    metaData?.error?.message || 'Meta API error',
        metaData,
      });
    }

    // ── Success ──
    console.log(`[CAPI] ✅ Sent ${capiEvents.length} event(s) to Pixel ${body.pixelId}:`,
      capiEvents.map(e => e.event_name).join(', ')
    );

    return res.status(200).json({
      success:         true,
      events_received: metaData.events_received,
      fbtrace_id:      metaData.fbtrace_id,
      messages:        metaData.messages || [],
    });

  } catch (error: any) {
    console.error('[CAPI] Unhandled error:', error);
    return res.status(500).json({
      success: false,
      error:   error?.message || 'Internal server error',
    });
  }
}
