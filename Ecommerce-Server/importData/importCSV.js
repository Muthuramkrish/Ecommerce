import mongoose from "mongoose";
import csv from "csvtojson";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

dotenv.config();

/** ---------- Helpers ---------- **/
const toNumber = (v) =>
  v === undefined || v === null || v === "" ? undefined : Number(String(v).trim());
const toBool = (v) =>
  String(v || "")
    .trim()
    .toLowerCase() === "true";
const splitUrls = (raw) =>
  (raw || "")
    .split(/[\r\n|,]+/g)
    .map((s) => s.trim())
    .filter(Boolean);

const splitMulti = (raw) =>
  (raw || "")
    .split(/[\r\n|,]+/g)
    .map((s) => s.trim())
    .filter(Boolean);

/**
 * Parse key-value style multi-line text into an array of objects
 * Example input:
 *   "group': 'Electrical'
 *    name': 'Current Rating'
 *    value': '10'
 *    unit': 'A'
 *
 *    group': 'Electrical'
 *    name': 'Voltage Rating'
 *    value': '240'
 *    unit': 'V'"
 */
const parseKeyValueArray = (raw) => {
  if (!raw) return [];
  const lines = String(raw)
    .split(/\r?\n/g)
    .map((l) => l.trim())
    .filter(Boolean);

  const result = [];
  let obj = {};
  const rx = /'?([A-Za-z0-9_]+)'?\s*:\s*'?(.*?)'?$/;

  for (const line of lines) {
    const m = line.match(rx);
    if (!m) continue;
    const key = m[1];
    let val = m[2];

    // Convert numbers & booleans
    if (!isNaN(val) && val.trim() !== "") {
      val = Number(val);
    } else if (["true", "false"].includes(val.toLowerCase())) {
      val = val.toLowerCase() === "true";
    }

    // Special case: multiple images
    if (key.toLowerCase() === "images") {
      if (!obj.images) obj.images = [];
      obj.images.push(val);
      continue;
    }

    // If key already exists → assume new object begins
    if (obj[key] !== undefined) {
      result.push(obj);
      obj = {};
    }

    obj[key] = val;
  }

  if (Object.keys(obj).length) result.push(obj);
  return result;
};

/** ---------- Main Import ---------- **/
const importCSV = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected");

    const csvFile = process.env.CSV_FILE;
    if (!csvFile || !fs.existsSync(csvFile))
      throw new Error("CSV file not found: " + csvFile);

    // Normalize collection name
    let collectionName = path.basename(csvFile, path.extname(csvFile));
    collectionName = collectionName.replace(/\s+/g, "-").toLowerCase();
    console.log(`📂 Importing into collection: ${collectionName}`);

    // Read CSV
    const rows = await csv().fromFile(csvFile);
    console.log("Raw CSV sample:", rows.slice(0, 1));

    // Map rows → Mongo docs
    const docs = rows.map((item) => ({
      identifiers: {
        productId: item.identifiers_productId,
        sku: item.identifiers_sku,
        slug: item.identifiers_slug,
        barcode: item.identifiers_barcode,
      },
      characteristics: {
        title: item.characteristics_title,
        description: item.characteristics_description,
        images: {
          primary: splitUrls(item.characteristics_images_primary),
          offers: splitUrls(item.characteristics_images_offers),
        },
        specifications: parseKeyValueArray(item.characteristics_specifications),
        weight: {
          value: toNumber(item.characteristics_weight_value),
          unit: item.characteristics_weight_unit,
        },
        dimensions: {
          length: toNumber(item.characteristics_dimensions_length),
          width: toNumber(item.characteristics_dimensions_width),
          height: toNumber(item.characteristics_dimensions_height),
          unit: item.characteristics_dimensions_unit,
        },
      },
      anchor: {
        category: item.anchor_category,
        subcategory: item.anchor_subcategory,
        subSubcategory: item.anchor_subSubcategory,
        brand: item.anchor_brand,
        manufacturer: item.anchor_manufacturer,
        productType: item.anchor_productType,
      },
      classification: {
        variants: parseKeyValueArray(item.classification_variants),
        attributes: {
          material: item.classification_attributes_material,
          certification: splitMulti(item.classification_attributes_certification),
          warrantyPeriod: item.classification_attributes_warrantyPeriod,
          countryOfOrigin: item.classification_attributes_countryOfOrigin,
        },
      },
      pricing: {
        basePrice: toNumber(item.pricing_basePrice),
        comparePrice: toNumber(item.pricing_comparePrice),
        costPrice: toNumber(item.pricing_costPrice),
        currency: item.pricing_currency || "INR",
        taxRate: toNumber(item.pricing_taxRate),
        discounts: parseKeyValueArray(item.pricing_discounts),
      },
      inventory: {
        totalQuantity: toNumber(item.inventory_totalQuantity),
        availableQuantity: toNumber(item.inventory_availableQuantity),
        reservedQuantity: toNumber(item.inventory_reservedQuantity),
        lowStockThreshold: toNumber(item.inventory_lowStockThreshold),
        trackInventory: toBool(item.inventory_trackInventory),
        allowBackorder: toBool(item.inventory_allowBackorder),
        bulkQuantityTiers: parseKeyValueArray(item.inventory_bulkQuantityTiers),
      },
      marketing: {
        tags: splitMulti(item.marketing_tags),
        metaTitle: item.marketing_metaTitle,
        metaDescription: item.marketing_metaDescription,
        keywords: splitMulti(item.marketing_keywords),
        isActive: toBool(item.marketing_isActive),
        isFeatured: toBool(item.marketing_isFeatured),
        isBestseller: toBool(item.marketing_isBestseller),
        featuredOrder: toNumber(item.marketing_featuredOrder),
        promotionText: item.marketing_promotionText,
      },
    }));

    // Dynamic model with timestamps
    const DynamicModel = mongoose.model(
      collectionName,
      new mongoose.Schema({}, { strict: false, timestamps: true }),
      collectionName
    );

    await DynamicModel.insertMany(docs);
    console.log(`✅ Imported ${docs.length} documents into '${collectionName}'`);

    await mongoose.connection.close();
  } catch (err) {
    console.error("❌ Error importing CSV:", err);
    process.exit(1);
  }
};

importCSV();