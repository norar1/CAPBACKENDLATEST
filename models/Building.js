import mongoose from "mongoose";

const BuildingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: true
  },
  date_received: {
    type: String,
    default: null
  },
  owner_establishment: {
    type: String,
    default: null
  },
  location: {
    type: String,
    default: null
  },
  fcode_fee: {
    type: String,
    default: null
  },
  or_no: {
    type: String,
    default: null
  },
  evaluated_by: {
    type: String,
    default: null
  },
  date_released_fsec: {
    type: String,
    default: null
  },
  control_no: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  payment_status: {
    type: String,
    enum: ['paid', 'not_paid'],
    default: 'not_paid'
  },
  last_payment_date: {
    type: String,
    default: null
  },
  validity_period: {
    type: String,
    default: null
  },
  permit_fee: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const Building = mongoose.model("Building", BuildingSchema);

export default Building;
