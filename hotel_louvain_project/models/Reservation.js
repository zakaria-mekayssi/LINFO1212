// models/Reservation.js — réservation de chambre

const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // client
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true }, // chambre
  checkIn: { type: Date, required: true },      // date d'arrivée
  checkOut: { type: Date, required: true },     // date de départ
  guests: { type: Number, required: true, min: 1 }, // nombre de personnes
  status: {
    type: String,
    enum: ['confirmed', 'cancelled'],
    default: 'confirmed'
  },
  createdAt: { type: Date, default: Date.now }  // date de création
});

module.exports = mongoose.model('Reservation', reservationSchema);
