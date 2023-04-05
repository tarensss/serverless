// app.js
const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const stripe = require('stripe')(functions.config().stripe.secret_key);

const app = express();

// Middlewares
app.use(cors({ origin: true }));
app.use(bodyParser.json());

// Routes
app.post('/charge', async (req, res) => {
  try {
    const { token, amount, currency, description } = req.body;

    const charge = await stripe.charges.create({
      amount,
      currency,
      source: token.id,
      description
    });

    res.json({ success: true, charge });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error', error: err });
  }
});

// Start server
exports.app = functions.https.onRequest(app);
