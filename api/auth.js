const express = require('express');
const md5 = require('md5');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { User } = require('../models/index'); // Use ES6 destructuring and correct import path

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Constants for secret keys
const AUTH_SECRET = 'mokleters';

// Middleware for user authentication
const authenticate = async (request, response) => {
  try {
    const { email, password } = request.body;
    const hashedPassword = md5(password);

    const user = await User.findOne({ where: { email, password: hashedPassword } });

    if (user) {
      const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
      };
      const token = jwt.sign(payload, AUTH_SECRET, { expiresIn: '1h' });

      response.json({
        success: true,
        logged: true,
        message: 'Authentication Successful',
        token,
        data: user,
      });
    } else {
      response.status(401).json({
        success: false,
        logged: false,
        message: 'Authentication Failed. Invalid email or password',
      });
    }
  } catch (error) {
    console.error(error);
    response.status(500).json({
      success: false,
      logged: false,
      message: 'Internal Server Error',
    });
  }
};

// Middleware for authorization
const authorize = (request, response, next) => {
  const { authorization } = request.headers;
  const tokenKey = authorization && authorization.split(' ')[1];

  if (!tokenKey) {
    return response.status(401).json({
      success: false,
      message: 'Unauthorized User',
    });
  }

  jwt.verify(tokenKey, AUTH_SECRET, (error, user) => {
    if (error) {
      return response.status(401).json({
        success: false,
        message: 'Invalid Token',
      });
    }
    next();
  });
};

app.post('/login', authenticate);

module.exports = app;
