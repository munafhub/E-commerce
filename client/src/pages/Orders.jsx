import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    api("/api/orders")
      .then(setOrders)
      .catch((e) => setError(e.message));
  }, [user]);

  if (!user) {
    return (
      <section className="section empty">
        <h2>Sign in to see orders</h2>
        <Link className="btn" to="/login">
          Sign in
        </Link>
      </section>
    );
  }

  return (
    <section className="section">
      <h2>{user.role === "admin" ? "All orders" : "Your orders"}</h2>
      {error && <p className="error">{error}</p>}
      {orders.length === 0 && <p className="muted">No orders yet.</p>}
      <div className="order-list">
        {orders.map((order) => (
          <article className="panel order" key={order.id}>
            <div className="row">
              <strong>{order.id}</strong>
              <span className={`status ${order.status}`}>{order.status}</span>
            </div>
            <p className="muted">
              {new Date(order.createdAt).toLocaleString()} · ${order.total.toFixed(2)}
              {user.role === "admin" ? ` · ${order.customerEmail}` : ""}
            </p>
            <ul>
              {order.items.map((item) => (
                <li key={item.productId}>
                  {item.qty} × {item.name}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
