import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'GREIA - Properties Marketplace',
  description: 'Buy, rent, or sell properties across residential, commercial, and luxury segments',
}

export default function PropertiesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Properties Marketplace</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Property listings will be rendered here */}
        <div className="text-center text-gray-600">
          Loading properties...
        </div>
      </div>
    </div>
  )
}