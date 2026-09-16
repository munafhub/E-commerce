import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useCart } from "../context/CartContext";
import SafeImage from "../components/SafeImage";

export default function Home() {
  const [products, setProducts] = useState([]);
  const { add } = useCart();

  useEffect(() => {
    api("/api/products").then((all) => setProducts(all.filter((p) => p.featured).slice(0, 4)));
  }, []);

  return (
    <>
      <section className="hero">
        <div>
          <p className="eyebrow">Spring drop · 2026</p>
          <h1>
            Objects that earn
            <em> a place on your desk.</em>
          </h1>
          <p className="lede">
            Headphones, bags, and tools designed to last. Browse the catalog, add to bag, and
            check out through a real Node API.
          </p>
          <div className="hero-actions">
            <Link className="btn" to="/shop">
              Shop the catalog
            </Link>
            <Link className="text-link" to="/register">
              Create a free account
            </Link>
          </div>
        </div>
        <div className="hero-panel">
          <img
            src="/products/headphones.png"
            alt="Featured headphones"
          />
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Featured</h2>
          <Link to="/shop">View all</Link>
        </div>
        <div className="grid">
          {products.map((p) => (
            <article className="card" key={p.id}>
              <Link to={`/product/${p.id}`}>
                <SafeImage src={p.image} alt={p.name} />
              </Link>
              <div className="card-body">
                <p className="cat">{p.category}</p>
                <h3>
                  <Link to={`/product/${p.id}`}>{p.name}</Link>
                </h3>
                <div className="row">
                  <strong>${p.price}</strong>
                  <button type="button" className="btn btn-sm" onClick={() => add(p)}>
                    Add
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
