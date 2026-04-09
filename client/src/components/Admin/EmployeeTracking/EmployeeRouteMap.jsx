import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  GoogleMap, 
  useJsApiLoader, 
  Polyline, 
  Marker, 
  InfoWindow 
} from '@react-google-maps/api';
import { 
  Camera, 
  Navigation, 
  Store, 
  Clock, 
  MapPin, 
  Navigation2,
  AlertCircle,
  Loader2
} from 'lucide-react';

const containerStyle = {
  width: '100%',
  height: '100%'
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: true,
  fullscreenControl: true,
  styles: [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }]
    }
  ]
};

const EmployeeRouteMap = ({ locations = [], checkIns = [], visits = [] }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  });

  const [map, setMap] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);

  // 1. Prepare coordinates for Polyline
  const routePath = useMemo(() => {
    return locations
      .filter(loc => loc.latitude && loc.longitude)
      .map(loc => ({ lat: loc.latitude, lng: loc.longitude }));
  }, [locations]);

  // 2. Prepare all markers for unification
  const allEvents = useMemo(() => {
    const list = [];
    
    // GPS Pulses (Lightweight)
    locations.forEach((loc, idx) => {
      list.push({
        id: `pulse-${idx}`,
        position: { lat: loc.latitude, lng: loc.longitude },
        type: 'pulse',
        time: loc.timestamp,
        data: loc
      });
    });

    // Biometric Check-ins
    checkIns.forEach((ci, idx) => {
      list.push({
        id: `ci-${idx}`,
        position: { lat: ci.latitude, lng: ci.longitude },
        type: 'checkin',
        time: ci.timestamp || ci.createdAt,
        data: ci
      });
    });

    // Modular Site Visits
    visits.forEach((v, idx) => {
      list.push({
        id: `visit-${idx}`,
        position: { lat: v.latitude, lng: v.longitude },
        type: 'visit',
        time: v.createdAt,
        data: v
      });
    });

    return list;
  }, [locations, checkIns, visits]);

  const onSelect = (marker) => setSelectedMarker(marker);

  const onLoad = useCallback(function callback(mapInstance) {
    if (allEvents.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      allEvents.forEach(marker => bounds.extend(marker.position));
      mapInstance.fitBounds(bounds);
    }
    setMap(mapInstance);
  }, [allEvents]);

  const onUnmount = useCallback(function callback(mapInstance) {
    setMap(null);
  }, []);

  // Update bounds when events change
  useEffect(() => {
    if (map && allEvents.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      allEvents.forEach(marker => bounds.extend(marker.position));
      map.fitBounds(bounds);
    }
  }, [map, allEvents]);

  if (!isLoaded) {
    return (
      <div className="w-full h-full rounded-[2.5rem] bg-slate-50 flex items-center justify-center border border-slate-100">
         <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Warming Up Google Maps Engine...</p>
         </div>
      </div>
    );
  }

  if (allEvents.length === 0) {
    return (
      <div className="w-full h-full rounded-[2.5rem] bg-slate-50 flex items-center justify-center border-2 border-dashed border-slate-200">
         <div className="text-center">
            <AlertCircle className="h-12 w-12 text-slate-200 mx-auto mb-4" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Geospatial Data to Visualize</p>
         </div>
      </div>
    );
  }

  const getMarkerIcon = (type) => {
    switch (type) {
      case 'visit':
        return {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: '#4f46e5',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          scale: 8,
        };
      case 'checkin':
        return {
          path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          fillColor: '#10b981',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          scale: 6,
        };
      default:
        return {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: '#6366f1',
          fillOpacity: 0.6,
          strokeColor: '#ffffff',
          strokeWeight: 1,
          scale: 4,
        };
    }
  };

  return (
    <div className="w-full h-full rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl relative">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={allEvents[0]?.position}
        zoom={13}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={mapOptions}
      >
        {/* The Route Trace */}
        <Polyline
          path={routePath}
          options={{
            strokeColor: '#6366f1',
            strokeOpacity: 0.8,
            strokeWeight: 4,
            icons: [{
              icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 4 },
              offset: '0',
              repeat: '20px'
            }]
          }}
        />

        {/* All Geospatial Records */}
        {allEvents.map((marker) => (
          <Marker
            key={marker.id}
            position={marker.position}
            onClick={() => onSelect(marker)}
            icon={getMarkerIcon(marker.type)}
          />
        ))}

        {/* Audit Evidence InfoWindow */}
        {selectedMarker && (
          <InfoWindow
            position={selectedMarker.position}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div className="p-2 min-w-[200px] space-y-3">
               <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <div className={`p-1.5 rounded-lg ${selectedMarker.type === 'visit' ? 'bg-indigo-600' : 'bg-slate-800'} text-white`}>
                     {selectedMarker.type === 'visit' ? <Store size={14} /> : <Navigation size={14} />}
                  </div>
                  <div>
                     <p className="text-[10px] font-black uppercase text-slate-800 leading-none">
                        {selectedMarker.type === 'visit' ? 'Verified visit' : 'GPS Pulse'}
                     </p>
                     <p className="text-[9px] font-bold text-slate-400 mt-0.5">
                        {new Date(selectedMarker.time).toLocaleTimeString()}
                     </p>
                  </div>
               </div>

               {selectedMarker.type !== 'pulse' && (selectedMarker.data.outsidePhoto || selectedMarker.data.insidePhoto) ? (
                 <div className="grid grid-cols-2 gap-2">
                    {selectedMarker.data.outsidePhoto && (
                      <div className="space-y-1">
                        <p className="text-[8px] font-black text-slate-400 uppercase">Outside</p>
                        <img src={selectedMarker.data.outsidePhoto} alt="Out" className="w-full aspect-square object-cover rounded-lg" />
                      </div>
                    )}
                    {selectedMarker.data.insidePhoto && (
                      <div className="space-y-1">
                        <p className="text-[8px] font-black text-slate-400 uppercase">Inside</p>
                        <img src={selectedMarker.data.insidePhoto} alt="In" className="w-full aspect-square object-cover rounded-lg" />
                      </div>
                    )}
                 </div>
               ) : (
                 <p className="text-[9px] font-bold text-slate-500 italic">No biometric evidence available for this point.</p>
               )}

               <div className="pt-1 flex items-center justify-between">
                  <p className="text-[8px] font-bold text-slate-300">Lat: {selectedMarker.position.lat.toFixed(4)}</p>
                  <p className="text-[8px] font-bold text-slate-300">Lng: {selectedMarker.position.lng.toFixed(4)}</p>
               </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-6 left-6 z-10 bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-100 shadow-xl space-y-3">
         <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-indigo-600 opacity-60"></div>
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Movement Pulse</span>
         </div>
         <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-[8px] font-black ring-2 ring-white">V</div>
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Site Verification</span>
         </div>
      </div>
    </div>
  );
};

export default EmployeeRouteMap;
