import { Heart, X, Trash2 } from 'lucide-react'
import { fmt } from '../utils/formatters'

export default function FavoritesPanel({ favorites, onSelect, onRemove, onClose }) {
  return (
    <div style={panel}>
      <div style={header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Heart size={16} color="#e05c5c" fill="#e05c5c" />
          <span style={title}>Saved Properties</span>
          <span style={badge}>{favorites.length}</span>
        </div>
        <button style={closeBtn} onClick={onClose}><X size={15} /></button>
      </div>

      <div style={body}>
        {favorites.length === 0 ? (
          <div style={empty}>
            <Heart size={32} style={{ opacity: 0.15, marginBottom: 10 }} />
            <div style={{ fontSize: 13, color: 'var(--text3)' }}>No saved properties yet</div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>Click the heart on any listing to save it here</div>
          </div>
        ) : (
          <>
            {favorites.length >= 2 && (
              <div style={compareHint}>
                💡 Tip: Click any property to view full details and compare against comps
              </div>
            )}
            {favorites.map(p => (
              <div key={p.id} style={favCard} onClick={() => onSelect(p)}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={favPrice}>{fmt.price(p.price)}</div>
                  <div style={favAddr}>{p.addressLine1}</div>
                  <div style={favStats}>
                    {p.bedrooms && <span>{p.bedrooms} bd</span>}
                    {p.bathrooms && <span>{p.bathrooms} ba</span>}
                    {p.squareFootage && <span>{p.squareFootage.toLocaleString()} sqft</span>}
                    {p.zipCode && <span>ZIP {p.zipCode}</span>}
                  </div>
                  {p.squareFootage && p.price && (
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{fmt.ppsf(p.price, p.squareFootage)}</div>
                  )}
                </div>
                <button style={removeBtn} onClick={e => { e.stopPropagation(); onRemove(p) }}>
                  <Trash2 size={13} />
                </button>
              </div>
            ))}

            {/* Comparison summary */}
            {favorites.length >= 2 && (
              <div style={summaryBox}>
                <div style={summaryTitle}>Quick Compare</div>
                <div style={summaryRow}>
                  <span style={{ color: 'var(--text3)' }}>Price Range</span>
                  <span>{fmt.price(Math.min(...favorites.map(f => f.price || 0)))} — {fmt.price(Math.max(...favorites.map(f => f.price || 0)))}</span>
                </div>
                <div style={summaryRow}>
                  <span style={{ color: 'var(--text3)' }}>Avg Price</span>
                  <span>{fmt.price(Math.round(favorites.reduce((s, f) => s + (f.price || 0), 0) / favorites.length))}</span>
                </div>
                {favorites.some(f => f.squareFootage) && (
                  <div style={summaryRow}>
                    <span style={{ color: 'var(--text3)' }}>Avg Size</span>
                    <span>{Math.round(favorites.reduce((s, f) => s + (f.squareFootage || 0), 0) / favorites.filter(f => f.squareFootage).length).toLocaleString()} sqft</span>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

const panel = { height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--surface)', borderLeft: '1px solid var(--border)' }
const header = { padding: '16px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }
const title = { fontFamily: 'var(--serif)', fontSize: 15, fontWeight: 600 }
const badge = { background: '#e05c5c22', color: '#e05c5c', border: '1px solid #e05c5c44', borderRadius: 4, padding: '1px 7px', fontSize: 11, fontFamily: 'var(--sans)' }
const closeBtn = { background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: 4 }
const body = { flex: 1, overflowY: 'auto', padding: '12px 14px' }
const empty = { textAlign: 'center', padding: '40px 20px', color: 'var(--text3)' }
const compareHint = { background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 10px', fontSize: 11, color: 'var(--text3)', marginBottom: 10, lineHeight: 1.5 }
const favCard = { display: 'flex', alignItems: 'flex-start', gap: 8, padding: '12px 10px', border: '1px solid var(--border)', borderRadius: 8, marginBottom: 8, cursor: 'pointer', transition: 'border-color 0.2s', background: 'var(--bg)' }
const favPrice = { fontFamily: 'var(--serif)', fontSize: 16, color: 'var(--gold)', fontWeight: 700, marginBottom: 2 }
const favAddr = { fontSize: 12, color: 'var(--text)', marginBottom: 3 }
const favStats = { display: 'flex', gap: 8, fontSize: 11, color: 'var(--text3)' }
const removeBtn = { background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: 4, flexShrink: 0 }
const summaryBox = { background: 'var(--bg)', border: '1px solid var(--border2)', borderRadius: 8, padding: '12px 14px', marginTop: 8 }
const summaryTitle = { fontSize: 10, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 10 }
const summaryRow = { display: 'flex', justifyContent: 'space-between', fontSize: 12, fontFamily: 'var(--sans)', marginBottom: 6 }
