import mongoose from "mongoose";
import crypto from "crypto";

const walkSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    destination: {
      type: String,
      required: true,
    },
    destinationLat: { type: Number, default: null },
    destinationLon: { type: Number, default: null },
    source: {
      type: String,
      default: "",
    },
    currentLat: { type: Number, default: null },
    currentLon: { type: Number, default: null },
    lastUpdated: { type: Date, default: Date.now },
    eta: {
      type: String,
      default: "",
    },
    etaMinutes: { type: Number, default: null },
    duration: {
      type: String,
      default: "0 min",
    },
    status: {
      type: String,
      enum: ["Ongoing", "Safe", "SOS"],
      default: "Ongoing",
    },
    sosLastAttemptAt: { type: Date, default: null },
    sosDeliveredPhones: { type: [String], default: [] },
    shareToken: {
      type: String,
      unique: true,
      sparse: true,
      default: () => crypto.randomBytes(12).toString("hex"),
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Walk = mongoose.model("Walk", walkSchema);

export default Walk;
