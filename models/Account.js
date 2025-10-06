import mongoose from "mongoose";

const AccountSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
    required: true
  }
});

const Account = mongoose.model("Account", AccountSchema);

export default Account;
