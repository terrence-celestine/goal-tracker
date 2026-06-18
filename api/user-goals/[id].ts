import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../../src/lib/schema';
import { eq, and } from 'drizzle-orm';
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

  const goalId = Number(req.query.id)
  if (!goalId) return res.status(400).json({ error: 'Invalid goal id' })

  if (req.method === 'PATCH') {
    try {
      const { status, dueDate } = req.body

      await db
        .update(schema.userGoals)
        .set({
          ...(status !== undefined && { status }),
          ...(dueDate !== undefined && { dueDate }),
          ...(status === 'done' && { completedAt: new Date() }),
          ...(status === 'active' && { completedAt: null }),
        })
        .where(
          and(
            eq(schema.userGoals.id, goalId),
            eq(schema.userGoals.userId, user.userId)
          )
        )

      return res.status(200).json({ success: true })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      await db
        .delete(schema.userGoals)
        .where(
          and(
            eq(schema.userGoals.id, goalId),
            eq(schema.userGoals.userId, user.userId)
          )
        )

      return res.status(200).json({ success: true })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}