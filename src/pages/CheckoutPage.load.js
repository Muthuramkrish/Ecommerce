// CheckoutPage.load.js - Functions for CheckoutPage component
import { useState, useEffect } from 'react';

// Page initialization
export const useCheckoutPageInit = () => {
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, []);

  return {};
};

// Form validation
export const useFormValidation = () => {
  const [errors, setErrors] = useState({});

  const validateField = (name, value, rules = {}) => {
    const newErrors = { ...errors };

    if (rules.required && !value.trim()) {
      newErrors[name] = `${name} is required`;
    } else if (rules.email && value && !/\S+@\S+\.\S+/.test(value)) {
      newErrors[name] = 'Invalid email format';
    } else if (rules.phone && value && !/^\d{10}$/.test(value.replace(/\D/g, ''))) {
      newErrors[name] = 'Phone number must be 10 digits';
    } else if (rules.minLength && value.length < rules.minLength) {
      newErrors[name] = `${name} must be at least ${rules.minLength} characters`;
    } else {
      delete newErrors[name];
    }

    setErrors(newErrors);
    return !newErrors[name];
  };

  const validateForm = (formData, validationRules) => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(field => {
      const value = formData[field] || '';
      const rules = validationRules[field];
      
      if (rules.required && !value.trim()) {
        newErrors[field] = `${field} is required`;
        isValid = false;
      } else if (rules.email && value && !/\S+@\S+\.\S+/.test(value)) {
        newErrors[field] = 'Invalid email format';
        isValid = false;
      } else if (rules.phone && value && !/^\d{10}$/.test(value.replace(/\D/g, ''))) {
        newErrors[field] = 'Phone number must be 10 digits';
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const clearErrors = () => setErrors({});

  return {
    errors,
    validateField,
    validateForm,
    clearErrors
  };
};

// Order calculations
export const useOrderCalculations = (items = []) => {
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

// Payment methods
export const usePaymentMethods = () => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cod');

  const paymentMethods = [
    { id: 'cod', name: 'Cash on Delivery', description: 'Pay when you receive your order' },
    { id: 'card', name: 'Credit/Debit Card', description: 'Visa, MasterCard, RuPay' },
    { id: 'upi', name: 'UPI', description: 'Pay using UPI apps' },
    { id: 'wallet', name: 'Digital Wallet', description: 'Paytm, PhonePe, etc.' }
  ];

  return {
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    paymentMethods
  };
};

// Shipping address management
export const useShippingAddress = () => {
  const [shippingAddress, setShippingAddress] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India'
  });

  const updateAddressField = (field, value) => {
    setShippingAddress(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetAddress = () => {
    setShippingAddress({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    });
  };

  return {
    shippingAddress,
    setShippingAddress,
    updateAddressField,
    resetAddress
  };
};

// Order processing
export const useOrderProcessing = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderStatus, setOrderStatus] = useState('pending');

  const processOrder = async (orderData, onComplete) => {
    setIsProcessing(true);
    setOrderStatus('processing');

    try {
      // Simulate order processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setOrderStatus('completed');
      
      // Generate order number
      const orderNumber = `ORD-${Date.now()}`;
      
      if (onComplete) {
        onComplete({
          orderNumber,
          status: 'completed',
          ...orderData
        });
      }
    } catch (error) {
      setOrderStatus('failed');
      console.error('Order processing failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    orderStatus,
    processOrder
  };
};

// Form state management
export const useCheckoutForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});

  const updateFormData = (stepData) => {
    setFormData(prev => ({
      ...prev,
      ...stepData
    }));
  };

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const resetForm = () => {
    setCurrentStep(1);
    setFormData({});
  };

  return {
    currentStep,
    setCurrentStep,
    formData,
    updateFormData,
    nextStep,
    prevStep,
    resetForm
  };
};
