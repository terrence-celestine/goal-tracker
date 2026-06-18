// api/categories.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../src/lib/schema.js';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

export default async function handler(req: VercelRequest, res: VercelResponse) {

  // GET — list recommendations received
  if (req.method === 'GET') {
    try {
      const allCategories = await db
        .select()
        .from(schema.categories);

      if (allCategories.length === 0) return res.status(200).json([]);

      return res.status(200).json(allCategories);

    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}