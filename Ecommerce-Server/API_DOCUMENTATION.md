# E-commerce API Documentation

## Overview
This API provides comprehensive user authentication, product management, and e-commerce functionality including user registration, login, cart management, wishlist, and product catalog.

## Base URL
```
http://localhost:5000/api
```

## Authentication
The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Response Format
All API responses follow this format:
```json
{
  "success": true|false,
  "message": "Response message",
  "data": {}, // Response data (if applicable)
  "errors": [] // Validation errors (if applicable)
}
```

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123",
  "phone": "+1234567890", // optional
  "dateOfBirth": "1990-01-01", // optional
  "gender": "male", // optional: male, female, other, prefer-not-to-say
  "newsletter": true, // optional, default: true
  "smsNotifications": false, // optional, default: false
  "emailNotifications": true // optional, default: true
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { /* user object */ },
    "token": "jwt-token",
    "refreshToken": "refresh-token"
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
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { /* user object */ },
    "token": "jwt-token",
    "refreshToken": "refresh-token"
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
    "user": { /* user object */ }
  }
}
```

### Update Profile
**PUT** `/auth/profile`

Update user profile information.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "bio": "Software developer",
  "newsletter": true,
  "language": "en",
  "currency": "USD"
}
```

### Change Password
**PUT** `/auth/change-password`

Change user password.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "currentPassword": "OldPass123",
  "newPassword": "NewPass123"
}
```

### Forgot Password
**POST** `/auth/forgot-password`

Request password reset token.

**Request Body:**
```json
{
  "email": "john.doe@example.com"
}
```

### Reset Password
**PUT** `/auth/reset-password/:token`

Reset password using reset token.

**Request Body:**
```json
{
  "password": "NewPass123"
}
```

### Verify Email
**GET** `/auth/verify-email/:token`

Verify user email address.

### Logout
**POST** `/auth/logout`

Logout user (invalidate token).

**Headers:** `Authorization: Bearer <token>`

---

## User Management Endpoints

### Address Management

#### Add Address
**POST** `/user/addresses`

Add a new address to user profile.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "type": "home", // home, work, billing, shipping, other
  "fullName": "John Doe",
  "addressLine1": "123 Main Street",
  "addressLine2": "Apt 4B", // optional
  "city": "New York",
  "state": "NY",
  "postalCode": "10001",
  "country": "USA",
  "phone": "+1234567890", // optional
  "instructions": "Ring doorbell", // optional
  "isDefault": false // optional
}
```

#### Get Addresses
**GET** `/user/addresses`

Get all user addresses.

**Headers:** `Authorization: Bearer <token>`

#### Update Address
**PUT** `/user/addresses/:addressId`

Update specific address.

**Headers:** `Authorization: Bearer <token>`

#### Delete Address
**DELETE** `/user/addresses/:addressId`

Delete specific address.

**Headers:** `Authorization: Bearer <token>`

### Wishlist Management

#### Add to Wishlist
**POST** `/user/wishlist`

Add product to user's wishlist.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "productId": "product-object-id",
  "collectionName": "switches"
}
```

#### Get Wishlist
**GET** `/user/wishlist`

Get user's wishlist with product details.

**Headers:** `Authorization: Bearer <token>`

#### Remove from Wishlist
**DELETE** `/user/wishlist/:productId`

Remove product from wishlist.

**Headers:** `Authorization: Bearer <token>`

### Cart Management

#### Add to Cart
**POST** `/user/cart`

Add product to user's cart.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "productId": "product-object-id",
  "collectionName": "switches",
  "quantity": 2,
  "selectedVariant": { "color": "red", "size": "large" }, // optional
  "price": 29.99
}
```

#### Get Cart
**GET** `/user/cart`

Get user's cart with product details and totals.

**Headers:** `Authorization: Bearer <token>`

#### Update Cart Item
**PUT** `/user/cart/:productId`

Update cart item quantity.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "quantity": 3,
  "selectedVariant": { "color": "red", "size": "large" }
}
```

#### Remove from Cart
**DELETE** `/user/cart/:productId`

Remove product from cart.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "selectedVariant": { "color": "red", "size": "large" }
}
```

#### Clear Cart
**DELETE** `/user/cart`

Clear entire cart.

**Headers:** `Authorization: Bearer <token>`

---

## Product Endpoints

### Get All Products
**GET** `/productList`

Get products with filtering, sorting, and pagination.

**Query Parameters:**
- `collection` - Specific collection name (e.g., "switches", "fans")
- `all` - Set to "true" to get products from all collections
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `search` - Search term
- `category` - Filter by category
- `minPrice` - Minimum price filter
- `maxPrice` - Maximum price filter
- `sortBy` - Sort field (default: "createdAt")
- `sortOrder` - Sort order: "asc" or "desc" (default: "desc")

**Examples:**
```
GET /productList?all=true&page=1&limit=10
GET /productList?collection=switches&search=mechanical
GET /productList?category=electronics&minPrice=10&maxPrice=100
```

### Get Product by ID
**GET** `/productList/:collection/:productId`

Get single product details.

**Example:**
```
GET /productList/switches/64f8b1234567890abcdef123
```

### Get Featured Products
**GET** `/productList/featured`

Get featured products across all collections.

**Query Parameters:**
- `limit` - Number of products to return (default: 10)

### Get Categories
**GET** `/productList/categories`

Get all available categories, subcategories, and brands.

### Search Products
**GET** `/productList/search`

Search products across collections.

**Query Parameters:**
- `q` - Search query (required, min 2 characters)
- `collection` - Limit search to specific collection
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

**Example:**
```
GET /productList/search?q=mechanical&collection=switches
```

---

## Database Schema

### User Schema
The user schema includes comprehensive user information:

```javascript
{
  personalInfo: {
    firstName: String,
    lastName: String,
    email: String (unique),
    phone: String,
    dateOfBirth: Date,
    gender: String
  },
  authentication: {
    password: String (hashed),
    isEmailVerified: Boolean,
    emailVerificationToken: String,
    passwordResetToken: String,
    lastLogin: Date,
    loginAttempts: Number,
    lockUntil: Date
  },
  profile: {
    avatar: { url: String, publicId: String },
    bio: String,
    preferences: {
      newsletter: Boolean,
      smsNotifications: Boolean,
      emailNotifications: Boolean,
      language: String,
      currency: String
    }
  },
  addresses: [{
    type: String, // home, work, billing, shipping, other
    isDefault: Boolean,
    fullName: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
    phone: String,
    instructions: String
  }],
  ecommerce: {
    wishlist: [{
      productId: ObjectId,
      collectionName: String,
      addedAt: Date
    }],
    cart: [{
      productId: ObjectId,
      collectionName: String,
      quantity: Number,
      selectedVariant: Mixed,
      price: Number,
      addedAt: Date
    }],
    orders: [{ /* order references */ }],
    metrics: {
      totalOrders: Number,
      totalSpent: Number,
      averageOrderValue: Number,
      loyaltyPoints: Number,
      customerTier: String
    }
  },
  account: {
    status: String, // active, inactive, suspended, deleted
    role: String, // customer, admin, moderator, vendor
    permissions: [String]
  },
  tracking: {
    registrationSource: String,
    referralCode: String,
    ipAddress: String,
    userAgent: String,
    lastActiveAt: Date
  }
}
```

### Product Schema
Products use a flexible schema that supports multiple product types:

```javascript
{
  identifiers: Mixed, // productId, sku, name, description, etc.
  characteristics: Mixed, // images, specs, weight, dimensions, etc.
  anchor: Mixed, // category, subcategory, brand, manufacturer, etc.
  classification: Mixed, // variants, attributes, certifications, etc.
  pricing: {
    basePrice: Number,
    comparePrice: Number,
    currency: String,
    discounts: [{ /* discount objects */ }]
  },
  inventory: {
    totalQuantity: Number,
    availableQuantity: Number,
    trackInventory: Boolean,
    allowBackorder: Boolean
  },
  marketing: {
    tags: [String],
    isActive: Boolean,
    isFeatured: Boolean,
    featuredOrder: Number
  }
}
```

---

## Error Handling

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `423` - Locked (account locked due to failed login attempts)
- `500` - Internal Server Error

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

---

## Security Features

1. **Password Hashing**: Passwords are hashed using bcrypt with salt rounds
2. **JWT Authentication**: Secure token-based authentication
3. **Account Locking**: Automatic account locking after failed login attempts
4. **Input Validation**: Comprehensive validation using express-validator
5. **CORS Protection**: Configurable CORS settings
6. **Rate Limiting**: Can be implemented for API endpoints
7. **SQL Injection Protection**: MongoDB's built-in protection

---

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Setup**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start Server**:
   ```bash
   npm run dev  # Development mode
   npm start    # Production mode
   ```

4. **Health Check**:
   ```
   GET /api/health
   ```

---

## Testing the API

You can test the API using tools like Postman, curl, or any HTTP client. Here are some example requests:

### Register a new user:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

### Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

### Get products:
```bash
curl http://localhost:5000/api/productList?all=true&limit=5
```

### Add to cart (requires authentication):
```bash
curl -X POST http://localhost:5000/api/user/cart \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "productId": "PRODUCT_ID",
    "collectionName": "switches",
    "quantity": 1,
    "price": 29.99
  }'
```