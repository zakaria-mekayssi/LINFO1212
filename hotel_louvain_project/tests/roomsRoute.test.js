// tests/roomsRoute.test.js — tests HTTP de la route /rooms

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Room = require('../models/Room');
require('../db');

describe('Route GET /rooms', () => {
  beforeAll(async () => {
    // on prépare une base de test avec une chambre
    await Room.deleteMany({});

    await Room.create({
      name: 'Chambre test',
      type: 'single',
      pricePerNight: 80,
      capacity: 1,
      description: 'Chambre utilisée pour les tests.',
      amenities: ['WiFi'],
      isActive: true
    });
  });

  afterAll(async () => {
    // on ferme la connexion MongoDB à la fin de tous les tests
    await mongoose.connection.close();
  });

  test('retourne une page 200 avec le nom de la chambre', async () => {
    const response = await request(app).get('/rooms');

    expect(response.status).toBe(200);
    expect(response.text).toContain('Chambre test');
  });
});
