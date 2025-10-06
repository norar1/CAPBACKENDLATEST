import mongoose from "mongoose";

const OccupancySchema = new mongoose.Schema({
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
  address: {
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
  inspected_by: {
    type: String,
    default: null
  },
  date_released_fsic: {
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
  inspection_date: {
    type: String,
    default: null
  },
  certificate_fee: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const Occupancy = mongoose.model("Occupancy", OccupancySchema);

export default Occupancy;