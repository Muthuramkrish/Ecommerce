import bcrypt from "bcryptjs";

// Simple in-memory storage for demonstration
let users = [];
let nextId = 1;

class User {
  constructor(data) {
    this._id = nextId++;
    this.fullName = data.fullName;
    this.email = data.email.toLowerCase();
    this.password = data.password;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  // Static method to find user by email
  static async findOne(query) {
    if (query.email) {
      return users.find(user => user.email === query.email.toLowerCase()) || null;
    }
    return null;
  }

  // Static method to find user by ID
  static async findById(id) {
    return users.find(user => user._id == id) || null;
  }

  // Instance method to save user
  async save() {
    // Hash password before saving
    if (this.password && !this.password.startsWith('$2a$')) {
      const salt = await bcrypt.genSalt(12);
      this.password = await bcrypt.hash(this.password, salt);
    }
    
    this.updatedAt = new Date();
    
    // Check if user already exists
    const existingIndex = users.findIndex(user => user._id === this._id);
    if (existingIndex >= 0) {
      users[existingIndex] = this;
    } else {
      users.push(this);
    }
    
    return this;
  }

  // Instance method to compare password
  async comparePassword(candidatePassword) {
    if (!this.password) return false;
    return bcrypt.compare(candidatePassword, this.password);
  }

  // Convert to object (remove password)
  toObject() {
    const obj = { ...this };
    delete obj.password;
    return obj;
  }

  // Static method to get all users (for debugging)
  static getAllUsers() {
    return users.map(user => {
      const userObj = { ...user };
      delete userObj.password;
      return userObj;
    });
  }
}

export default User;