const express = require("express");
const path = require("path");
const fs = require("fs");
const { Sequelize, Op } = require("sequelize");
const sequelize = new Sequelize('hotelbe', 'root', '', {
  host: 'localhost',
  dialect: 'mysql', // or 'postgres', 'sqlite', etc.
});
const kamarModel = require("../models/index").Kamar;
const pemesananModel = require("../models/index").Pemesanan;
const app = express();

// Define routes for kamar operations
app.get("/", async (req, res) => {
  try {
    const kamar = await kamarModel.findAll();
    res.json(kamar);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route for creating a new kamar record
app.post("/", async (req, res) => {
  try {
    const { nomor_kamar, id_tipe_kamar, tersedia } = req.body;

    const createdKamar = await kamarModel.create({
      nomor_kamar: nomor_kamar,
      id_tipe_kamar: id_tipe_kamar,
      tersedia: tersedia,
    });

    console.log("Data inserted successfully");
    res.status(201).json({
      message: "Data inserted successfully",
      data: createdKamar,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.put("/:id", async (req, res) => {
  try {
    const { nomor_kamar, id_tipe_kamar, tersedia } = req.body;
    const kamarId = req.params.id;

    // Check if the kamar with the specified ID exists
    const existingKamar = await kamarModel.findByPk(kamarId);

    if (!existingKamar) {
      return res.status(404).json({ error: "Kamar not found" });
    }

    // Update the kamar data
    await existingKamar.update({
      nomor_kamar: nomor_kamar,
      id_tipe_kamar: id_tipe_kamar,
      tersedia: tersedia,
    });

    console.log("Data updated successfully");
    res.status(200).json({
      message: "Data updated successfully",
      data: existingKamar,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/search", async (req, res) => {
  try {
    const { keyword } = req.body;

    // Use Op.iLike to perform a case-insensitive search
    const kamar = await kamarModel.findAll({
      where: {
        [Op.or]: [
          { id: { [Op.substring]: keyword } },
          { nomor_kamar: { [Op.substring]: keyword } },
          { id_tipe_kamar: { [Op.substring]: keyword } },
          { tersedia: { [Op.substring]: keyword } },
        ],
      },
    });

    if (kamar.length === 0) {
      return res.status(404).json({ message: "Kamar not found" });
    }

    res.json(kamar);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/available", async (req, res) => {
  try {
    // Use Op.iLike to perform a case-insensitive search
    const kamar = await kamarModel.findAll({
      where: {
        tersedia: true,
      },
    });

    if (kamar.length === 0) {
      return res.status(404).json({ message: "No available kamar found" });
    }

    res.json(kamar);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/find", async (req, res) => {
  try {
    const { tgl_check_in, tgl_check_out } = req.body; // Assuming you get these dates from the request body

    // Use Sequelize's `query` method to perform a custom SQL query
    const availableRooms = await sequelize.query(
      `
      SELECT DISTINCT k.*
      FROM kamar AS k
      WHERE k.tersedia = true
      AND k.id NOT IN (
        SELECT p.id_kamar
        FROM pemesanan AS p
        WHERE (
          (p.tgl_check_in <= :tgl_check_in AND p.tgl_check_out >= :tgl_check_in)
          OR (p.tgl_check_in <= :tgl_check_out AND p.tgl_check_out >= :tgl_check_out)
          OR (p.tgl_check_in >= :tgl_check_in AND p.tgl_check_out <= :tgl_check_out)
        )
      )
    `,
      {
        replacements: { tgl_check_in, tgl_check_out },
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    if (availableRooms.length === 0) {
      return res.status(404).json({ message: "No available kamar found" });
    }

    res.json(availableRooms);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.delete("/:id", async (req, res) => {
  try {
    const kamarId = req.params.id;

    // Find the kamar by ID and delete it
    const deletedKamar = await kamarModel.destroy({
      where: {
        id: kamarId,
      },
    });

    if (deletedKamar) {
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
