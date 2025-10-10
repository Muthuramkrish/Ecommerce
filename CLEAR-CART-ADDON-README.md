# Clear Cart Add-on

Simple add-on to add clear cart functionality with user storage to your existing application **without changing any existing code**.

## Quick Start

1. Include the add-on script:
```html
<script src="clear-cart-addon.js"></script>
```

2. Add a clear cart button anywhere:
```javascript
addClearCartButton('your-container-id');
```

That's it! The button will use your existing backend API at `/api/user/cart`.

## Usage Examples

### Basic Usage
```javascript
// Add simple clear cart button
addClearCartButton('cart-actions');
```

### Custom Button
```javascript
addClearCartButton('cart-actions', {
    text: '🗑️ Empty Cart',
    style: 'background: red; color: white; padding: 10px;',
    confirmMessage: 'Remove all items?',
    onSuccess: function() {
        alert('Cart cleared!');
        // Update your UI here
    }
});
```

### Programmatic Usage
```javascript
// Set user token
clearCartManager.setAuthToken('your-jwt-token');

// Clear cart programmatically
await clearUserCart();
```

## Integration

### With Your Authentication
```javascript
// When user logs in
function onUserLogin(token) {
    clearCartManager.setAuthToken(token);
}

// When user logs out
function onUserLogout() {
    localStorage.removeItem('authToken');
}
```

### With Your Existing Cart UI
```javascript
addClearCartButton('existing-cart-container', {
    onSuccess: function() {
        // Refresh your existing cart display
        refreshCartDisplay();
        updateCartCount(0);
    }
});
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `text` | string | 'Clear Cart' | Button text |
| `className` | string | 'clear-cart-btn' | CSS class |
| `style` | string | Default red button | Inline CSS |
| `confirmMessage` | string/false | 'Are you sure...' | Confirmation dialog |
| `onSuccess` | function | alert | Success callback |
| `onError` | function | alert | Error callback |
| `refreshPage` | boolean | false | Reload page after clear |

## API

The add-on uses your existing backend endpoint:
- **URL**: `DELETE /api/user/cart`
- **Auth**: Bearer token in Authorization header
- **Response**: `{ message: "Cart cleared successfully", cart: [] }`

## No Changes Required

✅ Works with your existing backend  
✅ No modifications to existing code  
✅ Uses your current authentication  
✅ Integrates with existing UI  

Just include the script and add buttons where needed!