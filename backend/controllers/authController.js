import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// POST /api/auth/register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      bloodGroup: user.bloodGroup,
      address: user.address,
      home: user.home,
      office: user.office,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      bloodGroup: user.bloodGroup,
      address: user.address,
      home: user.home,
      office: user.office,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/auth/profile — protected, returns the logged-in user's full profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/auth/profile — protected, updates profile fields including saved Home/Office
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, bloodGroup, address, home, office } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (bloodGroup !== undefined) user.bloodGroup = bloodGroup;
    if (address !== undefined) user.address = address;

    if (home !== undefined) {
      user.home = {
        label: home.label || "",
        lat: home.lat ?? null,
        lon: home.lon ?? null,
      };
    }

    if (office !== undefined) {
      user.office = {
        label: office.label || "",
        lat: office.lat ?? null,
        lon: office.lon ?? null,
      };
    }

    await user.save();

    const updated = user.toObject();
    delete updated.password;

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
