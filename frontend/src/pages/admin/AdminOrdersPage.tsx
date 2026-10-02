import { Link } from 'react-router';

export default function AdminOrdersPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">
        Manage orders
      </h1>
      <p className="mt-2 text-slate-600">
        Order management arrives in the next sprint. This page reserves the
        admin orders section.
      </p>
      <Link
        to="/admin"
        className="mt-6 inline-block rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
      >
        Back to dashboard
      </Link>
    </main>
  );
}
