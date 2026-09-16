import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import SafeImage from "../components/SafeImage";

const empty = {
  name: "",
  category: "Lifestyle",
  price: "",
  stock: "",
  image: "",
  description: "",
  featured: false,
};

export default function Admin() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");

  function load() {
    api("/api/products").then(setProducts);
  }

  useEffect(() => {
    if (user?.role === "admin") load();
  }, [user]);

  if (!user || user.role !== "admin") {
    return (
      <section className="section empty">
        <h2>Admin only</h2>
        <p className="muted">Sign in as admin@aurora.dev / admin123</p>
        <Link className="btn" to="/login">
          Sign in
        </Link>
      </section>
    );
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      await api("/api/products", { method: "POST", body: { ...form, price: Number(form.price), stock: Number(form.stock) } });
      setForm(empty);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function remove(id) {
    await api(`/api/products/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <section className="section admin">
      <form className="panel" onSubmit={submit}>
        <h2>Add product</h2>
        {error && <p className="error">{error}</p>}
        <label>
          Name
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </label>
        <label>
          Category
          <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
        </label>
        <label>
          Price
          <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
        </label>
        <label>
          Stock
          <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required />
        </label>
        <label>
          Image URL
          <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
        </label>
        <label>
          Description
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => setForm({ ...form, featured: e.target.checked })}
          />
          Featured on home
        </label>
        <button className="btn" type="submit">
          Save product
        </button>
      </form>
      <div>
        <h2>Inventory</h2>
        {products.map((p) => (
          <div className="cart-row" key={p.id}>
            <SafeImage src={p.image} alt="" />
            <div>
              <h3>{p.name}</h3>
              <p className="muted">
                ${p.price} · {p.stock} left
              </p>
            </div>
            <button className="ghost" type="button" onClick={() => remove(p.id)}>
              Delete
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
