import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import * as dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function seed() {
  console.log('Seeding categories...');

  await db.insert(schema.categories).values([
    { name: 'Fitness', icon: '💪' },
    { name: 'Learning', icon: '📚' },
    { name: 'Finance', icon: '💰' },
    { name: 'Mental Health', icon: '🧘' },
    { name: 'Career', icon: '💼' },
    { name: 'Relationships', icon: '❤️' },
    { name: 'Creativity', icon: '🎨' },
    { name: 'Nutrition', icon: '🥗' },
  ]);

  console.log('Done!');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});