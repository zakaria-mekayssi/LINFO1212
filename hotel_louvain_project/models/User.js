// models/User.js — utilisateur de l'application

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true }, // email de connexion
  username: { type: String, required: true },            // nom affiché
  passwordHash: { type: String, required: true }         // mot de passe chiffré
});

module.exports = mongoose.model('User', userSchema);
