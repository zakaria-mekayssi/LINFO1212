// tests/userModel.test.js — tests du modèle User

const User = require('../models/User');
require('../db');

describe('Modèle User', () => {
  beforeAll(async () => {
    // on repart d'une collection vide pour ces tests
    await User.deleteMany({});
  });

  test("n'autorise pas un utilisateur sans email", async () => {
    const user = new User({
      username: 'Test',
      passwordHash: 'hash'
    });

    let error = null;
    try {
      await user.save();
    } catch (err) {
      error = err;
    }

    expect(error).not.toBeNull();
  });

  test('enregistre un utilisateur valide', async () => {
    const user = new User({
      email: 'test@example.com',
      username: 'Test',
      passwordHash: 'hash'
    });

    const saved = await user.save();

    expect(saved._id).toBeDefined();
    expect(saved.email).toBe('test@example.com');
  });
});
