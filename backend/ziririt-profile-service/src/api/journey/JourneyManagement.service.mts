import { Pool } from 'pg';

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  isPrivate: boolean;
  stepsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateJourneyData {
  title: string;
  description?: string;
  isPrivate?: boolean;
}

export interface UpdateJourneyData {
  title?: string;
  description?: string;
  isPrivate?: boolean;
}

export class JourneyManagementService {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async createJourney(userId: string, goalData: CreateJourneyData): Promise<Goal> {
    const { title, description, isPrivate = false } = goalData;
    
    const result = await this.pool.query<Goal>(
      `INSERT INTO journeys (user_id, title, description, is_private, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING 
         id,
         user_id       AS "userId",
         title,
         description,
         is_private    AS "isPrivate",
         steps_count   AS "stepsCount",
         created_at    AS "createdAt",
         updated_at    AS "updatedAt"`,
      [userId, title, description, isPrivate]
    );

    // Update goals count in profile
    await this.updateJourneysCount(userId);

    return result.rows[0];
  }

  async getUserJourneys(userId: string, viewerId?: string): Promise<Goal[]> {
    let query = `
      SELECT 
        id,
        user_id       AS "userId",
        title,
        description,
        is_private    AS "isPrivate",
        steps_count   AS "stepsCount",
        created_at    AS "createdAt",
        updated_at    AS "updatedAt"
      FROM journeys
      WHERE user_id = $1
    `;
    const params = [userId];

    // If viewer is not the owner, only show public goals
    if (viewerId !== userId) {
      query += ` AND is_private = false`;
    }

    query += ` ORDER BY created_at DESC`;

    const result = await this.pool.query<Goal>(query, params);
    return result.rows;
  }

  async updateJourney(goalId: string, userId: string, updates: UpdateJourneyData): Promise<Goal> {
    const updateFields: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (updates.title !== undefined) {
      updateFields.push(`title = $${paramIndex++}`);
      params.push(updates.title);
    }
    if (updates.description !== undefined) {
      updateFields.push(`description = $${paramIndex++}`);
      params.push(updates.description);
    }
    if (updates.isPrivate !== undefined) {
      updateFields.push(`is_private = $${paramIndex++}`);
      params.push(updates.isPrivate);
    }

    if (updateFields.length === 0) {
      throw new Error('No fields to update');
    }

    updateFields.push(`updated_at = NOW()`);
    params.push(goalId, userId);

    const result = await this.pool.query<Goal>(
      `UPDATE journeys 
       SET ${updateFields.join(', ')}
       WHERE id = $${paramIndex++} AND user_id = $${paramIndex++}
       RETURNING 
         id,
         user_id       AS "userId",
         title,
         description,
         is_private    AS "isPrivate",
         steps_count   AS "stepsCount",
         created_at    AS "createdAt",
         updated_at    AS "updatedAt"`,
      params
    );

    if (result.rows.length === 0) {
      throw new Error('Goal not found or access denied');
    }

    return result.rows[0];
  }

  async deleteJourney(goalId: string, userId: string): Promise<void> {
    const result = await this.pool.query(
      `DELETE FROM journeys WHERE id = $1 AND user_id = $2`,
      [goalId, userId]
    );

    if (result.rowCount === 0) {
      throw new Error('Goal not found or access denied');
    }

    // Update goals count in profile
    await this.updateJourneysCount(userId);
  }

  async getJourneyById(goalId: string, viewerId?: string): Promise<Goal | null> {
    const query = `
      SELECT 
        j.id,
        j.user_id       AS "userId",
        j.title,
        j.description,
        j.is_private    AS "isPrivate",
        j.steps_count   AS "stepsCount",
        j.created_at    AS "createdAt",
        j.updated_at    AS "updatedAt",
        u.display_name  AS "userDisplayName"
      FROM journeys j
      JOIN users u ON j.user_id = u.id
      WHERE j.id = $1
    `;
    
    const params = [goalId];

    const result = await this.pool.query<(Goal & { userDisplayName: string })>(query, params);
    
    if (result.rows.length === 0) {
      return null;
    }

    const goal = result.rows[0];

    // Check privacy permissions
    if (goal.isPrivate && viewerId !== goal.userId) {
      return null;
    }

    return goal;
  }

  private async updateJourneysCount(userId: string): Promise<void> {
    await this.pool.query(
      `UPDATE profiles 
       SET journeys_count = (
         SELECT COUNT(*) FROM journeys WHERE user_id = $1
       ), 
       updated_at = NOW()
       WHERE user_id = $1`,
      [userId]
    );
  }
}
