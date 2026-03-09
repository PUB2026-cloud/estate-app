export const fmt = {
  price: (p) => {
    if (!p) return 'N/A'
    if (p >= 1_000_000) return `$${(p / 1_000_000).toFixed(2)}M`
    if (p >= 1_000) return `$${(p / 1_000).toFixed(0)}K`
    return `$${p}`
  },
  sqft: (s) => s ? `${s.toLocaleString()} sqft` : 'N/A',
  ppsf: (price, size) => (price && size) ? `$${Math.round(price / size).toLocaleString()}/sqft` : 'N/A',
  date: (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A',
  pct: (n) => n != null ? `${n > 0 ? '+' : ''}${n.toFixed(1)}%` : 'N/A',
}

export const PROPERTY_TYPES = ['Any', 'Single Family', 'Condo', 'Townhouse', 'Multi Family', 'Land']
export const BEDS_OPTIONS = ['Any', '1', '2', '3', '4', '5+']
export const SORT_OPTIONS = [
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'size_asc', label: 'Size: Small → Large' },
  { value: 'size_desc', label: 'Size: Large → Small' },
  { value: 'ppsf_asc', label: '$/sqft: Low → High' },
]

export function sortProperties(list, sortBy) {
  return [...list].sort((a, b) => {
    if (sortBy === 'price_asc') return (a.price || 0) - (b.price || 0)
    if (sortBy === 'price_desc') return (b.price || 0) - (a.price || 0)
    if (sortBy === 'size_asc') return (a.squareFootage || 0) - (b.squareFootage || 0)
    if (sortBy === 'size_desc') return (b.squareFootage || 0) - (a.squareFootage || 0)
    if (sortBy === 'ppsf_asc') {
      const pA = a.price && a.squareFootage ? a.price / a.squareFootage : Infinity
      const pB = b.price && b.squareFootage ? b.price / b.squareFootage : Infinity
      return pA - pB
    }
    return 0
  })
}

// Generate mock price history for demo/fallback
export function mockPriceHistory(currentPrice) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const now = new Date()
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now)
    d.setMonth(d.getMonth() - (11 - i))
    const variance = (Math.random() - 0.5) * 0.08
    const trend = (i / 11) * 0.06
    return {
      month: months[d.getMonth()],
      price: Math.round(currentPrice * (0.94 + trend + variance)),
      estimate: Math.round(currentPrice * (0.93 + trend + variance * 0.5))
    }
  })
}
