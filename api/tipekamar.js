const express = require("express");
const { Sequelize } = require("sequelize");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const { Tipe_Kamar, Kamar, Pemesanan } = require("../models/index");
const upload = multer({ dest: "uploads/" });

const app = express();
const port = 3000;

app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(express.json());

app.get("/", async (req, res) => {
  try {
    const tipekamar = await Tipe_Kamar.findAll();
    res.json(tipekamar);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/", upload.single("foto"), async (req, res) => {
  try {
    const { nama_tipe_kamar, harga, deskripsi } = req.body;
    const { filename } = req.file;
    const hargaInt = parseInt(harga, 10);

    const createdTipeKamar = await Tipe_Kamar.create({
      nama_tipe_kamar,
      harga: hargaInt,
      deskripsi,
      foto: filename,
    });

    console.log("Data inserted successfully");
    res.status(201).json({
      message: "Data inserted successfully",
      data: createdTipeKamar,
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
    const existingTipeKamar = await Tipe_Kamar.findByPk(tipeKamarId);

    if (!existingTipeKamar) {
      return res.status(404).json({ error: "Record not found" });
    }

    if (nama_tipe_kamar) existingTipeKamar.nama_tipe_kamar = nama_tipe_kamar;
    if (harga) existingTipeKamar.harga = hargaInt;
    if (deskripsi) existingTipeKamar.deskripsi = deskripsi;
    if (req.file) existingTipeKamar.foto = req.file.filename;

    const updatedTipeKamar = await existingTipeKamar.save();

    console.log("Data updated successfully");
    res.status(200).json({
      message: "Data updated successfully",
      data: updatedTipeKamar,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.delete("/:id", async (req, res) => {
  try {
    const tipekamarId = req.params.id;

    const deletedTipekamar = await Tipe_Kamar.destroy({
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
