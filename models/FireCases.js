import mongoose from "mongoose";

const FireIncidentSchema = new mongoose.Schema({
  barangay: {
    type: String,
    required: true,
    trim: true
  },
  purok: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  damageCost: {
    type: String,
    default: "Unknown"
  }
});

const FireIncident = mongoose.model("FireIncident", FireIncidentSchema);

export default FireIncident;
