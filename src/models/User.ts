import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  role: 'user' | 'admin';
  interests: string[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    interests: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

// ------------------------------------------------------------------------------------------
// Explicit Index Definitions (required by task specification: use schema.index method)
// ------------------------------------------------------------------------------------------

// 1. Unique index on email: Supports fast authentication lookups and guarantees email uniqueness
userSchema.index({ email: 1 }, { unique: true });

// 2. Multikey index on interests: Specifically supports Aggregation Scenario 1 (group by interests)
userSchema.index({ interests: 1 });

// 3. Compound index on role & createdAt: Supports Admin user list operations with pagination & sorting
userSchema.index({ role: 1, createdAt: -1 });

// Pre-save hook for secure password hashing
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to verify password on login
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Transform to remove sensitive information on JSON serialization
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

export const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);
export default User;
