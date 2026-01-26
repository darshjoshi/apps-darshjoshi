import Link from 'next/link';

interface App {
  id: string;
  name: string;
  description: string;
  href: string;
  color: string;
}

const apps: App[] = [
  {
    id: 'example-app',
    name: 'Example App',
    description: 'A template application demonstrating backend integration',
    href: '/example-app',
    color: 'from-blue-500 to-indigo-600',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Apps Dashboard
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Welcome to your personal apps collection. Select an app below to get started.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((app) => (
            <Link
              key={app.id}
              href={app.href}
              className="group block"
            >
              <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden h-full">
                <div className={`h-32 bg-gradient-to-r ${app.color} group-hover:scale-105 transition-transform duration-300`} />
                <div className="p-6">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {app.name}
                  </h2>
                  <p className="text-gray-600">
                    {app.description}
                  </p>
                  <div className="mt-4 flex items-center text-blue-600 font-medium">
                    <span>Open app</span>
                    <svg
                      className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}

          {/* Add New App Card */}
          <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-6 flex items-center justify-center h-full min-h-[280px] hover:border-gray-400 transition-colors">
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">Add New App</p>
              <p className="text-sm text-gray-400 mt-1">Create a new application</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
