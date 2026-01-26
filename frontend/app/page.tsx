import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Plus } from 'lucide-react';

interface App {
  id: string;
  name: string;
  description: string;
  href: string;
}

const apps: App[] = [
  {
    id: 'example-app',
    name: 'Example App',
    description: 'A template application demonstrating backend integration with a clean structure.',
    href: '/example-app',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-24">
        <section className="mb-16 text-center space-y-4">
          <h1 className="text-5xl font-bold tracking-tight text-primary">
            Apps Dashboard
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your personal collection of applications.
            Designed with minimalism and focus in mind.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((app) => (
            <Link
              key={app.id}
              href={app.href}
              className="group block h-full"
            >
              <Card className="h-full transition-all duration-300 hover:shadow-lg hover:border-primary/50 group-hover:-translate-y-1">
                <CardHeader>
                  <CardTitle className="group-hover:text-primary transition-colors">{app.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {app.description}
                  </CardDescription>
                </CardContent>
                <CardFooter className="mt-auto pt-0">
                  <Button variant="ghost" className="p-0 hover:bg-transparent group-hover:text-primary">
                    Open App <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardFooter>
              </Card>
            </Link>
          ))}

          {/* Add New App Card */}
          <button className="text-left h-full group">
            <Card className="h-full border-dashed border-2 hover:border-primary/50 hover:bg-secondary/30 transition-all duration-300 flex flex-col items-center justify-center p-8 space-y-4 cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <Plus className="w-6 h-6 text-muted-foreground group-hover:text-primary" />
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">Add New App</h3>
                <p className="text-sm text-muted-foreground mt-1">Create something new</p>
              </div>
            </Card>
          </button>
        </div>
      </main>

      <footer className="w-full py-6 text-center text-sm text-muted-foreground border-t border-border">
        <p>&copy; {new Date().getFullYear()} Darsh Joshi. All rights reserved.</p>
      </footer>
    </div>
  );
}
