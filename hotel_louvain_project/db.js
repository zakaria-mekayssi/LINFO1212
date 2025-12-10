// db.js — connexion à MongoDB

const mongoose = require('mongoose');

// base de données différente pour les tests éventuels
const dbURL =
  process.env.NODE_ENV === 'test'
    ? 'mongodb://127.0.0.1:27017/hotel_louvain_test'
    : 'mongodb://127.0.0.1:27017/hotel_louvain';

mongoose
  .connect(dbURL)
  .then(() => {
    console.log(`Connecté à MongoDB : ${dbURL}`);
  })
  .catch((err) => {
    console.error('Erreur de connexion MongoDB :', err);
  });

module.exports = mongoose;
