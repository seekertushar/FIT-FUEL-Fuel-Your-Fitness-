import 'dotenv/config';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { WebSocketServer } from 'ws';
import { createServer as createViteServer } from 'vite';
import { LiveServerMessage, Modality } from '@google/genai';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import {
  createDietTemplate,
  createPaymentRecord,
  createProgressRecord,
  createWorkoutTemplate,
  deleteDietTemplate,
  deleteProgressRecord,
  deleteWorkoutTemplate,
  getOrCreateUser,
  getUserDashboardData,
  listAllMembersSummary,
  listDietTemplates,
  listWorkoutTemplates,
  updateDietTemplate,
  updateProgressRecord,
  updateUserProfile,
  updateWorkoutTemplate,
  upsertActivityLog,
} from './src/db/repository.ts';
import { askFitnessCoach, createGeminiClient } from './src/server/gemini.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // Authenticated member sync & dashboard bootstrap (Cloud SQL + Firebase Auth)
  app.get('/api/auth/me', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const email = req.user!.email || 'member@fitfuel.in';
      const name = (req.user!.name as string | undefined) || undefined;
      await getOrCreateUser(uid, email, name);
      const data = await getUserDashboardData(uid);
      res.json(data);
    } catch (error: any) {
      console.error('Error in GET /api/auth/me:', error);
      res.status(500).json({ error: error.message || 'Failed to load profile' });
    }
  });

  app.put('/api/profile', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const body = req.body ?? {};
      const age = typeof body.age === 'number' ? body.age : undefined;
      let fitnessGoal = body.fitnessGoal;
      if (age !== undefined && age < 18) {
        fitnessGoal = 'General Fitness';
      }
      const updated = await updateUserProfile(uid, {
        fullName: body.fullName,
        mobile: body.mobile,
        age,
        gender: body.gender,
        heightCm: body.heightCm,
        currentWeightKg: body.currentWeightKg,
        targetWeightKg: age !== undefined && age < 18 ? body.currentWeightKg : body.targetWeightKg,
        experience: body.experience,
        activityLevel: body.activityLevel,
        dietaryPreference: body.dietaryPreference,
        allergies: body.allergies,
        fitnessGoal,
        branchCity: body.branchCity,
        membershipPlan: body.membershipPlan,
        language: body.language,
        theme: body.theme,
        notificationsEnabled: body.notificationsEnabled,
        onboardingComplete: body.onboardingComplete,
      });
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to update profile' });
    }
  });

  app.post('/api/progress', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const { recordDate, weightKg, waistCm, chestCm, armCm, notes } = req.body ?? {};
      if (!recordDate) {
        return res.status(400).json({ error: 'Record date is required.' });
      }
      const record = await createProgressRecord(uid, {
        recordDate,
        weightKg: weightKg ? Number(weightKg) : null,
        waistCm: waistCm ? Number(waistCm) : null,
        chestCm: chestCm ? Number(chestCm) : null,
        armCm: armCm ? Number(armCm) : null,
        notes: typeof notes === 'string' ? notes : '',
      });
      res.status(201).json(record);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to create progress record' });
    }
  });

  app.put('/api/progress/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) {
        return res.status(400).json({ error: 'Invalid record ID' });
      }
      const updated = await updateProgressRecord(uid, id, req.body ?? {});
      if (!updated) {
        return res.status(404).json({ error: 'Record not found' });
      }
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to update progress record' });
    }
  });

  app.delete('/api/progress/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) {
        return res.status(400).json({ error: 'Invalid record ID' });
      }
      const deleted = await deleteProgressRecord(uid, id);
      if (!deleted) {
        return res.status(404).json({ error: 'Record not found' });
      }
      res.json({ deleted: true, id });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to delete progress record' });
    }
  });

  app.post('/api/activity', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const { logDate, itemType, itemId, completed } = req.body ?? {};
      if (!logDate || !itemType || !itemId) {
        return res.status(400).json({ error: 'Missing activity fields' });
      }
      const saved = await upsertActivityLog(uid, logDate, itemType, String(itemId), Boolean(completed));
      res.json(saved);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to update activity' });
    }
  });

  app.post('/api/payments', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const { planName, amountInr, gstInr, totalInr, paymentMethod, upiOrRef, invoiceNumber } = req.body ?? {};
      if (!planName || !amountInr || !paymentMethod || !invoiceNumber) {
        return res.status(400).json({ error: 'Incomplete payment payload' });
      }
      const saved = await createPaymentRecord(uid, {
        planName,
        amountInr: Number(amountInr),
        gstInr: Number(gstInr),
        totalInr: Number(totalInr),
        paymentMethod,
        upiOrRef: String(upiOrRef || 'UPI'),
        invoiceNumber,
      });
      res.status(201).json(saved);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to save payment' });
    }
  });

  // Templates (Diet & Workout)
  app.get('/api/templates/diets', async (_req, res) => {
    try {
      const rows = await listDietTemplates();
      res.json(rows);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to load diet templates' });
    }
  });

  app.post('/api/templates/diets', requireAuth, async (req: AuthRequest, res) => {
    try {
      const created = await createDietTemplate({
        ...req.body,
        createdBy: req.user!.email || 'trainer',
      });
      res.status(201).json(created);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to create diet template' });
    }
  });

  app.put('/api/templates/diets/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const updated = await updateDietTemplate(Number(req.params.id), req.body);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to update diet template' });
    }
  });

  app.delete('/api/templates/diets/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      await deleteDietTemplate(Number(req.params.id));
      res.json({ deleted: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to delete diet template' });
    }
  });

  app.get('/api/templates/workouts', async (_req, res) => {
    try {
      const rows = await listWorkoutTemplates();
      res.json(rows);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to load workout templates' });
    }
  });

  app.post('/api/templates/workouts', requireAuth, async (req: AuthRequest, res) => {
    try {
      const created = await createWorkoutTemplate({
        ...req.body,
        createdBy: req.user!.email || 'trainer',
      });
      res.status(201).json(created);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to create workout template' });
    }
  });

  app.put('/api/templates/workouts/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const updated = await updateWorkoutTemplate(Number(req.params.id), req.body);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to update workout template' });
    }
  });

  app.delete('/api/templates/workouts/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      await deleteWorkoutTemplate(Number(req.params.id));
      res.json({ deleted: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to delete workout template' });
    }
  });

  app.get('/api/admin/members', requireAuth, async (_req: AuthRequest, res) => {
    try {
      const members = await listAllMembersSummary();
      res.json(members);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to load members' });
    }
  });

  // Gemini Deep Thinking & Fast Q&A API (server-side only)
  app.post('/api/gemini/ask', async (req, res) => {
    try {
      const { question, mode, language, userContext } = req.body ?? {};
      if (!question || typeof question !== 'string' || !question.trim()) {
        return res.status(400).json({ error: 'Please enter a fitness or Indian nutrition question.' });
      }
      const result = await askFitnessCoach({
        question: question.trim(),
        mode: mode === 'fast' ? 'fast' : 'deep',
        language: language === 'hi' ? 'hi' : 'en',
        userContext,
      });
      res.json(result);
    } catch (error: any) {
      console.error('Gemini API error:', error);
      const status = error?.status && Number.isInteger(error.status) ? error.status : 500;
      res.status(status).json({
        error: error?.message || 'Unable to reach Gemini right now. Please check your API key in Settings > Secrets.',
      });
    }
  });

  // Vite middleware in dev, static dist in prod
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = http.createServer(app);

  // WebSocket bridge for Gemini Live API (gemini-3.8-live)
  const wss = new WebSocketServer({ server, path: '/live' });

  wss.on('connection', async (clientWs, req) => {
    let session: any = null;
    try {
      const url = new URL(req.url || '/live', `http://${req.headers.host || 'localhost'}`);
      const lang = url.searchParams.get('lang') === 'hi' ? 'hi' : 'en';
      const ai = createGeminiClient();

      session = await ai.live.connect({
        model: 'gemini-3.8-live',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction:
            lang === 'hi'
              ? 'You are FIT FUEL Live Voice Coach in India. Speak warmly in natural Hindi (Hinglish/Hindi) giving safe, encouraging general workout form cues, Indian home meal ideas (poha, dal-roti, paneer, idli-sambar), and hydration tips. Never give medical diagnoses or weight-loss advice for under-18 users.'
              : 'You are FIT FUEL Live Voice Coach in India. Speak warmly and concisely in English with Indian fitness and nutrition context (poha, idli-sambar, dal-roti, paneer, sprouts). Give safe general workout form cues and hydration reminders. Never give medical diagnoses or weight-loss advice for minors.',
        },
        callbacks: {
          onmessage: (message: LiveServerMessage) => {
            if (clientWs.readyState !== clientWs.OPEN) return;
            const content = message.serverContent;
            if (content?.inputTranscription?.text) {
              clientWs.send(JSON.stringify({ inputTranscript: content.inputTranscription.text }));
            }
            if (content?.outputTranscription?.text) {
              clientWs.send(JSON.stringify({ outputTranscript: content.outputTranscription.text }));
            }
            for (const part of content?.modelTurn?.parts ?? []) {
              if (part.inlineData?.data) {
                clientWs.send(JSON.stringify({ audio: part.inlineData.data }));
              }
            }
            if (content?.interrupted) {
              clientWs.send(JSON.stringify({ interrupted: true }));
            }
          },
          onerror: (err: any) => {
            if (clientWs.readyState === clientWs.OPEN) {
              clientWs.send(
                JSON.stringify({
                  error: err?.message || 'Live voice session encountered an error.',
                })
              );
            }
          },
        },
      });

      if (clientWs.readyState === clientWs.OPEN) {
        clientWs.send(JSON.stringify({ ready: true }));
      }
    } catch (error: any) {
      console.error('Failed to start Gemini Live session:', error);
      if (clientWs.readyState === clientWs.OPEN) {
        clientWs.send(
          JSON.stringify({
            error: error?.message || 'Unable to connect to Gemini Live voice service.',
          })
        );
        clientWs.close();
      }
      return;
    }

    clientWs.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        if (msg.audio && session) {
          session.sendRealtimeInput({
            audio: { data: msg.audio, mimeType: 'audio/pcm;rate=16000' },
          });
        } else if (msg.text && session) {
          session.sendRealtimeInput({ text: String(msg.text) });
        }
      } catch (err) {
        console.error('Error forwarding live message:', err);
      }
    });

    clientWs.on('close', () => {
      try {
        session?.close?.();
      } catch {
        // ignore close cleanup errors
      }
    });
  });

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`FIT FUEL server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
