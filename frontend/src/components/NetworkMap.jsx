import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';

// Fix for default Leaflet marker icons in React (Critical for visibility)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Premium Clinical Icon for Laboratories
const clinicalIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3063/3063174.png',
    iconSize: [42, 42],
    iconAnchor: [21, 42],
    popupAnchor: [0, -42],
});

// Component to handle auto-view updates when coordinates change
const AutoView = ({ center, labs }) => {
    const map = useMap();
    if (center) {
        map.setView(center, 14, { animate: true });
    } else if (labs.length > 0) {
        // If no user center, fit map to show all discovered labs
        const bounds = L.latLngBounds(labs.map(l => [l.location.coordinates[1], l.location.coordinates[0]]));
        map.fitBounds(bounds, { padding: [50, 50] });
    }
    return null;
};

const NetworkMap = ({ labs, userLocation, height = "500px" }) => {
    const navigate = useNavigate();
    const defaultCenter = [21.1458, 79.0882]; // National Center / Nagpur

    return (
        <div style={{ 
            height, 
            width: '100%', 
            borderRadius: '28px', 
            overflow: 'hidden', 
            border: '2px solid rgba(226, 232, 240, 0.8)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.08)',
            position: 'relative',
            zIndex: 1
        }}>
            <MapContainer 
                center={userLocation ? [userLocation.lat, userLocation.lng] : defaultCenter} 
                zoom={13} 
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
            >
                {/* SAFE & FREE OPENSTREETMAP TILE SERVICE */}
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; DiagnoLabs | OpenStreetMap'
                />

                <AutoView 
                    center={userLocation ? [userLocation.lat, userLocation.lng] : null} 
                    labs={labs} 
                />

                {/* User Identity Marker */}
                {userLocation && (
                    <Marker position={[userLocation.lat, userLocation.lng]}>
                        <Popup>
                            <div style={{ textAlign: 'center', fontWeight: 'bold' }}>
                                Your Scanning Environment
                            </div>
                        </Popup>
                    </Marker>
                )}

                {/* Clinical Node Markers */}
                {labs.map((lab) => (
                    <Marker 
                        key={lab._id || lab.googlePlaceId} 
                        position={[lab.location.coordinates[1], lab.location.coordinates[0]]}
                        icon={clinicalIcon}
                    >
                        <Popup className="premium-popup">
                            <div style={{ minWidth: '180px', padding: '10px 5px' }}>
                                <div style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: '900', textTransform: 'uppercase', marginBottom: '5px' }}>
                                    {lab.category || 'Clinical Partner'}
                                </div>
                                <div style={{ fontWeight: '900', fontSize: '1.1rem', marginBottom: '8px', color: '#0f172a' }}>{lab.name}</div>
                                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '15px' }}>{lab.address || lab.city}</div>
                                <button 
                                    onClick={() => navigate(`/lab/${lab._id || lab.googlePlaceId}`)}
                                    style={{ 
                                        width: '100%',
                                        background: 'var(--primary)', 
                                        color: 'white', 
                                        border: 'none', 
                                        padding: '10px', 
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        fontWeight: '800',
                                        fontSize: '0.85rem'
                                    }}
                                >
                                    Access Facility
                                </button>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
            
            <style>{`
                .leaflet-popup-content-wrapper {
                    border-radius: 18px !important;
                    padding: 5px !important;
                    box-shadow: 0 15px 35px rgba(0,0,0,0.15) !important;
                }
                .leaflet-container {
                    font-family: inherit !important;
                }
            `}</style>
        </div>
    );
};

export default NetworkMap;
