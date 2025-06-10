import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  passwordHash: string;
  learningSettings: {
    dailyTarget: number;
    voiceSpeed: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters long"],
      maxlength: [30, "Username cannot exceed 30 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address",
      ],
    },
    passwordHash: {
      type: String,
      required: [true, "Password hash is required"],
    },
    learningSettings: {
      dailyTarget: {
        type: Number,
        default: 20,
      },
      voiceSpeed: {
        type: Number,
        default: 1.0,
      },
    },
  },
  {
    timestamps: true,
  }
);

export default model<IUser>("User", userSchema);
