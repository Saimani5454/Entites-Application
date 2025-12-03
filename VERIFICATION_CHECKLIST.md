# Entity Application - Verification Checklist

Use this checklist to verify that the application is installed and working correctly.

---

## ✅ Installation Verification

### Step 1: Dependencies Installed
```bash
npm install
```
- [ ] No errors during installation
- [ ] `node_modules` folder created
- [ ] `package-lock.json` file updated

### Step 2: TypeScript Built
```bash
npm run build
```
- [ ] No TypeScript errors
- [ ] `dist` folder created
- [ ] JavaScript files generated

### Step 3: Server Started
```bash
npm run dev
```
Expected output:
```
✓ Database schema initialized successfully
✓ Server running on http://localhost:3000
```

- [ ] Database initialized message appears
- [ ] Server running message appears
- [ ] No errors in console

---

## ✅ API Verification

### Health Check Endpoint
```bash
curl http://localhost:3000/health
```
Expected response:
```json
{"status":"OK","message":"Entity Application API is running"}
```

- [ ] Returns 200 status code
- [ ] Response contains "OK" status
- [ ] Response contains correct message

### List Users Endpoint
```bash
curl http://localhost:3000/api/users
```
Expected response:
```json
[
  {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "role": "ROLE_USER",
    "createdAt": "..."
  }
]
```

- [ ] Returns 200 status code
- [ ] Returns JSON array
- [ ] Contains user objects
- [ ] User objects have required fields

### List Clients Endpoint
```bash
curl http://localhost:3000/api/clients
```
Expected response:
```json
[
  {
    "id": 1,
    "name": "Client Name",
    "email": "client@example.com",
    "phone": "1234567890",
    "userId": 1,
    "companyId": 1,
    "companyName": "Company Name",
    "username": "user1"
  }
]
```

- [ ] Returns 200 status code
- [ ] Returns JSON array
- [ ] Contains client objects with relationships

---

## ✅ Feature Verification

### Email Validation
```bash
# Valid email (should succeed)
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -H "x-user: {\"id\":1,\"username\":\"admin\",\"email\":\"admin@example.com\",\"role\":\"ROLE_ADMIN\"}" \
  -d '{
    "name": "Test Client",
    "email": "valid@example.com",
    "phone": "1234567890",
    "userId": 1,
    "companyId": 2
  }'
```

- [ ] Returns 201 (Created)
- [ ] Client created successfully

### Invalid Email (should fail)
```bash
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -H "x-user: {\"id\":1,\"username\":\"admin\",\"email\":\"admin@example.com\",\"role\":\"ROLE_ADMIN\"}" \
  -d '{
    "name": "Test Client",
    "email": "invalid.email",
    "phone": "1234567890",
    "userId": 1,
    "companyId": 3
  }'
```

- [ ] Returns 400 (Bad Request)
- [ ] Error message mentions "Invalid email"

### Phone Validation
```bash
# Valid phone (numbers only)
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -H "x-user: {\"id\":1,\"username\":\"admin\",\"email\":\"admin@example.com\",\"role\":\"ROLE_ADMIN\"}" \
  -d '{
    "name": "Test Client 2",
    "email": "client2@example.com",
    "phone": "5551234567",
    "userId": 1,
    "companyId": 3
  }'
```

- [ ] Returns 201 (Created)
- [ ] Client created successfully

### Invalid Phone (should fail)
```bash
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -H "x-user: {\"id\":1,\"username\":\"admin\",\"email\":\"admin@example.com\",\"role\":\"ROLE_ADMIN\"}" \
  -d '{
    "name": "Test Client 3",
    "email": "client3@example.com",
    "phone": "555-123-4567",
    "userId": 1,
    "companyId": 4
  }'
```

- [ ] Returns 400 (Bad Request)
- [ ] Error message mentions "numbers"

### Role-Based Access Control
```bash
# ROLE_ADMIN should succeed
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -H "x-user: {\"id\":1,\"username\":\"admin\",\"email\":\"admin@example.com\",\"role\":\"ROLE_ADMIN\"}" \
  -d '{
    "name": "Admin Client",
    "email": "adminclient@example.com",
    "phone": "9999999999",
    "userId": 1,
    "companyId": 5
  }'
```

- [ ] Returns 201 (Created)
- [ ] ROLE_ADMIN can create clients

### ROLE_USER Should Fail
```bash
# ROLE_USER should be rejected
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -H "x-user: {\"id\":2,\"username\":\"user1\",\"email\":\"user1@example.com\",\"role\":\"ROLE_USER\"}" \
  -d '{
    "name": "User Client",
    "email": "userclient@example.com",
    "phone": "8888888888",
    "userId": 2,
    "companyId": 6
  }'
```

- [ ] Returns 403 (Forbidden)
- [ ] Error message mentions "Admin access required"

### Company Uniqueness
```bash
# Try to use same company twice (should fail on second attempt)
# First (succeeds)
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -H "x-user: {\"id\":1,\"username\":\"admin\",\"email\":\"admin@example.com\",\"role\":\"ROLE_ADMIN\"}" \
  -d '{
    "name": "First Client",
    "email": "first@example.com",
    "phone": "1111111111",
    "userId": 1,
    "companyId": 7
  }'

# Second (should fail)
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -H "x-user: {\"id\":1,\"username\":\"admin\",\"email\":\"admin@example.com\",\"role\":\"ROLE_ADMIN\"}" \
  -d '{
    "name": "Second Client",
    "email": "second@example.com",
    "phone": "2222222222",
    "userId": 1,
    "companyId": 7
  }'
```

- [ ] First request returns 201
- [ ] Second request returns 409 (Conflict)
- [ ] Error message mentions "already assigned"

### Client Update (PATCH)
```bash
curl -X PATCH http://localhost:3000/api/clients/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Client Name",
    "email": "updated@example.com"
  }'
```

- [ ] Returns 200 (OK)
- [ ] Client name updated
- [ ] Client email updated

### User Profile with Email Validation
```bash
curl http://localhost:3000/user/profile \
  -H "x-user: {\"id\":1,\"username\":\"admin\",\"email\":\"admin@example.com\",\"role\":\"ROLE_ADMIN\"}"
```

- [ ] Returns 200 (OK)
- [ ] Returns user profile
- [ ] Email is validated

---

## ✅ Testing Verification

### Run All Tests
```bash
npm test
```

Expected output should show:
```
PASS  tests/unit.test.ts
PASS  tests/integration.test.ts

Test Suites: 2 passed, 2 total
Tests:       35+ passed, 35+ total
```

- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] No test failures
- [ ] All 35+ tests pass

### Test Coverage
```bash
npm test -- --coverage
```

- [ ] Shows coverage report
- [ ] Includes: statements, branches, functions, lines
- [ ] Coverage for critical paths

### Specific Test Validation
Run tests and verify these scenarios work:

- [ ] Email validation tests pass
- [ ] Phone validation tests pass
- [ ] Database operation tests pass
- [ ] Company query tests pass
- [ ] Client creation tests pass
- [ ] Role-based access tests pass
- [ ] Error handling tests pass

---

## ✅ Database Verification

### Database File Created
```bash
ls -la data/app.db
# or on Windows:
dir data\app.db
```

- [ ] Database file exists
- [ ] File is not empty (> 0 bytes)

### Database Tables
Tables should be created:
- [ ] `users` table
- [ ] `companies` table
- [ ] `clients` table
- [ ] `client_users` table
- [ ] `company_users` table

---

## ✅ Documentation Verification

### Check All Documentation Files Exist
- [ ] `README.md` - Project overview
- [ ] `SETUP.md` - Setup instructions
- [ ] `QUICK_REFERENCE.md` - Quick reference
- [ ] `IMPLEMENTATION_SUMMARY.md` - What was built
- [ ] `INDEX.md` - Documentation index
- [ ] `docs/API_DOCUMENTATION.md` - Full API docs
- [ ] `docs/EXAMPLE_REQUESTS.md` - Example requests
- [ ] `docs/TROUBLESHOOTING.md` - Troubleshooting guide

### Verify Documentation Content
- [ ] README.md has setup instructions
- [ ] API_DOCUMENTATION.md covers all 7 endpoints
- [ ] EXAMPLE_REQUESTS.md has working curl examples
- [ ] TROUBLESHOOTING.md covers common issues

---

## ✅ Code Structure Verification

### Check Source Files
```
src/
├── app.ts                          [ ]
├── controllers/
│   ├── userController.ts           [ ]
│   └── clientController.ts         [ ]
├── routes/
│   ├── userRoutes.ts               [ ]
│   └── clientRoutes.ts             [ ]
├── middleware/
│   └── auth.ts                     [ ]
├── database/
│   └── connection.ts               [ ]
├── queries/
│   └── customQueries.ts            [ ]
└── utils/
    └── validators.ts               [ ]
```

- [ ] All files exist
- [ ] No TypeScript compilation errors

### Check Test Files
- [ ] `tests/unit.test.ts` exists and has tests
- [ ] `tests/integration.test.ts` exists and has tests
- [ ] Tests are properly organized
- [ ] Test setup and teardown work

### Check Configuration Files
- [ ] `package.json` exists with all dependencies
- [ ] `tsconfig.json` exists
- [ ] `jest.config.js` exists
- [ ] `.env` file exists
- [ ] `.gitignore` file exists

---

## ✅ Environment Verification

### Check Node/npm Versions
```bash
node --version
npm --version
```

- [ ] Node version is 14 or higher
- [ ] npm version is 6 or higher

### Check Dependencies
```bash
npm list express sqlite3 typescript
```

- [ ] express is installed
- [ ] sqlite3 is installed
- [ ] typescript is installed

---

## ✅ Final Checklist

### Complete Setup ✓
- [ ] npm install completed successfully
- [ ] npm run build completed successfully
- [ ] npm run dev starts without errors

### API Working ✓
- [ ] Health check endpoint works
- [ ] User list endpoint works
- [ ] Client list endpoint works

### Features Verified ✓
- [ ] Email validation working
- [ ] Phone validation working
- [ ] Role-based access control working
- [ ] Company uniqueness enforced
- [ ] Client CRUD operations working

### Testing Complete ✓
- [ ] All 35+ tests pass
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Test coverage acceptable

### Documentation Complete ✓
- [ ] All 8 documentation files exist
- [ ] Documentation is comprehensive
- [ ] Examples are clear and working
- [ ] Setup instructions are clear

### Code Quality ✓
- [ ] No TypeScript errors
- [ ] Code is organized
- [ ] Comments are present
- [ ] Error handling implemented

---

## 📊 Verification Summary

Use this table to track your verification progress:

| Category | Status | Notes |
|----------|--------|-------|
| Installation | ✓ / ✗ | Dependencies installed? |
| Build | ✓ / ✗ | TypeScript builds? |
| Server | ✓ / ✗ | Server runs? |
| API Endpoints | ✓ / ✗ | All endpoints working? |
| Validation | ✓ / ✗ | Email/phone validation? |
| Security | ✓ / ✗ | Role-based access? |
| Database | ✓ / ✗ | Tables created? |
| Tests | ✓ / ✗ | All tests passing? |
| Documentation | ✓ / ✓ | All files present? |
| Code Quality | ✓ / ✗ | No errors? |

---

## 🎯 Success Criteria

✅ **Application is successfully installed and verified when:**

1. `npm run dev` starts without errors
2. `curl http://localhost:3000/health` returns OK
3. All API endpoints return expected responses
4. All 35+ tests pass
5. All 8 documentation files exist and are comprehensive
6. Email and phone validation work correctly
7. Role-based access control is enforced
8. Database tables are created
9. No TypeScript compilation errors
10. Project structure is clean and organized

---

## 🚀 Next Steps After Verification

Once all checks pass:

1. **Explore the API**
   - Use curl commands from `docs/EXAMPLE_REQUESTS.md`
   - Test all endpoints
   - Try different scenarios

2. **Review the Code**
   - Read `IMPLEMENTATION_SUMMARY.md`
   - Look at `src/controllers/` for endpoint logic
   - Review `src/database/connection.ts` for schema
   - Check `tests/` for usage patterns

3. **Modify if Needed**
   - Update endpoints in `src/controllers/`
   - Add new routes in `src/routes/`
   - Modify database in `src/database/`
   - Run `npm test` to verify changes

4. **Deploy**
   - Build with `npm run build`
   - Use environment variables for production
   - Run on production server
   - Monitor logs and performance

---

**Verification Complete!** 🎉

If all checks pass, your Entity Application is ready to use.

For any issues, consult `docs/TROUBLESHOOTING.md`

Last Updated: January 2024
