import { Link } from 'react-router';

export default function AdminDashboard() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">
        Admin dashboard
      </h1>
      <p className="mt-2 text-slate-600">
        Welcome, Admin. Manage the store from the sections below.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          to="/admin/productos"
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-colors hover:border-slate-900"
        >
          <h2 className="text-lg font-semibold text-slate-900">Products</h2>
          <p className="mt-1 text-sm text-slate-600">
            View and manage the product catalog.
          </p>
        </Link>
        <Link
          to="/admin/pedidos"
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-colors hover:border-slate-900"
        >
          <h2 className="text-lg font-semibold text-slate-900">Orders</h2>
          <p className="mt-1 text-sm text-slate-600">
            View and manage customer orders.
          </p>
        </Link>
      </div>
    </main>
  );
}
