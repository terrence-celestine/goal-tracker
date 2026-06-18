// api/user-goals.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../src/lib/schema';
import { eq } from 'drizzle-orm';   
import { parse } from 'cookie';
import jwt from 'jsonwebtoken';

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
      const userGoals = await db
        .select({
          id: schema.userGoals.id,
          title: schema.goals.title,
          description: schema.goals.description,
          status: schema.userGoals.status,
          dueDate: schema.userGoals.dueDate,
          completedAt: schema.userGoals.completedAt,
        })
        .from(schema.userGoals)
        .innerJoin(schema.goals, eq(schema.userGoals.goalId, schema.goals.id))
        .where(eq(schema.userGoals.userId, userId))

      return res.status(200).json(userGoals);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { goals } = req.body;

      if (!Array.isArray(goals) || goals.length === 0) {
        return res.status(400).json({ error: 'goals must be a non-empty array' });
      }

      for (const goal of goals) {
        const [newGoal] = await db.insert(schema.goals).values({
          title: goal.title,
          description: goal.description,
          isCustom: false,
        }).returning({ id: schema.goals.id });

        await db.insert(schema.userGoals).values({
          userId: userId,
          goalId: newGoal.id,
          status: 'active',
        });
      }

      return res.status(201).json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}