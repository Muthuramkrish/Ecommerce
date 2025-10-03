# Simple E-commerce API Documentation

## Overview
This API provides basic user authentication and product management with database storage.

## Base URL
```
http://localhost:5000/api
```

## Authentication
The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

Register a new user and store in database.

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "user-id",
      "fullName": "John Doe",
      "email": "john.doe@example.com",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt-token-here"
  }
}
```

### Login User
**POST** `/auth/login`

Authenticate user and get access token.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "user-id",
      "fullName": "John Doe",
      "email": "john.doe@example.com",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt-token-here"
  }
}
```

### Get Current User
**GET** `/auth/me`

Get current authenticated user's profile.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user-id",
      "fullName": "John Doe",
      "email": "john.doe@example.com",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

---

## Product Endpoints

### Get All Products
**GET** `/productList`

Get products with filtering and pagination.

**Query Parameters:**
- `collection` - Specific collection name (e.g., "switches", "fans")
- `all` - Set to "true" to get products from all collections
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `search` - Search term
- `category` - Filter by category

### Get Product by ID
**GET** `/productList/:collection/:productId`

Get single product details.

### Get Featured Products
**GET** `/productList/featured`

Get featured products.

### Get Categories
**GET** `/productList/categories`

Get all available categories and brands.

### Search Products
**GET** `/productList/search?q=searchterm`

Search products across collections.

---

## Database Schema

### User Schema
```javascript
{
  fullName: String (required, max 100 chars),
  email: String (required, unique, valid email),
  password: String (required, min 6 chars, hashed),
  createdAt: Date,
  updatedAt: Date
}
```

---

## Testing the API

### Register a new user:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Get current user (requires token):
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get products:
```bash
curl http://localhost:5000/api/productList?all=true&limit=5
```

---

## Environment Variables

Create a `.env` file with:
```
MONGO_URI=mongodb://localhost:27017/ecommerce-db
PORT=5000
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=30d
```

---

## Key Features

✅ **Database Storage**: All user data is stored in MongoDB  
✅ **Password Security**: Passwords are hashed with bcrypt  
✅ **JWT Authentication**: Secure token-based authentication  
✅ **Input Validation**: Email and password validation  
✅ **Error Handling**: Proper error responses  
✅ **Simple & Clean**: Only essential features included