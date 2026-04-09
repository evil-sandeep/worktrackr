import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Camera, Clock, MapPin, Navigation } from 'lucide-react';

// Fix for default Leaflet marker icons in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom pulsing icon for Check-ins
const createCheckInIcon = () => L.divIcon({
  className: 'custom-checkin-icon',
  html: `<div class="w-8 h-8 bg-blue-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center animate-pulse">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
         </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

// Component to auto-fit map bounds
const ChangeView = ({ bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, map]);
  return null;
};

const EmployeeRouteMap = ({ locations = [], checkIns = [], visits = [] }) => {
  // 1. Prepare coordinates for Polyline
  const routePath = useMemo(() => {
    return locations.map(loc => [loc.latitude, loc.longitude]);
  }, [locations]);

  // 2. Prepare bounds to include all points
  const bounds = useMemo(() => {
    const allCoords = [
      ...locations.map(l => [l.latitude, l.longitude]),
      ...checkIns.map(c => [c.latitude, c.longitude]),
      ...visits.map(v => [v.latitude, v.longitude])
    ];
    return allCoords.length > 0 ? allCoords : [[20.5937, 78.9629]]; // Default center (India)
  }, [locations, checkIns, visits]);

  return (
    <div className="w-full h-full rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-inner bg-slate-50 relative">
      <MapContainer 
        center={bounds[0]} 
        zoom={13} 
        style={{ height: '100%', width: '100%', zIndex: 1 }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <ChangeView bounds={bounds} />

        {/* Draw Route Path */}
        <Polyline 
          positions={routePath} 
          pathOptions={{ 
            color: '#3b82f6', 
            weight: 4, 
            opacity: 0.6,
            dashArray: '10, 10' 
          }} 
        />

        {/* Standard Pulse Locations */}
        {locations.map((loc, idx) => (
          <Marker 
            key={`loc-${idx}`} 
            position={[loc.latitude, loc.longitude]}
          >
            <Popup className="custom-popup">
              <div className="p-2 space-y-1">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1.5">
                  <Navigation className="h-3 w-3" /> Hourly Pulse
                </p>
                <p className="text-sm font-black text-slate-900">{new Date(loc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                <p className="text-[10px] text-slate-400 font-bold">GPS: {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Verification Check-Ins (Legacy/Biometric) */}
        {checkIns.map((ci, idx) => (
          <Marker 
            key={`ci-${idx}`} 
            position={[ci.latitude, ci.longitude]}
            icon={createCheckInIcon()}
          >
            <Popup minWidth={240} className="verification-popup">
              <div className="p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1.5">
                      <Camera className="h-3 w-3" /> Hardware Verified
                    </p>
                    <p className="text-xs font-black text-slate-900">{ci.locationName}</p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">{new Date(ci.timestamp || ci.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest text-center">Outside</p>
                    <div className="aspect-square rounded-lg overflow-hidden bg-slate-100">
                      <img src={ci.outsidePhoto} alt="Out" className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest text-center">Inside</p>
                    <div className="aspect-square rounded-lg overflow-hidden bg-slate-100">
                      <img src={ci.insidePhoto} alt="In" className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Modular Site Visits */}
        {visits.map((visit, idx) => (
          <Marker 
            key={`visit-${idx}`} 
            position={[visit.latitude, visit.longitude]}
            icon={createCheckInIcon()}
          >
            <Popup minWidth={240} className="verification-popup">
              <div className="p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1.5">
                      <Store className="h-3 w-3" /> Site Verification
                    </p>
                    <p className="text-xs font-black text-slate-900">Audit Proof Uploaded</p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">{new Date(visit.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest text-center">Outside</p>
                    <div className="aspect-square rounded-lg overflow-hidden bg-slate-100">
                      <img src={visit.outsidePhoto} alt="Out" className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest text-center">Inside</p>
                    <div className="aspect-square rounded-lg overflow-hidden bg-slate-100">
                      <img src={visit.insidePhoto} alt="In" className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-6 left-6 z-[1000] bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-100 shadow-xl space-y-3">
         <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-blue-600"></div>
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Pulse Log</span>
         </div>
         <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow-sm animate-pulse"></div>
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Shop Visit / Verification</span>
         </div>
         <div className="flex items-center gap-3">
            <div className="w-6 h-0.5 bg-blue-400 border-t border-dashed"></div>
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Calculated Route</span>
         </div>
      </div>
    </div>
  );
};

export default EmployeeRouteMap;
