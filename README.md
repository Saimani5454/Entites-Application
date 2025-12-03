# Entity Application - RESTful API

A comprehensive RESTful API for managing Users, Clients, and Companies using Node.js and SQLite3, featuring secure endpoints, custom queries, role-based access control, and complete test coverage.

## 🚀 Quick Start

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build TypeScript:**
   ```bash
   npm run build
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

   Or for development:
   ```bash
   npm run dev
   ```

4. **Verify the server:**
   ```bash
   curl http://localhost:3000/health
   ```

## ✨ Features

### Core Features
- ✅ User management with role-based access control (ROLE_USER, ROLE_ADMIN)
- ✅ Client management with validation (email regex, phone numbers)
- ✅ Company management with relationships
- ✅ Secure endpoints with authentication and authorization
- ✅ Custom SQL queries for advanced filtering and aggregation
- ✅ Soft delete support (deletedAt field)
- ✅ Complete error handling and validation

### Security Features
- ✅ Role-based access control (RBAC)
- ✅ Email validation using regex
- ✅ Phone number validation (numbers only)
- ✅ Unique constraint enforcement
- ✅ Input validation and sanitization

### Testing & Quality
- ✅ Unit tests for validators and database operations
- ✅ Integration tests for API endpoints
- ✅ Test coverage for all critical functionality
- ✅ Jest configuration with TypeScript support

### Documentation
- ✅ Comprehensive API documentation
- ✅ Database schema documentation
- ✅ Setup instructions and examples
- ✅ Error handling guide

## 📋 Requirements Fulfillment

### 1. Entity Creation ✅
- **Client Entity**: name, email, phone (with validation), user relationship, company relationship
- **ClientUsers Entity**: client, users relationships, timestamps (createdAt, updatedAt, deletedAt), active flag
- **Company Entity**: relatedCompany field, inverse users relationship

### 2. API Endpoints ✅
- `GET /api/users` - List users with optional username filter
- `PUT /api/users/:id` - Replace entire user object
- `POST /api/clients` - Create client (ROLE_ADMIN only)
- `PATCH /api/clients/:id` - Partial client update
- `GET /api/clients` - List all clients
- `GET /api/clients/:id` - Get specific client
- `GET /user/profile` - Get user profile with email validation

### 3. Custom Queries ✅
- Companies by employee range
- Search clients by user
- Search clients by company name
- Max revenue by industry
- Count companies by minimum employees

### 4. Security ✅
- Role-based access control on `/api/clients` POST endpoint
- Email validation (regex) on profile endpoint
- Phone validation (numbers only) on client creation
- Unique company assignment constraint

### 5. Testing ✅
- Only 1 company with 200,000+ employees
- ROLE_USER cannot create users
- Clients can be created correctly
- Max revenue query contains Amazon/Google, excludes other E-commerce

### 6. Documentation ✅
- Complete API documentation with examples
- Setup instructions
- Database schema diagrams
- Error handling guide

## 📁 Project Structure

```
Entity Application/
├── src/
│   ├── app.ts                          # Main application
│   ├── controllers/
│   │   ├── userController.ts          # User endpoints
│   │   └── clientController.ts        # Client endpoints
│   ├── routes/
│   │   ├── userRoutes.ts
│   │   └── clientRoutes.ts
│   ├── middleware/
│   │   └── auth.ts                    # Authentication & authorization
│   ├── database/
│   │   └── connection.ts              # Database setup & queries
│   ├── queries/
│   │   └── customQueries.ts           # Custom SQL queries
│   └── utils/
│       └── validators.ts              # Email/phone validation
├── tests/
│   ├── unit.test.ts                   # Unit tests
│   └── integration.test.ts            # Integration tests
├── docs/
│   └── API_DOCUMENTATION.md           # Full API documentation
├── package.json
├── tsconfig.json
├── jest.config.js
├── .env
└── .gitignore
```

## 🔧 Configuration

### Environment Variables (`.env`)

```env
PORT=3000
NODE_ENV=development
DATABASE_PATH=./data/app.db
```

## 📚 API Endpoints

### Users
- `GET /api/users` - List users
- `GET /api/users?username=search` - Search users by username
- `PUT /api/users/:id` - Replace user
- `GET /user/profile` - Get authenticated user profile

### Clients
- `POST /api/clients` - Create client (ROLE_ADMIN)
- `GET /api/clients` - List clients
- `GET /api/clients/:id` - Get client details
- `PATCH /api/clients/:id` - Update client

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Run Specific Test Suite
```bash
npm test -- tests/unit.test.ts
npm test -- tests/integration.test.ts
```

### Run Tests with Coverage
```bash
npm test -- --coverage
```

### Test Coverage Includes
- ✅ Email/phone validation
- ✅ User CRUD operations
- ✅ Client management
- ✅ Role-based access control
- ✅ Custom query functionality
- ✅ Error handling

## 🔐 Authentication

The API uses header-based authentication for testing:

```bash
curl http://localhost:3000/api/users \
  -H "x-user: {\"id\":1,\"username\":\"admin\",\"email\":\"admin@example.com\",\"role\":\"ROLE_ADMIN\"}"
```

For protected endpoints:
- Include `x-user` header with user JSON object
- User must have appropriate role (ROLE_ADMIN for client creation)

## 📖 Validation Rules

### Email
- Pattern: `^[^\s@]+@[^\s@]+\.[^\s@]+$`
- Examples: ✅ user@example.com, ❌ invalid-email

### Phone
- Pattern: `^\d+$` (numbers only)
- Examples: ✅ 1234567890, ❌ 123-456-7890

### User Roles
- `ROLE_USER` - Regular user
- `ROLE_ADMIN` - Administrator

## 🛠 Development

### Build TypeScript
```bash
npm run build
```

### Start Development Server
```bash
npm run dev
```

### Code Quality
- TypeScript strict mode disabled for flexibility
- ESLint ready for configuration
- Organized project structure

## 📝 Database

### Schema
- **users**: User accounts with roles
- **companies**: Company information with relationships
- **clients**: Clients linked to users and companies
- **client_users**: Many-to-many relationship (junction table)
- **company_users**: Company-to-users relationship

### Features
- Soft delete support (deletedAt field)
- Timestamp tracking (createdAt, updatedAt)
- Foreign key relationships
- Unique constraints
- CHECK constraints for roles

## 🚨 Error Handling

Standard error responses:
```json
{
  "error": "Description of the error"
}
```

Status codes:
- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Duplicate resource
- `500 Internal Server Error` - Server error

## 📄 Documentation

See `docs/API_DOCUMENTATION.md` for:
- Complete API endpoint documentation
- Request/response examples
- Parameter descriptions
- Validation rules
- Authentication details
- Error codes
- Complete workflow examples

## 🎯 Key Features Implemented

1. **Complete Entity Management**
   - All required fields and relationships
   - Proper validation
   - Soft delete support

2. **Secure API**
   - Role-based access control
   - Email and phone validation
   - Unique constraint enforcement
   - Input validation

3. **Advanced Queries**
   - Employee range filtering
   - Company name search
   - User-based client search
   - Max revenue by industry
   - Aggregation queries

4. **Comprehensive Testing**
   - 20+ unit tests
   - 15+ integration tests
   - Error scenario coverage
   - All critical paths tested

5. **Professional Documentation**
   - Setup instructions
   - API reference
   - Database schema
   - Usage examples
   - Troubleshooting guide

## 🐛 Troubleshooting

### Port Already in Use
Change `PORT` in `.env` or kill the process using the port

### Database Not Found
Ensure `data/` directory exists; it's created automatically on first run

### Module Not Found
Run `npm install` to install all dependencies

### TypeScript Errors
Run `npm run build` to compile and check for errors

## 📦 Dependencies

### Production
- express (4.18.2)
- sqlite3 (5.1.6)
- cors (2.8.5)
- dotenv (16.0.3)

### Development
- typescript (5.0.2)
- jest (29.5.0)
- ts-jest (29.1.0)
- supertest (6.3.3)

## 📋 Assignment Checklist

- ✅ 1.1 Client Entity with name, User, Company, email (regex), phone (regex)
- ✅ 1.2 ClientUsers Entity with relationships and timestamps
- ✅ 1.3 Company Entity with relatedCompany and users relationship
- ✅ 2.1 GET /api/users with username filter
- ✅ 2.2 PUT /api/users/:id for complete replacement
- ✅ 2.3 POST /api/clients with company uniqueness validation
- ✅ 2.4 PATCH /api/clients/:id for partial updates
- ✅ 3.1 Companies by employee range query
- ✅ 3.2 Search clients by user and company name
- ✅ 3.3 Max revenue by industry SQL query
- ✅ 4.1 ROLE_ADMIN restriction on client creation
- ✅ 5.1 Email regex validation
- ✅ 6.1 Unit/functional tests for all requirements
- ✅ 7.1 Comprehensive API documentation

## 📞 Support

For issues or questions:
1. Check the API_DOCUMENTATION.md file
2. Review test files for usage examples
3. Check error messages for validation details

---

**Built with TypeScript, Node.js, Express, and SQLite3**
