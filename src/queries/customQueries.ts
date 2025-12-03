import { dbAll, dbGet } from '../database/connection';

/**
 * Find companies within an employee range
 * @param minEmployees Minimum number of employees
 * @param maxEmployees Maximum number of employees
 * @returns List of companies within the range
 */
export const findCompaniesByEmployeeRange = async (
  minEmployees: number,
  maxEmployees: number
): Promise<any[]> => {
  return dbAll(
    `
    SELECT id, name, industry, employees, revenue, relatedCompanyId
    FROM companies
    WHERE employees BETWEEN ? AND ?
    AND deletedAt IS NULL
    ORDER BY employees DESC
    `,
    [minEmployees, maxEmployees]
  );
};

/**
 * Search clients by user
 * @param userId User ID to filter clients
 * @returns List of clients associated with the user
 */
export const findClientsByUser = async (userId: number): Promise<any[]> => {
  return dbAll(
    `
    SELECT c.id, c.name, c.email, c.phone, c.companyId, co.name as companyName
    FROM clients c
    JOIN companies co ON c.companyId = co.id
    WHERE c.userId = ? AND c.deletedAt IS NULL
    ORDER BY c.createdAt DESC
    `,
    [userId]
  );
};

/**
 * Search clients by company name
 * @param companyName Company name to search
 * @returns List of clients associated with companies matching the name
 */
export const findClientsByCompanyName = async (companyName: string): Promise<any[]> => {
  return dbAll(
    `
    SELECT c.id, c.name, c.email, c.phone, c.userId, c.companyId, co.name as companyName
    FROM clients c
    JOIN companies co ON c.companyId = co.id
    WHERE co.name LIKE ? AND c.deletedAt IS NULL
    ORDER BY c.createdAt DESC
    `,
    [`%${companyName}%`]
  );
};

/**
 * Get companies with maximum revenue in each industry
 * Returns one company per industry with the highest revenue
 * @returns List of companies with max revenue per industry
 */
export const getMaxRevenueByIndustry = async (): Promise<any[]> => {
  return dbAll(
    `
    SELECT id, name, industry, employees, revenue
    FROM companies
    WHERE (industry, revenue) IN (
      SELECT industry, MAX(revenue)
      FROM companies
      WHERE deletedAt IS NULL
      GROUP BY industry
    )
    AND deletedAt IS NULL
    ORDER BY revenue DESC
    `
  );
};

/**
 * Count companies with more than specified employees
 * @param minEmployees Minimum number of employees
 * @returns Count of companies
 */
export const countCompaniesByMinEmployees = async (minEmployees: number): Promise<number> => {
  const result = await dbGet(
    `
    SELECT COUNT(*) as count
    FROM companies
    WHERE employees > ?
    AND deletedAt IS NULL
    `,
    [minEmployees]
  );
  return result?.count || 0;
};

/**
 * Get all users associated with a company
 * @param companyId Company ID
 * @returns List of users
 */
export const getUsersByCompany = async (companyId: number): Promise<any[]> => {
  return dbAll(
    `
    SELECT DISTINCT u.id, u.username, u.email, u.role
    FROM users u
    JOIN company_users cu ON u.id = cu.userId
    WHERE cu.companyId = ? AND u.deletedAt IS NULL
    ORDER BY u.username
    `,
    [companyId]
  );
};
