import { Linkedin, Github, X } from 'lucide-react';

export function AppFooter() {
  return (
    <footer className="border-t-2 border-black mt-32">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-sm text-gray-600 font-mono">
            &copy; {new Date().getFullYear()} Darsh Joshi
          </div>

          <div className="flex items-center gap-6">
            <span className="text-sm text-gray-600 font-mono font-bold">
              OPEN FOR COLLABORATION!
            </span>
            <div className="flex items-center gap-3">
              <a
                href="https://www.linkedin.com/in/darshjoshi"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 border-2 border-black bg-white hover:bg-black text-black hover:text-white transition-all duration-300 flex items-center justify-center"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://github.com/darshjoshi"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 border-2 border-black bg-white hover:bg-black text-black hover:text-white transition-all duration-300 flex items-center justify-center"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://x.com/darshjoshii"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 border-2 border-black bg-white hover:bg-black text-black hover:text-white transition-all duration-300 flex items-center justify-center"
                aria-label="X (Twitter)"
              >
                <X className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
