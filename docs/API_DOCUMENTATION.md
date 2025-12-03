# Entity Application API Documentation

## Overview

The Entity Application is a secure RESTful API built with Node.js and SQLite3 that manages Users, Clients, and Companies. The API provides comprehensive endpoints for creating, reading, updating, and deleting entities, with role-based access control and data validation.

## Table of Contents

1. [Setup and Installation](#setup-and-installation)
2. [Environment Configuration](#environment-configuration)
3. [Database Schema](#database-schema)
4. [API Endpoints](#api-endpoints)
5. [Authentication](#authentication)
6. [Error Handling](#error-handling)
7. [Examples](#examples)
8. [Testing](#testing)

---

## Setup and Installation

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation Steps

1. **Clone or extract the project:**
   ```bash
   cd Entity\ Application
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create necessary directories:**
   ```bash
   mkdir -p data
   ```

4. **Configure environment variables:**
   Create a `.env` file in the root directory (see [Environment Configuration](#environment-configuration))

5. **Build TypeScript:**
   ```bash
   npm run build
   ```

6. **Start the server:**
   ```bash
   npm start
   ```

   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

### Verification

Check if the server is running:
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

---

## Environment Configuration

Create a `.env` file in the project root with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DATABASE_PATH=./data/app.db
```

### Configuration Details

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 3000 | Port number for the API server |
| NODE_ENV | development | Environment mode (development/production) |
| DATABASE_PATH | ./data/app.db | Path to SQLite database file |

---

## Database Schema

### Users Table

Stores user account information with role-based access control.

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'ROLE_USER' CHECK(role IN ('ROLE_USER', 'ROLE_ADMIN')),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  deletedAt DATETIME
)
```

**Fields:**
- `id`: Unique identifier
- `username`: Unique username
- `email`: Unique email address
- `password`: User password (should be hashed in production)
- `role`: User role (ROLE_USER or ROLE_ADMIN)
- `createdAt`: Account creation timestamp
- `updatedAt`: Last update timestamp
- `deletedAt`: Soft delete timestamp (NULL if not deleted)

### Companies Table

Stores company information with support for company relationships.

```sql
CREATE TABLE companies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  industry TEXT NOT NULL,
  employees INTEGER NOT NULL,
  revenue REAL NOT NULL,
  relatedCompanyId INTEGER,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  deletedAt DATETIME,
  FOREIGN KEY (relatedCompanyId) REFERENCES companies(id)
)
```

**Fields:**
- `id`: Unique identifier
- `name`: Company name
- `industry`: Industry sector
- `employees`: Number of employees
- `revenue`: Annual revenue
- `relatedCompanyId`: Optional reference to a related company
- `createdAt`: Record creation timestamp
- `updatedAt`: Last update timestamp
- `deletedAt`: Soft delete timestamp

### Clients Table

Stores client information with relationships to Users and Companies.

```sql
CREATE TABLE clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  userId INTEGER NOT NULL,
  companyId INTEGER NOT NULL UNIQUE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  deletedAt DATETIME,
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (companyId) REFERENCES companies(id)
)
```

**Fields:**
- `id`: Unique identifier
- `name`: Client name
- `email`: Client email (validated with regex)
- `phone`: Client phone number (numbers only)
- `userId`: Reference to User
- `companyId`: Unique reference to Company (one-to-one relationship)
- `createdAt`: Record creation timestamp
- `updatedAt`: Last update timestamp
- `deletedAt`: Soft delete timestamp

### ClientUsers Table (Junction Table)

Many-to-many relationship between Clients and Users.

```sql
CREATE TABLE client_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clientId INTEGER NOT NULL,
  userId INTEGER NOT NULL,
  active BOOLEAN DEFAULT 1,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  deletedAt DATETIME,
  UNIQUE(clientId, userId),
  FOREIGN KEY (clientId) REFERENCES clients(id),
  FOREIGN KEY (userId) REFERENCES users(id)
)
```

### CompanyUsers Table (Junction Table)

Many-to-many relationship between Companies and Users (inverse side for Companies).

```sql
CREATE TABLE company_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  companyId INTEGER NOT NULL,
  userId INTEGER NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(companyId, userId),
  FOREIGN KEY (companyId) REFERENCES companies(id),
  FOREIGN KEY (userId) REFERENCES users(id)
)
```

---

## API Endpoints

### User Management

#### 1. List Users

**GET** `/api/users`

List all active users with optional filtering.

**Query Parameters:**
- `username` (optional): Filter users by username (partial match)

**Response:**
```json
[
  {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "ROLE_ADMIN",
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

**Status Codes:**
- `200 OK`: Successfully retrieved users
- `500 Internal Server Error`: Database error

**Example:**
```bash
# List all users
curl http://localhost:3000/api/users

# Filter by username
curl http://localhost:3000/api/users?username=john
```

---

#### 2. Replace User

**PUT** `/api/users/:id`

Replace all fields of a user (complete user object replacement).

**Path Parameters:**
- `id` (required): User ID

**Request Body:**
```json
{
  "username": "new_username",
  "email": "newemail@example.com",
  "password": "newpassword123",
  "role": "ROLE_ADMIN"
}
```

**Response:**
```json
{
  "message": "User replaced successfully",
  "user": {
    "id": 1,
    "username": "new_username",
    "email": "newemail@example.com",
    "role": "ROLE_ADMIN",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T12:00:00Z"
  }
}
```

**Status Codes:**
- `200 OK`: Successfully updated user
- `400 Bad Request`: Missing required fields or invalid data
- `404 Not Found`: User not found
- `409 Conflict`: Username or email already exists
- `500 Internal Server Error`: Database error

**Validation Rules:**
- `username`: Required, unique
- `email`: Required, unique, must be valid format
- `password`: Required
- `role`: Required, must be 'ROLE_USER' or 'ROLE_ADMIN'

**Example:**
```bash
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{
    "username": "updated_user",
    "email": "updated@example.com",
    "password": "newpass123",
    "role": "ROLE_ADMIN"
  }'
```

---

#### 3. Get User Profile

**GET** `/user/profile`

Get the authenticated user's profile with email validation.

**Headers:**
- `x-user` (required): JSON string containing user object
  ```json
  {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "ROLE_ADMIN"
  }
  ```

**Response:**
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "role": "ROLE_ADMIN",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T12:00:00Z"
}
```

**Status Codes:**
- `200 OK`: Successfully retrieved profile
- `400 Bad Request`: Invalid email format
- `401 Unauthorized`: Not authenticated or invalid user header
- `404 Not Found`: User not found
- `500 Internal Server Error`: Database error

**Example:**
```bash
curl http://localhost:3000/user/profile \
  -H "x-user: {\"id\":1,\"username\":\"john_doe\",\"email\":\"john@example.com\",\"role\":\"ROLE_ADMIN\"}"
```

---

### Client Management

#### 4. Create Client

**POST** `/api/clients`

Create a new client. **Requires ROLE_ADMIN.**

**Headers:**
- `x-user` (required): JSON string with user object containing ROLE_ADMIN role

**Request Body:**
```json
{
  "name": "Acme Corporation",
  "email": "contact@acmecorp.com",
  "phone": "5551234567",
  "userId": 1,
  "companyId": 5
}
```

**Response:**
```json
{
  "message": "Client created successfully",
  "client": {
    "id": 1,
    "name": "Acme Corporation",
    "email": "contact@acmecorp.com",
    "phone": "5551234567",
    "userId": 1,
    "companyId": 5,
    "companyName": "Acme Inc",
    "username": "admin"
  }
}
```

**Status Codes:**
- `201 Created`: Client created successfully
- `400 Bad Request`: Invalid data or validation failure
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: User is not ROLE_ADMIN
- `404 Not Found`: User or Company not found
- `409 Conflict`: Company already assigned to another client
- `500 Internal Server Error`: Database error

**Validation Rules:**
- `name`: Required, non-empty string
- `email`: Required, must match email regex pattern
- `phone`: Required, must contain only numeric digits
- `userId`: Required, must reference existing active user
- `companyId`: Required, must reference existing active company

**Email Regex:** `^[^\s@]+@[^\s@]+\.[^\s@]+$`

**Phone Regex:** `^\d+$`

**Example:**
```bash
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -H "x-user: {\"id\":1,\"username\":\"admin\",\"email\":\"admin@example.com\",\"role\":\"ROLE_ADMIN\"}" \
  -d '{
    "name": "New Client",
    "email": "newclient@example.com",
    "phone": "1234567890",
    "userId": 1,
    "companyId": 5
  }'
```

---

#### 5. Update Client

**PATCH** `/api/clients/:id`

Update one or more fields of a client (partial update).

**Path Parameters:**
- `id` (required): Client ID

**Request Body:** (all fields optional, include only fields to update)
```json
{
  "name": "Updated Client Name",
  "email": "updated@example.com",
  "phone": "9876543210"
}
```

**Response:**
```json
{
  "message": "Client updated successfully",
  "client": {
    "id": 1,
    "name": "Updated Client Name",
    "email": "updated@example.com",
    "phone": "9876543210",
    "userId": 1,
    "companyId": 5,
    "companyName": "Acme Inc",
    "username": "admin"
  }
}
```

**Status Codes:**
- `200 OK`: Client updated successfully
- `400 Bad Request`: Invalid data or no fields to update
- `404 Not Found`: Client, User, or Company not found
- `409 Conflict`: Company already assigned to another client
- `500 Internal Server Error`: Database error

**Validation Rules:**
- Fields follow same validation as create endpoint
- At least one field must be provided for update

**Example:**
```bash
curl -X PATCH http://localhost:3000/api/clients/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "phone": "9999999999"
  }'
```

---

#### 6. List Clients

**GET** `/api/clients`

List all active clients with their associated company and user information.

**Response:**
```json
[
  {
    "id": 1,
    "name": "Client A",
    "email": "clienta@example.com",
    "phone": "1234567890",
    "userId": 1,
    "companyId": 5,
    "companyName": "Company A",
    "username": "admin"
  }
]
```

**Status Codes:**
- `200 OK`: Successfully retrieved clients
- `500 Internal Server Error`: Database error

**Example:**
```bash
curl http://localhost:3000/api/clients
```

---

#### 7. Get Client

**GET** `/api/clients/:id`

Get a specific client's details.

**Path Parameters:**
- `id` (required): Client ID

**Response:**
```json
{
  "id": 1,
  "name": "Client A",
  "email": "clienta@example.com",
  "phone": "1234567890",
  "userId": 1,
  "companyId": 5,
  "companyName": "Company A",
  "username": "admin",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T12:00:00Z"
}
```

**Status Codes:**
- `200 OK`: Successfully retrieved client
- `404 Not Found`: Client not found
- `500 Internal Server Error`: Database error

**Example:**
```bash
curl http://localhost:3000/api/clients/1
```

---

## Authentication

### Authentication Method

The API uses a header-based authentication system for testing purposes. In production, this should be replaced with JWT tokens.

### Authentication Header

Include the `x-user` header with a JSON-encoded user object:

```bash
-H "x-user: {\"id\":1,\"username\":\"admin\",\"email\":\"admin@example.com\",\"role\":\"ROLE_ADMIN\"}"
```

### User Object Format

```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@example.com",
  "role": "ROLE_ADMIN"
}
```

### Role-Based Access Control

- **ROLE_USER**: Regular user permissions
  - Can read user and client data
  - Cannot create clients

- **ROLE_ADMIN**: Administrator permissions
  - Can read all data
  - Can create clients
  - Can manage users and clients

---

## Error Handling

### Standard Error Response Format

```json
{
  "error": "Description of the error"
}
```

### Common HTTP Status Codes

| Status | Code | Description |
|--------|------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource successfully created |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource conflict (duplicate) |
| 500 | Internal Server Error | Server-side error |

### Validation Error Examples

**Missing Required Fields:**
```json
{
  "error": "Missing required fields: name, email, phone, userId, companyId"
}
```

**Invalid Email Format:**
```json
{
  "error": "Invalid email format"
}
```

**Invalid Phone Format:**
```json
{
  "error": "Phone must contain only numbers"
}
```

**Duplicate Company:**
```json
{
  "error": "Company is already assigned to another client"
}
```

---

## Examples

### Complete Workflow Example

#### 1. Create a User
```bash
# Note: Direct user creation not exposed via API
# Users should be created through an admin interface
```

#### 2. Create a Company
```bash
# Company creation endpoint not exposed in this API version
# Should be created through admin interface
```

#### 3. List Users
```bash
curl http://localhost:3000/api/users
```

#### 4. Create a Client (as Admin)
```bash
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -H "x-user: {\"id\":1,\"username\":\"admin\",\"email\":\"admin@example.com\",\"role\":\"ROLE_ADMIN\"}" \
  -d '{
    "name": "TechStartup Inc",
    "email": "contact@techstartup.com",
    "phone": "5551234567",
    "userId": 1,
    "companyId": 10
  }'
```

#### 5. Get Client Details
```bash
curl http://localhost:3000/api/clients/1
```

#### 6. Update Client
```bash
curl -X PATCH http://localhost:3000/api/clients/1 \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newemail@techstartup.com",
    "phone": "5559876543"
  }'
```

#### 7. Get User Profile
```bash
curl http://localhost:3000/user/profile \
  -H "x-user: {\"id\":1,\"username\":\"admin\",\"email\":\"admin@example.com\",\"role\":\"ROLE_ADMIN\"}"
```

---

## Testing

### Running Unit Tests

```bash
npm test
```

### Running Specific Tests

```bash
npm test -- tests/unit.test.ts
npm test -- tests/integration.test.ts
```

### Test Coverage

```bash
npm test -- --coverage
```

### Test Files

- `tests/unit.test.ts`: Database operations, validators, queries
- `tests/integration.test.ts`: API endpoint integration tests

### Key Tests

1. **Email and Phone Validation**
   - Valid email patterns
   - Valid phone patterns (numbers only)
   - Invalid format rejection

2. **User Management**
   - User listing with filtering
   - User complete replacement
   - Unique constraint validation

3. **Client Management**
   - Client creation with ROLE_ADMIN requirement
   - Client field updates
   - Duplicate company prevention
   - Email and phone validation

4. **Role-Based Access Control**
   - ROLE_ADMIN can create clients
   - ROLE_USER cannot create clients
   - ROLE_USER cannot create other users

5. **Custom Queries**
   - Companies by employee range
   - Clients by user
   - Clients by company name
   - Max revenue by industry

---

## Database Seeding (Optional)

To seed initial data for testing, you can run:

```sql
-- Insert test users
INSERT INTO users (username, email, password, role) VALUES
  ('admin', 'admin@example.com', 'adminpass', 'ROLE_ADMIN'),
  ('user1', 'user1@example.com', 'userpass', 'ROLE_USER');

-- Insert test companies
INSERT INTO companies (name, industry, employees, revenue) VALUES
  ('TechCorp', 'Technology', 5000, 1000000000),
  ('FinanceInc', 'Finance', 3000, 500000000),
  ('RetailCo', 'Retail', 250000, 50000000);

-- Insert test clients
INSERT INTO clients (name, email, phone, userId, companyId) VALUES
  ('Client1', 'client1@example.com', '1234567890', 1, 1),
  ('Client2', 'client2@example.com', '9876543210', 1, 2);
```

---

## Dependencies

### Core Dependencies

- **express**: Web framework
- **sqlite3**: Database
- **cors**: CORS middleware
- **dotenv**: Environment variables

### Development Dependencies

- **typescript**: TypeScript compiler
- **ts-node**: TypeScript runtime
- **jest**: Testing framework
- **ts-jest**: TypeScript support for Jest
- **supertest**: HTTP testing library

---

## Project Structure

```
Entity Application/
├── src/
│   ├── app.ts                 # Main application file
│   ├── controllers/           # Request handlers
│   │   ├── userController.ts
│   │   └── clientController.ts
│   ├── routes/               # API routes
│   │   ├── userRoutes.ts
│   │   └── clientRoutes.ts
│   ├── middleware/           # Custom middleware
│   │   └── auth.ts          # Authentication & authorization
│   ├── database/            # Database configuration
│   │   └── connection.ts
│   ├── queries/             # Custom SQL queries
│   │   └── customQueries.ts
│   └── utils/               # Utility functions
│       └── validators.ts
├── tests/                    # Test files
│   ├── unit.test.ts
│   └── integration.test.ts
├── docs/                     # Documentation
├── dist/                     # Compiled JavaScript
├── data/                     # SQLite database
├── package.json
├── tsconfig.json
├── jest.config.js
└── .env
```

---

## Support and Troubleshooting

### Issue: Database not found
**Solution**: Ensure the `data/` directory exists and DATABASE_PATH is correct in `.env`

### Issue: Port already in use
**Solution**: Change PORT in `.env` or kill the process using that port

### Issue: Module not found errors
**Solution**: Run `npm install` to install all dependencies

### Issue: TypeScript compilation errors
**Solution**: Run `npm run build` to check for TypeScript errors

---

## License

This project is provided as-is for educational and development purposes.

