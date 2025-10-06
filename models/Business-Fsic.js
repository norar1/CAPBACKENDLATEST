import mongoose from "mongoose";

const BusinessPermitSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: true
  },
  contact_number: {
    type: String,
    default: null
  },
  business_name: {
    type: String,
    required: true
  },
  owner: {
    type: String,
    required: true
  },
  brgy: {
    type: String,
    default: null
  },
  complete_address: {
    type: String,
    default: null
  },
  floor_area: {
    type: Number,
    default: null
  },
  no_of_storeys: {
    type: Number,
    default: null
  },
  rental: {
    type: String,
    enum: ['Y', 'N'],
    default: null
  },
  nature_of_business: {
    type: String,
    default: null
  },
  bir_tin: {
    type: String,
    default: null
  },
  expiry: {
    type: Date,
    default: null
  },
  amount_paid: {
    type: Number,
    default: 0
  },
  or_number: {
    type: String,
    default: null
  },
  date_applied: {
    type: Date,
    default: Date.now
  },
  type_of_occupancy: {
    type: String,
    default: null
  },
  date_released: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  processed_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    default: null
  }
}, {
  timestamps: true
});

BusinessPermitSchema.index({ owner: 1 });
BusinessPermitSchema.index({ business_name: 1 });
BusinessPermitSchema.index({ status: 1 });
BusinessPermitSchema.index({ date_applied: -1 });

const BusinessPermit = mongoose.model("BusinessPermit", BusinessPermitSchema);

export default BusinessPermit;
