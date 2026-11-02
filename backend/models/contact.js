import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      match: [/^\+[1-9]\d{7,14}$/, "Phone number must be in E.164 format"],
    },
    email: {
      type: String,
      default: "",
    },
    relation: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Contact = mongoose.model("Contact", contactSchema);

export default Contact;
