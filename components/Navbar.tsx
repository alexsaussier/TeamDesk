import Link from "next/link"
import { Button } from "@/components/ui/button"
import LogoutButton from "@/components/LogoutButton"

export default function Navbar() {
  return (
    <nav className="bg-gray-100 w-64 h-screen p-4">
      <div className="flex flex-col h-full">
        <Link href="/" className="text-2xl font-bold mb-8">
          Resourcing Application
        </Link>
        <div className="space-y-2">
          <Button variant="ghost" className="w-full justify-start hover:bg-gray-200" asChild>
            <Link href="/dashboard">Home</Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start hover:bg-gray-200" asChild>
            <Link href="/dashboard/timeline">Timeline</Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start hover:bg-gray-200" asChild>
            <Link href="/dashboard/projects">Projects</Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start hover:bg-gray-200" asChild>
            <Link href="/dashboard/workforce">Workforce</Link>
          </Button>
        </div>
        <div className="mt-auto">
          <LogoutButton />
        </div>
      </div>
    </nav>
  )
}

