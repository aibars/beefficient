import { pgTable, text, timestamp, uuid, boolean, integer, decimal } from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').unique().notNull(),
  name: text('name').notNull(),
  profileType: text('profile_type').notNull(), // 'productor' | 'tecnico'
  passwordHash: text('password_hash').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const establishmentsTable = pgTable('establishments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => usersTable.id),
  name: text('name').notNull(),
  location: text('location'),
  hectares: decimal('hectares', { precision: 10, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Placeholder para expansión futura
export const lotsTable = pgTable('lots', {
  id: uuid('id').primaryKey().defaultRandom(),
  establishmentId: uuid('establishment_id').notNull().references(() => establishmentsTable.id),
  name: text('name').notNull(),
  hectares: decimal('hectares', { precision: 10, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const cattleTable = pgTable('cattle', {
  id: uuid('id').primaryKey().defaultRandom(),
  establishmentId: uuid('establishment_id').notNull().references(() => establishmentsTable.id),
  lotId: uuid('lot_id').references(() => lotsTable.id),
  tagNumber: text('tag_number').notNull(),
  breed: text('breed'),
  weight: decimal('weight', { precision: 10, scale: 2 }),
  age: integer('age'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
