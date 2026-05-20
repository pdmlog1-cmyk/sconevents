import Link from 'next/link';
import { CONFERENCES } from '@/lib/conferences';

export const metadata = {
  title: 'SCON Events - Conference Landing Pages',
  description: 'Scientific Conference Organizers Network - Landing pages for upcoming conferences',
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">SCON Events</h1>
        <p className="text-slate-400 mb-12">Select a conference landing page:</p>

        <div className="grid gap-4">
          {CONFERENCES.map((conf) => (
            <Link
              key={conf.slug}
              href={`/${conf.slug}`}
              className="block p-5 bg-slate-800 rounded-xl border border-slate-700 hover:bg-slate-700 hover:-translate-y-0.5 transition-all"
            >
              <div className="font-semibold text-lg">{conf.name}</div>
              <div className="text-slate-500 text-sm font-mono mt-1">{conf.slug}</div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
