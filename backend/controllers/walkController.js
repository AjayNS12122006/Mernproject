import Walk from "../models/walk.js";
import User from "../models/user.js";
import Contact from "../models/contact.js";
import { sendSOSEmailAlerts } from "../utils/alertService.js";

// GET /api/walks — get all walks for logged-in user (history)
export const getWalks = async (req, res) => {
  try {
    const walks = await Walk.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(walks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/walks/start — create a new in-progress walk, returns a shareToken
export const startWalk = async (req, res) => {
  try {
    const {
      destination,
      destinationLat,
      destinationLon,
      source,
      eta,
      etaMinutes,
      currentLat,
      currentLon,
    } = req.body;

    if (!destination) {
      return res.status(400).json({ message: "Destination is required" });
    }

    const walk = await Walk.create({
      user: req.user._id,
      destination,
      destinationLat: destinationLat ?? null,
      destinationLon: destinationLon ?? null,
      source: source || "",
      eta: eta || "",
      etaMinutes: etaMinutes ?? null,
      currentLat: currentLat ?? null,
      currentLon: currentLon ?? null,
      status: "Ongoing",
    });

    res.status(201).json(walk);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/walks/:id/location — update live location while tracking
export const updateLocation = async (req, res) => {
  try {
    const { lat, lon } = req.body;

    const walk = await Walk.findById(req.params.id);

    if (!walk) {
      return res.status(404).json({ message: "Walk not found" });
    }

    if (walk.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    walk.currentLat = lat;
    walk.currentLon = lon;
    walk.lastUpdated = new Date();
    await walk.save();

    res.json({ message: "Location updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/walks/:id/finish — mark a walk Safe or SOS.
export const finishWalk = async (req, res) => {
  try {
    const { status, duration } = req.body;

    const walk = await Walk.findById(req.params.id);

    if (!walk) {
      return res.status(404).json({ message: "Walk not found" });
    }

    if (walk.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    walk.status = status === "SOS" ? "SOS" : "Safe";
    walk.duration = duration || walk.duration;
    await walk.save();

    res.json(walk);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/walks/:id/sos — persist SOS state before the user chooses recipients in WhatsApp.
export const triggerWalkSOS = async (req, res) => {
  try {
    const walk = await Walk.findById(req.params.id);

    if (!walk) {
      return res.status(404).json({ message: "Walk not found" });
    }

    if (walk.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const now = new Date();

    const { lat, lon } = req.body || {};
    const validCoordinate = (value, min, max) =>
      value !== null && value !== undefined && value !== "" &&
      Number.isFinite(Number(value)) && Number(value) >= min && Number(value) <= max;

    walk.status = "SOS";
    if (validCoordinate(lat, -90, 90) && validCoordinate(lon, -180, 180)) {
      walk.currentLat = Number(lat);
      walk.currentLon = Number(lon);
      walk.lastUpdated = now;
    }
    walk.sosLastAttemptAt = now;
    await walk.save();

    // Send email alerts automatically when SOS is triggered. Email failures
    // are reported but do not block the existing WhatsApp flow.
    let emailAlerts = [];
    try {
      const [user, contacts] = await Promise.all([
        User.findById(req.user._id).select("name email"),
        Contact.find({ user: req.user._id }),
      ]);

      const locationUrl =
        walk.currentLat != null && walk.currentLon != null
          ? `https://maps.google.com/?q=${walk.currentLat},${walk.currentLon}`
          : "";
      const frontendBase = (process.env.FRONTEND_URL || "").replace(/\/$/, "");
      const trackingUrl = frontendBase
        ? `${frontendBase}/track/${walk.shareToken}`
        : "";

      emailAlerts = await sendSOSEmailAlerts({
        user,
        contacts,
        destination: walk.destination,
        source: walk.source,
        locationUrl,
        trackingUrl,
        timestamp: now.toLocaleString(),
      });
    } catch (emailError) {
      // The SOS state has already been saved. Do not fail the SOS response
      // or prevent the frontend from opening WhatsApp.
      console.error("[SOS] Email alert processing failed:", emailError.message);
      emailAlerts = [{ channel: "email", sent: false, reason: "Email alert processing failed" }];
    }

    res.json({
      success: true,
      shareToken: walk.shareToken,
      currentLat: walk.currentLat,
      currentLon: walk.currentLon,
      emailAlerts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Could not send SOS alerts" });
  }
};

// GET /api/walks/track/:shareToken — PUBLIC, no auth. For live-share links sent via WhatsApp etc.
export const getPublicTrack = async (req, res) => {
  try {
    const walk = await Walk.findOne({ shareToken: req.params.shareToken }).populate(
      "user",
      "name"
    );

    if (!walk) {
      return res.status(404).json({ message: "Tracking link not found or expired" });
    }

    res.json({
      userName: walk.user?.name || "A friend",
      destination: walk.destination,
      destinationLat: walk.destinationLat,
      destinationLon: walk.destinationLon,
      source: walk.source,
      currentLat: walk.currentLat,
      currentLon: walk.currentLon,
      lastUpdated: walk.lastUpdated,
      status: walk.status,
      eta: walk.eta,
      createdAt: walk.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/walks/:id — delete a walk record
export const deleteWalk = async (req, res) => {
  try {
    const walk = await Walk.findById(req.params.id);

    if (!walk) {
      return res.status(404).json({ message: "Walk not found" });
    }

    if (walk.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await walk.deleteOne();
    res.json({ message: "Walk deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
