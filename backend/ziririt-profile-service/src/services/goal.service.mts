import { DatabaseConnection } from '../database/db.mts';
import { Goal, CreateGoalRequest, UpdateGoalRequest } from '../types/profile.types.mts';

export class GoalService {
  private db: DatabaseConnection;

  constructor() {
    this.db = DatabaseConnection.getInstance();
  }

  async createGoal(userId: string, goalData: CreateGoalRequest): Promise<Goal> {
    const { title, description, isPrivate = false } = goalData;
    
    const result = await this.db.query<Goal>(
      `INSERT INTO goals (user_id, title, description, is_private, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING *`,
      [userId, title, description, isPrivate]
    );

    // Update goals count in profile
    await this.updateGoalsCount(userId);

    return result.rows[0];
  }

  async getUserGoals(userId: string, viewerId?: string): Promise<Goal[]> {
    let query = `
      SELECT * FROM goals 
      WHERE user_id = $1
    `;
    const params = [userId];

    // If viewer is not the owner, only show public goals
    if (viewerId !== userId) {
      query += ` AND is_private = false`;
    }

    query += ` ORDER BY created_at DESC`;

    const result = await this.db.query<Goal>(query, params);
    return result.rows;
  }

  async updateGoal(goalId: string, userId: string, updates: UpdateGoalRequest): Promise<Goal> {
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

    const result = await this.db.query<Goal>(
      `UPDATE goals 
       SET ${updateFields.join(', ')}
       WHERE id = $${paramIndex++} AND user_id = $${paramIndex++}
       RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      throw new Error('Goal not found or access denied');
    }

    return result.rows[0];
  }

  async deleteGoal(goalId: string, userId: string): Promise<void> {
    const result = await this.db.query(
      `DELETE FROM goals WHERE id = $1 AND user_id = $2`,
      [goalId, userId]
    );

    if (result.rowCount === 0) {
      throw new Error('Goal not found or access denied');
    }

    // Update goals count in profile
    await this.updateGoalsCount(userId);
  }

  async getGoalById(goalId: string, viewerId?: string): Promise<Goal | null> {
    let query = `
      SELECT g.*, u.display_name as user_display_name
      FROM goals g
      JOIN users u ON g.user_id = u.id
      WHERE g.id = $1
    `;
    
    const params = [goalId];

    const result = await this.db.query<Goal & { user_display_name: string }>(query, params);
    
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

  private async updateGoalsCount(userId: string): Promise<void> {
    await this.db.query(
      `UPDATE profiles 
       SET goals_count = (
         SELECT COUNT(*) FROM goals WHERE user_id = $1
       ), 
       updated_at = NOW()
       WHERE user_id = $1`,
      [userId]
    );
  }
}