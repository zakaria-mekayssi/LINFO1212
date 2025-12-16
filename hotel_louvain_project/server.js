// import des librairies principales
const express = require('express')
const session = require('express-session')
const path = require('path')
const bcrypt = require('bcryptjs')

// import des modèles de données
const User = require('./models/User')
const Room = require('./models/Room')
const Reservation = require('./models/Reservation')

// connexion à la base de données
require('./db')

// création de l’application express
const app = express()
const PORT = 3000

// configuration du moteur de vues
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

// gestion des fichiers statiques
app.use(express.static(path.join(__dirname, 'public')))

// lecture des données envoyées par les formulaires
app.use(express.urlencoded({ extended: false }))

// configuration des sessions utilisateur
app.use(session({
  secret: 'hotel-louvain-secret',
  resave: false,
  saveUninitialized: false
}))

// rendre l’utilisateur accessible dans toutes les pages
app.use((req, res, next) => {
  res.locals.user = req.session.user || null
  next()
})

// middleware pour vérifier si l’utilisateur est connecté
const auth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login')
  }
  next()
}

// fonction utilitaire pour calculer le nombre de nuits
const nightsBetween = (start, end) => {
  const a = new Date(start)
  const b = new Date(end)

  // normalisation des heures
  a.setHours(0, 0, 0, 0)
  b.setHours(0, 0, 0, 0)

  // calcul de la différence en jours
  const diff = b - a
  const nights = Math.ceil(diff / 86400000)

  // au minimum une nuit
  return Math.max(1, nights)
}

// page d’accueil avec quelques chambres
app.get('/', async (req, res) => {
  try {
    // récupération des chambres actives
    const rooms = await Room.find({ isActive: true }).limit(3)

    // affichage de la page d’accueil
    res.render('index', { rooms })
  } catch (err) {
    console.error(err)
    res.status(500).send('Erreur serveur')
  }
})

// page listant toutes les chambres
app.get('/rooms', async (req, res) => {
  // récupération des filtres depuis l’URL
  const type = req.query.type || 'all'
  const q = (req.query.q || '').trim()

  // filtre de base
  const filter = { isActive: true }

  // filtre par type de chambre
  if (type !== 'all') {
    filter.type = type
  }

  // recherche par nom de chambre
  if (q) {
    filter.name = { $regex: q, $options: 'i' }
  }

  try {
    // récupération des chambres depuis la base
    const rooms = await Room.find(filter)

    // affichage de la page
    res.render('rooms', { rooms, type, q })
  } catch (err) {
    console.error(err)
    res.status(500).send('Erreur serveur')
  }
})

// page de détails d’une chambre
app.get('/rooms/:id', async (req, res) => {
  try {
    // recherche de la chambre par id
    const room = await Room.findById(req.params.id)

    // vérification de l’existence
    if (!room || !room.isActive) {
      return res.status(404).send('Chambre introuvable')
    }

    // affichage de la page détail
    res.render('room_detail', { room, error: null })
  } catch (err) {
    console.error(err)
    res.status(500).send('Erreur serveur')
  }
})

// création d’une réservation
app.post('/rooms/:id/reserve', auth, async (req, res) => {
  // récupération des données du formulaire
  const { checkIn, checkOut, guests } = req.body

  // vérification des champs
  if (!checkIn || !checkOut || !guests) {
    return res.redirect(`/rooms/${req.params.id}`)
  }

  try {
    // récupération de la chambre
    const room = await Room.findById(req.params.id)

    // vérification de la chambre
    if (!room || !room.isActive) {
      return res.status(404).send('Chambre introuvable')
    }

    // conversion des dates
    const inD = new Date(checkIn)
    const outD = new Date(checkOut)

    // vérification de la cohérence des dates
    if (outD <= inD) {
      return res.render('room_detail', {
        room,
        error: "La date de départ doit être après la date d'arrivée."
      })
    }

    // vérification des conflits de réservation
    const conflict = await Reservation.findOne({
      roomId: room._id,
      status: 'confirmed',
      checkIn: { $lt: outD },
      checkOut: { $gt: inD }
    })

    // si conflit détecté
    if (conflict) {
      return res.render('room_detail', {
        room,
        error: "Cette chambre est déjà réservée pour ces dates."
      })
    }

    // création de la réservation
    const reservation = await Reservation.create({
      userId: req.session.user._id,
      roomId: room._id,
      checkIn: inD,
      checkOut: outD,
      guests: Number(guests),
      status: 'confirmed'
    })

    // calcul du prix total
    const nights = nightsBetween(inD, outD)
    const totalPrice = nights * room.pricePerNight

    // page de confirmation
    res.render('reservation_confirmed', {
      room,
      reservation,
      nights,
      totalPrice
    })
  } catch (err) {
    console.error(err)
    res.status(500).send('Erreur serveur')
  }
})

// affichage des réservations de l’utilisateur
app.get('/my-reservations', auth, async (req, res) => {
  try {
    // récupération des réservations utilisateur
    const raw = await Reservation.find({ userId: req.session.user._id })
      .populate('roomId')
      .sort({ checkIn: -1 })

    // ajout des informations calculées
    const reservations = raw.map(r => {
      const nights = nightsBetween(r.checkIn, r.checkOut)
      const totalPrice = r.roomId ? nights * r.roomId.pricePerNight : 0
      return { ...r.toObject(), nights, totalPrice }
    })

    // affichage de la page
    res.render('my_reservations', { reservations })
  } catch (err) {
    console.error(err)
    res.status(500).send('Erreur serveur')
  }
})

// page d’annulation d’une réservation
app.get('/reservations/:id/cancel', auth, async (req, res) => {
  try {
    // récupération de la réservation
    const r = await Reservation.findById(req.params.id).populate('roomId')

    // vérification des droits
    if (!r || String(r.userId) !== String(req.session.user._id)) {
      return res.status(403).send('Accès interdit')
    }

    // vérification du délai de 48h
    const canCancel =
      r.status === 'confirmed' &&
      new Date(r.checkIn) - Date.now() >= 48 * 3600000

    // affichage de la page d’annulation
    res.render('cancel_reservation', { reservation: r, canCancel, error: null })
  } catch (err) {
    console.error(err)
    res.status(500).send('Erreur serveur')
  }
})

// confirmation de l’annulation
app.post('/reservations/:id/cancel', auth, async (req, res) => {
  try {
    // récupération de la réservation
    const r = await Reservation.findById(req.params.id)

    // vérification des droits
    if (!r || String(r.userId) !== String(req.session.user._id)) {
      return res.status(403).send('Accès interdit')
    }

    // vérification du délai
    if (new Date(r.checkIn) - Date.now() < 48 * 3600000) {
      return res.redirect(`/reservations/${r._id}/cancel`)
    }

    // mise à jour du statut
    r.status = 'cancelled'
    await r.save()

    // redirection
    res.redirect('/my-reservations')
  } catch (err) {
    console.error(err)
    res.status(500).send('Erreur serveur')
  }
})

// page d’inscription
app.get('/register', (req, res) => {
  res.render('register', { error: null })
})

// traitement de l’inscription
app.post('/register', async (req, res) => {
  const { email, username, password, confirmPassword } = req.body

  // vérification des champs
  if (!email || !username || !password || password !== confirmPassword) {
    return res.render('register', { error: 'Informations invalides.' })
  }

  try {
    // vérification de l’unicité de l’email
    if (await User.findOne({ email })) {
      return res.render('register', { error: 'Email déjà utilisé.' })
    }

    // création de l’utilisateur
    const user = await User.create({
      email,
      username,
      passwordHash: await bcrypt.hash(password, 10)
    })

    // création de la session
    req.session.user = { _id: user._id, email, username }

    res.redirect('/')
  } catch (err) {
    console.error(err)
    res.status(500).send('Erreur serveur')
  }
})

// page de connexion
app.get('/login', (req, res) => {
  res.render('login', { error: null })
})

// traitement de la connexion
app.post('/login', async (req, res) => {
  const { email, password } = req.body

  // vérification des champs
  if (!email || !password) {
    return res.render('login', { error: 'Champs manquants.' })
  }

  try {
    // recherche de l’utilisateur
    const user = await User.findOne({ email })

    // vérification du mot de passe
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.render('login', { error: 'Identifiants incorrects.' })
    }

    // création de la session
    req.session.user = { _id: user._id, email, username: user.username }

    res.redirect('/')
  } catch (err) {
    console.error(err)
    res.status(500).send('Erreur serveur')
  }
})

// déconnexion utilisateur
app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'))
})

// démarrage du serveur
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`)
  })
}

// export pour les tests
module.exports = app
