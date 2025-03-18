import { ApiError, ApiErrorCode } from '@/lib/errors';
import { createPool, sql } from '@vercel/postgres';

export const pool = createPool({
  connectionString: process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production',
  max: 10,
  idleTimeoutMillis: 30000,
});

/**
 * Execute a database query with error handling
 */
export async function query<T>(
  queryText: string,
  params: any[] = []
): Promise<T> {
  try {
    const result = await sql.query(queryText, params);
    return result.rows as T;
  } catch (error) {
    console.error('Database query error:', error);
    throw new ApiError(
      ApiErrorCode.DATABASE_ERROR,
      'Database operation failed',
      500,
      { query: queryText }
    );
  }
}

/**
 * Set the current user ID for audit logging
 */
export async function setCurrentUser(userId: string | null) {
  try {
    await query(
      "SELECT set_config('app.current_user_id', $1, true)",
      [userId || '']
    );
  } catch (error) {
    console.error('Failed to set current user:', error);
  }
}

/**
 * Set request metadata for audit logging
 */
export async function setRequestMetadata(
  ip: string | null,
  userAgent: string | null
) {
  try {
    await Promise.all([
      query("SELECT set_config('app.request_ip', $1, true)", [ip || '']),
      query("SELECT set_config('app.user_agent', $1, true)", [userAgent || '']),
    ]);
  } catch (error) {
    console.error('Failed to set request metadata:', error);
  }
}

/**
 * Begin a transaction
 */
export async function beginTransaction() {
  return await query('BEGIN');
}

/**
 * Commit a transaction
 */
export async function commitTransaction() {
  return await query('COMMIT');
}

/**
 * Rollback a transaction
 */
export async function rollbackTransaction() {
  return await query('ROLLBACK');
}

/**
 * Execute queries within a transaction
 */
export async function withTransaction<T>(
  callback: () => Promise<T>
): Promise<T> {
  try {
    await beginTransaction();
    const result = await callback();
    await commitTransaction();
    return result;
  } catch (error) {
    await rollbackTransaction();
    throw error;
  }
} 