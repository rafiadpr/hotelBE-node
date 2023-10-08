const express = require(`express`)
const bodyParser = require(`body-parser`)
const cors = require(`cors`)
const app = express()
const PORT = 8000

// Middleware
app.use(express.json()); // Parse JSON requests

// Import the pemesanan router
const pemesananRouter = require('./api/pemesanan');
const kamarRouter = require('./api/kamar');
const tipekamarRouter = require('./api/tipekamar');
const userRouter = require('./api/user');
const auth = require('./api/auth')

app.use('/pemesanan', pemesananRouter);
app.use('/kamar', kamarRouter);
app.use('/tipekamar', tipekamarRouter);
app.use('/user', userRouter);
app.use('/auth', auth);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
  });