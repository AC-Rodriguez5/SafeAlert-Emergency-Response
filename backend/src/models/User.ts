import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  password: string;
  contacts: {
    name: string;
    phone: string;
    isPrimary: boolean;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  contacts: [{
    name: { type: String, required: true },
    phone: { type: String, required: true },
    isPrimary: { type: Boolean, default: false },
  }],
}, {
  timestamps: true,
});

export const User = mongoose.model<IUser>('User', userSchema);
