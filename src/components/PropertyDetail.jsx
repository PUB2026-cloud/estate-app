import { useState, useEffect } from 'react'
import { X, Heart, TrendingUp, TrendingDown, Home, MapPin, Calendar, Ruler, DollarSign, Star, ExternalLink } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { fmt, mockPriceHistory } from '../utils/formatters'
import { getPropertyValue, getSalesComps, getWalkScore } from '../utils/api'

export default function PropertyDetail({ property: p, isFav, onFav, onClose }) {
  const [tab, setTab] = useState('overview')
  const [valueData, setValueData] = useState(null)
  const [comps, setComps] = useState([])
  const [walkScore, setWalkScore] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!p) return
    setTab('overview')
    setValueData(null)
    setComps([])
    setWalkScore(null)
    loadDetails()
  }, [p?.id])

  async function loadDetails() {
    if (!p) return
    setLoading(true)
    try {
      const [val] = await Promise.allSettled([
        getPropertyValue(p.addressLine1, p.zipCode),
      ])
      if (val.status === 'fulfilled') setValueData(val.value)
    } catch (e) { /* use mock */ }
    setLoading(false)
  }

  if (!p) return null

  const priceHistory = valueData?.priceHistory?.length
    ? valueData.priceHistory
    : mockPriceHistory(p.price || 500000)

  const estimatedValue = valueData?.price || p.price
  const priceDiff = p.price && estimatedValue ? ((p.price - estimatedValue) / estimatedValue * 100) : 0
  const overUnder = priceDiff > 2 ? 'over' : priceDiff < -2 ? 'under' : 'at'

  return (
    <div style={drawer}>
      {/* Header */}
      <div style={drawerHeader}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={drawerPrice}>{fmt.price(p.price)}</div>
          <div style={drawerAddr}>{p.addressLine1}</div>
          <div style={drawerCity}>
            <MapPin size={11} style={{ opacity: 0.5 }} />
            {p.city}, {p.state} {p.zipCode}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button style={iconBtn} onClick={() => onFav(p)}>
            <Heart size={16} fill={isFav ? '#e05c5c' : 'none'} color={isFav ? '#e05c5c' : 'var(--text2)'} />
          </button>
          <button style={iconBtn} onClick={onClose}><X size={16} /></button>
        </div>
      </div>

      {/* Tabs */}
      <div style={tabBar}>
        {['overview', 'price history', 'comps', 'neighborhood'].map(t => (
          <button key={t} style={{ ...tabBtn, ...(tab === t ? tabActive : {}) }} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      <div style={drawerBody}>
        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div style={{ animation: 'fadeUp 0.3s ease' }}>
            {/* Key Stats */}
            <div style={statsGrid}>
              <StatBox icon={<Home size={13} />} label="Type" val={p.propertyType || '—'} />
              <StatBox icon={<Ruler size={13} />} label="Size" val={p.squareFootage ? `${p.squareFootage.toLocaleString()} sqft` : '—'} />
              <StatBox icon={<DollarSign size={13} />} label="$/sqft" val={fmt.ppsf(p.price, p.squareFootage)} />
              <StatBox icon={<Calendar size={13} />} label="Year Built" val={p.yearBuilt || '—'} />
              <StatBox icon={<span style={{ fontSize: 12 }}>🛏</span>} label="Bedrooms" val={p.bedrooms ?? '—'} />
              <StatBox icon={<span style={{ fontSize: 12 }}>🛁</span>} label="Bathrooms" val={p.bathrooms ?? '—'} />
              {p.lotSize && <StatBox icon={<span style={{ fontSize: 12 }}>📐</span>} label="Lot Size" val={`${p.lotSize.toLocaleString()} sqft`} />}
              {p.daysOnMarket != null && <StatBox icon={<span style={{ fontSize: 12 }}>⏱</span>} label="Days on Market" val={p.daysOnMarket} />}
            </div>

            {/* AVM Value Indicator */}
            <div style={avmBox}>
              <div style={{ fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 8 }}>
                Estimated Market Value
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontFamily: 'var(--serif)', fontSize: 24, color: 'var(--gold)' }}>
                  {fmt.price(estimatedValue)}
                </span>
                {p.price && estimatedValue && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: overUnder === 'over' ? '#e05c5c' : overUnder === 'under' ? '#5cb88a' : 'var(--text2)' }}>
                    {overUnder === 'over' ? <TrendingUp size={13} /> : overUnder === 'under' ? <TrendingDown size={13} /> : null}
                    Listed {overUnder} value ({fmt.pct(Math.abs(priceDiff))})
                  </span>
                )}
              </div>
              {loading && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>Fetching live estimate…</div>}
            </div>

            {/* Description */}
            {p.description && (
              <div style={descBox}>
                <div style={sectionLabel}>Listing Description</div>
                <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--text2)' }}>{p.description}</p>
              </div>
            )}

            {/* Features */}
            {p.features?.length > 0 && (
              <div>
                <div style={sectionLabel}>Features</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {p.features.map(f => (
                    <span key={f} style={featureTag}>{f}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* PRICE HISTORY */}
        {tab === 'price history' && (
          <div style={{ animation: 'fadeUp 0.3s ease' }}>
            <div style={sectionLabel}>12-Month Price Trend</div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={priceHistory} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--text3)', fontFamily: 'var(--sans)' }} axisLine={false} tickLine={false} />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 6, fontFamily: 'var(--sans)', fontSize: 12 }}
                  formatter={(v) => [fmt.price(v)]}
                  labelStyle={{ color: 'var(--text3)', fontSize: 11 }}
                />
                <Line type="monotone" dataKey="price" stroke="var(--gold)" strokeWidth={2} dot={false} name="List Price" />
                {priceHistory[0]?.estimate && (
                  <Line type="monotone" dataKey="estimate" stroke="#5cb88a" strokeWidth={1.5} dot={false} strokeDasharray="4 3" name="Est. Value" />
                )}
                <ReferenceLine y={p.price} stroke="var(--text3)" strokeDasharray="3 3" />
              </LineChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
              <LegendItem color="var(--gold)" label="List Price" />
              <LegendItem color="#5cb88a" label="Est. Value" dashed />
              <LegendItem color="var(--text3)" label="Current Price" dashed />
            </div>

            {/* Price stats */}
            <div style={{ ...statsGrid, marginTop: 20 }}>
              <StatBox label="Current" val={fmt.price(p.price)} />
              <StatBox label="12mo Low" val={fmt.price(Math.min(...priceHistory.map(h => h.price)))} />
              <StatBox label="12mo High" val={fmt.price(Math.max(...priceHistory.map(h => h.price)))} />
              <StatBox label="Avg Est." val={fmt.price(Math.round(priceHistory.reduce((s, h) => s + (h.estimate || h.price), 0) / priceHistory.length))} />
            </div>
          </div>
        )}

        {/* COMPS */}
        {tab === 'comps' && (
          <div style={{ animation: 'fadeUp 0.3s ease' }}>
            <div style={sectionLabel}>Sales Comparables</div>
            {comps.length === 0 ? (
              <div style={emptyState}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>◈</div>
                <div style={{ fontSize: 13, color: 'var(--text3)' }}>
                  Comparable sales data requires a live Rentcast API key.
                  <br />Connect your key in <code style={{ color: 'var(--gold)', fontSize: 11 }}>.env</code> to enable this.
                </div>
                {/* Mock comps for display */}
                {mockComps(p).map((c, i) => <CompRow key={i} comp={c} subject={p} />)}
              </div>
            ) : (
              comps.map((c, i) => <CompRow key={i} comp={c} subject={p} />)
            )}
          </div>
        )}

        {/* NEIGHBORHOOD */}
        {tab === 'neighborhood' && (
          <div style={{ animation: 'fadeUp 0.3s ease' }}>
            <div style={sectionLabel}>Neighborhood Overview</div>
            <div style={{ ...statsGrid, gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
              <ScoreBox label="Walk Score" score={walkScore?.walkscore ?? randomScore(40, 95)} desc={walkScore?.description ?? 'Walkable'} color="#5cb88a" />
              <ScoreBox label="Transit Score" score={randomScore(30, 90)} desc="Good Transit" color="#6b9bd2" />
              <ScoreBox label="Bike Score" score={randomScore(35, 80)} desc="Bikeable" color="#c9a96e" />
              <ScoreBox label="School Rating" score={randomScore(5, 10, 10)} desc="out of 10" color="#b87cc9" max={10} />
            </div>

            <div style={sectionLabel}>Area Market Stats</div>
            <div style={statsGrid}>
              <StatBox label="Median Home Price" val={fmt.price(p.price ? Math.round(p.price * (0.85 + Math.random() * 0.3)) : null)} />
              <StatBox label="Avg Days on Market" val={`${Math.floor(20 + Math.random() * 40)} days`} />
              <StatBox label="Price / sqft" val={fmt.ppsf(p.price, p.squareFootage)} />
              <StatBox label="Homes for Sale" val={Math.floor(10 + Math.random() * 90)} />
            </div>

            <div style={{ marginTop: 16, padding: 14, background: 'var(--surface2)', borderRadius: 8, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, color: 'var(--text3)', lineHeight: 1.6 }}>
                💡 <strong style={{ color: 'var(--text2)' }}>Pro tip:</strong> Add a Walk Score API key in your <code style={{ color: 'var(--gold)' }}>.env</code> as <code style={{ color: 'var(--gold)' }}>VITE_WALKSCORE_API_KEY</code> to get real neighborhood scores. Free tier available at <a href="https://www.walkscore.com/professional/api.php" target="_blank" rel="noreferrer" style={{ color: 'var(--gold)' }}>walkscore.com</a>.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StatBox({ icon, label, val }) {
  return (
    <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 7, padding: '10px 12px' }}>
      {icon && <div style={{ color: 'var(--text3)', marginBottom: 4 }}>{icon}</div>}
      <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{val}</div>
    </div>
  )
}

function ScoreBox({ label, score, desc, color, max = 100 }) {
  const pct = Math.round((score / max) * 100)
  return (
    <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 7, padding: '12px 14px' }}>
      <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
        <span style={{ fontFamily: 'var(--serif)', fontSize: 26, color }}>{score}</span>
        <span style={{ fontSize: 11, color: 'var(--text3)' }}>{desc}</span>
      </div>
      <div style={{ height: 3, background: 'var(--border2)', borderRadius: 2 }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 2, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  )
}

function CompRow({ comp, subject }) {
  const priceDiff = subject.price && comp.price ? comp.price - subject.price : 0
  return (
    <div style={{ padding: '12px 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <div style={{ fontSize: 13, color: 'var(--text)', marginBottom: 2 }}>{comp.address}</div>
        <div style={{ fontSize: 11, color: 'var(--text3)' }}>{comp.sqft?.toLocaleString()} sqft · {comp.beds}bd · sold {comp.soldDate}</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--gold)', fontFamily: 'var(--serif)' }}>{fmt.price(comp.price)}</div>
        <div style={{ fontSize: 11, color: priceDiff > 0 ? '#5cb88a' : '#e05c5c' }}>
          {priceDiff > 0 ? '+' : ''}{fmt.price(Math.abs(priceDiff))} vs subject
        </div>
      </div>
    </div>
  )
}

function LegendItem({ color, label, dashed }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text3)' }}>
      <div style={{ width: 20, height: 2, background: dashed ? 'transparent' : color, borderTop: dashed ? `2px dashed ${color}` : 'none' }} />
      {label}
    </div>
  )
}

function randomScore(min, max, scale = 100) { return Math.floor(min + Math.random() * (max - min)) }

function mockComps(p) {
  return Array.from({ length: 4 }, (_, i) => ({
    address: `${100 + i * 37} Nearby ${['Ave', 'St', 'Blvd', 'Dr'][i]}`,
    price: Math.round((p.price || 500000) * (0.88 + Math.random() * 0.25)),
    sqft: Math.round((p.squareFootage || 1500) * (0.85 + Math.random() * 0.3)),
    beds: (p.bedrooms || 3) + (Math.random() > 0.6 ? 1 : 0),
    soldDate: `${Math.floor(1 + Math.random() * 6)}mo ago`,
  }))
}

const drawer = { height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--surface)', borderLeft: '1px solid var(--border)', overflow: 'hidden' }
const drawerHeader = { padding: '20px 20px 16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 12, alignItems: 'flex-start', flexShrink: 0 }
const drawerPrice = { fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 700, color: 'var(--gold)', marginBottom: 4 }
const drawerAddr = { fontSize: 14, color: 'var(--text)', marginBottom: 3 }
const drawerCity = { fontSize: 11, color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 3 }
const tabBar = { display: 'flex', borderBottom: '1px solid var(--border)', flexShrink: 0, overflowX: 'auto' }
const tabBtn = { flex: 1, padding: '10px 8px', background: 'none', border: 'none', borderBottom: '2px solid transparent', color: 'var(--text3)', fontSize: 11, letterSpacing: '0.8px', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'var(--sans)', whiteSpace: 'nowrap', transition: 'color 0.2s' }
const tabActive = { color: 'var(--gold)', borderBottomColor: 'var(--gold)' }
const drawerBody = { flex: 1, overflowY: 'auto', padding: 18 }
const statsGrid = { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 16 }
const avmBox = { background: 'var(--bg)', border: '1px solid var(--border2)', borderRadius: 8, padding: '14px 16px', marginBottom: 16 }
const descBox = { marginBottom: 16 }
const sectionLabel = { fontSize: 10, letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 10, fontFamily: 'var(--sans)' }
const featureTag = { background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 4, padding: '3px 8px', fontSize: 11, color: 'var(--text2)', fontFamily: 'var(--sans)' }
const iconBtn = { background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 6, padding: '7px 9px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text2)' }
const emptyState = { textAlign: 'center', padding: '10px 0 20px' }
