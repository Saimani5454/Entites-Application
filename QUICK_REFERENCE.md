# Entity Application - Quick Reference Card

## 🚀 Start Server
```bash
npm install
npm run dev
# Server runs on http://localhost:3000
```

## ✅ Verify Installation
```bash
curl http://localhost:3000/health
```

## 🧪 Run Tests
```bash
npm test
npm test -- --coverage
```

---

## 📚 API Endpoints

### Users
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/users` | - | List all users |
| GET | `/api/users?username=X` | - | Filter users |
| PUT | `/api/users/:id` | - | Replace user |
| GET | `/user/profile` | ✓ | Get profile |

### Clients
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/clients` | - | List clients |
| GET | `/api/clients/:id` | - | Get client |
| POST | `/api/clients` | ✓ ADMIN | Create client |
| PATCH | `/api/clients/:id` | - | Update client |

---

## 🔐 Authentication Header
```bash
-H "x-user: {\"id\":1,\"username\":\"admin\",\"email\":\"admin@example.com\",\"role\":\"ROLE_ADMIN\"}"
```

---

## 📝 Common Requests

### List Users
```bash
curl http://localhost:3000/api/users
```

### Create Client (Admin Only)
```bash
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -H "x-user: {\"id\":1,\"username\":\"admin\",\"email\":\"admin@example.com\",\"role\":\"ROLE_ADMIN\"}" \
  -d '{
    "name": "Client Name",
    "email": "client@example.com",
    "phone": "1234567890",
    "userId": 1,
    "companyId": 1
  }'
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

---

## ✔️ Validation Rules

| Field | Rule | Example |
|-------|------|---------|
| Email | `user@domain.com` | ✅ john@example.com |
| Phone | Numbers only | ✅ 1234567890 |
| Role | ROLE_USER \| ROLE_ADMIN | ✅ ROLE_ADMIN |
| Username | Unique | ✅ new_user |

---

## 🔴 Status Codes

| Code | Meaning | Common Cause |
|------|---------|-------------|
| 200 | Success | Request successful |
| 201 | Created | Resource created |
| 400 | Bad Request | Invalid data/validation |
| 401 | Unauthorized | No x-user header |
| 403 | Forbidden | Need ROLE_ADMIN |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate company/username |
| 500 | Server Error | Database/server issue |

---

## 🛠️ Configuration (.env)

```env
PORT=3000
NODE_ENV=development
DATABASE_PATH=./data/app.db
```

---

## 📁 Important Files

| File | Purpose |
|------|---------|
| `docs/API_DOCUMENTATION.md` | Full API reference |
| `SETUP.md` | Setup instructions |
| `EXAMPLE_REQUESTS.md` | Example curl commands |
| `TROUBLESHOOTING.md` | Problem solving |
| `README.md` | Project overview |

---

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| Port 3000 in use | Change PORT in .env |
| Module not found | Run npm install |
| Database error | Delete data/app.db and restart |
| 401 Unauthorized | Add x-user header |
| 403 Forbidden | Use ROLE_ADMIN user |
| Invalid email | Use user@example.com format |
| Invalid phone | Use numbers only |

---

## 🔍 Test Endpoints

```bash
# Health check
curl http://localhost:3000/health

# List users
curl http://localhost:3000/api/users

# List clients
curl http://localhost:3000/api/clients
```

---

## 📊 Database Tables

| Table | Key Fields |
|-------|-----------|
| users | id, username, email, role |
| companies | id, name, industry, employees |
| clients | id, name, email, phone |
| client_users | clientId, userId, active |
| company_users | companyId, userId |

---

## 🎯 Features Implemented

✅ User Management (list, replace)  
✅ Client Management (CRUD)  
✅ Company Relationships  
✅ Role-Based Access Control  
✅ Email/Phone Validation  
✅ Custom SQL Queries  
✅ Comprehensive Tests  
✅ Complete Documentation  

---

## 📖 Documentation Files

1. **API_DOCUMENTATION.md** - 600+ lines, all endpoints
2. **SETUP.md** - Setup guide with examples
3. **EXAMPLE_REQUESTS.md** - 250+ lines of examples
4. **TROUBLESHOOTING.md** - Problem solving guide
5. **IMPLEMENTATION_SUMMARY.md** - What was built
6. **README.md** - Project overview

---

## 🚨 Important Notes

- Each company can be assigned to only ONE client
- Emails must be unique and valid format
- Phones must be numeric only
- Only ROLE_ADMIN can create clients
- User roles are: ROLE_USER, ROLE_ADMIN
- All responses include appropriate status codes

---

## 📞 Quick Help

**Getting Started:**
1. `npm install` - Install dependencies
2. `npm run dev` - Start server
3. `curl http://localhost:3000/health` - Test

**Testing:**
1. `npm test` - Run all tests
2. `npm test -- --coverage` - See coverage

**Debugging:**
1. Check `docs/TROUBLESHOOTING.md`
2. Review `docs/EXAMPLE_REQUESTS.md`
3. Look at test files for patterns

---

**Full documentation available in `docs/` folder**

For detailed information: See `README.md` and `docs/API_DOCUMENTATION.md`
