import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import { useCart } from "../context/CartContext";

export default function Product() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");
  const [qty, setQty] = useState(1);
  const { add } = useCart();

  useEffect(() => {
    api(`/api/products/${id}`)
      .then(setProduct)
      .catch((e) => setError(e.message));
  }, [id]);

  if (error) return <p className="section error">{error}</p>;
  if (!product) return <p className="section muted">Loading…</p>;

  return (
    <section className="section product-page">
      <img src={product.image} alt={product.name} />
      <div>
        <Link className="muted" to="/shop">
          ← Back to shop
        </Link>
        <p className="cat">{product.category}</p>
        <h1>{product.name}</h1>
        <p className="price">${product.price}</p>
        <p className="lede">{product.description}</p>
        <p className="muted">{product.stock} in stock · rated {product.rating}★</p>
        <div className="qty-row">
          <label>
            Qty
            <input
              type="number"
              min="1"
              max={product.stock}
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
            />
          </label>
          <button
            className="btn"
            type="button"
            disabled={product.stock < 1}
            onClick={() => add(product, qty)}
          >
            Add to bag
          </button>
        </div>
      </div>
    </section>
  );
}
