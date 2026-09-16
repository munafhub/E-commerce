import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Checkout() {
  const { user } = useAuth();
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: user?.name || "",
    address: "",
    city: "",
    zip: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (!user) {
    return (
      <section className="section empty">
        <h2>Sign in to checkout</h2>
        <p className="muted">Orders are saved to your account on the Node API.</p>
        <Link className="btn" to="/login">
          Sign in
        </Link>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="section empty">
        <h2>Nothing to check out</h2>
        <Link className="btn" to="/shop">
          Shop
        </Link>
      </section>
    );
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api("/api/orders", {
        method: "POST",
        body: {
          items: items.map((i) => ({ productId: i.productId, qty: i.qty })),
          shipping: form,
        },
      });
      clear();
      navigate("/orders");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="section checkout">
      <form className="panel" onSubmit={submit}>
        <h2>Shipping</h2>
        {error && <p className="error">{error}</p>}
        {["name", "address", "city", "zip"].map((field) => (
          <label key={field}>
            {field}
            <input
              required
              value={form[field]}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
            />
          </label>
        ))}
        <button className="btn" disabled={busy} type="submit">
          {busy ? "Placing order…" : `Pay $${(subtotal + (subtotal >= 100 ? 0 : 8) + Math.round(subtotal * 0.08 * 100) / 100).toFixed(2)}`}
        </button>
        <p className="muted">Demo checkout — no real payment is processed.</p>
      </form>
    </section>
  );
}
