# Troubleshooting Guide

## Installation Issues

### Issue: npm install fails

**Error Message:**
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solutions:**
1. **Use legacy peer deps flag:**
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Clear npm cache:**
   ```bash
   npm cache clean --force
   npm install
   ```

3. **Delete node_modules and reinstall:**
   ```bash
   rm -r node_modules package-lock.json
   npm install
   ```

### Issue: Module 'sqlite3' not found

**Error Message:**
```
Cannot find module 'sqlite3'
```

**Solutions:**
1. **Install sqlite3 specifically:**
   ```bash
   npm install sqlite3
   ```

2. **Reinstall all dependencies:**
   ```bash
   npm install
   ```

3. **Check if node-gyp is installed:**
   ```bash
   npm install node-gyp -g
   npm install
   ```

---

## Server Issues

### Issue: Port 3000 already in use

**Error Message:**
```
listen EADDRINUSE: address already in use :::3000
```

**Solutions:**

**Windows (PowerShell):**
```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Example:
taskkill /PID 1234 /F
```

**macOS/Linux:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

**Alternative:** Change the port in `.env`:
```env
PORT=3001
```

### Issue: Cannot connect to server

**Error Message:**
```
connect ECONNREFUSED 127.0.0.1:3000
```

**Solutions:**
1. **Make sure server is running:**
   ```bash
   npm run dev
   ```

2. **Check PORT in .env:**
   ```bash
   cat .env
   ```

3. **Verify server started successfully:**
   ```bash
   npm run dev
   # Look for: ✓ Server running on http://localhost:3000
   ```

4. **Check if firewall is blocking the port**

### Issue: Server crashes immediately

**Error Message:**
```
Error: ENOENT: no such file or directory, open '...\data\app.db'
```

**Solutions:**
1. **Create data directory:**
   ```bash
   mkdir data
   ```

2. **Check DATABASE_PATH in .env:**
   ```bash
   cat .env
   ```

3. **Ensure path is correct and writable:**
   - Relative paths: `./data/app.db` (from project root)
   - Absolute paths: `/full/path/to/data/app.db`

---

## Database Issues

### Issue: Database locked

**Error Message:**
```
sqlite3 database is locked
```

**Solutions:**
1. **Stop all running instances:**
   ```bash
   npm run dev  # Stop this process
   npm test     # Stop this if running
   ```

2. **Delete database and restart:**
   ```bash
   rm data/app.db
   npm run dev
   ```

3. **Wait a few seconds before restarting:**
   Database locks are usually temporary

### Issue: Cannot create table (exists)

**Error Message:**
```
table X already exists
```

**Solutions:**
1. **This is usually not an error** - the code uses `CREATE TABLE IF NOT EXISTS`

2. **If you need fresh data:**
   ```bash
   rm data/app.db
   npm run dev
   ```

### Issue: Foreign key constraint fails

**Error Message:**
```
FOREIGN KEY constraint failed
```

**Solutions:**
1. **Ensure referenced record exists:**
   - User ID exists in users table
   - Company ID exists in companies table
   - Relationship IDs are valid

2. **Check data types match:**
   - Foreign key must match primary key type
   - Both should be INTEGER

3. **Example:**
   ```bash
   # Create client with non-existent user
   # This will fail because userId=999 doesn't exist
   curl -X POST http://localhost:3000/api/clients \
     -H "Content-Type: application/json" \
     -H "x-user: ..." \
     -d '{
       "userId": 999,  # This user doesn't exist!
       ...
     }'
   ```

---

## API Issues

### Issue: 401 Unauthorized

**Error Response:**
```json
{
  "error": "Unauthorized: No user provided"
}
```

**Solutions:**
1. **Add x-user header:**
   ```bash
   -H "x-user: {\"id\":1,\"username\":\"admin\",\"email\":\"admin@example.com\",\"role\":\"ROLE_ADMIN\"}"
   ```

2. **Check header format:**
   - Must be valid JSON
   - Properly escaped quotes
   - All required fields: id, username, email, role

3. **Example valid header:**
   ```bash
   curl http://localhost:3000/user/profile \
     -H 'x-user: {"id":1,"username":"admin","email":"admin@example.com","role":"ROLE_ADMIN"}'
   ```

### Issue: 403 Forbidden

**Error Response:**
```json
{
  "error": "Forbidden: Admin access required"
}
```

**Solutions:**
1. **Use ROLE_ADMIN user:**
   ```bash
   -H 'x-user: {"id":1,"username":"admin","email":"admin@example.com","role":"ROLE_ADMIN"}'
   ```

2. **Not ROLE_USER:**
   ```bash
   # This will fail
   -H 'x-user: {"id":2,"username":"user1","email":"user1@example.com","role":"ROLE_USER"}'
   ```

3. **Check which endpoints need admin:**
   - `POST /api/clients` - requires ROLE_ADMIN

### Issue: 400 Bad Request - Invalid email

**Error Response:**
```json
{
  "error": "Invalid email format"
}
```

**Solutions:**
1. **Use valid email format:**
   - ✅ `user@example.com`
   - ✅ `john.doe@company.co.uk`
   - ❌ `invalid.email`
   - ❌ `user@`

2. **Email regex:** `^[^\s@]+@[^\s@]+\.[^\s@]+$`

3. **Test your email:**
   ```bash
   # Valid
   "email": "client@example.com"
   
   # Invalid
   "email": "client.invalid"
   ```

### Issue: 400 Bad Request - Invalid phone

**Error Response:**
```json
{
  "error": "Phone must contain only numbers"
}
```

**Solutions:**
1. **Use numbers only:**
   - ✅ `1234567890`
   - ✅ `5551234567`
   - ❌ `555-123-4567`
   - ❌ `(555) 123-4567`

2. **Remove formatting:**
   ```bash
   # Valid
   "phone": "5551234567"
   
   # Invalid
   "phone": "555-123-4567"
   "phone": "+1-555-1234"
   ```

### Issue: 404 Not Found

**Error Response:**
```json
{
  "error": "User not found"
}
```

**Solutions:**
1. **Verify resource exists:**
   - Check user/client ID
   - Resource might be deleted (deletedAt is not NULL)

2. **List resources to find valid IDs:**
   ```bash
   curl http://localhost:3000/api/users
   curl http://localhost:3000/api/clients
   ```

3. **Use correct endpoint:**
   - `/api/users/:id` for users
   - `/api/clients/:id` for clients

### Issue: 409 Conflict

**Error Response:**
```json
{
  "error": "Company is already assigned to another client"
}
```

**Solutions:**
1. **Each company can only be used once:**
   - First client with companyId=1 succeeds
   - Second client with companyId=1 fails

2. **Use different company:**
   ```bash
   # This works
   "companyId": 1
   
   # If 1 is taken, use different ID
   "companyId": 2
   ```

3. **Check existing clients:**
   ```bash
   curl http://localhost:3000/api/clients
   # See which companyIds are already used
   ```

---

## Testing Issues

### Issue: Tests fail to run

**Error Message:**
```
Cannot find module 'jest'
```

**Solutions:**
1. **Install dev dependencies:**
   ```bash
   npm install --save-dev jest ts-jest @types/jest
   ```

2. **Ensure jest.config.js exists**

3. **Run with npm:**
   ```bash
   npm test
   ```

### Issue: Tests timeout

**Error Message:**
```
Jest did not exit one second after the test run has completed.
```

**Solutions:**
1. **Close database connection:**
   - The database connection is closed in afterAll
   - May take a few seconds

2. **Increase timeout:**
   ```bash
   npm test -- --testTimeout=10000
   ```

3. **Check for hanging processes:**
   - Kill any running servers
   - Close all database connections

### Issue: Specific test fails

**Solutions:**
1. **Run only that test:**
   ```bash
   npm test -- --testNamePattern="test name"
   ```

2. **Run in band (sequential):**
   ```bash
   npm test -- --runInBand
   ```

3. **Check test database:**
   - Tests create fresh database
   - Verify schema was initialized

---

## TypeScript Issues

### Issue: TypeScript compilation errors

**Error Message:**
```
error TS2307: Cannot find module 'express'
```

**Solutions:**
1. **Install type definitions:**
   ```bash
   npm install --save-dev @types/express @types/node
   ```

2. **Check tsconfig.json:**
   - Ensure strict mode is off
   - Check lib includes ES2020

3. **Rebuild:**
   ```bash
   npm run build
   ```

### Issue: Console errors during build

**Error Message:**
```
error TS2304: Cannot find name 'console'
```

**Solutions:**
1. **This is normal with strict TypeScript**
2. **Already disabled in tsconfig.json:**
   ```json
   "strict": false
   ```

3. **If seeing errors, rebuild:**
   ```bash
   npm run build
   ```

---

## Postman Issues

### Issue: Headers not working in Postman

**Solutions:**
1. **Set header correctly:**
   - Key: `x-user`
   - Value: `{"id":1,"username":"admin","email":"admin@example.com","role":"ROLE_ADMIN"}`

2. **Don't escape quotes in Postman:**
   - Raw JSON value (Postman handles escaping)

3. **Set Content-Type:**
   - Header: `Content-Type`
   - Value: `application/json`

### Issue: Body not sent in Postman

**Solutions:**
1. **Select Body tab**
2. **Choose "raw"**
3. **Set format to JSON** (dropdown on right)
4. **Paste JSON without outer quotes:**
   ```json
   {
     "name": "Client Name",
     "email": "client@example.com",
     "phone": "1234567890",
     "userId": 1,
     "companyId": 1
   }
   ```

---

## Performance Issues

### Issue: Server responds slowly

**Solutions:**
1. **Check system resources:**
   - RAM available
   - CPU usage
   - Disk space

2. **Reduce database size:**
   ```bash
   rm data/app.db
   npm run dev
   ```

3. **Check for large queries:**
   - Limit results
   - Add indexes (for production)

### Issue: Tests run slowly

**Solutions:**
1. **Run specific test file:**
   ```bash
   npm test -- tests/unit.test.ts
   ```

2. **Skip integration tests if just need unit tests:**
   ```bash
   npm test -- tests/unit.test.ts
   ```

---

## Data/Validation Issues

### Issue: Duplicate username error

**Error Response:**
```json
{
  "error": "Username already exists"
}
```

**Solutions:**
1. **Use unique username:**
   ```bash
   # Try different username
   "username": "new_unique_name"
   ```

2. **Check existing users:**
   ```bash
   curl http://localhost:3000/api/users
   ```

### Issue: Missing required fields

**Error Response:**
```json
{
  "error": "Missing required fields: name, email, phone, userId, companyId"
}
```

**Solutions:**
1. **Include all required fields:**
   ```json
   {
     "name": "Client Name",        // Required
     "email": "client@example.com", // Required
     "phone": "1234567890",         // Required
     "userId": 1,                   // Required
     "companyId": 1                 // Required
   }
   ```

2. **Check field names are exact**

---

## Getting Help

1. **Check API_DOCUMENTATION.md** for endpoint details
2. **Review EXAMPLE_REQUESTS.md** for working examples
3. **Check test files** for implementation patterns
4. **Review error message** - usually describes the problem

### Common Quick Fixes

| Issue | Fix |
|-------|-----|
| Port in use | Change PORT in .env or kill process |
| Module not found | Run npm install |
| Database locked | Stop all instances and restart |
| 401 Unauthorized | Add x-user header |
| 403 Forbidden | Use ROLE_ADMIN user |
| Invalid email | Use user@domain.com format |
| Invalid phone | Use numbers only |
| 404 Not found | Check ID exists with GET list |
| 409 Conflict | Don't reuse company IDs |

---

## Still Stuck?

1. **Check logs:**
   ```bash
   npm run dev
   # Look at console output
   ```

2. **Verify setup:**
   ```bash
   curl http://localhost:3000/health
   ```

3. **Test with example:**
   - Copy command from EXAMPLE_REQUESTS.md
   - Modify only the necessary values
   - Run it exactly as shown

4. **Reset database:**
   ```bash
   rm data/app.db
   npm run dev
   ```

---

Last updated: January 2024
