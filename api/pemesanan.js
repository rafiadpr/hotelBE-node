const express = require("express");
const Op = require("sequelize").Op;
const path = require("path");
const fs = require("fs");
const moment = require("moment");
const PDFDocument = require("pdfkit");
const kamarModel = require("../models/index").Kamar;
const pemesananModel = require("../models/index").Pemesanan;
const detailPemesananModel = require("../models/index").Detail_Pemesanan;
const tipeKamarModel = require("../models/index").Tipe_Kamar;
const userModel = require("../models/index").User;
const app = express();
const cors = require("cors");
const { sequelize } = require("../models/index");
const port = 3000;
app.use(cors());

function generateRandomNumber(n) {
  return Math.floor(Math.random() * 10 ** n)
    .toString()
    .padStart(n, "0");
}

async function isDuplicateBookingNumber(bookingNumber) {
  const result = await pemesananModel.findOne({
    where: { nomor_pemesanan: bookingNumber },
  });
  return !!result;
}

async function generateUniqueBookingNumber() {
  let bookingNumber;
  do {
    bookingNumber = generateRandomNumber(6);
  } while (await isDuplicateBookingNumber(bookingNumber));
  return bookingNumber;
}

app.get("/checkin", async (req, res) => {
  try {
    // Get the tgl_check_in parameter from the query string
    const tglCheckIn = new Date(req.query.tgl_check_in);
    tglCheckIn.setHours(12, 0, 0);

    // If tgl_check_in is provided in the query, use it for filtering
    if (tglCheckIn) {
      const pemesanan = await pemesananModel.findOne({
        where: { tgl_check_in: tglCheckIn },
      });
      res.json(pemesanan);
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/", async (req, res) => {
  try {
    const pemesanan = await pemesananModel.findAll();
    res.json(pemesanan);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/", async (req, res) => {
  try {
    // Set tgl_pemesanan and tgl_check_in to today's date
    const today = new Date();
    const tgl_pemesanan = today.toISOString().split("T")[0];

    // Set status_pemesanan to "baru"
    const status_pemesanan = "baru";

    const {
      nomor_pemesanan,
      nama_pemesan,
      email_pemesan,
      tgl_check_in,
      tgl_check_out,
      nama_tamu,
      jumlah_kamar,
      id_tipe_kamar, // Change id_kamar to id_tipe_kamar
      id_user,
      detail_pemesanan, // Include detail_pemesanan in the request body
    } = req.body;

    const nomorPemesanan = await generateUniqueBookingNumber();

    // Tanggal check-in yang dimasukkan oleh pengguna
    const tglCheckIn = new Date(tgl_check_in);
    tglCheckIn.setHours(12, 0, 0); // Set jam 12:00:00

    // Tanggal check-out yang dimasukkan oleh pengguna
    const tglCheckOut = new Date(tgl_check_out);
    tglCheckOut.setHours(12, 0, 0); // Set jam 12:00:00

    // Periksa apakah ada pemesanan dengan tanggal check-in yang sama
    const existingPemesanan = await pemesananModel.findOne({
      where: {
        tgl_check_in: tglCheckIn,
        tgl_check_out: tglCheckOut,
        id_tipe_kamar,
      },
    });

    const availableRooms = await kamarModel.findAll({
      where: {
        tersedia: "Tersedia",
        id_tipe_kamar,
      },
    });

    if (availableRooms.length === 0) {
      // Handle the case when no available rooms are found
      return res.status(400).json({ error: "No available rooms found" });
    }

    // Create a new pemesanan record for the reservation
    const createdPemesanan = await pemesananModel.create({
      nomor_pemesanan: nomorPemesanan,
      nama_pemesan,
      email_pemesan,
      tgl_pemesanan: tgl_pemesanan,
      tgl_check_in: tglCheckIn,
      tgl_check_out: tglCheckOut,
      nama_tamu,
      jumlah_kamar,
      id_tipe_kamar,
      id_user,
      status_pemesanan,
      id_kamar: availableRooms[0].id, // Use the ID of the first available room
    });

    console.log("Pemesanan inserted successfully");

    // Get the ID of the created pemesanan
    const pemesananID = createdPemesanan.id;

    if (detail_pemesanan && detail_pemesanan.length > 0) {
      // Fetch the harga from the tipekamar table based on id_tipe_kamar
      const tipeKamar = await tipeKamarModel.findOne({
        where: { id: id_tipe_kamar },
      });

      const detailsOfPemesanan = detail_pemesanan.map((detail) => ({
        id_kamar: detail.id_kamar,
        tgl_akses: new Date(),
        harga: tipeKamar.harga, // Use the harga from the tipekamar table
        id_pemesanan: pemesananID,
      }));

      const createdDetails = await detailPemesananModel.bulkCreate(
        detailsOfPemesanan
      );

      // Mark the reserved rooms as "Tidak Tersedia"
      await kamarModel.update(
        { tersedia: "Tidak Tersedia" },
        { where: { id: detailsOfPemesanan.map((detail) => detail.id_kamar) } }
      );

      return res.json({
        success: true,
        message: `New pemesanan has been inserted with details.`,
      });
    }

    res.status(201).json({
      message: "Data inserted successfully",
      data: createdPemesanan, // Include the created pemesanan data in the response
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update an existing pemesanan by ID
app.put("/:id", async (req, res) => {
  try {
    const pemesananID = req.params.id;

    // Check if the pemesanan exists
    const existingPemesanan = await pemesananModel.findOne({
      where: {
        id: pemesananID,
      },
    });

    if (!existingPemesanan) {
      return res.status(404).json({ error: "Pemesanan not found" });
    }

    // Update the pemesanan data
    const updatedPemesanan = await existingPemesanan.update(req.body);

    console.log("Pemesanan updated successfully");

    res.json({
      success: true,
      message: "Pemesanan updated successfully",
      data: updatedPemesanan,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.delete("/:id", async (req, res) => {
  try {
    const pemesananID = req.params.id;

    // Check if the pemesanan record exists
    const existingPemesanan = await pemesananModel.findOne({
      where: { id: pemesananID },
    });

    if (!existingPemesanan) {
      return res.status(404).json({ error: "Pemesanan not found" });
    }

    // Get the associated kamar ID
    const id_kamar = existingPemesanan.id_kamar;

    // Delete associated data in detailpemesanan table
    await detailPemesananModel.destroy({
      where: { id_pemesanan: pemesananID },
    });

    // Update the kamar table's tersedia column to "tersedia"
    await kamarModel.update(
      { tersedia: "Tersedia" },
      { where: { id: id_kamar } }
    );

    // Delete the pemesanan record
    await pemesananModel.destroy({
      where: { id: pemesananID },
    });

    res.json({
      success: true,
      message: "Data deleted successfully",
    }); // Send a 204 No Content response for successful deletion
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/search", async (req, res) => {
  try {
    const { keyword } = req.body;

    const pemesanan = await pemesananModel.findAll({
      where: {
        [Op.or]: [
          { nomor_pemesanan: { [Op.substring]: keyword } },
          { nama_pemesan: { [Op.substring]: keyword } },
          { email_pemesan: { [Op.substring]: keyword } },
          { tgl_pemesanan: { [Op.substring]: keyword } },
          { tgl_check_in: { [Op.substring]: keyword } },
          { tgl_check_out: { [Op.substring]: keyword } },
          { nama_tamu: { [Op.substring]: keyword } },
          { jumlah_kamar: { [Op.substring]: keyword } },
          { id_kamar: { [Op.substring]: keyword } },
          { status_pemesanan: { [Op.substring]: keyword } },
          { id_user: { [Op.substring]: keyword } },
        ],
      },
    });

    res.json(pemesanan);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/print/:id", async (req, res) => {
  try {
    const reservation = await pemesananModel.findByPk(req.params.id);
    if (!reservation) {
      return res.status(404).json({ error: "Reservation not found" });
    }

    // You can format the receipt data here
    const receipt = {
      // Add the relevant reservation data here
      id: reservation.id,
      nomor_pemesanan: reservation.nomor_pemesanan,
      nama_pemesan: reservation.nama_pemesan,
      email_pemesan: reservation.email_pemesan,
      tgl_pemesanan: reservation.tgl_pemesanan,
      tgl_check_in: reservation.tgl_check_in,
      tgl_check_out: reservation.tgl_check_out,
      nama_tamu: reservation.nama_tamu,
      jumlah_kamar: reservation.jumlah_kamar,
      id_tipe_kamar: reservation.id_tipe_kamar,
      status_pemesanan: reservation.status_pemesanan,
    };

    res.json(receipt);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = app;
