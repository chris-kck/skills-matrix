import Link from "next/link"
import { BarChart, Users, UserCircle, Network, Lightbulb, GitBranch, Users2 } from "lucide-react"

export function Sidebar() {
  return (
    <div className="w-64 bg-white h-full shadow-md">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800">Skills Matrix</h1>
      </div>
      <nav className="mt-6">
        <Link href="/" className="block px-6 py-3 text-gray-600 hover:bg-gray-100 hover:text-gray-800">
          <BarChart className="inline-block mr-2" size={20} />
          Dashboard
        </Link>
        <Link href="/team-comparison" className="block px-6 py-3 text-gray-600 hover:bg-gray-100 hover:text-gray-800">
          <Users className="inline-block mr-2" size={20} />
          Team Comparison
        </Link>
        <Link href="/individual-skills" className="block px-6 py-3 text-gray-600 hover:bg-gray-100 hover:text-gray-800">
          <UserCircle className="inline-block mr-2" size={20} />
          Individual Skills
        </Link>
        <Link
          href="/skill-relationships"
          className="block px-6 py-3 text-gray-600 hover:bg-gray-100 hover:text-gray-800"
        >
          <Network className="inline-block mr-2" size={20} />
          Skill Relationships
        </Link>
        <Link
          href="/skill-recommendations"
          className="block px-6 py-3 text-gray-600 hover:bg-gray-100 hover:text-gray-800"
        >
          <Lightbulb className="inline-block mr-2" size={20} />
          Skill Recommendations
        </Link>
        <Link href="/skill-gaps" className="block px-6 py-3 text-gray-600 hover:bg-gray-100 hover:text-gray-800">
          <GitBranch className="inline-block mr-2" size={20} />
          Skill Gaps
        </Link>
        <Link
          href="/team-collaboration"
          className="block px-6 py-3 text-gray-600 hover:bg-gray-100 hover:text-gray-800"
        >
          <Users2 className="inline-block mr-2" size={20} />
          Team Collaboration
        </Link>
      </nav>
    </div>
  )
}

