import Contact from "../models/contact.js";
import { normalizePhoneNumber } from "../utils/phoneNumber.js";

// GET /api/contacts — get all contacts for logged-in user
export const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find({ user: req.user._id });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/contacts — add a new contact
export const addContact = async (req, res) => {
  try {
    const { name, phone, relation, email } = req.body;

    if (!name || !phone || !relation) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const normalizedPhone = normalizePhoneNumber(phone);
    if (!normalizedPhone) {
      return res.status(400).json({
        message: "Enter a valid phone number in international format, for example +919876543210",
      });
    }

    const contact = await Contact.create({
      user: req.user._id,
      name,
      phone: normalizedPhone,
      relation,
      email: email || "",
    });

    res.status(201).json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/contacts/:id — delete a contact
export const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    // Make sure contact belongs to the logged-in user
    if (contact.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await contact.deleteOne();
    res.json({ message: "Contact deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
