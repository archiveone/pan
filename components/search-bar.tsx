'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      router.push(`/browse?search=${encodeURIComponent(searchTerm)}`)
    }
  }

  return (
    <div className="relative">
      <Search className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
      <input
        type="text"
        placeholder="Search properties, services, or experiences..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={handleSearch}
        className="w-full pl-12 pr-4 py-4 text-lg bg-white border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-gray-500"
      />
    </div>
  )
}
