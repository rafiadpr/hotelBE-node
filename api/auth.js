const express = require("express");
const md5 = require("md5");
const jwt = require("jsonwebtoken");
const userModel = require("../models/index").User;
const cors = require('cors');
const app = express();
const port = 3000;
app.use(cors());

// Middleware for user authentication
const authenticate = async (request, response, next) => {
  try {
    const dataLogin = {
      email: request.body.email,
      password: md5(request.body.password),
    };

    const dataUser = await userModel.findOne({ where: dataLogin });

    if (dataUser) {
      const payload = {
        id: dataUser.id,
        email: dataUser.email,
        role: dataUser.role,
      };
      const secret = "mokleters";
      const token = jwt.sign(payload, secret, { expiresIn: "1h" });

      response.json({
        success: true,
        logged: true,
        message: "Authentication Successed",
        token: token,
        data: dataUser,
      });
    } else {
      response.status(401).json({
        success: false,
        logged: false,
        message: "Authentication Failed. Invalid email or password",
      });
    }
  } catch (error) {
    console.error(error);
    response.status(500).json({
      success: false,
      logged: false,
      message: "Internal server error",
    });
  }
};

// Middleware for authorization
const authorize = (request, response, next) => {
  const headers = request.headers.authorization;
  const tokenKey = headers && headers.split(" ")[1];

  if (tokenKey == null) {
    return response.status(401).json({
      success: false,
      message: "Unauthorized User",
    });
  }

  const secret = "mokleters";
  jwt.verify(tokenKey, secret, (error, user) => {
    if (error) {
      return response.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }
    next();
  });
};

app.use(express.json());

// Endpoint for user login
app.post("/login", authenticate);

// Example protected routes
app.get("/admin", authorize, (request, response) => {
  response.json({
    message: "Admin-only route",
    user: request.user, // User information from the token
  });
});

app.get("/receptionist", authorize, (request, response) => {
  response.json({
    message: "Receptionist-only route",
    user: request.user, // User information from the token
  });
});

module.exports = app;
