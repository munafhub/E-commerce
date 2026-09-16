import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "data");
const dbPath = path.join(dataDir, "db.json");

// Category-aware fallback images so admin-added products get a fitting photo
// even if the form is submitted without an image URL.
const CATEGORY_IMAGES = {
  Audio:      "/products/headphones.png",
  Wearables:  "/products/smartwatch.png",
  Computing:  "/products/keyboard.png",
  Lifestyle:  "/products/backpack.png",
  Home:       "/products/desklamp.png",
  Apparel:    "/products/sneakers.png",
  Books:      "/products/backpack.png",
  Beauty:     "/products/bottle.png",
  Sports:     "/products/sneakers.png",
  Toys:       "/products/backpack.png",
  Food:       "/products/bottle.png",
  Gadgets:    "/products/webcam.png",
};
const DEFAULT_IMAGE = "/products/headphones.png";

export function fallbackImageFor(category) {
  return CATEGORY_IMAGES[category] || DEFAULT_IMAGE;
}

function seed() {
  const passwordHash = bcrypt.hashSync("demo123", 10);
  const adminHash = bcrypt.hashSync("admin123", 10);

  return {
    users: [
      {
        id: "user-admin",
        name: "Store Admin",
        email: "admin@aurora.dev",
        passwordHash: adminHash,
        role: "admin",
        createdAt: new Date().toISOString(),
      },
      {
        id: "user-demo",
        name: "Alex Rivera",
        email: "demo@aurora.dev",
        passwordHash,
        role: "customer",
        createdAt: new Date().toISOString(),
      },
    ],
    products: [
      {
        id: "p1",
        name: "Aurora Wireless Headphones",
        category: "Audio",
        price: 189,
        stock: 24,
        rating: 4.8,
        featured: true,
        image: "/products/headphones.png",
        description:
          "Over-ear cans with 40 hours of battery, spatial audio, and a whisper-quiet ANC profile for travel and studio work.",
      },
      {
        id: "p2",
        name: "Lumen Smart Watch",
        category: "Wearables",
        price: 249,
        stock: 18,
        rating: 4.6,
        featured: true,
        image: "/products/smartwatch.png",
        description:
          "AMOLED display, GPS, sleep coaching, and 5-day battery in a brushed aluminum case.",
      },
      {
        id: "p3",
        name: "Noir Mechanical Keyboard",
        category: "Computing",
        price: 159,
        stock: 31,
        rating: 4.9,
        featured: true,
        image: "/products/keyboard.png",
        description:
          "Hot-swap switches, gasket mount, and southpaw layout with RGB that stays out of the way.",
      },
      {
        id: "p4",
        name: "Canvas Weekend Pack",
        category: "Lifestyle",
        price: 98,
        stock: 40,
        rating: 4.5,
        featured: false,
        image: "/products/backpack.png",
        description:
          "Waxed canvas 22L pack with a padded laptop sleeve and hidden passport pocket.",
      },
      {
        id: "p5",
        name: "Studio Desk Lamp",
        category: "Home",
        price: 72,
        stock: 27,
        rating: 4.4,
        featured: false,
        image: "/products/desklamp.png",
        description:
          "Warm-to-cool LED with USB-C charging and a matte steel arm that holds any angle.",
      },
      {
        id: "p6",
        name: "Polar Insulated Bottle",
        category: "Lifestyle",
        price: 36,
        stock: 80,
        rating: 4.7,
        featured: false,
        image: "/products/bottle.png",
        description:
          "32oz double-wall steel that keeps drinks cold for 24 hours. Leak-proof, dishwasher safe.",
      },
      {
        id: "p7",
        name: "Frame 4K Webcam",
        category: "Computing",
        price: 129,
        stock: 15,
        rating: 4.3,
        featured: true,
        image: "/products/webcam.png",
        description:
          "Sony sensor, hardware HDR, and a magnetic privacy shutter for daily standups.",
      },
      {
        id: "p8",
        name: "Harbor Sneakers",
        category: "Apparel",
        price: 140,
        stock: 22,
        rating: 4.6,
        featured: false,
        image: "/products/sneakers.png",
        description:
          "Recycled knit upper, cloud foam midsole, and a gum outsole that actually grips wet pavement.",
      },
    ],
    orders: [],
  };
}

export function loadDb() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(dbPath)) {
    const initial = seed();
    fs.writeFileSync(dbPath, JSON.stringify(initial, null, 2));
    return initial;
  }
  return JSON.parse(fs.readFileSync(dbPath, "utf8"));
}

export function saveDb(db) {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

export function newId(prefix) {
  return `${prefix}-${uuid().slice(0, 8)}`;
}
