// CartPage.load.js - Functions for CartPage component
import { useEffect } from 'react';

// Cart calculations
export const useCartCalculations = (items = []) => {
  const subtotal = items.reduce((sum, item) => sum + (parseFloat(item['new-price']) * item.quantity), 0);
  const shipping = subtotal > 500 ? 0 : 99;
  const tax = subtotal * 0.18;
  const total = subtotal + shipping + tax;

  return {
    subtotal,
    shipping,
    tax,
    total
  };
};

// Cart item handlers
export const useCartItemHandlers = (onUpdateQuantity, onRemoveItem) => {
  const handleQuantityChange = (index, value) => {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) return;
    
    const minQty = 1;
    const clamped = Math.max(minQty, parsed);
    onUpdateQuantity(index, clamped);
  };

  const handleQuantityIncrease = (index, currentQuantity, maxQuantity = null) => {
    const newQuantity = currentQuantity + 1;
    const finalQuantity = maxQuantity ? Math.min(newQuantity, maxQuantity) : newQuantity;
    onUpdateQuantity(index, finalQuantity);
  };

  const handleQuantityDecrease = (index, currentQuantity) => {
    const newQuantity = Math.max(1, currentQuantity - 1);
    onUpdateQuantity(index, newQuantity);
  };

  const handleItemRemove = (index) => {
    onRemoveItem(index);
  };

  return {
    handleQuantityChange,
    handleQuantityIncrease,
    handleQuantityDecrease,
    handleItemRemove
  };
};

// Page initialization
export const useCartPageInit = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, []);

  return {};
};

// Cart validation
export const useCartValidation = (items = []) => {
  const validateItemQuantity = (item, requestedQuantity) => {
    const maxQty = item?.raw?.inventory?.availableQuantity ?? item?.inventory?.availableQuantity;
    const minQty = 1;
    
    if (maxQty != null) {
      return Math.max(minQty, Math.min(requestedQuantity, maxQty));
    }
    
    return Math.max(minQty, requestedQuantity);
  };

  const isCartValid = items.length > 0;

  return {
    validateItemQuantity,
    isCartValid
  };
};