import mongoose from "mongoose";

const savedPlaceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    label: {
      type: String,
      required: true, // e.g. "Home", "Office", or a custom name
    },
    icon: {
      type: String,
      default: "📍", // 🏠 for Home, 🏢 for Office, etc.
    },
    address: {
      type: String,
      required: true,
    },
    lat: {
      type: Number,
      required: true,
    },
    lon: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const SavedPlace = mongoose.model("SavedPlace", savedPlaceSchema);

export default SavedPlace;
