import mongoose from "mongoose";
import FireIncident from "../models/FireCases.js";

export const CreateFire = async (req, res) => {
  try {
    const { barangay, purok, date, year, damageCost } = req.body;

    if (!barangay || !purok || !date || !year) {
      return res.status(400).json({ message: "Missing required fields", success: false });
    }

    const newFire = new FireIncident({
      barangay,
      purok,
      date,
      year,
      damageCost: damageCost || "Unknown"
    });

    await newFire.save();
    res.status(201).json({ message: "Fire incident created successfully!", success: true });
  } catch (error) {
    res.status(500).json({ message: "Error creating fire incident", error: error.message });
  }
};

export const GetFire = async (req, res) => {
  try {
    const fires = await FireIncident.find();
    if (!fires || fires.length === 0) {
      return res.status(404).json({ message: "No fire incidents found", success: false });
    }
    res.status(200).json({ fires, success: true });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving fire incidents", error: error.message });
  }
};

export const UpdateFire = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format", success: false });
    }

    const updated = await FireIncident.findByIdAndUpdate(id, req.body, { new: true });

    if (!updated) {
      return res.status(404).json({ message: "Fire incident not found", success: false });
    }

    res.status(200).json({ message: "Fire incident updated successfully!", success: true, updated });
  } catch (error) {
    res.status(500).json({ message: "Error updating fire incident", error: error.message });
  }
};

export const DeleteFire = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format", success: false });
    }

    const result = await FireIncident.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Fire incident not found", success: false });
    }

    res.status(200).json({ message: "Fire incident deleted successfully!", success: true });
  } catch (error) {
    res.status(500).json({ message: "Error deleting fire incident", error: error.message });
  }
};

export const SearchFire = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: "Search query is required", success: false });
    }

    const searchPattern = new RegExp(query, "i");

    const fires = await FireIncident.find({
      $or: [
        { barangay: searchPattern },
        { purok: searchPattern },
        { year: searchPattern },
        { damageCost: searchPattern }
      ]
    });

    if (fires.length === 0) {
      return res.status(404).json({ message: "No matching fire incidents found", success: false });
    }

    res.status(200).json({ fires, success: true });
  } catch (error) {
    res.status(500).json({ message: "Error searching fire incidents", error: error.message });
  }
};
