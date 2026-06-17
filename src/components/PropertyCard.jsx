import { useState } from "react";
import { Heart, ExternalLink, Bed, Bath, Square, TrendingUp, MapPin } from "lucide-react";

const formatPrice = (p) => {
  if (!p) return "N/A";
  return p >= 1000000 ? `$${(p / 1000000).toFixed(2)}M` : `$${(p / 1000).toFixed(0)}K`;
};

const formatAddress = (property) => {
  const parts = [
    property.addressLine1,
    property.city,
    property.state,
    property.zipCode,
  ].filter(Boolean);
  return parts.join(", ");
};

const getZillowUrl = (property) => {
  const address = formatAddress(property);
  return `https://www.zillow.com/homes/${encodeURIComponent(address)}_rb/`;
};

const getRedfinUrl = (property) => {
  const address = formatAddress(property);
  return `https://www.redfin.com/search#combined?q=${encodeURIComponent(address)}&v=2`;
};

const getGoogleMapsUrl = (property) => {
  const address = formatAddress(property);
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
};

export default function PropertyCard({ property, isFavorite, onToggleFavorite, onViewDetails }) {
  const [hovered, setHovered] = useState(false);

  const pricePerSqft = property.squareFootage
    ? Math.round(property.price / property.squareFootage)
    : null;

  const propertyTypeEmoji = {
    "Single Family": "🏡",
    "Condo": "🏢",
    "Townhouse": "🏘️",
    "Multi Family": "🏗️",
    "Land": "🌿",
  }[property.propertyType] || "🏠";

  return (
    <div
      style={{
        background: "var(--surface)",
        border: `1px solid ${hovered ? "var(--gold)" : "var(--border)"}`,
        borderRadius: 10,
        overflow: "hidden",
        transition: "border-color 0.2s, transform 0.2s, box-shadow 0.2s",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        boxShadow: hovered ? "0 6px 24px rgba(0,0,0,0.08)" : "0 1px 4px rgba(0,0,0,0.04)",
        fontFamily: "var(--sans)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image / Emoji Header */}
      <div style={{
        background: "var(--surface2)",
        padding: "28px 24px",
        textAlign: "center",
        fontSize: 40,
        borderBottom: "1px solid var(--border)",
        position: "relative",
        minHeight: 96,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        {propertyTypeEmoji}

        {/* Favorite button */}
        <button
          onClick={() => onToggleFavorite && onToggleFavorite(property)}
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 6,
            width: 30,
            height: 30,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: isFavorite ? "#c0392b" : "var(--text3)",
            transition: "all 0.2s",
          }}
        >
          <Heart size={14} fill={isFavorite ? "#c0392b" : "none"} />
        </button>

        {/* Property type badge */}
        {property.propertyType && (
          <div style={{
            position: "absolute",
            top: 10,
            right: 10,
            background: "var(--gold-dim)",
            border: "1px solid var(--gold)",
            color: "var(--gold)",
            borderRadius: 4,
            padding: "2px 8px",
            fontSize: 10,
            letterSpacing: 0.5,
            fontWeight: 500,
          }}>
            {property.propertyType}
          </div>
        )}
      </div>

      {/* Card Body */}
      <div style={{ padding: "16px 18px 14px" }}>
        {/* Price & Address */}
        <div style={{ marginBottom: 12 }}>
          <div style={{
            fontFamily: "var(--serif)",
            fontSize: 22,
            fontWeight: 700,
            color: "var(--gold)",
            letterSpacing: -0.5,
          }}>
            {formatPrice(property.price)}
          </div>
          <div style={{ fontSize: 13, color: "var(--text)", marginTop: 3, fontWeight: 500 }}>
            {property.addressLine1}
          </div>
          <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
            <MapPin size={10} />
            {[property.city, property.state, property.zipCode].filter(Boolean).join(", ")}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "var(--border)", margin: "12px 0" }} />

        {/* Stats */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
          <StatCell icon={<Bed size={12} color="var(--text3)" />} val={property.bedrooms ?? "—"} label="Beds" />
          <StatCell icon={<Bath size={12} color="var(--text3)" />} val={property.bathrooms ?? "—"} label="Baths" />
          <StatCell icon={<Square size={12} color="var(--text3)" />} val={property.squareFootage?.toLocaleString() ?? "—"} label="Sq Ft" />
          <StatCell icon={<TrendingUp size={12} color="var(--text3)" />} val={pricePerSqft ? `$${pricePerSqft.toLocaleString()}` : "—"} label="/sqft" />
        </div>

        {/* View Details button */}
        {onViewDetails && (
          <button
            onClick={() => onViewDetails(property)}
            style={{
              width: "100%",
              background: "var(--gold)",
              border: "none",
              color: "#fff",
              borderRadius: 6,
              padding: "9px 0",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              marginBottom: 10,
              fontFamily: "var(--sans)",
              transition: "opacity 0.2s",
              letterSpacing: 0.2,
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            View Details & Comps
          </button>
        )}

        {/* External Links */}
        <div style={{ display: "flex", gap: 6 }}>
          <LinkBtn href={getZillowUrl(property)} color="#1557b0" label="Zillow" />
          <LinkBtn href={getRedfinUrl(property)} color="#b52424" label="Redfin" />
          <LinkBtn href={getGoogleMapsUrl(property)} color="#27714f" label="Maps" />
        </div>
      </div>
    </div>
  );
}

function StatCell({ icon, val, label }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text)", display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}>
        {icon}{val}
      </div>
      <div style={{ fontSize: 10, color: "var(--text3)", textTransform: "uppercase", letterSpacing: 1, marginTop: 2 }}>{label}</div>
    </div>
  );
}

function LinkBtn({ href, color, label }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        flex: 1,
        background: color,
        color: "#fff",
        borderRadius: 5,
        padding: "7px 0",
        fontSize: 11,
        fontWeight: 500,
        cursor: "pointer",
        textDecoration: "none",
        textAlign: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        opacity: 0.9,
        transition: "opacity 0.2s",
        fontFamily: "var(--sans)",
      }}
      onMouseEnter={e => e.currentTarget.style.opacity = "1"}
      onMouseLeave={e => e.currentTarget.style.opacity = "0.9"}
    >
      <ExternalLink size={10} /> {label}
    </a>
  );
}
