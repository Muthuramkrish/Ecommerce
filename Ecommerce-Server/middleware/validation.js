import { body, param } from "express-validator";

// User registration validation
export const validateRegister = [
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("First name can only contain letters and spaces"),

  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Last name can only contain letters and spaces"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("Password must contain at least one lowercase letter, one uppercase letter, and one number"),

  body("phone")
    .optional()
    .trim()
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage("Please provide a valid phone number"),

  body("dateOfBirth")
    .optional()
    .isISO8601()
    .withMessage("Please provide a valid date of birth")
    .custom((value) => {
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 13) {
        throw new Error("You must be at least 13 years old to register");
      }
      
      if (birthDate > today) {
        throw new Error("Date of birth cannot be in the future");
      }
      
      return true;
    }),

  body("gender")
    .optional()
    .isIn(["male", "female", "other", "prefer-not-to-say"])
    .withMessage("Gender must be one of: male, female, other, prefer-not-to-say"),

  body("newsletter")
    .optional()
    .isBoolean()
    .withMessage("Newsletter preference must be a boolean"),

  body("smsNotifications")
    .optional()
    .isBoolean()
    .withMessage("SMS notifications preference must be a boolean"),

  body("emailNotifications")
    .optional()
    .isBoolean()
    .withMessage("Email notifications preference must be a boolean"),
];

// User login validation
export const validateLogin = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required"),
];

// Profile update validation
export const validateProfileUpdate = [
  body("firstName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("First name can only contain letters and spaces"),

  body("lastName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Last name can only contain letters and spaces"),

  body("phone")
    .optional()
    .trim()
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage("Please provide a valid phone number"),

  body("dateOfBirth")
    .optional()
    .isISO8601()
    .withMessage("Please provide a valid date of birth")
    .custom((value) => {
      if (value) {
        const birthDate = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        
        if (age < 13) {
          throw new Error("You must be at least 13 years old");
        }
        
        if (birthDate > today) {
          throw new Error("Date of birth cannot be in the future");
        }
      }
      return true;
    }),

  body("gender")
    .optional()
    .isIn(["male", "female", "other", "prefer-not-to-say"])
    .withMessage("Gender must be one of: male, female, other, prefer-not-to-say"),

  body("bio")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Bio cannot exceed 500 characters"),

  body("newsletter")
    .optional()
    .isBoolean()
    .withMessage("Newsletter preference must be a boolean"),

  body("smsNotifications")
    .optional()
    .isBoolean()
    .withMessage("SMS notifications preference must be a boolean"),

  body("emailNotifications")
    .optional()
    .isBoolean()
    .withMessage("Email notifications preference must be a boolean"),

  body("language")
    .optional()
    .isLength({ min: 2, max: 5 })
    .withMessage("Language code must be between 2 and 5 characters"),

  body("currency")
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage("Currency code must be exactly 3 characters"),
];

// Change password validation
export const validateChangePassword = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),

  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("New password must contain at least one lowercase letter, one uppercase letter, and one number")
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error("New password must be different from current password");
      }
      return true;
    }),
];

// Forgot password validation
export const validateForgotPassword = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
];

// Reset password validation
export const validateResetPassword = [
  param("token")
    .notEmpty()
    .withMessage("Reset token is required")
    .isLength({ min: 40, max: 40 })
    .withMessage("Invalid reset token format"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("Password must contain at least one lowercase letter, one uppercase letter, and one number"),
];

// Email verification validation
export const validateEmailVerification = [
  param("token")
    .notEmpty()
    .withMessage("Verification token is required")
    .isLength({ min: 40, max: 40 })
    .withMessage("Invalid verification token format"),
];

// Address validation
export const validateAddress = [
  body("type")
    .optional()
    .isIn(["home", "work", "billing", "shipping", "other"])
    .withMessage("Address type must be one of: home, work, billing, shipping, other"),

  body("fullName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Full name must be between 2 and 100 characters"),

  body("addressLine1")
    .trim()
    .notEmpty()
    .withMessage("Address line 1 is required")
    .isLength({ min: 5, max: 200 })
    .withMessage("Address line 1 must be between 5 and 200 characters"),

  body("addressLine2")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Address line 2 cannot exceed 200 characters"),

  body("city")
    .trim()
    .notEmpty()
    .withMessage("City is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("City must be between 2 and 100 characters"),

  body("state")
    .trim()
    .notEmpty()
    .withMessage("State is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("State must be between 2 and 100 characters"),

  body("postalCode")
    .trim()
    .notEmpty()
    .withMessage("Postal code is required")
    .matches(/^[0-9]{6}$/)
    .withMessage("Please provide a valid 6-digit postal code"),

  body("country")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Country must be between 2 and 100 characters"),

  body("phone")
    .optional()
    .trim()
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage("Please provide a valid phone number"),

  body("instructions")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Instructions cannot exceed 500 characters"),

  body("isDefault")
    .optional()
    .isBoolean()
    .withMessage("isDefault must be a boolean"),
];

// Cart item validation
export const validateCartItem = [
  body("productId")
    .notEmpty()
    .withMessage("Product ID is required")
    .isMongoId()
    .withMessage("Please provide a valid product ID"),

  body("collectionName")
    .trim()
    .notEmpty()
    .withMessage("Collection name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Collection name must be between 2 and 50 characters"),

  body("quantity")
    .isInt({ min: 1, max: 100 })
    .withMessage("Quantity must be a number between 1 and 100"),

  body("selectedVariant")
    .optional()
    .isObject()
    .withMessage("Selected variant must be an object"),

  body("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
];

// Wishlist item validation
export const validateWishlistItem = [
  body("productId")
    .notEmpty()
    .withMessage("Product ID is required")
    .isMongoId()
    .withMessage("Please provide a valid product ID"),

  body("collectionName")
    .trim()
    .notEmpty()
    .withMessage("Collection name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Collection name must be between 2 and 50 characters"),
];

export default {
  validateRegister,
  validateLogin,
  validateProfileUpdate,
  validateChangePassword,
  validateForgotPassword,
  validateResetPassword,
  validateEmailVerification,
  validateAddress,
  validateCartItem,
  validateWishlistItem,
};