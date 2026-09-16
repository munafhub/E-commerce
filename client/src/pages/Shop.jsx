import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api";
import { useCart } from "../context/CartContext";

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [q, setQ] = useState(params.get("q") || "");
  const category = params.get("category") || "All";
  const { add } = useCart();

  useEffect(() => {
    api("/api/products/categories").then(setCategories);
  }, []);

  useEffect(() => {
    const query = new URLSearchParams();
    if (category && category !== "All") query.set("category", category);
    if (params.get("q")) query.set("q", params.get("q"));
    api(`/api/products?${query.toString()}`).then(setProducts);
  }, [category, params]);

  function search(e) {
    e.preventDefault();
    const next = new URLSearchParams(params);
    if (q.trim()) next.set("q", q.trim());
    else next.delete("q");
    setParams(next);
  }

  return (
    <section className="section">
      <div className="section-head">
        <h2>Catalog</h2>
        <form className="search" onSubmit={search}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products" />
          <button className="btn btn-sm" type="submit">
            Search
          </button>
        </form>
      </div>
      <div className="chips">
        {["All", ...categories].map((c) => (
          <button
            key={c}
            type="button"
            className={c === category ? "chip on" : "chip"}
            onClick={() => {
              const next = new URLSearchParams(params);
              if (c === "All") next.delete("category");
              else next.set("category", c);
              setParams(next);
            }}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="grid">
        {products.map((p) => (
          <article className="card" key={p.id}>
            <Link to={`/product/${p.id}`}>
              <img src={p.image} alt={p.name} />
            </Link>
            <div className="card-body">
              <p className="cat">{p.category}</p>
              <h3>
                <Link to={`/product/${p.id}`}>{p.name}</Link>
              </h3>
              <p className="muted stock">{p.stock} in stock · {p.rating}★</p>
              <div className="row">
                <strong>${p.price}</strong>
                <button type="button" className="btn btn-sm" onClick={() => add(p)} disabled={p.stock < 1}>
                  Add to bag
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
      {products.length === 0 && <p className="muted">No products match that filter.</p>}
    </section>
  );
}
