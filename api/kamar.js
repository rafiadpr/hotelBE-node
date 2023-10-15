const express = require("express");
const cors = require("cors");
const { Sequelize, Op } = require("sequelize");

const sequelize = new Sequelize("hotelbe", "root", "", {
  host: "localhost",
  dialect: "mysql", // or 'postgres', 'sqlite', etc.
});

const { Kamar, Pemesanan } = require("../models/index");

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.get("/", async (req, res) => {
  try {
    const kamar = await Kamar.findAll();
    res.json(kamar);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/", async (req, res) => {
  try {
    const { nomor_kamar, id_tipe_kamar, tersedia } = req.body;

    const createdKamar = await Kamar.create({
      nomor_kamar,
      id_tipe_kamar,
      tersedia,
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

    const existingKamar = await Kamar.findByPk(kamarId);

    if (!existingKamar) {
      return res.status(404).json({ error: "Kamar not found" });
    }

    await existingKamar.update({
      nomor_kamar,
      id_tipe_kamar,
      tersedia,
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

    const kamar = await Kamar.findAll({
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

app.post("/find", async (req, res) => {
  try {
    const { tgl_check_in, tgl_check_out, id_tipe_kamar } = req.body;

    const availableRooms = await sequelize.query(
      `
      SELECT DISTINCT k.tersedia AS tipekamar
      FROM kamar AS k
      WHERE k.tersedia = true
      AND k.id_tipe_kamar = :id_tipe_kamar
      AND k.id NOT IN (
        SELECT p.id_tipe_kamar
        FROM pemesanan AS p
        WHERE (
          (p.tgl_check_in <= :tgl_check_in AND p.tgl_check_out >= :tgl_check_in)
          OR (p.tgl_check_in <= :tgl_check_out AND p.tgl_check_out >= :tgl_check_out)
          OR (p.tgl_check_in >= :tgl_check_in AND p.tgl_check_out <= :tgl_check_out)
        )
      )
    `,
      {
        replacements: { tgl_check_in, tgl_check_out, id_tipe_kamar },
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    if (availableRooms.length === 0) {
      return res.status(404).json({ message: "No available tipekamar found" });
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

    const deletedKamar = await Kamar.destroy({
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