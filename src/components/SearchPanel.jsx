import { useState } from 'react'
import { Search, X, Plus, MapPin } from 'lucide-react'
import { PROPERTY_TYPES, BEDS_OPTIONS, SORT_OPTIONS } from '../utils/formatters'

const ZIP_CITIES = {
  '90210': 'Beverly Hills, CA', '10001': 'Manhattan, NY', '78701': 'Austin, TX',
  '33101': 'Miami, FL', '60601': 'Chicago, IL', '94102': 'San Francisco, CA',
  '30301': 'Atlanta, GA', '98101': 'Seattle, WA', '77001': 'Houston, TX',
  '85001': 'Phoenix, AZ', '19101': 'Philadelphia, PA', '02101': 'Boston, MA',
}

export default function SearchPanel({ onSearch, loading }) {
  const [zipInput, setZipInput] = useState('')
  const [zips, setZips] = useState([])
  const [filters, setFilters] = useState({
    minPrice: '', maxPrice: '', minSize: '', maxSize: '',
    propertyType: 'Any', beds: 'Any', sortBy: 'price_asc'
  })

  const addZip = () => {
    const z = zipInput.trim()
    if (z.length === 5 && /^\d+$/.test(z) && !zips.includes(z)) {
      setZips(p => [...p, z])
      setZipInput('')
    }
  }

  const set = (k, v) => setFilters(p => ({ ...p, [k]: v }))

  const handleSearch = () => {
    if (zips.length === 0) return
    onSearch({ zips, ...filters })
  }

  return (
    <div style={styles.panel}>
      {/* ZIP Input */}
      <div style={styles.section}>
        <label style={styles.label}>Area Codes / ZIP Codes</label>
        <div style={styles.row}>
          <div style={styles.inputWrap}>
            <MapPin size={14} color="var(--text3)" style={{ flexShrink: 0 }} />
            <input
              style={styles.input}
              placeholder="Enter 5-digit ZIP…"
              value={zipInput}
              maxLength={5}
              onChange={e => setZipInput(e.target.value.replace(/\D/g, ''))}
              onKeyDown={e => e.key === 'Enter' && addZip()}
            />
          </div>
          <button style={styles.addBtn} onClick={addZip}>
            <Plus size={14} /> Add
          </button>
        </div>

        {zips.length > 0 && (
          <div style={styles.zipTags}>
            {zips.map(z => (
              <span key={z} style={styles.zipTag}>
                <span style={{ color: 'var(--gold)', fontWeight: 500 }}>{z}</span>
                {ZIP_CITIES[z] && <span style={{ color: 'var(--text3)', fontSize: 11 }}> · {ZIP_CITIES[z]}</span>}
                <button style={styles.removeBtn} onClick={() => setZips(p => p.filter(c => c !== z))}>
                  <X size={11} />
                </button>
              </span>
            ))}
            <button style={styles.clearBtn} onClick={() => setZips([])}>clear all</button>
          </div>
        )}

        {/* Quick picks */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
          {Object.entries(ZIP_CITIES).slice(0, 6).map(([z, city]) => (
            <button key={z} style={styles.quickPick}
              onClick={() => !zips.includes(z) && setZips(p => [...p, z])}>
              {z} <span style={{ color: 'var(--text3)', fontSize: 10 }}>{city.split(',')[1]}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={styles.divider} />

      {/* Price Range */}
      <div style={styles.section}>
        <label style={styles.label}>Price Range</label>
        <div style={styles.rangeRow}>
          <input style={styles.field} type="number" placeholder="Min $" value={filters.minPrice} onChange={e => set('minPrice', e.target.value)} />
          <span style={{ color: 'var(--text3)', fontSize: 12 }}>—</span>
          <input style={styles.field} type="number" placeholder="Max $" value={filters.maxPrice} onChange={e => set('maxPrice', e.target.value)} />
        </div>
      </div>

      {/* Size Range */}
      <div style={styles.section}>
        <label style={styles.label}>Size (sqft)</label>
        <div style={styles.rangeRow}>
          <input style={styles.field} type="number" placeholder="Min sqft" value={filters.minSize} onChange={e => set('minSize', e.target.value)} />
          <span style={{ color: 'var(--text3)', fontSize: 12 }}>—</span>
          <input style={styles.field} type="number" placeholder="Max sqft" value={filters.maxSize} onChange={e => set('maxSize', e.target.value)} />
        </div>
      </div>

      {/* Type & Beds */}
      <div style={styles.section}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label style={styles.label}>Property Type</label>
            <select style={styles.select} value={filters.propertyType} onChange={e => set('propertyType', e.target.value)}>
              {PROPERTY_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={styles.label}>Min Beds</label>
            <select style={styles.select} value={filters.beds} onChange={e => set('beds', e.target.value)}>
              {BEDS_OPTIONS.map(b => <option key={b}>{b}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Sort */}
      <div style={styles.section}>
        <label style={styles.label}>Sort Results</label>
        <select style={styles.select} value={filters.sortBy} onChange={e => set('sortBy', e.target.value)}>
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div style={styles.divider} />

      <button
        style={{ ...styles.searchBtn, opacity: zips.length === 0 || loading ? 0.5 : 1 }}
        onClick={handleSearch}
        disabled={zips.length === 0 || loading}
      >
        {loading ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
            <span style={{ animation: 'pulse 1s infinite' }}>⬤</span> Searching…
          </span>
        ) : (
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
            <Search size={15} /> Search Properties
          </span>
        )}
      </button>
    </div>
  )
}

const styles = {
  panel: { display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', padding: '20px 0' },
  section: { padding: '0 20px', marginBottom: 16 },
  label: { display: 'block', fontSize: 10, letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 7, fontFamily: 'var(--sans)' },
  row: { display: 'flex', gap: 8 },
  rangeRow: { display: 'flex', gap: 8, alignItems: 'center' },
  inputWrap: { flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 6, padding: '9px 12px' },
  input: { flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text)', fontFamily: 'var(--sans)', fontSize: 13 },
  field: { flex: 1, background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 6, padding: '9px 12px', color: 'var(--text)', fontFamily: 'var(--sans)', fontSize: 13, outline: 'none', width: '100%' },
  select: { width: '100%', background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 6, padding: '9px 12px', color: 'var(--text)', fontFamily: 'var(--sans)', fontSize: 13, outline: 'none' },
  addBtn: { display: 'flex', alignItems: 'center', gap: 5, background: 'var(--surface2)', border: '1px solid var(--border2)', color: 'var(--gold)', borderRadius: 6, padding: '9px 14px', cursor: 'pointer', fontSize: 13, fontFamily: 'var(--sans)', whiteSpace: 'nowrap' },
  zipTags: { display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  zipTag: { display: 'inline-flex', alignItems: 'center', gap: 5, background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 5, padding: '4px 8px', fontSize: 12, fontFamily: 'var(--sans)' },
  removeBtn: { display: 'flex', alignItems: 'center', background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: 0 },
  clearBtn: { background: 'none', border: 'none', color: 'var(--text3)', fontSize: 11, cursor: 'pointer', fontFamily: 'var(--sans)', alignSelf: 'center' },
  quickPick: { background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 4, padding: '3px 8px', fontSize: 11, color: 'var(--text2)', cursor: 'pointer', fontFamily: 'var(--sans)' },
  divider: { height: 1, background: 'var(--border)', margin: '4px 0 16px' },
  searchBtn: { margin: '0 20px', background: 'var(--gold)', color: 'var(--bg)', border: 'none', borderRadius: 7, padding: '13px', fontFamily: 'var(--sans)', fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'background 0.2s' },
}
