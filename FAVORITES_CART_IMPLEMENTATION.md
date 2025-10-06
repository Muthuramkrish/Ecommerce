# User Favorites and Cart Database Implementation

## Overview
This implementation adds database-backed user favorites and cart functionality to the e-commerce application. The system now stores user favorites and cart items in MongoDB instead of relying solely on localStorage.

## Database Schema Changes

### User Model (`Ecommerce-Server/models/user.js`)
Extended the user schema to include:

#### Favorites Array
```javascript
favorites: [{
  productTitle: { type: String, required: true },
  imageUrl: { type: String, required: true },
  oldPrice: { type: String, required: true },
  newPrice: { type: String, required: true },
  category: String,
  rating: Number,
  reviews: Number,
  raw: { type: mongoose.Schema.Types.Mixed },
  addedAt: { type: Date, default: Date.now }
}]
```

#### Cart Array
```javascript
cart: [{
  productTitle: { type: String, required: true },
  imageUrl: { type: String, required: true },
  oldPrice: { type: String, required: true },
  newPrice: { type: String, required: true },
  category: String,
  rating: Number,
  reviews: Number,
  raw: { type: mongoose.Schema.Types.Mixed },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  addedAt: { type: Date, default: Date.now }
}]
```

## API Endpoints

### Authentication Routes
- `POST /api/signup` - User registration (now initializes empty favorites and cart)
- `POST /api/signin` - User login (now returns favorites and cart data)

### Protected Routes (require JWT authentication)
All routes below require `Authorization: Bearer <token>` header:

#### User Profile
- `GET /api/user/profile` - Get user profile with favorites and cart

#### Favorites Management
- `GET /api/user/favorites` - Get user's favorites list
- `POST /api/user/favorites` - Add product to favorites
- `DELETE /api/user/favorites/:productTitle` - Remove product from favorites

#### Cart Management
- `GET /api/user/cart` - Get user's cart items
- `POST /api/user/cart` - Add product to cart
- `PUT /api/user/cart/:productTitle` - Update cart item quantity
- `DELETE /api/user/cart/:productTitle` - Remove product from cart
- `DELETE /api/user/cart` - Clear entire cart
- `POST /api/user/cart/sync` - Sync localStorage cart to database

## Frontend Implementation

### API Client (`Ecommerce-UI/src/api/userApi.js`)
New API client module provides functions for:
- Authentication with automatic token management
- Favorites operations
- Cart operations
- Data synchronization utilities

### Updated Components

#### Root Component (`Ecommerce-UI/src/pages/Root.jsx`)
- **Hybrid Data Management**: Supports both database (logged-in users) and localStorage (guests)
- **Automatic API Integration**: Cart and favorites operations automatically use database for authenticated users
- **Seamless Login**: Favorites and cart data loaded from database on successful login
- **Data Migration**: localStorage data is cleared after successful database sync

#### Login Page (`Ecommerce-UI/src/pages/LoginPage.jsx`)
- **Enhanced Login Response**: Now handles favorites and cart data from login response
- **Token Management**: Stores JWT token for authenticated API requests

## Key Features

### 1. Dual Storage Strategy
- **Logged-in Users**: All data stored in MongoDB database
- **Guest Users**: Data stored in localStorage (existing behavior preserved)
- **Seamless Transition**: When guests log in, their localStorage data can be synced to database

### 2. Real-time Synchronization
- All cart and favorites operations immediately sync to database for logged-in users
- Frontend state updates instantly for responsive UI
- Automatic error handling with user feedback

### 3. Security
- JWT authentication for all protected routes
- Token-based authorization with automatic expiration handling
- Input validation and sanitization

### 4. Data Format Conversion
- Automatic conversion between frontend format (`'product-title'`) and database format (`productTitle`)
- Maintains compatibility with existing frontend components
- Preserves all product metadata including raw data

## Migration Strategy

### For Existing Users
1. **Login Process**: When users log in, existing localStorage data remains available
2. **Data Sync**: Future implementation can include migration utilities to sync localStorage to database
3. **Graceful Degradation**: System falls back to localStorage if API calls fail

### For New Users
- All favorites and cart operations use database from first interaction
- No localStorage dependency for authenticated users
- Better data persistence and cross-device synchronization

## API Response Formats

### Login Response
```javascript
{
  message: "Login successful",
  token: "jwt_token_here",
  user: {
    fullName: "User Name",
    email: "user@example.com"
  },
  favorites: [...], // Array of favorite products
  cart: [...]       // Array of cart items with quantities
}
```

### Cart/Favorites Operation Responses
```javascript
{
  message: "Operation successful",
  cart: [...],      // Updated cart items (for cart operations)
  favorites: [...]  // Updated favorites (for favorites operations)
}
```

## Error Handling
- Network errors: Graceful fallback with user notifications
- Authentication errors: Automatic token refresh or re-login prompts
- Validation errors: Clear user feedback with specific error messages
- Server errors: Retry mechanisms and fallback to localStorage

## Performance Considerations
- **Optimistic Updates**: UI updates immediately, syncs to server in background
- **Minimal API Calls**: Batch operations where possible
- **Caching Strategy**: Server responses update local state to avoid redundant requests
- **Token Management**: Automatic token refresh to maintain session

## Future Enhancements
1. **Cross-device Sync**: Users can access favorites and cart from any device
2. **Data Analytics**: Track user behavior and preferences
3. **Backup & Recovery**: Robust data persistence with backup strategies
4. **Offline Support**: Queue operations for when connectivity is restored
5. **Real-time Updates**: WebSocket integration for real-time cart/favorites updates

## Testing Recommendations
1. Test login/logout cycles with favorites and cart data
2. Verify guest-to-user migration scenarios
3. Test error handling for network failures
4. Validate JWT token expiration and refresh
5. Check cross-browser compatibility for localStorage fallback
6. Performance testing with large cart/favorites datasets

This implementation provides a robust, scalable foundation for user data management while maintaining backward compatibility and ensuring a smooth user experience.