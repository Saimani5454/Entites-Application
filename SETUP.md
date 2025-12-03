# Entity Application - Setup Guide

## Quick Start (5 minutes)

### Step 1: Install Dependencies
```bash
npm install
```

This installs:
- Express.js (web framework)
- SQLite3 (database)
- TypeScript (language)
- Jest (testing framework)
- And other development tools

### Step 2: Start the Server

**Development Mode (with auto-reload):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm run build
npm start
```

### Step 3: Verify Server is Running

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Entity Application API is running"
}
```

## Configuration

The application uses environment variables from `.env` file:

```env
PORT=3000
NODE_ENV=development
DATABASE_PATH=./data/app.db
```

You can modify these values to match your setup.

## Running Tests

### Run all tests:
```bash
npm test
```

### Run tests with coverage:
```bash
npm test -- --coverage
```

### Run specific test file:
```bash
npm test -- tests/unit.test.ts
```

## Project Components

### Source Code (`src/`)

#### `app.ts`
Main application entry point that:
- Initializes Express server
- Sets up middleware
- Registers routes
- Initializes database

#### `controllers/`
Request handlers:
- `userController.ts`: User-related endpoints
- `clientController.ts`: Client-related endpoints

#### `routes/`
API route definitions:
- `userRoutes.ts`: Routes for /api/users and /user/profile
- `clientRoutes.ts`: Routes for /api/clients

#### `middleware/auth.ts`
Authentication and authorization:
- `authenticateUser`: Validates x-user header
- `requireAdmin`: Checks for ROLE_ADMIN
- `requireAuth`: Checks for any authenticated user

#### `database/connection.ts`
Database setup:
- SQLite3 connection
- Database initialization
- Helper functions (dbRun, dbGet, dbAll)
- Schema creation

#### `queries/customQueries.ts`
Custom SQL queries:
- findCompaniesByEmployeeRange
- findClientsByUser
- findClientsByCompanyName
- getMaxRevenueByIndustry
- countCompaniesByMinEmployees
- getUsersByCompany

#### `utils/validators.ts`
Validation functions:
- isValidEmail (regex: `^[^\s@]+@[^\s@]+\.[^\s@]+$`)
- isValidPhone (regex: `^\d+$`)

### Tests (`tests/`)

#### `unit.test.ts`
Unit tests covering:
- Email/phone validation
- Database operations
- Company queries
- Client queries
- Role-based access control

#### `integration.test.ts`
Integration tests covering:
- User endpoints (GET, PUT)
- Client endpoints (GET, POST, PATCH)
- Authentication and authorization
- Error handling

### Documentation (`docs/`)

#### `API_DOCUMENTATION.md`
Complete API reference:
- Setup instructions
- Database schema
- All endpoint documentation
- Request/response examples
- Error handling
- Troubleshooting

## API Quick Reference

### List Users
```bash
curl http://localhost:3000/api/users
```

### Filter Users by Username
```bash
curl http://localhost:3000/api/users?username=admin
```

### Get User Profile (requires authentication)
```bash
curl http://localhost:3000/user/profile \
  -H "x-user: {\"id\":1,\"username\":\"admin\",\"email\":\"admin@example.com\",\"role\":\"ROLE_ADMIN\"}"
```

### Replace User
```bash
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newname",
    "email": "new@example.com",
    "password": "newpass",
    "role": "ROLE_ADMIN"
  }'
```

### Create Client (ROLE_ADMIN required)
```bash
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -H "x-user: {\"id\":1,\"username\":\"admin\",\"email\":\"admin@example.com\",\"role\":\"ROLE_ADMIN\"}" \
  -d '{
    "name": "New Client",
    "email": "client@example.com",
    "phone": "1234567890",
    "userId": 1,
    "companyId": 1
  }'
```

### List Clients
```bash
curl http://localhost:3000/api/clients
```

### Get Client Details
```bash
curl http://localhost:3000/api/clients/1
```

### Update Client
```bash
curl -X PATCH http://localhost:3000/api/clients/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "email": "updated@example.com"
  }'
```

## Database Structure

### Tables

**users**
- id, username, email, password, role, createdAt, updatedAt, deletedAt

**companies**
- id, name, industry, employees, revenue, relatedCompanyId, createdAt, updatedAt, deletedAt

**clients**
- id, name, email, phone, userId, companyId, createdAt, updatedAt, deletedAt

**client_users** (junction table)
- id, clientId, userId, active, createdAt, updatedAt, deletedAt

**company_users** (junction table)
- id, companyId, userId, createdAt

## Validation Rules

### Email
- Must match pattern: `user@domain.com`
- Used on: Client creation/update, user management
- Example: `client@example.com` ✅, `invalid.email` ❌

### Phone
- Must contain only numeric digits (0-9)
- Used on: Client creation/update
- Example: `1234567890` ✅, `123-456-7890` ❌

### User Role
- Must be one of: `ROLE_USER`, `ROLE_ADMIN`
- `ROLE_USER`: Regular user (cannot create clients)
- `ROLE_ADMIN`: Administrator (can create clients)

## Common Issues and Solutions

### Port Already in Use
**Problem:** "listen EADDRINUSE: address already in use :::3000"

**Solution:**
- Change PORT in `.env` file to a different number (e.g., 3001)
- Or kill the process using port 3000:
  ```bash
  # Windows
  netstat -ano | findstr :3000
  taskkill /PID <PID> /F
  ```

### Database Not Found
**Problem:** "Cannot find module 'sqlite3'"

**Solution:**
- Run `npm install` to install all dependencies
- Delete `node_modules` and run `npm install` again

### TypeScript Errors
**Problem:** Various TypeScript compilation errors

**Solution:**
- Run `npm run build` to check for errors
- Most errors are in test files and resolve after running tests

### Cannot Create Client (403 Forbidden)
**Problem:** Getting 403 when trying to create a client

**Solution:**
- Verify you're sending the `x-user` header with `ROLE_ADMIN`
- Check the header format:
  ```bash
  -H "x-user: {\"id\":1,\"username\":\"admin\",\"email\":\"admin@example.com\",\"role\":\"ROLE_ADMIN\"}"
  ```

## Authentication Header Format

For endpoints requiring authentication, include the `x-user` header:

```bash
-H "x-user: {\"id\":1,\"username\":\"username\",\"email\":\"email@example.com\",\"role\":\"ROLE_ADMIN\"}"
```

Replace with actual user data:
- `id`: User ID from database
- `username`: Username
- `email`: User email
- `role`: `ROLE_USER` or `ROLE_ADMIN`

## Development Workflow

1. **Make changes** to TypeScript files in `src/`
2. **Run development server** with `npm run dev` (auto-recompiles)
3. **Test endpoints** with curl or Postman
4. **Run tests** with `npm test` to verify changes
5. **Build for production** with `npm run build`

## Project Statistics

- **Lines of Code**: ~1500+ (source + tests)
- **Endpoints**: 7 main endpoints
- **Database Tables**: 5 tables
- **Test Cases**: 35+ tests
- **Validation Rules**: Email (regex), Phone (numbers only)
- **Security Features**: RBAC, input validation, unique constraints

## Next Steps

1. Review `API_DOCUMENTATION.md` for complete endpoint documentation
2. Run `npm test` to verify all tests pass
3. Test endpoints using curl or Postman
4. Seed test data into the database (SQL provided in docs)
5. Deploy to production with environment variables set

## Files Quick Reference

| File | Purpose |
|------|---------|
| `src/app.ts` | Application entry point |
| `src/controllers/` | Request handlers |
| `src/routes/` | API routes |
| `src/middleware/auth.ts` | Authentication |
| `src/database/connection.ts` | Database setup |
| `src/queries/customQueries.ts` | Custom SQL |
| `src/utils/validators.ts` | Validation functions |
| `tests/unit.test.ts` | Unit tests |
| `tests/integration.test.ts` | Integration tests |
| `docs/API_DOCUMENTATION.md` | API reference |
| `package.json` | Dependencies |
| `tsconfig.json` | TypeScript config |
| `.env` | Environment variables |

## Support

For detailed information:
- See `README.md` for project overview
- See `docs/API_DOCUMENTATION.md` for complete API reference
- Check test files for usage examples
- Review TypeScript files for implementation details

---

Ready to start? Run `npm install && npm run dev` and visit `http://localhost:3000/health`!
