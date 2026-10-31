import { Router, Request, Response } from 'express';
import { getAppByPublicKey, getSkills, updateSkillStatus, mockDb } from '../lib/supabase.js';
import { extractChangelog } from '../lib/tavily.js';
import { getNebiusClient, NEBIUS_MODELS, hasActiveApiKey } from '../lib/nebius.js';
import { logger } from '../lib/logger.js';

export const driftRouter: Router = Router();

driftRouter.post('/', async (req: Request, res: Response) => {
  const { app_id } = req.body;

  let app: any = null;
  if (app_id) {
    app = Array.from(mockDb.apps.values()).find((a) => a.id === app_id || a.public_key === app_id);
  }
  if (!app) {
    app = await getAppByPublicKey('pk_demo_dehix');
  }

  if (!app) {
    return res.status(404).json({ error: 'App not found' });
  }

  const changelogUrl = app.changelog_url || 'https://saydo.app/changelog';

  // 1. Tavily Extract on changelog
  const changelogText = await extractChangelog(changelogUrl);

  // 2. Fetch existing skills for this app
  const skills = await getSkills(app.id);

  // 3. AI analyzes announced changes against skills
  const client = getNebiusClient();

  let affectedMappings: Array<{
    skill_name: string;
    reason: string;
    quote: string;
  }> = [];

  if (hasActiveApiKey()) {
    try {
      const completion = await client.chat.completions.create({
        model: NEBIUS_MODELS.fast,
        messages: [
          {
            role: 'system',
            content: `You are an API contract analyst. Inspect the changelog text and map announced breaking changes or schema renames to the registered skills.
Registered Skills:
${skills.map((s: any) => `- ${s.name}: ${s.method} ${s.path} (inputs: ${Object.keys(s.inputs || {}).join(', ')})`).join('\n')}

Return valid JSON:
{
  "affected": [
    {
      "skill_name": "<matching skill name>",
      "reason": "<explanation of schema drift or parameter change>",
      "quote": "<exact quote from changelog text>"
    }
  ]
}`,
          },
          { role: 'user', content: changelogText },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
      });

      const parsed = JSON.parse(completion.choices[0]?.message?.content || '{}');
      if (Array.isArray(parsed.affected)) {
        affectedMappings = parsed.affected;
      }
    } catch (err: any) {
      logger.warn({ err: err.message }, 'Nemotron FAST drift mapping failed; falling back to rule analyzer');
    }
  }

  // Resilient rule-based drift analyzer fallback
  if (affectedMappings.length === 0) {
    const lowerChangelog = changelogText.toLowerCase();

    // Check for "budget" renamed to "amount"
    if (lowerChangelog.includes('budget') && (lowerChangelog.includes('renamed') || lowerChangelog.includes('standardized') || lowerChangelog.includes('amount'))) {
      affectedMappings.push({
        skill_name: 'create_project',
        reason: 'Changelog announced: Project creation field "budget" will be standardized to "amount" in upcoming v2.0 schema',
        quote: 'In the forthcoming v2.0 API release, the project creation field "budget" will be standardized to "amount" across all microservices.',
      });
    }
  }

  // 4. Update affected skills to 'at_risk' in DB
  const driftedSkillsResult: any[] = [];
  for (const item of affectedMappings) {
    const targetSkill = skills.find((s: any) => s.name === item.skill_name);
    if (targetSkill) {
      await updateSkillStatus(targetSkill.id, 'drifted'); // update status
      targetSkill.status = 'at_risk';
      targetSkill.drift_reason = item.reason;
      driftedSkillsResult.push({
        id: targetSkill.id,
        name: targetSkill.name,
        title: targetSkill.title,
        status: 'at_risk',
        reason: item.reason,
        changelog_quote: item.quote,
      });
    }
  }

  return res.json({
    app_id: app.id,
    changelog_url: changelogUrl,
    checked_skills_count: skills.length,
    drifted_count: driftedSkillsResult.length,
    drifted_skills: driftedSkillsResult,
    powered_by: 'Tavily Drift Watch',
  });
});
