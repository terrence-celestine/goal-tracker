import { pgTable, serial, varchar, text, boolean, timestamp, date, integer } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  displayName: varchar('display_name', { length: 100 }).notNull(),
  onboardingComplete: boolean('onboarding_complete').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  icon: varchar('icon', { length: 50 }),
});

export const goals = pgTable('goals', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  categoryId: integer('category_id').references(() => categories.id),
  isCustom: boolean('is_custom').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const userGoals = pgTable('user_goals', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  goalId: integer('goal_id').references(() => goals.id),
  dueDate: date('due_date'),
  completedAt: timestamp('completed_at'),
  status: varchar('status', { length: 20 }).default('active'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const achievements = pgTable('achievements', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  icon: varchar('icon', { length: 50 }),
  triggerRule: varchar('trigger_rule', { length: 100 }),
});

export const userAchievements = pgTable('user_achievements', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  achievementId: integer('achievement_id').references(() => achievements.id),
  earnedAt: timestamp('earned_at').defaultNow(),
});