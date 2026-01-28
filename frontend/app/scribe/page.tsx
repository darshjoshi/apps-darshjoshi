'use client';

import Link from 'next/link';
import { ArrowLeft, Linkedin, Github, X } from 'lucide-react';
import { Logo } from '@/components/ui/logo';

export default function ScribePage() {
    return (
        <div className="min-h-screen bg-white text-black grid-bg flex flex-col">
            {/* Header */}
            <header className="border-b-2 border-black">
                <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="flex items-center gap-3 hover:opacity-70 transition-opacity">
                            <Logo size={40} className="glow-on-hover" />
                            <span className="text-xl font-bold tracking-tight">MINI PRODUCT SHOWCASE</span>
                        </Link>
                    </div>
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-sm text-gray-600 font-mono hover:text-black transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Showcase
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow flex flex-col items-center justify-center p-6 relative overflow-hidden">
                <div className="max-w-4xl w-full text-center relative z-10">
                    <div className="inline-block mb-8 px-4 py-2 border-2 border-black text-black text-sm font-mono font-bold bg-white">
                        SCRIBE WHITEPAPER
                    </div>

                    <h1 className="text-9xl font-black mb-8 tracking-tighter" style={{
                        textShadow: '4px 4px 0px #000, 8px 8px 0px rgba(0,0,0,0.2)'
                    }}>
                        COMING<br />SOON
                    </h1>

                    <p className="text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-12">
                        A local Mac app to store meeting transcripts and chat with them later at any time. Purely AI enabled.
                    </p>

                    <div className="inline-block p-8 border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <p className="font-mono text-lg font-bold">
                            STAY TUNED FOR UPDATES
                        </p>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-20 left-20 w-32 h-32 border-4 border-black rounded-full opacity-10 animate-bounce delay-700"></div>
                <div className="absolute bottom-20 right-20 w-48 h-48 border-4 border-black opacity-10 animate-pulse"></div>
            </main>

            {/* Footer */}
            <footer className="border-t-2 border-black mt-auto">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        {/* Copyright */}
                        <div className="text-sm text-gray-600 font-mono">
                            &copy; {new Date().getFullYear()} Darsh Joshi
                        </div>

                        {/* Social Links */}
                        <div className="flex items-center gap-6">
                            <span className="text-sm text-gray-600 font-mono font-bold">
                                OPEN FOR COLLABORATION!
                            </span>
                            <div className="flex items-center gap-3">
                                <a
                                    href="https://www.linkedin.com/in/darshjoshi"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-9 h-9 border-2 border-black bg-white hover:bg-black text-black hover:text-white transition-all duration-300 flex items-center justify-center group"
                                    aria-label="LinkedIn"
                                >
                                    <Linkedin className="w-4 h-4" />
                                </a>
                                <a
                                    href="https://github.com/darshjoshi"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-9 h-9 border-2 border-black bg-white hover:bg-black text-black hover:text-white transition-all duration-300 flex items-center justify-center group"
                                    aria-label="GitHub"
                                >
                                    <Github className="w-4 h-4" />
                                </a>
                                <a
                                    href="https://x.com/darshjoshii"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-9 h-9 border-2 border-black bg-white hover:bg-black text-black hover:text-white transition-all duration-300 flex items-center justify-center group"
                                    aria-label="X (Twitter)"
                                >
                                    <X className="w-4 h-4" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
