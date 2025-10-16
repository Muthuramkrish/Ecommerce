import mongoose from "mongoose";
import csv from "csvtojson";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

dotenv.config();

/** ---------- Helpers ---------- **/
const cleanString = (v) => {
  if (typeof v !== "string") return v;
  return v.trim().replace(/^'+|'+$/g, "").replace(/,+$/, "");
};

const toNumber = (v) =>
  v === undefined || v === null || v === ""
    ? undefined
    : Number(cleanString(String(v)));

const toBool = (v) =>
  cleanString(String(v || "")).toLowerCase() === "true";

const splitUrls = (raw) =>
  (raw || "")
    .split(/\r?\n/g)
    .map((s) => cleanString(s))
    .filter(Boolean);

const splitMulti = (raw) =>
  (raw || "")
    .split(/\r?\n/g)
    .map((s) => cleanString(s))
    .filter(Boolean);

const parseKeyValueArray = (raw) => {
  if (!raw) return [];
  const lines = String(raw)
    .split(/\r?\n/g)
    .map((l) => cleanString(l))
    .filter(Boolean);

  const result = [];
  let obj = {};
  const rx = /^'?([^']+)'?\s*:\s*'?(.*?)'?$/;

  for (const line of lines) {
    const m = line.match(rx);
    if (!m) continue;
    const key = cleanString(m[1]);
    let val = cleanString(m[2]);

    if (!isNaN(val) && val !== "") {
      val = Number(val);
    } else if (["true", "false"].includes(String(val).toLowerCase())) {
      val = String(val).toLowerCase() === "true";
    }

    if (key.toLowerCase() === "images") {
      if (!obj.images) obj.images = [];
      obj.images.push(val);
      continue;
    }

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
const importCSVFolder = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected");

    const folder = process.env.CSV_FOLDER;
    if (!folder || !fs.existsSync(folder)) {
      throw new Error("CSV folder not found: " + folder);
    }

    const files = fs
      .readdirSync(folder)
      .filter((f) => f.toLowerCase().endsWith(".csv"));

    console.log(`📂 Found ${files.length} CSV files`);

    for (const file of files) {
      const csvFile = path.join(folder, file);
      let collectionName = path.basename(csvFile, path.extname(csvFile));
      collectionName = collectionName.replace(/\s+/g, "-").toLowerCase();

      console.log(`\n➡️ Importing: ${file} → Collection: ${collectionName}`);

      const DynamicModel = mongoose.model(
        collectionName,
        new mongoose.Schema({}, { strict: false, timestamps: true }),
        collectionName
      );

      const rows = await csv().fromFile(csvFile);

      const mapRowToDoc = (item) => ({
        identifiers: {
          productId: cleanString(item.identifiers_productId),
          sku: cleanString(item.identifiers_sku),
          slug: cleanString(item.identifiers_slug),
          barcode: cleanString(item.identifiers_barcode),
        },
        characteristics: {
          title: cleanString(item.characteristics_title),
          description: cleanString(item.characteristics_description),
          images: {
            primary: splitUrls(item.characteristics_images_primary),
            offers: splitUrls(item.characteristics_images_offers),
          },
          specifications: parseKeyValueArray(item.characteristics_specifications),
          weight: {
            value: toNumber(item.characteristics_weight_value),
            unit: cleanString(item.characteristics_weight_unit),
          },
          dimensions: {
            length: toNumber(item.characteristics_dimensions_length),
            width: toNumber(item.characteristics_dimensions_width),
            height: toNumber(item.characteristics_dimensions_height),
            unit: cleanString(item.characteristics_dimensions_unit),
          },
        },
        anchor: {
          category: cleanString(item.anchor_category),
          subcategory: cleanString(item.anchor_subcategory),
          subSubcategory: cleanString(item.anchor_subSubcategory),
          brand: cleanString(item.anchor_brand),
          manufacturer: cleanString(item.anchor_manufacturer),
          productType: cleanString(item.anchor_productType),
        },
        classification: {
          variants: parseKeyValueArray(item.classification_variants),
          attributes: {
            material: cleanString(item.classification_attributes_material),
            certification: splitMulti(item.classification_attributes_certification),
            warrantyPeriod: cleanString(item.classification_attributes_warrantyPeriod),
            countryOfOrigin: cleanString(item.classification_attributes_countryOfOrigin),
          },
        },
        pricing: {
          basePrice: toNumber(item.pricing_basePrice),
          comparePrice: toNumber(item.pricing_comparePrice),
          costPrice: toNumber(item.pricing_costPrice),
          currency: cleanString(item.pricing_currency) || "INR",
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
          metaTitle: cleanString(item.marketing_metaTitle),
          metaDescription: cleanString(item.marketing_metaDescription),
          keywords: splitMulti(item.marketing_keywords),
          isActive: toBool(item.marketing_isActive),
          isFeatured: toBool(item.marketing_isFeatured),
          isBestseller: toBool(item.marketing_isBestseller),
          featuredOrder: toNumber(item.marketing_featuredOrder),
          promotionText: cleanString(item.marketing_promotionText),
        },
      });

      const ops = [];
      for (const row of rows) {
        const doc = mapRowToDoc(row);
        const id = doc.identifiers || {};
        const filter = id.productId
          ? { "identifiers.productId": id.productId }
          : id.sku
          ? { "identifiers.sku": id.sku }
          : id.slug
          ? { "identifiers.slug": id.slug }
          : id.barcode
          ? { "identifiers.barcode": id.barcode }
          : { "characteristics.title": doc.characteristics?.title };

        ops.push({
          updateOne: {
            filter,
            update: { $set: doc },
            upsert: true,
          },
        });
      }

      if (ops.length > 0) {
        const result = await DynamicModel.bulkWrite(ops, { ordered: false });
        const upserts =
          result.upsertedCount ||
          (result.getUpsertedIds ? result.getUpsertedIds().length : 0) ||
          0;
        const modified = result.modifiedCount || 0;
        console.log(
          `✅ Upserted ${upserts}, Updated ${modified} docs in '${collectionName}'`
        );
      } else {
        console.log(`ℹ️ No rows found for '${collectionName}'`);
      }
    }

    await mongoose.connection.close();
    console.log("\n🎉 All CSV imports completed!");
  } catch (err) {
    console.error("❌ Error importing CSVs:", err);
    process.exit(1);
  }
};

importCSVFolder();