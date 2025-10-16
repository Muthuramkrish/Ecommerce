import mongoose from "mongoose";

const { Schema } = mongoose;

const productSchema = new Schema(
  {
    identifiers: {
      type: Schema.Types.Mixed, // flexible identifiers (productId, sku, slug, barcode, etc.)
      required: true,
    },
    characteristics: {
      type: Schema.Types.Mixed, // images, specs, weight, dimensions, etc.
    },
    anchor: {
      type: Schema.Types.Mixed, // category, subcategory, brand, manufacturer, etc.
    },
    classification: {
      type: Schema.Types.Mixed, // variants & attributes (color, material, certifications, etc.)
    },
    pricing: {
      basePrice: Number,
      comparePrice: Number,
      costPrice: Number,
      currency: { type: String, default: "INR" },
      taxRate: Number,
      discounts: [
        {
          type: { type: String }, // "percentage", "flat", "bulk"
          value: Number,
          minQuantity: Number,
          validFrom: Date,
          validTo: Date,
          isActive: Boolean,
        },
      ],
    },
    inventory: {
      totalQuantity: Number,
      availableQuantity: Number,
      reservedQuantity: Number,
      lowStockThreshold: Number,
      bulkQuantityTiers: [
        {
          minQuantity: Number,
          maxQuantity: Number,
          discountPercentage: Number,
        },
      ],
      trackInventory: { type: Boolean, default: true },
      allowBackorder: { type: Boolean, default: false },
    },
    marketing: {
      tags: [String],
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
      isActive: { type: Boolean, default: true },
      isFeatured: { type: Boolean, default: false },
      isBestseller: { type: Boolean, default: false },
      featuredOrder: Number,
      promotionText: String,
    },
  },
  { timestamps: true, strict: false } // strict:false → allows new fields in future
);

/**
 * Factory function to get a Product model bound to a specific collection.
 * Ensures mongoose doesn’t recompile models on hot reload.
 *
 * @param {string} collectionName - name of the collection (e.g., "switches", "fans")
 */
export const getProductModel = (collectionName) => {
  const name = collectionName.toLowerCase().replace(/\s+/g, "-");
  return mongoose.models[name] || mongoose.model(name, productSchema, name);
};