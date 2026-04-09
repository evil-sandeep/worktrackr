import React, { useMemo, useEffect } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Polyline, 
  Marker, 
  Popup, 
  useMap 
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Store, MapPin, Navigation } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';

// Custom Map Bounds Updater
const ChangeView = ({ bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, map]);
  return null;
};

// Custom Icon Generator using Lucide Icons
const createCustomIcon = (iconComponent, color = '#4f46e5') => {
  const iconMarkup = renderToStaticMarkup(
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '12px', 
      padding: '8px', 
      border: `2px solid ${color}`,
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      color: color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {iconComponent}
    </div>
  );

  return L.divIcon({
    html: iconMarkup,
    className: 'custom-leaflet-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

const TrackingMap = ({ locations = [], visits = [] }) => {
  // 1. Prepare Polyline Coordinates
  const polylinePositions = useMemo(() => {
    return locations
      .filter(loc => loc.latitude && loc.longitude)
      .map(loc => [loc.latitude, loc.longitude]);
  }, [locations]);

  // 2. Prepare Bounds for Auto-fitting
  const bounds = useMemo(() => {
    const coords = [...polylinePositions];
    visits.forEach(v => coords.push([v.latitude, v.longitude]));
    return coords.length > 0 ? coords : null;
  }, [polylinePositions, visits]);

  const visitIcon = useMemo(() => createCustomIcon(<Store size={20} strokeWidth={3} />, '#4f46e5'), []);
  const pulseIcon = useMemo(() => createCustomIcon(<Navigation size={16} strokeWidth={3} />, '#94a3b8'), []);

  if (!bounds) {
    return (
      <div className="h-[500px] w-full bg-slate-50 rounded-[2.5rem] flex flex-col items-center justify-center border-2 border-dashed border-slate-200">
        <MapPin className="h-10 w-10 text-slate-300 mb-4" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No location data to visualize</p>
      </div>
    );
  }

  return (
    <div className="h-[600px] w-full rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl relative z-0">
      <MapContainer 
        center={bounds[0]} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Update View on Data Change */}
        <ChangeView bounds={bounds} />

        {/* The Path Taken */}
        <Polyline 
          positions={polylinePositions} 
          pathOptions={{ 
            color: '#6366f1', 
            weight: 4, 
            opacity: 0.6,
            dashArray: '10, 10'
          }} 
        />

        {/* GPS Pulse Dots (Smaller) */}
        {locations.map((loc, idx) => (
          <Marker 
            key={`pulse-${idx}`} 
            position={[loc.latitude, loc.longitude]} 
            icon={pulseIcon}
          >
            <Popup className="custom-popup">
               <div className="p-2">
                  <p className="text-[10px] font-black uppercase text-slate-400">GPS Pulse</p>
                  <p className="font-bold text-slate-800">{new Date(loc.timestamp).toLocaleTimeString()}</p>
                  <p className="text-[9px] text-slate-400 mt-1">{loc.latitude.toFixed(6)}, {loc.longitude.toFixed(6)}</p>
               </div>
            </Popup>
          </Marker>
        ))}

        {/* Major Visit Points (Larger) */}
        {visits.map((visit) => (
          <Marker 
            key={visit._id} 
            position={[visit.latitude, visit.longitude]} 
            icon={visitIcon}
          >
            <Popup maxWidth={300} className="custom-popup">
              <div className="p-1 space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center">
                    <Store size={14} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-indigo-600 leading-none">Verified Visit</p>
                    <p className="text-xs font-bold text-slate-800">{new Date(visit.createdAt).toLocaleTimeString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <p className="text-[8px] font-black uppercase text-slate-400">Outside</p>
                    <img src={visit.outsidePhoto} alt="Outside" className="w-full aspect-square object-cover rounded-lg border border-slate-100" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] font-black uppercase text-slate-400">Inside</p>
                    <img src={visit.insidePhoto} alt="Inside" className="w-full aspect-square object-cover rounded-lg border border-slate-100" />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <p className="text-[9px] font-medium text-slate-500 italic">Coordinates secured via native GPS verification.</p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default TrackingMap;
