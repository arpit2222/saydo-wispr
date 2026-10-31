import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { traceValueDependencies } from '../lib/valueTracer.js';
import { compileSkillsWithNemotron } from '../lib/compiler.js';
import { getRecordingById, getSkills, saveSkill, savePolicies } from '../lib/supabase.js';
import { logger } from '../lib/logger.js';

export const compileRouter = Router();

const CompileRequestSchema = z.object({
  recording_id: z.string().min(1, 'recording_id is required'),
});

compileRouter.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = CompileRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0]?.message || 'Invalid compile request' });
    }

    const { recording_id } = parsed.data;

    // 1. Fetch recording
    const recording = await getRecordingById(recording_id);
    if (!recording) {
      return res.status(404).json({ error: `Recording not found with id: ${recording_id}` });
    }

    const events = recording.events || [];
    if (events.length === 0) {
      return res.status(400).json({ error: 'Recording contains no captured events to compile.' });
    }

    // 2. Deterministic Value Tracer
    const tracerEdges = traceValueDependencies(events);
    logger.info({ recording_id, edgeCount: tracerEdges.length }, 'Value tracing completed');

    // 3. Existing skills for reference and versioning
    const existingSkills = await getSkills(recording.app_id);

    // 4. Compile with Nemotron Fast model
    const compileOutput = await compileSkillsWithNemotron({
      events,
      narration: recording.narration || '',
      tracerEdges,
      existingSkills,
    });

    // 5. Version skills & Persist
    const savedSkills = [];
    for (const rawSkill of compileOutput.skills) {
      const existingSameName = existingSkills.filter((s: any) => s.name === rawSkill.name);
      const nextVersion =
        existingSameName.length > 0
          ? Math.max(...existingSameName.map((s: any) => s.version || 1)) + 1
          : 1;

      const skillToSave = {
        ...rawSkill,
        app_id: recording.app_id,
        version: nextVersion,
        source_recording: recording_id,
        narration: recording.narration,
        narration_metadata: recording.narration_metadata || (recording.narration ? {
          source: 'voice',
          words: recording.narration.trim().split(/\s+/).filter(Boolean).length,
          created_at: recording.created_at,
        } : null),
        status: 'active',
      };

      const saved = await saveSkill(skillToSave);
      savedSkills.push(saved);
    }

    // 6. Save suggested policies
    const policiesToSave = compileOutput.suggested_policies.map((p) => ({
      ...p,
      app_id: recording.app_id,
    }));
    const savedPolicies = await savePolicies(policiesToSave);

    logger.info(
      {
        recording_id,
        skillsCompiled: savedSkills.length,
        policiesSuggested: savedPolicies.length,
        tracerEdges: tracerEdges.length,
      },
      'Compilation successful'
    );

    return res.status(200).json({
      message: 'Skills compiled and versioned successfully',
      recording_id,
      skills: savedSkills,
      suggested_policies: savedPolicies,
      tracer_edges: tracerEdges,
    });
  } catch (err: any) {
    logger.error({ err }, 'Compilation failed');
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
});
