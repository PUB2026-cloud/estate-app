// Rentcast API — https://app.rentcast.io/app (get your key there, ~$30/mo)
// Replace RENTCAST_API_KEY below with your actual key
const API_KEY = import.meta.env.VITE_RENTCAST_API_KEY || 'YOUR_RENTCAST_API_KEY'
const BASE = 'https://api.rentcast.io/v1'

const headers = {
  'X-Api-Key': API_KEY,
  'Accept': 'application/json'
}

// Search properties for sale by ZIP code
export async function searchListings({ zipCode, minPrice, maxPrice, minSize, maxSize, bedrooms, propertyType, limit = 20 }) {
  const params = new URLSearchParams({ zipCode, limit })
  if (minPrice) params.append('priceMin', minPrice)
  if (maxPrice) params.append('priceMax', maxPrice)
  if (minSize) params.append('squareFootageMin', minSize)
  if (maxSize) params.append('squareFootageMax', maxSize)
  if (bedrooms && bedrooms !== 'Any') params.append('bedroomsMin', bedrooms)
  if (propertyType && propertyType !== 'Any') params.append('propertyType', propertyType.toUpperCase())

  const res = await fetch(`${BASE}/listings/sale?${params}`, { headers })
  if (!res.ok) throw new Error(`Rentcast error: ${res.status}`)
  return res.json()
}

// Get price history & value estimates for a property
export async function getPropertyValue(address, zipCode) {
  const params = new URLSearchParams({ address, zipCode })
  const res = await fetch(`${BASE}/avm/value?${params}`, { headers })
  if (!res.ok) throw new Error(`Rentcast value error: ${res.status}`)
  return res.json()
}

// Get sales comparables for a property
export async function getSalesComps(address, zipCode) {
  const params = new URLSearchParams({ address, zipCode, limit: 6 })
  const res = await fetch(`${BASE}/avm/value?${params}&compCount=6`, { headers })
  if (!res.ok) throw new Error(`Rentcast comps error: ${res.status}`)
  return res.json()
}

// Get market statistics for a ZIP code
export async function getMarketStats(zipCode) {
  const params = new URLSearchParams({ zipCode })
  const res = await fetch(`${BASE}/markets?${params}`, { headers })
  if (!res.ok) throw new Error(`Rentcast market error: ${res.status}`)
  return res.json()
}

// Geocode an address to lat/lng using free Nominatim (no key needed)
export async function geocode(address) {
  const encoded = encodeURIComponent(address)
  const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encoded}&limit=1`, {
    headers: { 'User-Agent': 'EstateApp/1.0' }
  })
  const data = await res.json()
  if (data.length > 0) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
  return null
}

// Get ZIP code boundary polygon from OpenStreetMap
export async function getZipBoundary(zipCode) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=geojson&q=${zipCode}&limit=1&polygon_geojson=1`,
    { headers: { 'User-Agent': 'EstateApp/1.0' } }
  )
  const data = await res.json()
  return data.features?.[0] || null
}

// Walk Score API (free tier available at walkscore.com/professional/api.php)
export async function getWalkScore(address, lat, lng) {
  const wsKey = import.meta.env.VITE_WALKSCORE_API_KEY || ''
  if (!wsKey) return null
  const params = new URLSearchParams({ wsapikey: wsKey, address, lat, lon: lng, format: 'json' })
  const res = await fetch(`https://api.walkscore.com/score?${params}`)
  return res.json()
}
