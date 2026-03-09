import { Heart, Maximize2, Bed, Bath, MapPin, ExternalLink } from 'lucide-react'
import { fmt } from '../utils/formatters'

function getZillowUrl(p) {
  const addr = encodeURIComponent(`${p.addressLine1} ${p.city} ${p.state} ${p.zipCode}`)
  return `https://www.zillow.com/homes/${addr}_rb/`
}

function getRedfinUrl(p) {
  const addr = encodeURIComponent(`${p.addressLine1}, ${p.city}, ${p.state} ${p.zipCode}`)
  return `https://www.redfin.com/search#location=${addr}`
}

function getStreetViewUrl(p) {
  if (!p.latitude || !p.longitude) return null
  return `https://maps.googleapis.com/maps/api/streetview?size=400x200&location=${p.latitude},${p.longitude}&key=YOUR_GOOGLE_KEY`
}

export default function PropertyCard({ property: p, isFav, onFav, onClick, style }) {
  return (
    <div style={{ ...cardStyle, ...style }}>
      {/* Image / Placeholder */}
      <div style={imgBox} onClick={() => onClick(p)}>
        <div style={imgPlaceholder}>{typeEmoji(p.propertyType)}</div>
        <button
          style={{ ...favBtn, color: isFav ? '#e05c5c' : 'var(--text2)' }}
          onClick={e => { e.stopPropagation(); onFav(p) }}
        >
          <Heart size={15} fill={isFav ? '#e05c5c' : 'none'} />
        </button>
        <span style={typeBadge}>{p.propertyType || 'Property'}</span>
      </div>

      {/* Body */}
      <div style={body} onClick={() => onClick(p)}>
        <div style={{ marginBottom: 10 }}>
          <div style={priceRow}>
            <span style={price}>{fmt.price(p.price)}</span>
            {p.squareFootage && p.price && (
              <span style={ppsf}>{fmt.ppsf(p.price, p.squareFootage)}</span>
            )}
          </div>
          <div style={address}>{p.addressLine1}{p.addressLine2 ? `, ${p.addressLine2}` : ''}</div>
          <div style={cityStyle}>
            <MapPin size={10} style={{ opacity: 0.5 }} />
            {p.city}, {p.state} {p.zipCode}
          </div>
        </div>

        <div style={divider} />

        <div style={statsRow}>
          <Stat icon={<Bed size={11} />} val={p.bedrooms ?? '—'} label="beds" />
          <Stat icon={<Bath size={11} />} val={p.bathrooms ?? '—'} label="baths" />
          <Stat icon={<Maximize2 size={11} />} val={p.squareFootage ? p.squareFootage.toLocaleString() : '—'} label="sqft" />
          {p.yearBuilt && <Stat val={p.yearBuilt} label="built" />}
        </div>
      </div>

      {/* Links Footer */}
      <div style={footer}>
        <a
          href={getZillowUrl(p)}
          target="_blank"
          rel="noreferrer"
          style={linkBtn}
          onClick={e => e.stopPropagation()}
        >
          <ExternalLink size={11} /> Zillow
        </a>
        <a
          href={getRedfinUrl(p)}
          target="_blank"
          rel="noreferrer"
          style={linkBtn}
          onClick={e => e.stopPropagation()}
        >
          <ExternalLink size={11} /> Redfin
        </a>
        {p.mlsName && (
          <span style={mlsBadge}>{p.mlsName}</span>
        )}
      </div>
    </div>
  )
}

function Stat({ icon, val, label }) {
  return (
    <div style={{ textAlign: 'center' }}>
      {icon && <div style={{ color: 'var(--text3)', marginBottom: 2 }}>{icon}</div>}
      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{val}</div>
      <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{label}</div>
    </div>
  )
}

function typeEmoji(type) {
  const map = {
    'Single Family': '🏡',
    'Condo': '🏢',
    'Townhouse': '🏘️',
    'Multi Family': '🏗️',
    'Multi-Family': '🏗️',
    'Land': '🌿'
  }
  return <span style={{ fontSize: 52 }}>{map[type] || '🏠'}</span>
}

const cardStyle = {
  background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10,
  overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
  display: 'flex', flexDirection: 'column',
}
const imgBox = { position: 'relative', height: 160, background: 'var(--bg)', overflow: 'hidden', cursor: 'pointer' }
const imgPlaceholder = { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0e0f12, #1a1b1e)' }
const favBtn = { position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '6px 8px', cursor: 'pointer', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center' }
const typeBadge = { position: 'absolute', bottom: 10, left: 10, background: 'rgba(0,0,0,0.7)', color: 'var(--gold)', border: '1px solid var(--gold-dim)', borderRadius: 4, padding: '3px 8px', fontSize: 10, letterSpacing: '0.8px', textTransform: 'uppercase', backdropFilter: 'blur(4px)' }
const body = { padding: '14px 16px 12px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }
const priceRow = { display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }
const price = { fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 700, color: 'var(--gold)', letterSpacing: -0.5 }
const ppsf = { fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--sans)' }
const address = { fontSize: 13, color: 'var(--text)', fontFamily: 'var(--sans)', marginBottom: 2 }
const cityStyle = { fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--sans)', display: 'flex', alignItems: 'center', gap: 3 }
const divider = { height: 1, background: 'var(--border)', margin: '10px 0' }
const statsRow = { display: 'flex', justifyContent: 'space-between' }
const footer = { 
  borderTop: '1px solid var(--border)', 
  padding: '10px 14px', 
  display: 'flex', 
  gap: 8, 
  alignItems: 'center',
  background: 'var(--surface2)'
}
const linkBtn = { 
  display: 'inline-flex', alignItems: 'center', gap: 4,
  background: 'var(--bg)', border: '1px solid var(--border2)', 
  color: 'var(--gold)', borderRadius: 5, padding: '4px 10px', 
  fontSize: 11, fontFamily: 'var(--sans)', textDecoration: 'none',
  transition: 'border-color 0.15s',
  cursor: 'pointer'
}
const mlsBadge = { 
  marginLeft: 'auto', fontSize: 10, color: 'var(--text3)', 
  fontFamily: 'var(--sans)', letterSpacing: '0.5px',
  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 100
}
