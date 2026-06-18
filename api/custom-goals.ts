// api/custom-goals.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../src/lib/schema.js';
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

  if (req.method === 'POST') {
    const { title, description, categoryId, dueDate } = req.body;

      if (!title || !description) {
        return res.status(400).json({ error: 'Title and description are required' });
      }

    try {
        // inser the new goal into the goals table and return the goal Id to be used in the user_goals table
        const [newGoal] = await db.insert(schema.goals).values({
            title,
            description,
            categoryId: categoryId ?? null,
            isCustom: true
        }).returning({ id: schema.goals.id})

        await db.insert(schema.userGoals).values({
            userId: user.userId,
            goalId: newGoal.id,
            status: 'active',
            dueDate: dueDate ?? null
        })
      return res.status(201).json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}