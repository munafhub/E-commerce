import { Router } from "express";
import { loadDb, saveDb, newId } from "../db.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, (req, res) => {
  const db = loadDb();
  const orders =
    req.user.role === "admin"
      ? db.orders
      : db.orders.filter((o) => o.userId === req.user.id);
  res.json(orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
});

router.post("/", requireAuth, (req, res) => {
  const { items, shipping } = req.body || {};
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Cart is empty" });
  }
  if (!shipping?.name || !shipping?.address || !shipping?.city) {
    return res.status(400).json({ error: "Shipping name, address, and city are required" });
  }

  const db = loadDb();
  const lineItems = [];
  let subtotal = 0;

  for (const item of items) {
    const product = db.products.find((p) => p.id === item.productId);
    if (!product) return res.status(400).json({ error: `Unknown product ${item.productId}` });
    const qty = Math.max(1, Number(item.qty) || 1);
    if (product.stock < qty) {
      return res.status(400).json({ error: `${product.name} only has ${product.stock} left` });
    }
    product.stock -= qty;
    const lineTotal = product.price * qty;
    subtotal += lineTotal;
    lineItems.push({
      productId: product.id,
      name: product.name,
      image: product.image,
      price: product.price,
      qty,
    });
  }

  const shippingFee = subtotal >= 100 ? 0 : 8;
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const total = Math.round((subtotal + shippingFee + tax) * 100) / 100;

  const order = {
    id: newId("ord"),
    userId: req.user.id,
    customerEmail: req.user.email,
    items: lineItems,
    shipping,
    subtotal,
    shippingFee,
    tax,
    total,
    status: "processing",
    createdAt: new Date().toISOString(),
  };
  db.orders.push(order);
  saveDb(db);
  res.status(201).json(order);
});

router.patch("/:id/status", requireAuth, requireAdmin, (req, res) => {
  const db = loadDb();
  const order = db.orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });
  order.status = req.body.status || order.status;
  saveDb(db);
  res.json(order);
});

export default router;
