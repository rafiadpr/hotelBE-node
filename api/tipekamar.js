const express = require("express");
const { Sequelize, Op } = require("sequelize");
const sequelize = new Sequelize("hotelbe", "root", "", {
  host: "localhost",
  dialect: "mysql", // or 'postgres', 'sqlite', etc.
});
const path = require(`path`);
const fs = require(`fs`);
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const tipeKamarModel = require("../models/index").Tipe_Kamar;
const app = express();

// Define routes for tipe_kamar operations
app.get("/", async (req, res) => {
  try {
    const tipekamar = await tipeKamarModel.findAll();
    res.json(tipekamar);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route for creating a new tipe_kamar record
app.post("/", upload.single("foto"), async (req, res) => {
  try {
    const { nama_tipe_kamar, harga, deskripsi } = req.body;
    const { filename } = req.file; // Get the filename of the uploaded file
    const hargaInt = parseInt(harga, 10);

    const createdTipeKamar = await tipeKamarModel.create({
      nama_tipe_kamar,
      harga: hargaInt,
      deskripsi,
      foto: filename, // Use the filename in the database
    });

    console.log("Data inserted successfully");
    res.status(201).json({
      message: "Data inserted successfully",
      data: createdTipeKamar, // Include the created data in the response
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.put("/:id", upload.single("foto"), async (req, res) => {
  try {
    const { nama_tipe_kamar, harga, deskripsi } = req.body;
    const hargaInt = parseInt(harga, 10);

    const tipeKamarId = req.params.id;

    // Check if the record with the given ID exists
    const existingTipeKamar = await tipeKamarModel.findByPk(tipeKamarId);

    if (!existingTipeKamar) {
      return res.status(404).json({ error: "Record not found" });
    }

    // Update the fields that have new values provided in the request body
    if (nama_tipe_kamar) {
      existingTipeKamar.nama_tipe_kamar = nama_tipe_kamar;
    }
    if (harga) {
      existingTipeKamar.harga = hargaInt;
    }
    if (deskripsi) {
      existingTipeKamar.deskripsi = deskripsi;
    }

    // Check if a file has been uploaded
    if (req.file) {
      existingTipeKamar.foto = req.file.filename; // Update the photo if a new one is provided
    }

    const updatedTipeKamar = await existingTipeKamar.save();

    console.log("Data updated successfully");
    res.status(200).json({
      message: "Data updated successfully",
      data: updatedTipeKamar, // Include the updated data in the response
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.delete("/:id", async (req, res) => {
  try {
    const tipekamarId = req.params.id;

    // Find the tipekamar by ID and delete it
    const deletedTipekamar = await tipeKamarModel.destroy({
      where: {
        id: tipekamarId,
      },
    });

    if (deletedTipekamar) {
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
