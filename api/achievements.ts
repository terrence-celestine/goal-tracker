// api/achievements.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../src/lib/schema.js';
import { parse } from 'cookie';
import jwt from 'jsonwebtoken';
import { eq, and, count, isNotNull } from 'drizzle-orm';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });
const JWT_SECRET = process.env.JWT_SECRET!;

function getUserFromRequest(req: VercelRequest) {
  const cookies = parse(req.headers.cookie || '');
  const token = cookies.token;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number; email: string; displayName: string };
  } catch {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Not authenticated' });
  const userId = user.userId;

  if (req.method === 'GET') {
    try {
      const allAchievements = await db.select().from(schema.achievements);
      const earnedAchievements = await db
        .select()
        .from(schema.userAchievements)
        .where(eq(schema.userAchievements.userId, userId));

      const earnedIds = new Set(earnedAchievements.map(a => a.achievementId))

      const result = allAchievements.map(a => ({
        ...a,
        earned: earnedIds.has(a.id),
        earnedAt: earnedAchievements.find(e => e.achievementId === a.id)?.earnedAt ?? null,
      }))

      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    try {
      // Get all stats in parallel
      const [
        [completedResult],
        [addedResult],
        [customResult],
        [dueDateResult],
        earnedAchievements,
        allAchievements,
      ] = await Promise.all([
        db.select({ count: count() }).from(schema.userGoals)
          .where(and(eq(schema.userGoals.userId, userId), eq(schema.userGoals.status, 'done'))),
        db.select({ count: count() }).from(schema.userGoals)
          .where(eq(schema.userGoals.userId, userId)),
        db.select({ count: count() }).from(schema.userGoals)
          .innerJoin(schema.goals, eq(schema.userGoals.goalId, schema.goals.id))
          .where(and(eq(schema.userGoals.userId, userId), eq(schema.goals.isCustom, true))),
        db.select({ count: count() }).from(schema.userGoals)
          .where(and(eq(schema.userGoals.userId, userId), isNotNull(schema.userGoals.dueDate))),
        db.select().from(schema.userAchievements)
          .where(eq(schema.userAchievements.userId, userId)),
        db.select().from(schema.achievements),
      ])

      const stats: Record<string, number> = {
        goals_completed: completedResult.count,
        goals_added: addedResult.count,
        custom_goal: customResult.count,
        due_date_set: dueDateResult.count,
      }

      const earnedIds = new Set(earnedAchievements.map(a => a.achievementId))

      // Filter to achievements user qualifies for but hasn't earned yet
      const toAward = allAchievements.filter(a => {
        if (earnedIds.has(a.id)) return false
        const [rule, valueStr] = (a.triggerRule ?? '').split(':')
        const threshold = Number(valueStr)
        return stats[rule] !== undefined && stats[rule] >= threshold
      })

      if (toAward.length === 0) {
        return res.status(200).json({ awarded: false, achievements: [] })
      }

      // Bulk insert all newly earned achievements
      await db.insert(schema.userAchievements).values(
        toAward.map(a => ({ userId, achievementId: a.id }))
      )

      return res.status(200).json({ awarded: true, achievements: toAward })
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}