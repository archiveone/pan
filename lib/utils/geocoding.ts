interface GeocodeResult {
  lat: number;
  lng: number;
  formattedAddress: string;
  city: string;
  state: string;
  country: string;
  postcode: string;
}

/**
 * Geocode an address using the Google Maps Geocoding API
 * @param address The address to geocode
 * @returns Promise<GeocodeResult>
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult> {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new Error('Google Maps API key not configured');
    }

    const encodedAddress = encodeURIComponent(address);
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`
    );

    const data = await response.json();

    if (data.status !== 'OK') {
      throw new Error(`Geocoding failed: ${data.status}`);
    }

    const result = data.results[0];
    const { lat, lng } = result.geometry.location;

    // Extract address components
    let city = '';
    let state = '';
    let country = '';
    let postcode = '';

    result.address_components.forEach((component: any) => {
      if (component.types.includes('locality')) {
        city = component.long_name;
      }
      if (component.types.includes('administrative_area_level_1')) {
        state = component.long_name;
      }
      if (component.types.includes('country')) {
        country = component.long_name;
      }
      if (component.types.includes('postal_code')) {
        postcode = component.long_name;
      }
    });

    return {
      lat,
      lng,
      formattedAddress: result.formatted_address,
      city,
      state,
      country,
      postcode,
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    throw error;
  }
}

/**
 * Calculate the distance between two points using the Haversine formula
 * @param lat1 Latitude of first point
 * @param lng1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lng2 Longitude of second point
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Convert degrees to radians
 * @param degrees Angle in degrees
 * @returns Angle in radians
 */
function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Get nearby coordinates within a radius
 * @param lat Center latitude
 * @param lng Center longitude
 * @param radiusKm Radius in kilometers
 * @returns Coordinate bounds
 */
export function getNearbyCoordinates(lat: number, lng: number, radiusKm: number) {
  return {
    minLat: lat - radiusKm / 111,
    maxLat: lat + radiusKm / 111,
    minLng: lng - radiusKm / (111 * Math.cos(lat * Math.PI / 180)),
    maxLng: lng + radiusKm / (111 * Math.cos(lat * Math.PI / 180)),
  };
}

/**
 * Validate coordinates
 * @param lat Latitude
 * @param lng Longitude
 * @returns boolean
 */
export function isValidCoordinates(lat: number, lng: number): boolean {
  return (
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

/**
 * Format coordinates for display
 * @param lat Latitude
 * @param lng Longitude
 * @returns Formatted coordinates string
 */
export function formatCoordinates(lat: number, lng: number): string {
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}

/**
 * Parse coordinates from string
 * @param coordString Coordinates string (format: "lat,lng")
 * @returns Coordinates object or null if invalid
 */
export function parseCoordinates(coordString: string): { lat: number; lng: number } | null {
  const parts = coordString.split(',').map(part => parseFloat(part.trim()));
  if (parts.length !== 2 || !isValidCoordinates(parts[0], parts[1])) {
    return null;
  }
  return { lat: parts[0], lng: parts[1] };
}