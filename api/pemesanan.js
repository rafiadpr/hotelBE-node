const express = require("express");
const Op = require("sequelize").Op;
const path = require("path");
const fs = require("fs");
const moment = require("moment");
const kamarModel = require("../models/index").Kamar;
const pemesananModel = require("../models/index").Pemesanan;
const detailPemesananModel = require("../models/index").Detail_Pemesanan;
const app = express();

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
    // const time =
    //   today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const nomorPemesanan = await generateUniqueBookingNumber();

    // Tanggal check-in yang dimasukkan oleh pengguna
    const tglCheckIn = new Date(req.body.tgl_check_in);
    tglCheckIn.setHours(12, 0, 0); // Set jam 12:00:00

    // Tanggal check-out yang dimasukkan oleh pengguna
    const tglCheckOut = new Date(req.body.tgl_check_out);
    tglCheckOut.setHours(12, 0, 0); // Set jam 12:00:00

    // Periksa apakah ada pemesanan dengan tanggal check-in yang sama
    const existingPemesanan = await pemesananModel.findOne({
      where: {
        tgl_check_in: tglCheckIn,
      },
    });
    const {
      nomor_pemesanan,
      nama_pemesan,
      email_pemesan,
      tgl_check_in,
      tgl_check_out,
      nama_tamu,
      jumlah_kamar,
      id_kamar,
      id_user,
    } = req.body;

    // Create a new pemesanan record
    const createdPemesanan = await pemesananModel.create({
      nomor_pemesanan: nomorPemesanan,
      nama_pemesan,
      email_pemesan,
      tgl_pemesanan: tgl_pemesanan,
      tgl_check_in: tglCheckIn,
      tgl_check_out: tglCheckOut,
      nama_tamu,
      jumlah_kamar,
      id_kamar,
      id_user,
      status_pemesanan,
    });

    await kamarModel.update(
      { tersedia: "Tidak Tersedia" },
      { where: { id: id_kamar } }
    );

    console.log("Pemesanan inserted successfully");

    // Get the ID of the created pemesanan
    const pemesananID = createdPemesanan.id;

    if (req.body.detail_pemesanan && req.body.detail_pemesanan.length > 0) {
      const detailsOfPemesanan = req.body.detail_pemesanan.map((detail) => ({
        id_kamar: detail.id_kamar,
        tgl_akses: today, // Use 'today' variable here
        harga: detail.harga,
        id_pemesanan: pemesananID,
      }));

      const createdDetails = await detailPemesananModel.bulkCreate(
        detailsOfPemesanan
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

module.exports = app;
