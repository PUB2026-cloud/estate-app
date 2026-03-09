import { useEffect, useRef } from 'react'
import { fmt } from '../utils/formatters'

export default function PropertyMap({ properties, selectedProperty, onSelectProperty, zipBoundaries }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])
  const boundaryLayersRef = useRef([])

  useEffect(() => {
    if (mapInstanceRef.current) return
    if (typeof window === 'undefined') return

    import('leaflet').then(L => {
      const map = L.map(mapRef.current, {
        center: [39.5, -98.35],
        zoom: 4,
        zoomControl: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map)

      mapInstanceRef.current = { map, L }
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.map.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Update markers when properties change
  useEffect(() => {
    if (!mapInstanceRef.current) return
    const { map, L } = mapInstanceRef.current

    // Clear old markers
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    const validProps = properties.filter(p => p._lat && p._lng)
    if (validProps.length === 0) return

    validProps.forEach(p => {
      const isSelected = selectedProperty?.id === p.id

      const icon = L.divIcon({
        className: '',
        html: `<div style="
          background: ${isSelected ? '#c9a96e' : '#1a1b1e'};
          color: ${isSelected ? '#0b0c0e' : '#c9a96e'};
          border: 2px solid ${isSelected ? '#dabb82' : '#c9a96e'};
          border-radius: 6px;
          padding: 4px 7px;
          font-size: 11px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
          cursor: pointer;
          transition: all 0.2s;
        ">${fmt.price(p.price)}</div>`,
        iconAnchor: [0, 0]
      })

      const marker = L.marker([p._lat, p._lng], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="min-width:180px">
            <div style="font-family:'Playfair Display',serif; font-size:16px; color:#c9a96e; font-weight:700; margin-bottom:4px">${fmt.price(p.price)}</div>
            <div style="font-size:12px; color:#e8e4dc; margin-bottom:2px">${p.addressLine1}</div>
            <div style="font-size:11px; color:#5a5650">${p.city}, ${p.state}</div>
            <div style="margin-top:8px; font-size:11px; color:#9a9690; display:flex; gap:12px">
              <span>${p.bedrooms ?? '—'} bd</span>
              <span>${p.bathrooms ?? '—'} ba</span>
              <span>${p.squareFootage?.toLocaleString() ?? '—'} sqft</span>
            </div>
          </div>
        `)

      marker.on('click', () => onSelectProperty(p))
      markersRef.current.push(marker)
    })

    // Fit map to markers
    if (validProps.length > 0) {
      const group = L.featureGroup(markersRef.current)
      map.fitBounds(group.getBounds().pad(0.15))
    }
  }, [properties, selectedProperty])

  // Draw ZIP boundaries
  useEffect(() => {
    if (!mapInstanceRef.current) return
    const { map, L } = mapInstanceRef.current

    boundaryLayersRef.current.forEach(l => l.remove())
    boundaryLayersRef.current = []

    if (!zipBoundaries) return

    Object.values(zipBoundaries).forEach(feature => {
      if (!feature?.geometry) return
      try {
        const layer = L.geoJSON(feature, {
          style: {
            color: '#c9a96e',
            weight: 2,
            opacity: 0.6,
            fillColor: '#c9a96e',
            fillOpacity: 0.04,
            dashArray: '4 4',
          }
        }).addTo(map)
        boundaryLayersRef.current.push(layer)
      } catch (e) { /* skip bad geometry */ }
    })
  }, [zipBoundaries])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%', borderRadius: 8 }} />
      {properties.filter(p => !p._lat).length > 0 && (
        <div style={geocodeWarning}>
          {properties.filter(p => !p._lat).length} properties not yet geocoded
        </div>
      )}
    </div>
  )
}

const geocodeWarning = {
  position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)',
  background: 'rgba(0,0,0,0.7)', color: 'var(--text3)', fontSize: 11,
  fontFamily: 'var(--sans)', padding: '4px 12px', borderRadius: 20, backdropFilter: 'blur(4px)',
  pointerEvents: 'none',
}
