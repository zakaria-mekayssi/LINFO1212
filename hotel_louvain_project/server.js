// server.js — application de réservation pour Hôtel Louvain

const express = require('express');
const session = require('express-session');
const path = require('path');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Room = require('./models/Room');
const Reservation = require('./models/Reservation');
require('./db');

const app = express();
const PORT = 3000;

// configuration du moteur de vues
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// fichiers statiques et lecture des formulaires
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));

// configuration des sessions (stockage en mémoire pour le projet)
app.use(
  session({
    secret: 'hotel-louvain-secret',
    resave: false,
    saveUninitialized: false
  })
);

// rendre l'utilisateur disponible dans toutes les vues
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// vérifie que l'utilisateur est connecté
function ensureAuthenticated(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
}

// page d'accueil : quelques chambres
app.get('/', async (req, res) => {
  try {
    const rooms = await Room.find({ isActive: true }).limit(3);
    res.render('index', { rooms });
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur serveur');
  }
});

// liste de toutes les chambres (avec filtre simple sur le type)
app.get('/rooms', async (req, res) => {
  const type = req.query.type || 'all';
  const filter = { isActive: true };

  if (type !== 'all') {
    filter.type = type;
  }

  try {
    const rooms = await Room.find(filter);
    res.render('rooms', { rooms, type });
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur serveur');
  }
});

// détails d'une chambre
app.get('/rooms/:id', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room || !room.isActive) {
      return res.status(404).send('Chambre introuvable');
    }
    res.render('room_detail', { room });
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur serveur');
  }
});

// création d'une réservation
app.post('/rooms/:id/reserve', ensureAuthenticated, async (req, res) => {
  const { checkIn, checkOut, guests } = req.body;

  if (!checkIn || !checkOut || !guests) {
    return res.redirect(`/rooms/${req.params.id}`);
  }

  try {
    const room = await Room.findById(req.params.id);
    if (!room || !room.isActive) {
      return res.status(404).send('Chambre introuvable');
    }

    const reservation = new Reservation({
      userId: req.session.user._id,
      roomId: room._id,
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
      guests: Number(guests),
      status: 'confirmed'
    });

    await reservation.save();

    res.render('reservation_confirmed', { room, reservation });
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur serveur');
  }
});

// affichage des réservations de l'utilisateur connecté
app.get('/my-reservations', ensureAuthenticated, async (req, res) => {
  try {
    const reservations = await Reservation.find({ userId: req.session.user._id })
      .populate('roomId')
      .sort({ checkIn: -1 });

    res.render('my_reservations', { reservations });
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur serveur');
  }
});

// formulaire d'inscription
app.get('/register', (req, res) => {
  res.render('register', { error: null });
});

// traitement d'inscription
app.post('/register', async (req, res) => {
  const { email, username, password, confirmPassword } = req.body;

  if (!email || !username || !password || !confirmPassword) {
    return res.render('register', { error: 'Veuillez remplir tous les champs.' });
  }

  if (password !== confirmPassword) {
    return res.render('register', { error: 'Les mots de passe ne correspondent pas.' });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.render('register', { error: 'Un compte existe déjà avec cet email.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      username,
      passwordHash
    });

    req.session.user = {
      _id: user._id.toString(),
      email: user.email,
      username: user.username
    };

    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur serveur');
  }
});

// formulaire de connexion
app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

// traitement de connexion
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.render('login', { error: 'Veuillez remplir tous les champs.' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.render('login', { error: 'Email ou mot de passe incorrect.' });
    }

    const passwordOk = await bcrypt.compare(password, user.passwordHash);
    if (!passwordOk) {
      return res.render('login', { error: 'Email ou mot de passe incorrect.' });
    }

    req.session.user = {
      _id: user._id.toString(),
      email: user.email,
      username: user.username
    };

    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur serveur');
  }
});

// déconnexion
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

// démarrage du serveur uniquement si ce fichier est exécuté directement
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
  });
}

// export de l'application pour les tests
module.exports = app;
