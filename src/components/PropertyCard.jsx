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
  const encoded = encodeURIComponent(address);
  return `https://www.zillow.com/search/real-estate/?searchQueryState={"usersSearchTerm":"${encoded}","mapBounds":{}}&city=${encodeURIComponent(property.city || "")}&state=${encodeURIComponent(property.state || "")}&searchTerm=${encoded}`;
};

const getRedfinUrl = (property) => {
  const address = formatAddress(property);
  const encoded = encodeURIComponent(address);
  return `https://www.redfin.com/search#combined?q=${encoded}`;
};

const getGoogleMapsUrl = (property) => {
  const address = formatAddress(property);
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
};

export default function PropertyCard({ property, isFavorite, onToggleFavorite, onViewDetails }) {
  const [imgError, setImgError] = useState(false);

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
    <div style={{
      background: "#161719",
      border: "1px solid #222226",
      borderRadius: 10,
      overflow: "hidden",
      transition: "border-color 0.2s, transform 0.2s",
      fontFamily: "'DM Sans', sans-serif",
    }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = "#c9a96e44";
        e.currentTarget.style.transform = "translateY(-3px)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = "#222226";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Image / Emoji Header */}
      <div style={{
        background: "#0e0f11",
        padding: "32px 24px",
        textAlign: "center",
        fontSize: 44,
        borderBottom: "1px solid #1e1e22",
        position: "relative",
        minHeight: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        {propertyTypeEmoji}

        {/* Favorite button */}
        <button
          onClick={() => onToggleFavorite(property)}
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            background: "none",
            border: "none",
            cursor: "pointer",
            color: isFavorite ? "#e74c3c" : "#3a3a40",
            fontSize: 20,
            transition: "color 0.2s",
          }}
        >
          <Heart size={20} fill={isFavorite ? "#e74c3c" : "none"} />
        </button>

        {/* Property type badge */}
        {property.propertyType && (
          <div style={{
            position: "absolute",
            top: 12,
            right: 12,
            background: "#1e1b14",
            border: "1px solid #c9a96e33",
            color: "#c9a96e",
            borderRadius: 4,
            padding: "2px 8px",
            fontSize: 11,
            letterSpacing: 0.5,
          }}>
            {property.propertyType}
          </div>
        )}
      </div>

      {/* Card Body */}
      <div style={{ padding: "20px 20px 16px" }}>
        {/* Price & Address */}
        <div style={{ marginBottom: 12 }}>
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 22,
            fontWeight: 700,
            color: "#c9a96e",
            letterSpacing: -0.5,
          }}>
            {formatPrice(property.price)}
          </div>
          <div style={{ fontSize: 13, color: "#8a8a8a", marginTop: 3 }}>
            {property.addressLine1}
          </div>
          <div style={{ fontSize: 11, color: "#4a4a50", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
            <MapPin size={10} />
            {[property.city, property.state, property.zipCode].filter(Boolean).join(", ")}
          </div>
          {property.listedBy && (
            <div style={{ fontSize: 10, color: "#3a3a40", marginTop: 3 }}>
              Listed by {property.listedBy}
            </div>
          )}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "#1e1e22", margin: "14px 0" }} />

        {/* Stats */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 15, fontWeight: 500, color: "#e8e4dc", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
              <Bed size={13} color="#5a5a5a" />{property.bedrooms ?? "—"}
            </div>
            <div style={{ fontSize: 10, color: "#5a5a5a", textTransform: "uppercase", letterSpacing: 1, marginTop: 2 }}>Beds</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 15, fontWeight: 500, color: "#e8e4dc", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
              <Bath size={13} color="#5a5a5a" />{property.bathrooms ?? "—"}
            </div>
            <div style={{ fontSize: 10, color: "#5a5a5a", textTransform: "uppercase", letterSpacing: 1, marginTop: 2 }}>Baths</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 15, fontWeight: 500, color: "#e8e4dc", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
              <Square size={13} color="#5a5a5a" />{property.squareFootage?.toLocaleString() ?? "—"}
            </div>
            <div style={{ fontSize: 10, color: "#5a5a5a", textTransform: "uppercase", letterSpacing: 1, marginTop: 2 }}>Sq Ft</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 15, fontWeight: 500, color: "#e8e4dc", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
              <TrendingUp size={13} color="#5a5a5a" />{pricePerSqft ? `$${pricePerSqft.toLocaleString()}` : "—"}
            </div>
            <div style={{ fontSize: 10, color: "#5a5a5a", textTransform: "uppercase", letterSpacing: 1, marginTop: 2 }}>/sqft</div>
          </div>
        </div>

        {/* Details button */}
        {onViewDetails && (
          <button
            onClick={() => onViewDetails(property)}
            style={{
              width: "100%",
              background: "#1a1c1e",
              border: "1px solid #2a2a2e",
              color: "#e8e4dc",
              borderRadius: 6,
              padding: "9px 0",
              fontSize: 13,
              cursor: "pointer",
              marginBottom: 10,
              transition: "background 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#222427"}
            onMouseLeave={e => e.currentTarget.style.background = "#1a1c1e"}
          >
            View Details & Comps
          </button>
        )}

        {/* External Links */}
        <div style={{ display: "flex", gap: 8 }}>
          <a
            href={getZillowUrl(property)}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flex: 1,
              background: "#1557b0",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "8px 0",
              fontSize: 12,
              cursor: "pointer",
              textDecoration: "none",
              textAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              transition: "background 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#1a6fd4"}
            onMouseLeave={e => e.currentTarget.style.background = "#1557b0"}
          >
            <ExternalLink size={11} /> Zillow
          </a>
          <a
            href={getRedfinUrl(property)}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flex: 1,
              background: "#cc2c2c",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "8px 0",
              fontSize: 12,
              cursor: "pointer",
              textDecoration: "none",
              textAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              transition: "background 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#e03333"}
            onMouseLeave={e => e.currentTarget.style.background = "#cc2c2c"}
          >
            <ExternalLink size={11} /> Redfin
          </a>
          <a
            href={getGoogleMapsUrl(property)}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flex: 1,
              background: "#2d7a4f",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "8px 0",
              fontSize: 12,
              cursor: "pointer",
              textDecoration: "none",
              textAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              transition: "background 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#369960"}
            onMouseLeave={e => e.currentTarget.style.background = "#2d7a4f"}
          >
            <ExternalLink size={11} /> Maps
          </a>
        </div>
      </div>
    </div>
  );
}
