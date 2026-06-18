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

  await db.insert(schema.achievements).values([
    { name: 'First Step', description: 'Complete your first goal', icon: '🎯', triggerRule: 'goals_completed:1' },
    { name: 'On a Roll', description: 'Complete 3 goals', icon: '🔥', triggerRule: 'goals_completed:3' },
    { name: 'Goal Setter', description: 'Add 5 goals to your list', icon: '📋', triggerRule: 'goals_added:5' },
    { name: 'Overachiever', description: 'Complete 10 goals', icon: '🏆', triggerRule: 'goals_completed:10' },
    { name: 'Custom Creator', description: 'Create your first custom goal', icon: '✨', triggerRule: 'custom_goal:1' },
    { name: 'Planner', description: 'Set a due date on a goal', icon: '📅', triggerRule: 'due_date_set:1' },
  ])
  
  console.log('Done!');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});