import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { sanitizeEvents, NetworkCapturedEventSchema } from '@saydo/shared';
import { getAppByPublicKey, saveRecording, getRecordings } from '../lib/supabase.js';
import { logger } from '../lib/logger.js';

export const recordingsRouter = Router();

const CreateRecordingSchema = z.object({
  publicKey: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  events: z.array(NetworkCapturedEventSchema).default([]),
  narration: z.string().optional(),
  narration_metadata: z
    .object({
      source: z.enum(['voice', 'typed']),
      words: z.number(),
      created_at: z.string().optional(),
    })
    .optional(),
});

recordingsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const publicKey = (req.headers['x-saydo-public-key'] as string) || req.body.publicKey;
    const origin = req.headers.origin;

    if (!publicKey) {
      return res.status(401).json({ error: 'Missing public key (X-SayDo-Public-Key header or publicKey in body)' });
    }

    const app = await getAppByPublicKey(publicKey);
    if (!app) {
      return res.status(404).json({ error: 'App not found for provided public key' });
    }

    // Origin Check
    if (origin && app.allowed_origins && app.allowed_origins.length > 0) {
      const isAllowed = app.allowed_origins.some((allowed: string) => {
        try {
          const allowedOrigin = new URL(allowed).origin;
          return origin === allowedOrigin;
        } catch {
          return allowed === origin;
        }
      });

      if (!isAllowed) {
        logger.warn({ origin, allowed: app.allowed_origins }, 'Recording rejected due to disallowed origin');
        return res.status(403).json({ error: `Origin '${origin}' not permitted for this application` });
      }
    }

    const parsed = CreateRecordingSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0]?.message || 'Invalid recording payload' });
    }

    const { title, events, narration, narration_metadata } = parsed.data;

    // Defense-in-depth: Re-sanitize events on server-side
    const cleanEvents = sanitizeEvents(events as any);

    const recording = await saveRecording({
      app_id: app.id,
      title,
      events: cleanEvents,
      narration,
      narration_metadata,
    });

    logger.info({ recordingId: recording.id, eventCount: cleanEvents.length, app: app.name }, 'Recording saved');

    return res.status(201).json({
      message: 'Recording captured and sanitized successfully',
      recording_id: recording.id,
      title: recording.title,
      event_count: cleanEvents.length,
      sanitized: true,
      created_at: recording.created_at,
    });
  } catch (err: any) {
    logger.error({ err }, 'Failed to save recording');
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
});

recordingsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const publicKey = req.query.publicKey as string;
    let appId: string | undefined;

    if (publicKey) {
      const app = await getAppByPublicKey(publicKey);
      if (app) appId = app.id;
    }

    const records = await getRecordings(appId);
    return res.json({
      recordings: records,
      count: records.length,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to list recordings' });
  }
});
