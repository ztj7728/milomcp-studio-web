import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Welcome to MiloMCP Studio
          </h1>
          <p className="text-xl text-muted-foreground">
            Modern web interface for the MiloMCP multi-user platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          <div className="group p-6 rounded-lg border hover:border-primary/50 transition-colors">
            <h2 className="text-xl font-semibold mb-3">Dashboard</h2>
            <p className="text-muted-foreground mb-4">
              Access your personalized dashboard with tools and workspace
              management.
            </p>
            <Button variant="outline" size="sm">
              Go to Dashboard
            </Button>
          </div>

          <div className="group p-6 rounded-lg border hover:border-primary/50 transition-colors">
            <h2 className="text-xl font-semibold mb-3">Tools</h2>
            <p className="text-muted-foreground mb-4">
              Execute and manage tools with real-time JSON-RPC communication.
            </p>
            <Button variant="outline" size="sm">
              View Tools
            </Button>
          </div>

          <div className="group p-6 rounded-lg border hover:border-primary/50 transition-colors">
            <h2 className="text-xl font-semibold mb-3">Workspace</h2>
            <p className="text-muted-foreground mb-4">
              Manage files and collaborate in your development workspace.
            </p>
            <Button variant="outline" size="sm">
              Open Workspace
            </Button>
          </div>

          <div className="group p-6 rounded-lg border hover:border-primary/50 transition-colors">
            <h2 className="text-xl font-semibold mb-3">Settings</h2>
            <p className="text-muted-foreground mb-4">
              Configure tokens, environment variables, and user preferences.
            </p>
            <Button variant="outline" size="sm">
              Settings
            </Button>
          </div>
        </div>

        <div className="flex gap-4 justify-center mt-12">
          <Link href="/login">
            <Button size="lg">Sign In</Button>
          </Link>
          <Button variant="outline" size="lg">
            Learn More
          </Button>
        </div>
      </div>
    </main>
  )
}
