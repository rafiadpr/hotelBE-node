const express = require('express');
const { Op } = require('sequelize');
const moment = require('moment');
const PDFDocument = require('pdfkit');

const { Kamar, Pemesanan, DetailPemesanan, TipeKamar, User } = require('../models/index');
const app = express();
const cors = require('cors');

const port = 3000;
app.use(cors());

function generateRandomNumber(n) {
  return Math.floor(Math.random() * 10 ** n).toString().padStart(n, '0');
}

async function isDuplicateBookingNumber(bookingNumber) {
  const result = await Pemesanan.findOne({
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

app.get('/checkin', async (req, res) => {
  try {
    const tglCheckIn = new Date(req.query.tgl_check_in);
    tglCheckIn.setHours(12, 0, 0);

    if (tglCheckIn) {
      const pemesanan = await Pemesanan.findOne({
        where: { tgl_check_in: tglCheckIn },
      });
      res.json(pemesanan);
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/', async (req, res) => {
  try {
    const pemesanan = await Pemesanan.findAll();
    res.json(pemesanan);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/', async (req, res) => {
  try {
    const today = new Date();
    const tgl_pemesanan = today.toISOString().split('T')[0];
    const status_pemesanan = 'baru';

    const {
      nomor_pemesanan,
      nama_pemesan,
      email_pemesan,
      tgl_check_in,
      tgl_check_out,
      nama_tamu,
      jumlah_kamar,
      id_tipe_kamar,
      id_user,
      detail_pemesanan,
    } = req.body;

    const nomorPemesanan = await generateUniqueBookingNumber();
    const tglCheckIn = new Date(tgl_check_in);
    tglCheckIn.setHours(12, 0, 0);
    const tglCheckOut = new Date(tgl_check_out);
    tglCheckOut.setHours(12, 0, 0);

    const existingPemesanan = await Pemesanan.findOne({
      where: {
        tgl_check_in: tglCheckIn,
        tgl_check_out: tglCheckOut,
        id_tipe_kamar,
      },
    });

    const availableRooms = await Kamar.findAll({
      where: {
        tersedia: 'Tersedia',
        id_tipe_kamar,
      },
    });

    if (availableRooms.length === 0) {
      return res.status(400).json({ error: 'No available rooms found' });
    }

    const createdPemesanan = await Pemesanan.create({
      nomor_pemesanan,
      nama_pemesan,
      email_pemesan,
      tgl_pemesanan,
      tgl_check_in: tglCheckIn,
      tgl_check_out: tglCheckOut,
      nama_tamu,
      jumlah_kamar,
      id_tipe_kamar,
      id_user,
      status_pemesanan,
      id_kamar: availableRooms[0].id,
    });

    console.log('Pemesanan inserted successfully');

    const pemesananID = createdPemesanan.id;

    if (detail_pemesanan && detail_pemesanan.length > 0) {
      const tipeKamar = await TipeKamar.findOne({ where: { id: id_tipe_kamar } });

      const detailsOfPemesanan = detail_pemesanan.map((detail) => ({
        id_kamar: detail.id_kamar,
        tgl_akses: new Date(),
        harga: tipeKamar.harga,
        id_pemesanan: pemesananID,
      }));

      const createdDetails = await DetailPemesanan.bulkCreate(detailsOfPemesanan);

      await Kamar.update(
        { tersedia: 'Tidak Tersedia' },
        { where: { id: detailsOfPemesanan.map((detail) => detail.id_kamar) } }
      );

      return res.json({
        success: true,
        message: 'New pemesanan has been inserted with details.',
      });
    }

    res.status(201).json({
      message: 'Data inserted successfully',
      data: createdPemesanan,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/:id', async (req, res) => {
  try {
    const pemesananID = req.params.id;
    const existingPemesanan = await Pemesanan.findOne({
      where: {
        id: pemesananID,
      },
    });

    if (!existingPemesanan) {
      return res.status(404).json({ error: 'Pemesanan not found' });
    }

    const updatedPemesanan = await existingPemesanan.update(req.body);

    console.log('Pemesanan updated successfully');

    res.json({
      success: true,
      message: 'Pemesanan updated successfully',
      data: updatedPemesanan,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/:id', async (req, res) => {
  try {
    const pemesananID = req.params.id;
    const existingPemesanan = await Pemesanan.findOne({
      where: { id: pemesananID },
    });

    if (!existingPemesanan) {
      return res.status(404).json({ error: 'Pemesanan not found' });
    }

    const id_kamar = existingPemesanan.id_kamar;

    await DetailPemesanan.destroy({ where: { id_pemesanan: pemesananID } });

    await Kamar.update(
      { tersedia: 'Tersedia' },
      { where: { id: id_kamar } }
    );

    await Pemesanan.destroy({ where: { id: pemesananID } });

    res.json({
      success: true,
      message: 'Data deleted successfully',
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/search', async (req, res) => {
  try {
    const { keyword } = req.body;

    const pemesanan = await Pemesanan.findAll({
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
          { id_tipe_kamar: { [Op.substring]: keyword } },
          { status_pemesanan: { [Op.substring]: keyword } },
          { id_user: { [Op.substring]: keyword } },
        ],
      },
    });

    res.json(pemesanan);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/print/:id', async (req, res) => {
  try {
    const reservation = await Pemesanan.findByPk(req.params.id);

    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    const receipt = {
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
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = app;
