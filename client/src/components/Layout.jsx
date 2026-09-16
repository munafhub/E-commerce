import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Layout() {
  const { user, logout } = useAuth();
  const { count } = useCart();

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand">
          <span className="brand-mark">A</span>
          Aurora Market
        </Link>
        <nav className="nav">
          <NavLink to="/shop">Shop</NavLink>
          {user && <NavLink to="/orders">Orders</NavLink>}
          {user?.role === "admin" && <NavLink to="/admin">Admin</NavLink>}
        </nav>
        <div className="top-actions">
          <Link to="/cart" className="cart-link">
            Bag <span className="badge">{count}</span>
          </Link>
          {user ? (
            <>
              <span className="who">{user.name.split(" ")[0]}</span>
              <button className="ghost" onClick={logout} type="button">
                Sign out
              </button>
            </>
          ) : (
            <Link className="btn btn-sm" to="/login">
              Sign in
            </Link>
          )}
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="footer">
        <p>Aurora Market — a full-stack shop built with React, Node, and Express.</p>
        <p className="muted">Demo accounts: demo@aurora.dev / demo123 · admin@aurora.dev / admin123</p>
      </footer>
    </div>
  );
}
