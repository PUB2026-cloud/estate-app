import { useState, useCallback } from 'react'
import { LayoutGrid, Map as MapIcon, Heart, AlertCircle } from 'lucide-react'
import SearchPanel from './components/SearchPanel'
import PropertyCard from './components/PropertyCard'
import PropertyMap from './components/PropertyMap'
import PropertyDetail from './components/PropertyDetail'
import FavoritesPanel from './components/FavoritesPanel'
import { useFavorites } from './hooks/useFavorites'
import { searchListings, getZipBoundary } from './utils/api'
import { sortProperties, fmt } from './utils/formatters'

export default function App() {
  const [view, setView] = useState('grid')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searched, setSearched] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [showFavorites, setShowFavorites] = useState(false)
  const [zipBoundaries, setZipBoundaries] = useState({})
  const { favorites, toggle: toggleFav, isFav } = useFavorites()

  const handleSearch = useCallback(async ({ zips, sortBy, ...filters }) => {
    setLoading(true)
    setError(null)
    setSelectedProperty(null)

    try {
      const allResults = await Promise.allSettled(
        zips.map(zip => searchListings({ zipCode: zip, ...filters }))
      )

      let combined = []
      allResults.forEach((r, i) => {
        if (r.status === 'fulfilled') {
          const data = r.value
          const listings = Array.isArray(data) ? data : (data.data || [])
          combined.push(...listings)
        } else {
          console.warn('Failed ZIP ' + zips[i] + ':', r.reason)
        }
      })

      // Deduplicate by id without using JS Map constructor
      const seen = {}
      const unique = combined.filter(p => {
        if (!p.id || seen[p.id]) return false
        seen[p.id] = true
        return true
      })

      const sorted = sortProperties(unique, sortBy)

      // Rentcast already provides lat/lng
      const withCoords = sorted.map(p => ({
        ...p,
        _lat: p.latitude,
        _lng: p.longitude,
      }))

      setResults(withCoords)
      fetchZipBoundaries(zips)

    } catch (e) {
      setError(e.message || 'Search failed. Check your Rentcast API key.')
    }

    setLoading(false)
    setSearched(true)
  }, [])

  async function fetchZipBoundaries(zips) {
    const res = await Promise.allSettled(zips.map(z => getZipBoundary(z)))
    const boundaries = {}
    zips.forEach((z, i) => {
      if (res[i].status === 'fulfilled') boundaries[z] = res[i].value
    })
    setZipBoundaries(boundaries)
  }

  const stats = results.length > 0 ? {
    count: results.length,
    min: Math.min(...results.map(r => r.price || Infinity)),
    max: Math.max(...results.map(r => r.price || 0)),
    avg: Math.round(results.reduce((s, r) => s + (r.price || 0), 0) / results.length),
  } : null

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>
      <div style={sidebar}>
        <div style={sidebarHeader}>
          <div>
            <h1 style={logo}>ESTĀTE</h1>
            <p style={logoSub}>Property Intelligence</p>
          </div>
          <button
            style={{ ...favToggleBtn, ...(showFavorites ? favToggleActive : {}) }}
            onClick={() => setShowFavorites(v => !v)}
          >
            <Heart size={14} fill={favorites.length > 0 ? '#e05c5c' : 'none'} color={favorites.length > 0 ? '#e05c5c' : 'var(--text2)'} />
            {favorites.length > 0 && <span style={favCount}>{favorites.length}</span>}
          </button>
        </div>
        <SearchPanel onSearch={handleSearch} loading={loading} />
      </div>

      <div style={main}>
        <div style={topBar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {searched && stats && (
              <div style={{ display: 'flex', gap: 24 }}>
                <TopStat label="Found" val={stats.count + ' listings'} />
                <TopStat label="Range" val={fmt.price(stats.min) + ' – ' + fmt.price(stats.max)} />
                <TopStat label="Average" val={fmt.price(stats.avg)} />
              </div>
            )}
            {!searched && (
              <div style={{ fontSize: 13, color: 'var(--text3)' }}>Enter ZIP codes and criteria to search</div>
            )}
          </div>
          <div style={viewToggle}>
            <button style={{ ...viewBtn, ...(view === 'grid' ? viewBtnActive : {}) }} onClick={() => setView('grid')}>
              <LayoutGrid size={14} /> Grid
            </button>
            <button style={{ ...viewBtn, ...(view === 'map' ? viewBtnActive : {}) }} onClick={() => setView('map')}>
              <MapIcon size={14} /> Map
            </button>
          </div>
        </div>

        {error && (
          <div style={errorBanner}>
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}

        <div style={contentArea}>
          {view === 'map' ? (
            <div style={{ flex: 1, height: '100%', padding: 12, overflow: 'hidden' }}>
              <PropertyMap
                properties={results}
                selectedProperty={selectedProperty}
                onSelectProperty={setSelectedProperty}
                zipBoundaries={zipBoundaries}
              />
            </div>
          ) : (
            <div style={gridArea}>
              {loading && (
                <div style={loadingState}>
                  <div style={spinner} />
                  <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 16 }}>Searching properties…</div>
                </div>
              )}
              {!loading && searched && results.length === 0 && (
                <div style={emptyState}>
                  <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.2 }}>⌖</div>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 18, color: 'var(--text3)' }}>No properties found</div>
                </div>
              )}
              {!loading && !searched && (
                <div style={emptyState}>
                  <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.15 }}>◈</div>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 18, color: 'var(--text3)' }}>Ready to search</div>
                  <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 8, maxWidth: 320, textAlign: 'center', lineHeight: 1.6 }}>
                    Add ZIP codes in the left panel, set your criteria, and click Search
                  </div>
                </div>
              )}
              {!loading && results.length > 0 && (
                <div style={grid}>
                  {results.map((p, i) => (
                    <PropertyCard
                      key={p.id || i}
                      property={p}
                      isFav={isFav(p.id)}
                      onFav={toggleFav}
                      onClick={setSelectedProperty}
                      style={{ animationDelay: Math.min(i * 40, 400) + 'ms', animation: 'fadeUp 0.4s ease both' }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {selectedProperty && (
            <div style={detailDrawer}>
              <PropertyDetail
                property={selectedProperty}
                isFav={isFav(selectedProperty.id)}
                onFav={toggleFav}
                onClose={() => setSelectedProperty(null)}
              />
            </div>
          )}

          {showFavorites && (
            <div style={favPanel}>
              <FavoritesPanel
                favorites={favorites}
                onSelect={p => { setSelectedProperty(p); setShowFavorites(false) }}
                onRemove={toggleFav}
                onClose={() => setShowFavorites(false)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function TopStat({ label, val }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
      <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text3)' }}>{label}</span>
      <span style={{ fontFamily: 'var(--serif)', fontSize: 15, color: 'var(--gold)' }}>{val}</span>
    </div>
  )
}

const sidebar = { width: 280, flexShrink: 0, background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }
const sidebarHeader = { padding: '20px 20px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }
const logo = { fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 700, letterSpacing: -0.5 }
const logoSub = { fontSize: 10, color: 'var(--text3)', letterSpacing: '2px', textTransform: 'uppercase', marginTop: 2 }
const favToggleBtn = { background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 7, padding: '7px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }
const favToggleActive = { borderColor: '#e05c5c44', background: '#e05c5c11' }
const favCount = { background: '#e05c5c', color: '#fff', borderRadius: 10, padding: '0 5px', fontSize: 10, fontFamily: 'var(--sans)' }
const main = { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }
const topBar = { height: 52, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', flexShrink: 0, gap: 12 }
const viewToggle = { display: 'flex', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 7, overflow: 'hidden', flexShrink: 0 }
const viewBtn = { display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', background: 'none', border: 'none', color: 'var(--text3)', fontSize: 12, fontFamily: 'var(--sans)', cursor: 'pointer', transition: 'all 0.15s' }
const viewBtnActive = { background: 'var(--gold)', color: 'var(--bg)', fontWeight: 600 }
const errorBanner = { background: '#e05c5c15', border: '1px solid #e05c5c33', margin: '8px 12px', padding: '8px 14px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#e05c5c', fontFamily: 'var(--sans)', flexShrink: 0 }
const contentArea = { flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }
const gridArea = { flex: 1, overflowY: 'auto', padding: '16px' }
const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }
const loadingState = { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }
const spinner = { width: 36, height: 36, border: '3px solid var(--border2)', borderTopColor: 'var(--gold)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }
const emptyState = { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }
const detailDrawer = { width: 380, flexShrink: 0, height: '100%', borderLeft: '1px solid var(--border)', overflow: 'hidden' }
const favPanel = { width: 300, flexShrink: 0, height: '100%', overflow: 'hidden' }
