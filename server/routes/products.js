import { Router } from "express";
import { loadDb, saveDb, newId } from "../db.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/", (req, res) => {
  const { category, q } = req.query;
  let products = loadDb().products;
  if (category && category !== "All") {
    products = products.filter((p) => p.category === category);
  }
  if (q) {
    const term = String(q).toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term)
    );
  }
  res.json(products);
});

router.get("/categories", (_req, res) => {
  const cats = [...new Set(loadDb().products.map((p) => p.category))].sort();
  res.json(cats);
});

router.get("/:id", (req, res) => {
  const product = loadDb().products.find((p) => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(product);
});

router.post("/", requireAuth, requireAdmin, (req, res) => {
  const { name, category, price, stock, image, description, featured } = req.body || {};
  if (!name || !category || price == null) {
    return res.status(400).json({ error: "Name, category, and price are required" });
  }
  const db = loadDb();
  const product = {
    id: newId("p"),
    name,
    category,
    price: Number(price),
    stock: Number(stock ?? 0),
    rating: 5,
    featured: Boolean(featured),
    image:
      image ||
      "https://images.unsplash.com/photo-1523275335680-378e8ba495df?auto=format&fit=crop&w=900&q=80",
    description: description || "",
  };
  db.products.push(product);
  saveDb(db);
  res.status(201).json(product);
});

router.put("/:id", requireAuth, requireAdmin, (req, res) => {
  const db = loadDb();
  const index = db.products.findIndex((p) => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Product not found" });
  const current = db.products[index];
  db.products[index] = {
    ...current,
    ...req.body,
    id: current.id,
    price: Number(req.body.price ?? current.price),
    stock: Number(req.body.stock ?? current.stock),
    featured: Boolean(req.body.featured ?? current.featured),
  };
  saveDb(db);
  res.json(db.products[index]);
});

router.delete("/:id", requireAuth, requireAdmin, (req, res) => {
  const db = loadDb();
  const next = db.products.filter((p) => p.id !== req.params.id);
  if (next.length === db.products.length) {
    return res.status(404).json({ error: "Product not found" });
  }
  db.products = next;
  saveDb(db);
  res.json({ ok: true });
});

export default router;
