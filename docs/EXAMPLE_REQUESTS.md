/**
 * Example API Requests
 * 
 * Copy and paste these curl commands to test the API
 * Make sure the server is running on http://localhost:3000
 */

// ==========================================
// HEALTH CHECK
// ==========================================

// Check if server is running
// Status: 200
curl http://localhost:3000/health


// ==========================================
// USER ENDPOINTS
// ==========================================

// 1. List all users
// Status: 200
curl http://localhost:3000/api/users

// 2. List users with username filter
// Status: 200
curl "http://localhost:3000/api/users?username=admin"

// 3. Replace entire user object
// Status: 200
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newadmin",
    "email": "newadmin@example.com",
    "password": "newpassword123",
    "role": "ROLE_ADMIN"
  }'

// 4. Get user profile (requires authentication)
// Status: 200
curl http://localhost:3000/user/profile \
  -H "x-user: {\"id\":1,\"username\":\"admin\",\"email\":\"admin@example.com\",\"role\":\"ROLE_ADMIN\"}"

// 5. Get user profile without authentication
// Status: 401 (Unauthorized)
curl http://localhost:3000/user/profile


// ==========================================
// CLIENT ENDPOINTS
// ==========================================

// 1. List all clients
// Status: 200
curl http://localhost:3000/api/clients

// 2. Get specific client
// Status: 200
curl http://localhost:3000/api/clients/1

// 3. Create client (requires ROLE_ADMIN)
// Status: 201
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -H "x-user: {\"id\":1,\"username\":\"admin\",\"email\":\"admin@example.com\",\"role\":\"ROLE_ADMIN\"}" \
  -d '{
    "name": "New Tech Client",
    "email": "newtechclient@example.com",
    "phone": "5551234567",
    "userId": 1,
    "companyId": 1
  }'

// 4. Create client with invalid email
// Status: 400 (Bad Request)
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -H "x-user: {\"id\":1,\"username\":\"admin\",\"email\":\"admin@example.com\",\"role\":\"ROLE_ADMIN\"}" \
  -d '{
    "name": "Invalid Email Client",
    "email": "invalid-email",
    "phone": "5551234567",
    "userId": 1,
    "companyId": 2
  }'

// 5. Create client with invalid phone
// Status: 400 (Bad Request)
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -H "x-user: {\"id\":1,\"username\":\"admin\",\"email\":\"admin@example.com\",\"role\":\"ROLE_ADMIN\"}" \
  -d '{
    "name": "Invalid Phone Client",
    "email": "validclient@example.com",
    "phone": "555-123-4567",
    "userId": 1,
    "companyId": 2
  }'

// 6. Create client as ROLE_USER
// Status: 403 (Forbidden)
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -H "x-user: {\"id\":2,\"username\":\"john_doe\",\"email\":\"john@example.com\",\"role\":\"ROLE_USER\"}" \
  -d '{
    "name": "Unauthorized Client",
    "email": "unauth@example.com",
    "phone": "1234567890",
    "userId": 2,
    "companyId": 2
  }'

// 7. Update client (partial update)
// Status: 200
curl -X PATCH http://localhost:3000/api/clients/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Client Name",
    "email": "updated@example.com"
  }'

// 8. Update client with only one field
// Status: 200
curl -X PATCH http://localhost:3000/api/clients/1 \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "9999999999"
  }'

// 9. Try to create duplicate company client
// Status: 409 (Conflict)
// Note: First create a client with companyId=5, then try again with same companyId
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -H "x-user: {\"id\":1,\"username\":\"admin\",\"email\":\"admin@example.com\",\"role\":\"ROLE_ADMIN\"}" \
  -d '{
    "name": "Duplicate Company Client",
    "email": "duplicate@example.com",
    "phone": "5555555555",
    "userId": 1,
    "companyId": 5
  }'


// ==========================================
// ERROR SCENARIOS
// ==========================================

// 1. Missing required fields in user update
// Status: 400
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{
    "username": "incomplete"
  }'

// 2. Non-existent user
// Status: 404
curl http://localhost:3000/api/users/99999

// 3. Non-existent client
// Status: 404
curl http://localhost:3000/api/clients/99999

// 4. Invalid user ID in client creation
// Status: 404
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -H "x-user: {\"id\":1,\"username\":\"admin\",\"email\":\"admin@example.com\",\"role\":\"ROLE_ADMIN\"}" \
  -d '{
    "name": "Invalid User Client",
    "email": "client@example.com",
    "phone": "1234567890",
    "userId": 99999,
    "companyId": 1
  }'

// 5. Invalid company ID in client creation
// Status: 404
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -H "x-user: {\"id\":1,\"username\":\"admin\",\"email\":\"admin@example.com\",\"role\":\"ROLE_ADMIN\"}" \
  -d '{
    "name": "Invalid Company Client",
    "email": "client@example.com",
    "phone": "1234567890",
    "userId": 1,
    "companyId": 99999
  }'


// ==========================================
// BATCH TESTING WITH VALID DATA
// ==========================================

// Complete workflow example:

// 1. Check server health
curl http://localhost:3000/health

// 2. Get all users
curl http://localhost:3000/api/users

// 3. Get admin user profile
curl http://localhost:3000/user/profile \
  -H "x-user: {\"id\":1,\"username\":\"admin\",\"email\":\"admin@example.com\",\"role\":\"ROLE_ADMIN\"}"

// 4. List existing clients
curl http://localhost:3000/api/clients

// 5. Create a new client
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -H "x-user: {\"id\":1,\"username\":\"admin\",\"email\":\"admin@example.com\",\"role\":\"ROLE_ADMIN\"}" \
  -d '{
    "name": "Demo Client Corp",
    "email": "democlient@corp.com",
    "phone": "2025551234",
    "userId": 1,
    "companyId": 3
  }'

// 6. Get the newly created client (if ID=1)
curl http://localhost:3000/api/clients/1

// 7. Update the client
curl -X PATCH http://localhost:3000/api/clients/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Demo Client Corp",
    "email": "updateddemo@corp.com"
  }'

// 8. Verify update
curl http://localhost:3000/api/clients/1


// ==========================================
// USING POSTMAN
// ==========================================

/*
If using Postman, use this format for x-user header:

Header: x-user
Value: {"id":1,"username":"admin","email":"admin@example.com","role":"ROLE_ADMIN"}

For POST/PATCH requests, set:
Content-Type: application/json

And in the Body (raw), paste the JSON data without escaping quotes.
*/


// ==========================================
// USING POWERSHELL (Windows)
// ==========================================

/*
# Health check
Invoke-WebRequest -Uri "http://localhost:3000/health" | Select-Object -ExpandProperty Content

# List users
Invoke-WebRequest -Uri "http://localhost:3000/api/users" | Select-Object -ExpandProperty Content

# Create client (as admin)
$headers = @{
    "x-user" = '{"id":1,"username":"admin","email":"admin@example.com","role":"ROLE_ADMIN"}'
    "Content-Type" = "application/json"
}

$body = @{
    name = "New Client"
    email = "client@example.com"
    phone = "1234567890"
    userId = 1
    companyId = 1
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/clients" `
    -Method POST `
    -Headers $headers `
    -Body $body | Select-Object -ExpandProperty Content
*/


// ==========================================
// NOTES
// ==========================================

/*
1. Authentication:
   - Most endpoints don't require authentication
   - POST /api/clients requires ROLE_ADMIN
   - GET /user/profile requires x-user header

2. Validation:
   - Email must match: user@example.com format
   - Phone must be numbers only: 1234567890
   - Roles: ROLE_USER or ROLE_ADMIN

3. Constraints:
   - Username and email must be unique
   - Each company can only be assigned to one client
   - Company must exist in database

4. Status Codes:
   - 200 = Success
   - 201 = Created
   - 400 = Validation error
   - 401 = Unauthorized
   - 403 = Forbidden (wrong role)
   - 404 = Not found
   - 409 = Conflict (duplicate)
   - 500 = Server error
*/
