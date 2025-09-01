import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import UnifiedListingForm from '@/components/listings/unified-listing-form'
import { Building, ArrowLeft } from 'lucide-react'

export default async function CreateListingPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Building className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold">Ireland Listings</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Create New Listing</h2>
            <p className="text-gray-600">
              List your property, service, or experience on Ireland's unified marketplace
            </p>
          </div>

          <UnifiedListingForm />
        </div>
      </div>
    </div>
  )
}
