import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import connectDB from "../config/db.js";
import User from "../models/user.js";

dotenv.config();

const createAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = "admin@shop.com";

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log("⚠️  Admin user already exists:");
      console.log("   Email:", existingAdmin.email);
      console.log("   ID:", existingAdmin._id);
      console.log("   Role:", existingAdmin.role);
      console.log("   Status:", existingAdmin.status);
      
      // ✅ Update admin if needed
      let updated = false;
      
      if (existingAdmin.role !== 'admin' && existingAdmin.role !== 'superadmin') {
        existingAdmin.role = 'admin';
        updated = true;
      }
      
      if (existingAdmin.status !== 'active') {
        existingAdmin.status = 'active';
        updated = true;
      }
      
      if (!existingAdmin.permissions || !existingAdmin.permissions.canManageUsers) {
        existingAdmin.permissions = {
          canManageOrders: true,
          canManageProducts: true,
          canManageUsers: true,
          canViewReports: true,
        };
        updated = true;
      }
      
      if (updated) {
        await existingAdmin.save();
        console.log("✅ Admin user updated successfully");
      }
      
      console.log("\n🔑 Login credentials:");
      console.log("   Email: admin@shop.com");
      console.log("   Password: Admin@123");
      
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    const admin = await User.create({
      fullName: "Admin User",
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
      permissions: {
        canManageOrders: true,
        canManageProducts: true,
        canManageUsers: true,
        canViewReports: true,
      },
      status: "active",
      termsAccepted: true,
    });

    console.log("✅ Admin user created successfully:");
    console.log("   Email:", admin.email);
    console.log("   ID:", admin._id);
    console.log("   Password: Admin@123");
    console.log("\n⚠️  IMPORTANT: Change password after first login!");
    
    process.exit(0);
  } catch (err) {
    console.error("❌ Error creating admin user:", err.message);
    console.error(err);
    process.exit(1);
  }
};

createAdmin();