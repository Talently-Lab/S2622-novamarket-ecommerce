import { Link } from 'react-router';

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <section className="rounded-2xl bg-slate-900 px-8 py-16 text-center text-white">
        <h1 className="text-4xl font-bold tracking-tight">
          Welcome to NovaMarket
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-slate-300">
          A low-fi storefront placeholder. Browse the catalog, log in, or create
          an account — everything is wired with React Router and Tailwind.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/productos"
            className="rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-200"
          >
            Browse products
          </Link>
          <Link
            to="/login"
            className="rounded-md border border-slate-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Log in
          </Link>
          <Link
            to="/registro"
            className="rounded-md border border-slate-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Sign up
          </Link>
        </div>
      </section>
    </main>
  );
}
