// Clear Cart Add-on
// This file adds clear cart functionality without modifying existing code

class ClearCartManager {
    constructor(apiBaseUrl = 'http://localhost:5000/api') {
        this.apiBaseUrl = apiBaseUrl;
        this.authToken = localStorage.getItem('authToken');
    }

    // Set authentication token
    setAuthToken(token) {
        this.authToken = token;
        localStorage.setItem('authToken', token);
    }

    // Clear cart API call
    async clearCart() {
        if (!this.authToken) {
            throw new Error('User not authenticated');
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/user/cart`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.authToken}`,
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to clear cart');
            }

            return data;
        } catch (error) {
            console.error('Clear cart error:', error);
            throw error;
        }
    }

    // Create clear cart button
    createClearCartButton(containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container with id '${containerId}' not found`);
            return;
        }

        const button = document.createElement('button');
        button.innerHTML = options.text || 'Clear Cart';
        button.className = options.className || 'clear-cart-btn';
        button.style.cssText = options.style || `
            background: #dc3545;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            margin: 10px 0;
        `;

        button.addEventListener('click', async () => {
            if (options.confirmMessage !== false) {
                const confirmed = confirm(options.confirmMessage || 'Are you sure you want to clear your cart?');
                if (!confirmed) return;
            }

            button.disabled = true;
            button.innerHTML = 'Clearing...';

            try {
                await this.clearCart();
                
                // Success callback
                if (options.onSuccess) {
                    options.onSuccess();
                } else {
                    alert('Cart cleared successfully!');
                }

                // Refresh page or update UI
                if (options.refreshPage) {
                    window.location.reload();
                }

            } catch (error) {
                // Error callback
                if (options.onError) {
                    options.onError(error);
                } else {
                    alert('Error clearing cart: ' + error.message);
                }
            } finally {
                button.disabled = false;
                button.innerHTML = options.text || 'Clear Cart';
            }
        });

        container.appendChild(button);
        return button;
    }
}

// Global instance
window.clearCartManager = new ClearCartManager();

// Simple usage function
window.addClearCartButton = function(containerId, options = {}) {
    return window.clearCartManager.createClearCartButton(containerId, options);
};

// Direct clear cart function
window.clearUserCart = async function(authToken) {
    if (authToken) {
        window.clearCartManager.setAuthToken(authToken);
    }
    return await window.clearCartManager.clearCart();
};