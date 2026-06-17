import { useState, useEffect } from 'react'
import { Download } from 'lucide-react'

const RENTCAST_API_KEY = import.meta.env.VITE_RENTCAST_API_KEY

const DAY_OPTIONS = [
  { label: '6 mo', value: 180 },
  { label: '12 mo', value: 365 },
  { label: '24 mo', value: 730 },
]

const RADIUS_OPTIONS = [
  { label: '0.25 mi', value: 0.25 },
  { label: '0.5 mi', value: 0.5 },
  { label: '1 mi', value: 1 },
]

const TYPE_OPTIONS = [
  { label: 'SFR', value: 'Single Family' },
  { label: 'Condo', value: 'Condo' },
  { label: 'All', value: '' },
]

function fmtPrice(n) {
  if (!n) return '—'
  return n >= 1000000
    ? '$' + (n / 1000000).toFixed(2) + 'M'
    : '$' + (n / 1000).toFixed(0) + 'K'
}

function fmtFull(n) {
  if (!n) return '—'
  return '$' + n.toLocaleString()
}

function daysAgo(dateStr) {
  if (!dateStr) return null
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 86400000)
  if (diff < 0) return null
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  return diff + ' days ago'
}

function median(arr) {
  if (!arr.length) return null
  const s = [...arr].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2)
}

export default function CompsPanel({ property }) {
  const [comps, setComps] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [days, setDays] = useState(180)
  const [radius, setRadius] = useState(0.5)
  const [propType, setPropType] = useState('Single Family')

  useEffect(() => {
    if (!property) return
    fetchComps()
  }, [property?.id, days, radius, propType])

  async function fetchComps() {
    setLoading(true)
    setError(null)
    setComps([])
    try {
      const address = [
        property.addressLine1,
        property.city,
        property.state,
        property.zipCode,
      ].filter(Boolean).join(', ')

      const params = new URLSearchParams({
        address,
        compCount: 25,
        ...(propType ? { propertyType: propType } : {}),
      })

      const res = await fetch(
        `https://api.rentcast.io/v1/avm/value?${params}`,
        {
          headers: {
            'X-Api-Key': RENTCAST_API_KEY,
            'accept': 'application/json',
          },
        }
      )

      if (!res.ok) throw new Error('Rentcast error ' + res.status)
      const data = await res.json()
      const list = Array.isArray(data)
        ? data
        : (data.comparables || data.comparableSales || data.data || [])

      // Filter by date range client-side
      const cutoff = Date.now() - days * 86400000
      const filtered = list.filter(c => {
        const sold = c.saleDate || c.lastSaleDate
        if (!sold) return true
        return new Date(sold).getTime() >= cutoff
      })

      // Filter by radius client-side if lat/lng available
      const filtered2 = radius < 1 && property.latitude && property.longitude
        ? filtered.filter(c => {
            if (!c.latitude || !c.longitude) return true
            const dlat = c.latitude - property.latitude
            const dlng = c.longitude - property.longitude
            const dist = Math.sqrt(dlat * dlat + dlng * dlng) * 69
            return dist <= radius
          })
        : filtered

      setComps(filtered2)
    } catch (e) {
      setError(e.message || 'Failed to load comps')
    }
    setLoading(false)
  }

  function exportCSV() {
    const headers = ['Address', 'City', 'State', 'ZIP', 'Sale Price', 'Sale Date', 'Beds', 'Baths', 'Sq Ft', '$/SF', 'Lot Size', 'Year Built']
    const rows = comps.map(c => {
      const price = c.price || c.salePrice
      const sqft = c.squareFootage
      const psf = price && sqft ? Math.round(price / sqft) : ''
      return [
        c.addressLine1 || c.address || '',
        c.city || '',
        c.state || '',
        c.zipCode || '',
        price || '',
        c.saleDate || c.lastSaleDate || '',
        c.bedrooms || '',
        c.bathrooms || '',
        sqft || '',
        psf,
        c.lotSize || '',
        c.yearBuilt || '',
      ]
    })
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `comps_${(property.addressLine1 || 'export').replace(/\s+/g, '_')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Summary stats
  const prices = comps.map(c => c.price || c.salePrice).filter(Boolean)
  const psfs = comps.map(c => {
    const p = c.price || c.salePrice
    const s = c.squareFootage
    return p && s ? Math.round(p / s) : null
  }).filter(Boolean)
  const doms = comps.map(c => c.daysOnMarket).filter(n => n != null)

  const medPrice = median(prices)
  const medPSF = median(psfs)
  const avgDOM = doms.length
    ? Math.round(doms.reduce((a, b) => a + b, 0) / doms.length)
    : null

  // Subject property $/SF for comparison
  const subjectPSF = property.price && property.squareFootage
    ? Math.round(property.price / property.squareFootage)
    : null

  return (
    <div style={s.wrap}>

      {/* Filter chips */}
      <div style={s.filters}>
        <div style={s.chipGroup}>
          {DAY_OPTIONS.map(o => (
            <button
              key={o.value}
              style={{ ...s.chip, ...(days === o.value ? s.chipOn : {}) }}
              onClick={() => setDays(o.value)}
            >
              {o.label}
            </button>
          ))}
        </div>
        <div style={s.chipGroup}>
          {RADIUS_OPTIONS.map(o => (
            <button
              key={o.value}
              style={{ ...s.chip, ...(radius === o.value ? s.chipOn : {}) }}
              onClick={() => setRadius(o.value)}
            >
              {o.label}
            </button>
          ))}
        </div>
        <div style={s.chipGroup}>
          {TYPE_OPTIONS.map(o => (
            <button
              key={o.label}
              style={{ ...s.chip, ...(propType === o.value ? s.chipOn : {}) }}
              onClick={() => setPropType(o.value)}
            >
              {o.label}
            </button>
          ))}
        </div>
        {comps.length > 0 && (
          <button style={s.exportBtn} onClick={exportCSV} title="Export to CSV">
            <Download size={11} style={{ marginRight: 3 }} /> CSV
          </button>
        )}
      </div>

      {/* Summary bar */}
      {!loading && comps.length > 0 && (
        <div style={s.summaryBar}>
          <SumCell label="Median Sale" val={fmtPrice(medPrice)} />
          <SumCell label="Median $/SF" val={medPSF ? '$' + medPSF.toLocaleString() : '—'} />
          <SumCell label="Avg DOM" val={avgDOM != null ? avgDOM + ' d' : '—'} />
          <SumCell label="Comps" val={comps.length} />
        </div>
      )}

      {/* Subject reference row */}
      {!loading && comps.length > 0 && (
        <div style={s.subjectRow}>
          <span style={{ fontSize: 11, color: 'var(--text3)' }}>Subject:</span>
          <span style={{ fontSize: 11, color: 'var(--gold)', fontFamily: 'var(--serif)' }}>
            {fmtFull(property.price)}
          </span>
          {subjectPSF && (
            <span style={{ fontSize: 10, color: 'var(--text3)' }}>
              ${subjectPSF.toLocaleString()}/sf
            </span>
          )}
          {medPSF && subjectPSF && (
            <span style={{
              fontSize: 10,
              color: subjectPSF > medPSF ? '#e05c5c' : '#5cb88a',
              marginLeft: 'auto',
            }}>
              {subjectPSF > medPSF ? '▲' : '▼'}{' '}
              {Math.abs(Math.round(((subjectPSF - medPSF) / medPSF) * 100))}% vs median
            </span>
          )}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={s.center}>
          <div style={s.spinner} />
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 12 }}>
            Searching comparable sales…
          </div>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div style={s.errorBox}>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>Could not load comps</div>
          <div style={{ fontSize: 11, opacity: 0.8 }}>{error}</div>
          <button style={s.retryBtn} onClick={fetchComps}>Retry</button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && comps.length === 0 && (
        <div style={s.center}>
          <div style={{ fontSize: 28, opacity: 0.2, marginBottom: 8 }}>◈</div>
          <div style={{ fontSize: 13, color: 'var(--text2)' }}>No comps found</div>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 6, textAlign: 'center', lineHeight: 1.6 }}>
            Try expanding the radius or date range
          </div>
        </div>
      )}

      {/* Comp rows */}
      {!loading && !error && comps.length > 0 && (
        <div style={s.list}>
          {comps.map((c, i) => {
            const price = c.price || c.salePrice
            const sqft = c.squareFootage
            const psf = price && sqft ? Math.round(price / sqft) : null
            const addr = c.addressLine1 || c.address || 'Address unavailable'
            const sold = c.saleDate || c.lastSaleDate
            const ago = daysAgo(sold)
            const priceDelta = price && property.price ? price - property.price : null
            const psfDelta = psf && subjectPSF ? psf - subjectPSF : null

            const fullAddr = [addr, c.city, c.state, c.zipCode].filter(Boolean).join(', ')
            const zillowUrl = `https://www.zillow.com/homes/${encodeURIComponent(fullAddr)}_rb/`
            const redfinUrl = `https://www.redfin.com/search#combined?q=${encodeURIComponent(fullAddr)}&v=2`

            return (
              <div key={i} style={s.compRow}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={s.compAddr}>{addr}</div>
                  <div style={s.compMeta}>
                    {[
                      c.bedrooms != null && c.bedrooms + ' bd',
                      c.bathrooms != null && c.bathrooms + ' ba',
                      sqft && sqft.toLocaleString() + ' sf',
                      c.lotSize && c.lotSize.toLocaleString() + ' lot',
                    ].filter(Boolean).join(' · ')}
                  </div>
                  <div style={{ display: 'flex', gap: 5, marginTop: 5, alignItems: 'center' }}>
                    {ago && <span style={s.badge}>{ago}</span>}
                    <a href={zillowUrl} target="_blank" rel="noopener noreferrer"
                      style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:20, height:20, borderRadius:4, background:'#1557b0', color:'#fff', fontSize:10, fontWeight:700, textDecoration:'none', fontFamily:'var(--sans)' }}>Z</a>
                    <a href={redfinUrl} target="_blank" rel="noopener noreferrer"
                      style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:20, height:20, borderRadius:4, background:'#b52424', color:'#fff', fontSize:10, fontWeight:700, textDecoration:'none', fontFamily:'var(--sans)' }}>R</a>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0, paddingLeft: 8 }}>
                  <div style={s.compPrice}>{fmtFull(price)}</div>
                  {psf && (
                    <div style={s.compPSF}>${psf.toLocaleString()}/sf</div>
                  )}
                  {priceDelta !== null && (
                    <div style={{
                      fontSize: 10,
                      color: priceDelta >= 0 ? '#27714f' : '#c0392b',
                      marginTop: 2,
                    }}>
                      {priceDelta >= 0 ? '+' : ''}{fmtPrice(priceDelta)}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function SumCell({ label, val }) {
  return (
    <div style={{ textAlign: 'center', padding: '8px 4px', background: 'var(--surface)' }}>
      <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text3)' }}>
        {label}
      </div>
      <div style={{ fontFamily: 'var(--serif)', fontSize: 13, color: 'var(--gold)', marginTop: 2 }}>
        {val}
      </div>
    </div>
  )
}

const s = {
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
  },
  filters: {
    display: 'flex',
    gap: 6,
    padding: '10px 14px',
    borderBottom: '1px solid var(--border)',
    flexWrap: 'wrap',
    alignItems: 'center',
    flexShrink: 0,
  },
  chipGroup: { display: 'flex', gap: 4 },
  chip: {
    background: 'var(--surface2)',
    border: '1px solid var(--border2)',
    borderRadius: 5,
    padding: '4px 9px',
    fontSize: 11,
    color: 'var(--text2)',
    cursor: 'pointer',
    fontFamily: 'var(--sans)',
    transition: 'all 0.15s',
  },
  chipOn: {
    borderColor: '#c9a96e55',
    color: 'var(--gold)',
    background: '#1e1b14',
  },
  exportBtn: {
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
    background: 'var(--surface2)',
    border: '1px solid var(--border2)',
    borderRadius: 5,
    padding: '4px 10px',
    fontSize: 11,
    color: 'var(--text2)',
    cursor: 'pointer',
    fontFamily: 'var(--sans)',
  },
  summaryBar: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1px',
    background: 'var(--border)',
    borderBottom: '1px solid var(--border)',
    flexShrink: 0,
  },
  subjectRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 14px',
    background: 'var(--bg)',
    borderBottom: '1px solid var(--border)',
    flexShrink: 0,
  },
  list: {
    flex: 1,
    overflowY: 'auto',
  },
  compRow: {
    display: 'flex',
    gap: 8,
    padding: '10px 14px',
    borderBottom: '1px solid var(--border)',
    transition: 'background 0.1s',
  },
  compAddr: {
    fontSize: 12,
    color: 'var(--text)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    marginBottom: 2,
  },
  compMeta: {
    fontSize: 10,
    color: 'var(--text3)',
    marginBottom: 3,
  },
  badge: {
    display: 'inline-block',
    background: '#1a3020',
    border: '1px solid #2d6e4044',
    color: '#5aab7a',
    borderRadius: 3,
    fontSize: 9,
    padding: '1px 5px',
  },
  compPrice: {
    fontFamily: 'var(--serif)',
    fontSize: 13,
    color: 'var(--gold)',
  },
  compPSF: {
    fontSize: 10,
    color: 'var(--text3)',
    marginTop: 1,
  },
  center: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  spinner: {
    width: 28,
    height: 28,
    border: '2px solid var(--border2)',
    borderTopColor: 'var(--gold)',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  errorBox: {
    margin: 14,
    padding: '12px 14px',
    background: '#e05c5c12',
    border: '1px solid #e05c5c33',
    borderRadius: 7,
    fontSize: 12,
    color: '#e05c5c',
    fontFamily: 'var(--sans)',
  },
  retryBtn: {
    marginTop: 8,
    background: 'none',
    border: '1px solid #e05c5c44',
    color: '#e05c5c',
    borderRadius: 5,
    padding: '4px 12px',
    fontSize: 11,
    cursor: 'pointer',
    fontFamily: 'var(--sans)',
  },
}
