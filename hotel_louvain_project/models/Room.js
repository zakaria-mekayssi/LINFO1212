// models/Room.js — chambre d'hôtel

const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true },        // nom de la chambre
  type: {
    type: String,
    enum: ['single', 'double', 'suite'],
    required: true
  },
  pricePerNight: { type: Number, required: true }, // prix par nuit
  capacity: { type: Number, required: true },      // nombre de personnes max
  description: String,                             // description courte
  amenities: [String],                             // liste d'équipements
  imageUrl: String,                                // URL d'une image
  isActive: { type: Boolean, default: true }       // chambre visible ou non
});

module.exports = mongoose.model('Room', roomSchema);
