import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    password: String,
    isActive: {
      type: Boolean,
      default: false
    },
    rates: {
      type: [String],
      default: []
    },
    library: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("User", userSchema);
