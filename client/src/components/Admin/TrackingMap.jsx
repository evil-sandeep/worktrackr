import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  GoogleMap, 
  useJsApiLoader, 
  Polyline, 
  Marker, 
  InfoWindow 
} from '@react-google-maps/api';
import { 
  Store, 
  MapPin, 
  Navigation,
  Loader2,
  AlertCircle
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

const TrackingMap = ({ locations = [], visits = [] }) => {
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

  // 2. Prepare all markers
  const allEvents = useMemo(() => {
    const list = [];
    
    // GPS Pulses
    locations.forEach((loc, idx) => {
      list.push({
        id: `pulse-${idx}`,
        position: { lat: loc.latitude, lng: loc.longitude },
        type: 'pulse',
        time: loc.timestamp,
        data: loc
      });
    });

    // Site Visits
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
  }, [locations, visits]);

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
      <div className="h-[600px] w-full rounded-[2.5rem] bg-slate-50 flex items-center justify-center border border-slate-100">
         <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Initialization...</p>
         </div>
      </div>
    );
  }

  if (allEvents.length === 0) {
    return (
      <div className="h-[500px] w-full bg-slate-50 rounded-[2.5rem] flex flex-col items-center justify-center border-2 border-dashed border-slate-200">
        <MapPin className="h-10 w-10 text-slate-300 mb-4" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No location data to visualize</p>
      </div>
    );
  }

  const getMarkerIcon = (type) => {
    return {
      path: window.google.maps.SymbolPath.CIRCLE,
      fillColor: type === 'visit' ? '#4f46e5' : '#94a3b8',
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 2,
      scale: type === 'visit' ? 8 : 4,
    };
  };

  return (
    <div className="h-[600px] w-full rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl relative">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={allEvents[0]?.position}
        zoom={13}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={mapOptions}
      >
        <Polyline
          path={routePath}
          options={{
            strokeColor: '#6366f1',
            strokeOpacity: 0.6,
            strokeWeight: 4,
            icons: [{
              icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 4 },
              offset: '0',
              repeat: '20px'
            }]
          }}
        />

        {allEvents.map((marker) => (
          <Marker
            key={marker.id}
            position={marker.position}
            onClick={() => onSelect(marker)}
            icon={getMarkerIcon(marker.type)}
          />
        ))}

        {selectedMarker && (
          <InfoWindow
            position={selectedMarker.position}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div className="p-2 min-w-[200px] space-y-3">
               <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <div className={`p-1.5 rounded-lg ${selectedMarker.type === 'visit' ? 'bg-indigo-600' : 'bg-slate-400'} text-white`}>
                     {selectedMarker.type === 'visit' ? <Store size={14} /> : <Navigation size={14} />}
                  </div>
                  <div>
                     <p className="text-[10px] font-black uppercase text-slate-800 leading-none">
                        {selectedMarker.type === 'visit' ? 'Verified visit' : 'GPS Pulse'}
                     </p>
                     <p className="text-xs font-bold text-slate-800 mt-1">
                        {new Date(selectedMarker.time).toLocaleTimeString()}
                     </p>
                  </div>
               </div>

               {selectedMarker.type === 'visit' && (
                 <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <p className="text-[8px] font-black text-slate-400 uppercase">Outside</p>
                      <img src={selectedMarker.data.outsidePhoto} alt="Out" className="w-full aspect-square object-cover rounded-lg" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[8px] font-black text-slate-400 uppercase">Inside</p>
                      <img src={selectedMarker.data.insidePhoto} alt="In" className="w-full aspect-square object-cover rounded-lg" />
                    </div>
                 </div>
               )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};

export default TrackingMap;
