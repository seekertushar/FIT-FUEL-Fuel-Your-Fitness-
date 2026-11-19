import { and, desc, eq } from 'drizzle-orm';
import { db } from './index.ts';
import {
  activityLogs,
  dietTemplates,
  paymentRecords,
  progressRecords,
  users,
  workoutTemplates,
} from './schema.ts';

export async function getOrCreateUser(uid: string, email: string, fullName?: string) {
  try {
    const result = await db
      .insert(users)
      .values({
        uid,
        email,
        fullName: fullName || email.split('@')[0] || 'Member',
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          updatedAt: new Date(),
        },
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Database query failed in getOrCreateUser:', error);
    throw new Error('Failed to synchronize user account.', { cause: error });
  }
}

export async function updateUserProfile(uid: string, payload: Partial<typeof users.$inferInsert>) {
  try {
    const { uid: _u, id: _i, createdAt: _c, ...safeFields } = payload;
    const result = await db
      .update(users)
      .set({ ...safeFields, updatedAt: new Date() })
      .where(eq(users.uid, uid))
      .returning();
    return result[0];
  } catch (error) {
    console.error('Database query failed in updateUserProfile:', error);
    throw new Error('Failed to update user profile.', { cause: error });
  }
}

export async function getUserDashboardData(uid: string) {
  try {
    const [profileRows, progress, activities, payments] = await Promise.all([
      db.select().from(users).where(eq(users.uid, uid)),
      db
        .select()
        .from(progressRecords)
        .where(eq(progressRecords.userUid, uid))
        .orderBy(desc(progressRecords.recordDate), desc(progressRecords.id)),
      db.select().from(activityLogs).where(eq(activityLogs.userUid, uid)),
      db
        .select()
        .from(paymentRecords)
        .where(eq(paymentRecords.userUid, uid))
        .orderBy(desc(paymentRecords.paidAt)),
    ]);
    return {
      profile: profileRows[0] ?? null,
      progress,
      activities,
      payments,
    };
  } catch (error) {
    console.error('Database query failed in getUserDashboardData:', error);
    throw new Error('Failed to load member data.', { cause: error });
  }
}

export async function createProgressRecord(
  userUid: string,
  data: {
    recordDate: string;
    weightKg?: number | null;
    waistCm?: number | null;
    chestCm?: number | null;
    armCm?: number | null;
    notes?: string;
  }
) {
  try {
    const result = await db
      .insert(progressRecords)
      .values({
        userUid,
        recordDate: data.recordDate,
        weightKg: data.weightKg ?? null,
        waistCm: data.waistCm ?? null,
        chestCm: data.chestCm ?? null,
        armCm: data.armCm ?? null,
        notes: data.notes ?? '',
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Database query failed in createProgressRecord:', error);
    throw new Error('Failed to save progress record.', { cause: error });
  }
}

export async function updateProgressRecord(
  userUid: string,
  id: number,
  data: {
    recordDate?: string;
    weightKg?: number | null;
    waistCm?: number | null;
    chestCm?: number | null;
    armCm?: number | null;
    notes?: string;
  }
) {
  try {
    const result = await db
      .update(progressRecords)
      .set(data)
      .where(and(eq(progressRecords.id, id), eq(progressRecords.userUid, userUid)))
      .returning();
    return result[0] ?? null;
  } catch (error) {
    console.error('Database query failed in updateProgressRecord:', error);
    throw new Error('Failed to update progress record.', { cause: error });
  }
}

export async function deleteProgressRecord(userUid: string, id: number) {
  try {
    const result = await db
      .delete(progressRecords)
      .where(and(eq(progressRecords.id, id), eq(progressRecords.userUid, userUid)))
      .returning();
    return result[0] ?? null;
  } catch (error) {
    console.error('Database query failed in deleteProgressRecord:', error);
    throw new Error('Failed to delete progress record.', { cause: error });
  }
}

export async function upsertActivityLog(
  userUid: string,
  logDate: string,
  itemType: string,
  itemId: string,
  completed: boolean
) {
  try {
    const existing = await db
      .select()
      .from(activityLogs)
      .where(
        and(
          eq(activityLogs.userUid, userUid),
          eq(activityLogs.logDate, logDate),
          eq(activityLogs.itemType, itemType),
          eq(activityLogs.itemId, itemId)
        )
      );
    if (existing.length > 0) {
      const updated = await db
        .update(activityLogs)
        .set({ completed, updatedAt: new Date() })
        .where(eq(activityLogs.id, existing[0].id))
        .returning();
      return updated[0];
    }
    const inserted = await db
      .insert(activityLogs)
      .values({ userUid, logDate, itemType, itemId, completed })
      .returning();
    return inserted[0];
  } catch (error) {
    console.error('Database query failed in upsertActivityLog:', error);
    throw new Error('Failed to save activity status.', { cause: error });
  }
}

export async function createPaymentRecord(
  userUid: string,
  data: {
    planName: string;
    amountInr: number;
    gstInr: number;
    totalInr: number;
    paymentMethod: string;
    upiOrRef: string;
    invoiceNumber: string;
  }
) {
  try {
    const inserted = await db
      .insert(paymentRecords)
      .values({
        userUid,
        ...data,
        status: 'Paid',
      })
      .returning();
    await db
      .update(users)
      .set({ membershipPlan: data.planName, updatedAt: new Date() })
      .where(eq(users.uid, userUid));
    return inserted[0];
  } catch (error) {
    console.error('Database query failed in createPaymentRecord:', error);
    throw new Error('Failed to record membership payment.', { cause: error });
  }
}

export async function listDietTemplates() {
  try {
    return await db.select().from(dietTemplates).orderBy(dietTemplates.id);
  } catch (error) {
    console.error('Database query failed in listDietTemplates:', error);
    throw new Error('Failed to fetch diet templates.', { cause: error });
  }
}

export async function createDietTemplate(data: typeof dietTemplates.$inferInsert) {
  try {
    const res = await db.insert(dietTemplates).values(data).returning();
    return res[0];
  } catch (error) {
    console.error('Database query failed in createDietTemplate:', error);
    throw new Error('Failed to create diet template.', { cause: error });
  }
}

export async function updateDietTemplate(id: number, data: Partial<typeof dietTemplates.$inferInsert>) {
  try {
    const res = await db
      .update(dietTemplates)
      .set(data)
      .where(eq(dietTemplates.id, id))
      .returning();
    return res[0] ?? null;
  } catch (error) {
    console.error('Database query failed in updateDietTemplate:', error);
    throw new Error('Failed to update diet template.', { cause: error });
  }
}

export async function deleteDietTemplate(id: number) {
  try {
    const res = await db.delete(dietTemplates).where(eq(dietTemplates.id, id)).returning();
    return res[0] ?? null;
  } catch (error) {
    console.error('Database query failed in deleteDietTemplate:', error);
    throw new Error('Failed to delete diet template.', { cause: error });
  }
}

export async function listWorkoutTemplates() {
  try {
    return await db.select().from(workoutTemplates).orderBy(workoutTemplates.id);
  } catch (error) {
    console.error('Database query failed in listWorkoutTemplates:', error);
    throw new Error('Failed to fetch workout templates.', { cause: error });
  }
}

export async function createWorkoutTemplate(data: typeof workoutTemplates.$inferInsert) {
  try {
    const res = await db.insert(workoutTemplates).values(data).returning();
    return res[0];
  } catch (error) {
    console.error('Database query failed in createWorkoutTemplate:', error);
    throw new Error('Failed to create workout template.', { cause: error });
  }
}

export async function updateWorkoutTemplate(
  id: number,
  data: Partial<typeof workoutTemplates.$inferInsert>
) {
  try {
    const res = await db
      .update(workoutTemplates)
      .set(data)
      .where(eq(workoutTemplates.id, id))
      .returning();
    return res[0] ?? null;
  } catch (error) {
    console.error('Database query failed in updateWorkoutTemplate:', error);
    throw new Error('Failed to update workout template.', { cause: error });
  }
}

export async function deleteWorkoutTemplate(id: number) {
  try {
    const res = await db.delete(workoutTemplates).where(eq(workoutTemplates.id, id)).returning();
    return res[0] ?? null;
  } catch (error) {
    console.error('Database query failed in deleteWorkoutTemplate:', error);
    throw new Error('Failed to delete workout template.', { cause: error });
  }
}

export async function listAllMembersSummary() {
  try {
    return await db
      .select({
        id: users.id,
        uid: users.uid,
        fullName: users.fullName,
        email: users.email,
        age: users.age,
        heightCm: users.heightCm,
        currentWeightKg: users.currentWeightKg,
        fitnessGoal: users.fitnessGoal,
        dietaryPreference: users.dietaryPreference,
        branchCity: users.branchCity,
        membershipPlan: users.membershipPlan,
        experience: users.experience,
      })
      .from(users)
      .orderBy(desc(users.createdAt));
  } catch (error) {
    console.error('Database query failed in listAllMembersSummary:', error);
    throw new Error('Failed to load member reports.', { cause: error });
  }
}
