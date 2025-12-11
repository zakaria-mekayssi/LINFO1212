// tests/reservationModel.test.js — tests du modèle Reservation

const Reservation = require('../models/Reservation');
require('../db');

describe('Modèle Reservation', () => {
  beforeAll(async () => {
    // on vide la collection pour ces tests
    await Reservation.deleteMany({});
  });

  test("refuse une réservation avec un nombre d'invités < 1", async () => {
    const reservation = new Reservation({
      userId: '000000000000000000000000',  // faux ID juste pour la validation
      roomId: '000000000000000000000000',
      checkIn: new Date('2025-01-01'),
      checkOut: new Date('2025-01-02'),
      guests: 0
    });

    let error = null;
    try {
      await reservation.save();
    } catch (err) {
      error = err;
    }

    expect(error).not.toBeNull();
  });
});
