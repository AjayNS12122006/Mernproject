import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      default: "",
    },

    bloodGroup: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      default: "",
    },

    home: {
      label: { type: String, default: "" },
      lat: { type: Number, default: null },
      lon: { type: Number, default: null },
    },

    office: {
      label: { type: String, default: "" },
      lat: { type: Number, default: null },
      lon: { type: Number, default: null },
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;