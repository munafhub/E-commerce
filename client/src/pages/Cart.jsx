import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function Cart() {
  const { items, subtotal, setQty, remove } = useCart();
  const shipping = subtotal >= 100 || subtotal === 0 ? 0 : 8;
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const total = subtotal + shipping + tax;

  if (items.length === 0) {
    return (
      <section className="section empty">
        <h2>Your bag is empty</h2>
        <Link className="btn" to="/shop">
          Browse products
        </Link>
      </section>
    );
  }

  return (
    <section className="section cart-layout">
      <div>
        <h2>Bag</h2>
        {items.map((item) => (
          <div className="cart-row" key={item.productId}>
            <img src={item.image} alt="" />
            <div>
              <h3>{item.name}</h3>
              <p>${item.price}</p>
              <button className="text-link" type="button" onClick={() => remove(item.productId)}>
                Remove
              </button>
            </div>
            <input
              type="number"
              min="1"
              value={item.qty}
              onChange={(e) => setQty(item.productId, Number(e.target.value))}
            />
          </div>
        ))}
      </div>
      <aside className="summary">
        <h3>Summary</h3>
        <p>
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </p>
        <p>
          <span>Shipping</span>
          <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
        </p>
        <p>
          <span>Tax</span>
          <span>${tax.toFixed(2)}</span>
        </p>
        <p className="total">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </p>
        <Link className="btn block" to="/checkout">
          Checkout
        </Link>
      </aside>
    </section>
  );
}
