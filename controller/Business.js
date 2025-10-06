import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import BusinessPermit from '../models/Business-Fsic.js';
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

const getEmailTemplate = (status, permitData) => {
  const { owner, business_name, or_number } = permitData;

  switch (status) {
    case 'approved':
      return {
        subject: 'Business Permit Approved - OR No: ' + or_number,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #28a745;">🎉 Business Permit Approved!</h2>
            <p>Dear ${owner},</p>
            <p>We are pleased to inform you that your business permit application has been <strong style="color: #28a745;">APPROVED</strong>.</p>
            <div style="background-color: #f8f9fa; padding: 20px; border-left: 4px solid #28a745; margin: 20px 0;">
              <h3>Permit Details:</h3>
              <ul style="list-style: none; padding: 0;">
                <li><strong>OR Number:</strong> ${or_number}</li>
                <li><strong>Business Name:</strong> ${business_name}</li>
                <li><strong>Business Owner:</strong> ${owner}</li>
                <li><strong>Status:</strong> <span style="color: #28a745;">Approved</span></li>
              </ul>
            </div>
            <p>You can now proceed with your business operations. Please keep this permit information for your records.</p>
            <p>Thank you for your compliance with local business regulations.</p>
            <hr style="margin: 30px 0;">
            <p style="color: #6c757d; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
          </div>
        `
      };
    case 'rejected':
      return {
        subject: 'Business Permit Application Update - OR No: ' + or_number,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc3545;">❌ Business Permit Application Update</h2>
            <p>Dear ${owner},</p>
            <p>We regret to inform you that your business permit application has been <strong style="color: #dc3545;">REJECTED</strong>.</p>
            <div style="background-color: #f8f9fa; padding: 20px; border-left: 4px solid #dc3545; margin: 20px 0;">
              <h3>Application Details:</h3>
              <ul style="list-style: none; padding: 0;">
                <li><strong>OR Number:</strong> ${or_number}</li>
                <li><strong>Business Name:</strong> ${business_name}</li>
                <li><strong>Business Owner:</strong> ${owner}</li>
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
        subject: 'Business Permit Status Update - OR No: ' + or_number,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #ffc107;">📋 Business Permit Status Update</h2>
            <p>Dear ${owner},</p>
            <p>Your business permit application status has been updated to: <strong style="color: #ffc107;">${status.toUpperCase()}</strong></p>
            <div style="background-color: #f8f9fa; padding: 20px; border-left: 4px solid #ffc107; margin: 20px 0;">
              <h3>Application Details:</h3>
              <ul style="list-style: none; padding: 0;">
                <li><strong>OR Number:</strong> ${or_number}</li>
                <li><strong>Business Name:</strong> ${business_name}</li>
                <li><strong>Business Owner:</strong> ${owner}</li>
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
    const emailTemplate = getEmailTemplate(status, permitData);
    const mailOptions = {
      from: `"Business Permit Admin" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: emailTemplate.subject,
      html: emailTemplate.html
    };
    
    const result = await transporter.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

export const CreatePermit = async (req, res) => {
  try {
    const {
      contact_number,
      business_name,
      owner,
      brgy,
      complete_address,
      floor_area,
      no_of_storeys,
      rental,
      nature_of_business,
      bir_tin,
      expiry,
      amount_paid,
      or_number,
      date_applied,
      type_of_occupancy,
      date_released,
      status
    } = req.body;

    if (!business_name || !owner || !or_number) {
      return res.status(400).json({ message: "Missing required fields", success: false });
    }

    const existingPermit = await BusinessPermit.findOne({
      business_name,
      owner,
      or_number
    });

    if (existingPermit) {
      return res.status(409).json({ message: "Business permit already exists", success: false });
    }

    const newPermit = new BusinessPermit({
      user: req.user.id,
      contact_number,
      business_name,
      owner,
      brgy,
      complete_address,
      floor_area,
      no_of_storeys,
      rental,
      nature_of_business,
      bir_tin,
      expiry,
      amount_paid: amount_paid || 0,
      or_number,
      date_applied: date_applied || new Date(),
      type_of_occupancy,
      date_released,
      status: status || 'pending'
    });

    await newPermit.save();
    res.status(201).json({ message: "Business permit created successfully!", success: true });
  } catch (error) {
    console.error("CreatePermit Error:", error);
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
      contact_number,
      business_name,
      owner,
      brgy,
      complete_address,
      floor_area,
      no_of_storeys,
      rental,
      nature_of_business,
      bir_tin,
      expiry,
      amount_paid,
      or_number,
      date_applied,
      type_of_occupancy,
      date_released,
      status
    } = req.body;

    if (!business_name || !owner || !or_number) {
      return res.status(400).json({ message: "Missing required fields", success: false });
    }

    const permit = await BusinessPermit.findById(id);

    if (!permit) {
      return res.status(404).json({ message: "Permit not found", success: false });
    }

    permit.contact_number = contact_number;
    permit.business_name = business_name;
    permit.owner = owner;
    permit.brgy = brgy;
    permit.complete_address = complete_address;
    permit.floor_area = floor_area;
    permit.no_of_storeys = no_of_storeys;
    permit.rental = rental;
    permit.nature_of_business = nature_of_business;
    permit.bir_tin = bir_tin;
    permit.expiry = expiry;
    permit.amount_paid = amount_paid;
    permit.or_number = or_number;
    permit.date_applied = date_applied;
    permit.type_of_occupancy = type_of_occupancy;
    permit.date_released = date_released;

    if (status) {
      permit.status = status;
    }

    await permit.save();
    res.status(200).json({ message: "Permit updated successfully!", success: true });
  } catch (error) {
    console.error("UpdatePermit Error:", error);
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

    const permit = await BusinessPermit.findById(id).populate('user', 'email');

    if (!permit) {
      return res.status(404).json({ message: "Permit not found", success: false });
    }

    permit.status = status;
    await permit.save();

    if (permit.user && permit.user.email) {
      const permitData = {
        owner: permit.owner,
        business_name: permit.business_name,
        or_number: permit.or_number
      };

      const emailResult = await sendStatusEmail(permit.user.email, status, permitData);
      
      if (emailResult.success) {
        console.log(`Email notification sent successfully to ${permit.user.email} for status: ${status}`);
      } else {
        console.error(`Failed to send email notification: ${emailResult.error}`);
      }
    }

    res.status(200).json({ 
      message: `Permit status updated to ${status}`, 
      success: true,
      emailSent: permit.user?.email ? true : false
    });
  } catch (error) {
    console.error("UpdateStatus Error:", error);
    res.status(500).json({ message: "Error updating permit status", error: error.message });
  }
};

export const DeletePermit = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format", success: false });
    }

    const result = await BusinessPermit.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Permit not found", success: false });
    }

    res.status(200).json({ message: "Permit deleted successfully!", success: true });
  } catch (error) {
    console.error("DeletePermit Error:", error);
    res.status(500).json({ message: "Error deleting permit", error: error.message });
  }
};

export const GetPermit = async (req, res) => {
  try {
    const permits = await BusinessPermit.find().populate("user");

    if (!permits || permits.length === 0) {
      return res.status(404).json({ message: "No permits found", success: false });
    }

    res.status(200).json({ permits, success: true });
  } catch (error) {
    console.error("GetPermit Error:", error);
    res.status(500).json({ message: "Error retrieving permits", error: error.message });
  }
};

export const SearchPermits = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: "Search query is required", success: false });
    }
    
    const searchPattern = new RegExp(query, 'i');
    
    const permits = await BusinessPermit.find({
      $or: [
        { business_name: searchPattern },
        { owner: searchPattern },
        { contact_number: searchPattern },
        { brgy: searchPattern },
        { nature_of_business: searchPattern },
        { bir_tin: searchPattern },
        { or_number: searchPattern },
        { type_of_occupancy: searchPattern },
        { status: searchPattern }
      ]
    }).populate("user");
    
    if (permits.length === 0) {
      return res.status(404).json({ message: "No matching permits found", success: false });
    }
    
    res.status(200).json({ permits, success: true });
  } catch (error) {
    console.error("SearchPermits Error:", error);
    res.status(500).json({ message: "Error searching permits", error: error.message });
  }
};

export const GetPermitsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    
    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: "Invalid status value", success: false });
    }
    
    const permits = await BusinessPermit.find({ status }).populate("user");
    
    if (!permits || permits.length === 0) {
      return res.status(404).json({ message: `No permits found with status: ${status}`, success: false });
    }
    
    res.status(200).json({ permits, success: true });
  } catch (error) {
    console.error("GetPermitsByStatus Error:", error);
    res.status(500).json({ message: "Error retrieving permits by status", error: error.message });
  }
};