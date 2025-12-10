const Room = require('./models/Room');
require('./db');

async function run() {
  try {
    await Room.deleteMany({});

    await Room.insertMany([
      {
        name: "Chambre 101",
        type: "single",
        pricePerNight: 70,
        capacity: 1,
        description: "Petite chambre confortable.",
        amenities: ["WiFi", "TV"],
        imageUrl: "/images/ch101.jpg",
        isActive: true
      },
      {
        name: "Chambre 202",
        type: "double",
        pricePerNight: 120,
        capacity: 2,
        description: "Chambre double lumineuse.",
        amenities: ["WiFi", "Mini-bar"],
        imageUrl: "/images/ch202.jpg",
        isActive: true
      },
      {
        name: "Suite Royale",
        type: "suite",
        pricePerNight: 250,
        capacity: 4,
        description: "Suite luxueuse avec salon.",
        amenities: ["WiFi", "Jacuzzi"],
        imageUrl: "/images/suite.jpg",
        isActive: true
      }
    ]);

    console.log("Chambres insérées !");
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

run();
