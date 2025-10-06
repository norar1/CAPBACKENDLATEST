import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import Occupancy from '../models/Occupancy.js';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.log('Email transporter verification failed:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

const getOccupancyEmailTemplate = (status, permitData) => {
  const { owner_establishment, control_no, address } = permitData;

  switch (status) {
    case 'approved':
      return {
        subject: 'Occupancy Permit Approved - Control No: ' + control_no,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #28a745;">🎉 Occupancy Permit Approved!</h2>
            <p>Dear ${owner_establishment},</p>
            <p>We are pleased to inform you that your occupancy permit application has been <strong style="color: #28a745;">APPROVED</strong>.</p>
            <div style="background-color: #f8f9fa; padding: 20px; border-left: 4px solid #28a745; margin: 20px 0;">
              <h3>Permit Details:</h3>
              <ul style="list-style: none; padding: 0;">
                <li><strong>Control Number:</strong> ${control_no}</li>
                <li><strong>Property Owner:</strong> ${owner_establishment}</li>
                <li><strong>Address:</strong> ${address}</li>
                <li><strong>Status:</strong> <span style="color: #28a745;">Approved</span></li>
              </ul>
            </div>
            <p>Your building is now approved for occupancy. Please keep this permit information for your records.</p>
            <p>Thank you for your compliance with local occupancy regulations.</p>
            <hr style="margin: 30px 0;">
            <p style="color: #6c757d; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
          </div>
        `
      };
    case 'rejected':
      return {
        subject: 'Occupancy Permit Application Update - Control No: ' + control_no,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc3545;">❌ Occupancy Permit Application Update</h2>
            <p>Dear ${owner_establishment},</p>
            <p>We regret to inform you that your occupancy permit application has been <strong style="color: #dc3545;">REJECTED</strong>.</p>
            <div style="background-color: #f8f9fa; padding: 20px; border-left: 4px solid #dc3545; margin: 20px 0;">
              <h3>Application Details:</h3>
              <ul style="list-style: none; padding: 0;">
                <li><strong>Control Number:</strong> ${control_no}</li>
                <li><strong>Property Owner:</strong> ${owner_establishment}</li>
                <li><strong>Address:</strong> ${address}</li>
                <li><strong>Status:</strong> <span style="color: #dc3545;">Rejected</span></li>
              </ul>
            </div>
            <p>Please contact our office for more information about the reasons for rejection and the steps needed to resubmit your application.</p>
            <p>We appreciate your understanding and look forward to assisting you further.</p>
            <hr style="margin: 30px 0;">
            <p style="color: #6c757d; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
          </div>
        `
      };
    default:
      return {
        subject: 'Occupancy Permit Status Update - Control No: ' + control_no,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #ffc107;">📋 Occupancy Permit Status Update</h2>
            <p>Dear ${owner_establishment},</p>
            <p>Your occupancy permit application status has been updated to: <strong style="color: #ffc107;">${status.toUpperCase()}</strong></p>
            <div style="background-color: #f8f9fa; padding: 20px; border-left: 4px solid #ffc107; margin: 20px 0;">
              <h3>Application Details:</h3>
              <ul style="list-style: none; padding: 0;">
                <li><strong>Control Number:</strong> ${control_no}</li>
                <li><strong>Property Owner:</strong> ${owner_establishment}</li>
                <li><strong>Address:</strong> ${address}</li>
                <li><strong>Status:</strong> ${status}</li>
              </ul>
            </div>
            <p>We will keep you updated on any further changes to your application status.</p>
            <hr style="margin: 30px 0;">
            <p style="color: #6c757d; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
          </div>
        `
      };
  }
};

const sendStatusEmail = async (userEmail, status, permitData) => {
  try {
    const emailTemplate = getOccupancyEmailTemplate(status, permitData);
    const mailOptions = {
      from: `"Fire Station Admin" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: emailTemplate.subject,
      html: emailTemplate.html
    };
    
    const result = await transporter.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const CreatePermit = async (req, res) => {
  try {
    const {
      date_received,
      owner_establishment,
      address,
      fcode_fee,
      or_no,
      inspected_by,
      date_released_fsic,
      control_no,
      status,
      payment_status,
      last_payment_date
    } = req.body;

    if (!date_received || !owner_establishment || !address || !control_no) {
      return res.status(400).json({ message: "Missing required fields", success: false });
    }

    const existingPermit = await Occupancy.findOne({
      owner_establishment,
      address,
      control_no
    });

    if (existingPermit) {
      return res.status(409).json({ message: "Occupancy permit already exists", success: false });
    }

    const newPermit = new Occupancy({
      user: req.user.id,
      date_received,
      owner_establishment,
      address,
      fcode_fee,
      or_no,
      inspected_by,
      date_released_fsic,
      control_no,
      status: status || 'pending',
      payment_status: payment_status || 'not_paid',
      last_payment_date: last_payment_date || null
    });

    await newPermit.save();

    res.status(201).json({ message: "Occupancy permit created successfully!", success: true });
  } catch (error) {
    res.status(500).json({ message: "Error creating permit", error: error.message });
  }
};

export const UpdatePermit = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format", success: false });
    }

    const {
      date_received,
      owner_establishment,
      address,
      fcode_fee,
      or_no,
      inspected_by,
      date_released_fsic,
      control_no,
      status,
      payment_status,
      last_payment_date
    } = req.body;

    if (!date_received || !owner_establishment || !address || !control_no) {
      return res.status(400).json({ message: "Missing required fields", success: false });
    }

    const permit = await Occupancy.findById(id);

    if (!permit) {
      return res.status(404).json({ message: "Permit not found", success: false });
    }

    permit.date_received = date_received;
    permit.owner_establishment = owner_establishment;
    permit.address = address;
    permit.fcode_fee = fcode_fee;
    permit.or_no = or_no;
    permit.inspected_by = inspected_by;
    permit.date_released_fsic = date_released_fsic;
    permit.control_no = control_no;

    if (status) {
      permit.status = status;
    }

    if (payment_status !== undefined) {
      permit.payment_status = payment_status;
    }

    if (last_payment_date !== undefined) {
      permit.last_payment_date = last_payment_date;
    }

    await permit.save();

    res.status(200).json({ message: "Permit updated successfully!", success: true });
  } catch (error) {
    res.status(500).json({ message: "Error updating permit", error: error.message });
  }
};

export const UpdateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format", success: false });
    }

    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: "Invalid status value", success: false });
    }

    const permit = await Occupancy.findById(id).populate('user', 'email');

    if (!permit) {
      return res.status(404).json({ message: "Permit not found", success: false });
    }

    permit.status = status;
    await permit.save();

    if (permit.user && permit.user.email) {
      const permitData = {
        owner_establishment: permit.owner_establishment,
        control_no: permit.control_no,
        address: permit.address
      };

      const emailResult = await sendStatusEmail(permit.user.email, status, permitData);
    }

    res.status(200).json({ 
      message: `Occupancy permit status updated to ${status}`, 
      success: true,
      emailSent: permit.user?.email ? true : false
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating permit status", error: error.message });
  }
};

export const UpdatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status, last_payment_date } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format", success: false });
    }

    if (!payment_status || !['paid', 'not_paid'].includes(payment_status)) {
      return res.status(400).json({ message: "Invalid payment status value", success: false });
    }

    const permit = await Occupancy.findById(id);

    if (!permit) {
      return res.status(404).json({ message: "Permit not found", success: false });
    }

    permit.payment_status = payment_status;
    
    if (payment_status === 'paid' && last_payment_date) {
      permit.last_payment_date = last_payment_date;
    } else if (payment_status === 'not_paid') {
      permit.last_payment_date = null;
    }

    await permit.save();

    res.status(200).json({ 
      message: `Occupancy payment status updated to ${payment_status}`, 
      success: true 
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating payment status", error: error.message });
  }
};

export const DeletePermit = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format", success: false });
    }

    const result = await Occupancy.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Permit not found", success: false });
    }

    res.status(200).json({ message: "Permit deleted successfully!", success: true });
  } catch (error) {
    res.status(500).json({ message: "Error deleting permit", error: error.message });
  }
};

export const GetPermit = async (req, res) => {
  try {
    const permits = await Occupancy.find().populate("user");

    if (!permits || permits.length === 0) {
      return res.status(404).json({ message: "No permits found", success: false });
    }

    res.status(200).json({ permits, success: true });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving permits", error: error.message });
  }
};

export const GetPermitsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    
    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: "Invalid status value", success: false });
    }
    
    const permits = await Occupancy.find({ status }).populate("user");
    
    if (!permits || permits.length === 0) {
      return res.status(404).json({ message: `No permits with status '${status}' found`, success: false });
    }
    
    res.status(200).json({ permits, success: true });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving permits by status", error: error.message });
  }
};

export const SearchPermits = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: "Search query is required", success: false });
    }
    
    const searchPattern = new RegExp(query, 'i');
    
    const permits = await Occupancy.find({
      $or: [
        { owner_establishment: searchPattern },
        { address: searchPattern },
        { control_no: searchPattern },
        { inspected_by: searchPattern },
        { or_no: searchPattern },
        { fcode_fee: searchPattern },
        { status: searchPattern },
        { payment_status: searchPattern }
      ]
    }).populate("user");
    
    if (permits.length === 0) {
      return res.status(404).json({ message: "No matching permits found", success: false });
    }
    
    res.status(200).json({ permits, success: true });
  } catch (error) {
    res.status(500).json({ message: "Error searching permits", error: error.message });
  }
};