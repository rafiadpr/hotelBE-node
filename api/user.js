const express = require("express");
const Op = require("sequelize").Op;
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const md5 = require("md5");
const userModel = require("../models/index").User;
const app = express();
const upload = multer({ dest: "uploads/" });

// Define routes for user operations
app.get("/", async (req, res) => {
  try {
    const users = await userModel.findAll();
    res.json(users);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route for creating a new user record
app.post("/", upload.single("foto"), async (req, res) => {
  try {
    const { nama_user, email, password, role } = req.body;
    const { filename } = req.file; // Get the filename of the uploaded file
    const hashedPassword = md5(password); // Hash the password using MD5

    const createdUser = await userModel.create({
      nama_user,
      foto: filename, // Use the filename in the database
      email,
      password: hashedPassword, // Save the hashed password in the database
      role,
    });

    console.log("Data inserted successfully");
    res.status(201).json({
      message: "Data inserted successfully",
      data: createdUser.toJSON(), // Include the created data in the response
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.put("/:id", upload.single("foto"), async (req, res) => {
  try {
    const { nama_user, email, password, role } = req.body;

    const userId = req.params.id;

    // Check if the record with the given ID exists
    const existingUser = await userModel.findByPk(userId);

    if (!existingUser) {
      return res.status(404).json({ error: "Record not found" });
    }

    // Update the fields that have new values provided in the request body
    if (nama_user) {
      existingUser.nama_user = nama_user;
    }
    if (email) {
      existingUser.email = email;
    }
    if (password) {
      existingUser.password = md5(password);
    }
    if (role) {
      existingUser.role = role;
    }

    // Check if a file has been uploaded
    if (req.file) {
      existingUser.foto = req.file.filename; // Update the photo if a new one is provided
    }

    const updatedUser = await existingUser.save();

    console.log("Data updated successfully");
    res.status(200).json({
      message: "Data updated successfully",
      data: updatedUser, // Include the updated data in the response
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.delete("/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    // Find the user by ID and delete it
    const deletedUser = await userModel.destroy({
      where: {
        id: userId,
      },
    });

    if (deletedUser) {
      res.json({
        success: true,
        message: "Data deleted successfully",
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Data not found",
      });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = app;
