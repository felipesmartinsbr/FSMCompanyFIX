import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 p-4 text-center">
      <h1 className="text-4xl font-bold text-neutral-900 mb-2">404</h1>
      <p className="text-neutral-600 mb-6">Página não encontrada</p>
      <Link
        href="/"
        className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm font-semibold hover:bg-neutral-800 transition-colors"
      >
        Voltar ao início
      </Link>
    </div>
  );
}
