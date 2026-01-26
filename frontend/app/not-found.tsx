import Link from 'next/link';
import { Logo } from '@/components/ui/logo';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white text-black grid-bg flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-6 text-center">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo size={60} className="glow-on-hover" />
        </div>

        {/* 404 Badge */}
        <div className="inline-block mb-8 px-6 py-3 border-2 border-black text-black text-sm font-mono font-bold">
          ERROR 404
        </div>

        {/* Main heading */}
        <h1 className="text-7xl font-bold mb-6 leading-none tracking-tighter">
          Page Not{' '}
          <span className="inline-block border-b-4 border-black">Found</span>
        </h1>

        {/* Witty message */}
        <p className="text-xl text-gray-600 leading-relaxed mb-12">
          Looks like this page went on vacation without telling anyone.
          <br />
          Either that, or you've discovered the digital equivalent of a wrong turn.
        </p>

        {/* Stats - humorous take */}
        <div className="grid grid-cols-3 gap-8 mb-12 pb-12 border-b-2 border-black">
          <div>
            <div className="text-4xl font-bold mb-2">404</div>
            <div className="text-sm text-gray-600 font-mono font-bold">PAGES NOT HERE</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">0</div>
            <div className="text-sm text-gray-600 font-mono font-bold">HELPFUL HINTS</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">∞</div>
            <div className="text-sm text-gray-600 font-mono font-bold">BETTER PLACES</div>
          </div>
        </div>

        {/* CTA Button */}
        <Link
          href="/"
          className="inline-block px-8 py-4 bg-black text-white border-2 border-black font-mono font-bold hover:bg-white hover:text-black transition-all duration-300"
        >
          BACK TO SAFETY →
        </Link>

        {/* Fun footer note */}
        <p className="mt-12 text-sm text-gray-500 font-mono">
          P.S. - If you think this page should exist, I probably broke something.
        </p>
      </div>
    </div>
  );
}
