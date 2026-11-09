import React, { useEffect, useState, useRef } from 'react';
import { MapPin, Loader, Info, HelpCircle } from 'lucide-react';

interface PlanMapProps {
  address: string;
  mode?: 'view' | 'select';
  onChangeLocation?: (newAddress: string, lat: number, lng: number) => void;
  heightClass?: string;
}

export default function PlanMap({ 
  address, 
  mode = 'view', 
  onChangeLocation, 
  heightClass = 'h-64' 
}: PlanMapProps) {
  const [isLeafletLoaded, setIsLeafletLoaded] = useState(typeof window !== 'undefined' && 'L' in window);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState('');
  
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const lastGeocodedAddressRef = useRef<string>('');

  // Dynamically load Leaflet CDN assets (no cost, no cards, 100% free)
  useEffect(() => {
    if (isLeafletLoaded) return;

    // Load CSS
    const cssId = 'leaflet-css-cdn';
    if (!document.getElementById(cssId)) {
      const link = document.createElement('link');
      link.id = cssId;
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Load JS
    const jsId = 'leaflet-js-cdn';
    let script = document.getElementById(jsId) as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.id = jsId;
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      document.body.appendChild(script);
    }

    const handleLoad = () => {
      setIsLeafletLoaded(true);
    };

    script.addEventListener('load', handleLoad);
    return () => {
      script.removeEventListener('load', handleLoad);
    };
  }, [isLeafletLoaded]);

  // Helper function to update marker position visually
  const updateMarker = (lat: number, lng: number, shouldPan = true) => {
    const L = (window as any).L;
    if (!L || !mapRef.current) return;

    const position = [lat, lng] as [number, number];

    // Elegant bright RED pointer marker with concentric pulse animation (designed for max contrast)
    const customIcon = L.divIcon({
      html: `<div class="relative flex items-center justify-center">
               <div class="absolute w-8 h-8 rounded-full bg-red-500/30 animate-ping"></div>
               <div class="relative w-7 h-7 rounded-full bg-red-600 border-2 border-white flex items-center justify-center shadow-lg">
                 <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
               </div>
             </div>`,
      className: 'custom-leaflet-marker',
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    if (markerRef.current) {
      markerRef.current.setLatLng(position);
    } else {
      markerRef.current = L.marker(position, { icon: customIcon }).addTo(mapRef.current);
    }

    if (shouldPan) {
      mapRef.current.setView(position, 15);
    }
  };

  // Helper to geocode a text address dynamically using OpenStreetMap Nominatim with extensive fallbacks
  const geocodeAddress = async (addr: string) => {
    if (!addr || addr.trim() === '' || !mapRef.current || !isLeafletLoaded) return;
    if (lastGeocodedAddressRef.current === addr) return;

    const L = (window as any).L;
    if (!L) return;

    setLoading(true);
    setErrorText('');

    // Normalize input to split by common separators used in layouts
    const normalized = addr
      .replace(/→/g, ',')
      .replace(/->/g, ',')
      .replace(/\//g, ',')
      .replace(/—/g, ',')
      .replace(/-+/g, ',')
      .replace(/límite/gi, ',')
      .replace(/limite/gi, ',');

    const rawParts = normalized
      .split(',')
      .map(p => p.trim())
      .filter(p => p.length >= 3); // Substantial query terms only

    const queriesToTry: string[] = [];

    if (rawParts.length > 0) {
      // 1. Try first landmark combined with second landmark (e.g., "Parque del Amor, Miraflores, Peru")
      if (rawParts.length >= 2) {
        queriesToTry.push(`${rawParts[0]}, ${rawParts[1]}, Peru`);
        queriesToTry.push(`${rawParts[0]}, ${rawParts[1]}`);
      }
      
      // 2. Try first landmark with "Lima, Peru"
      if (!rawParts[0].toLowerCase().includes('lima') && !rawParts[0].toLowerCase().includes('peru')) {
        queriesToTry.push(`${rawParts[0]}, Lima, Peru`);
      }
      queriesToTry.push(`${rawParts[0]}, Peru`);
      queriesToTry.push(rawParts[0]);

      // 3. Try other parts separately as fallback landmarks
      for (let i = 1; i < rawParts.length; i++) {
        if (!rawParts[i].toLowerCase().includes('peru') && !rawParts[i].toLowerCase().includes('lima')) {
          queriesToTry.push(`${rawParts[i]}, Lima, Peru`);
          queriesToTry.push(`${rawParts[i]}, Peru`);
        }
      }
    }

    // 4. Default strategy: whole address with country
    let rawWithCountry = addr;
    if (!addr.toLowerCase().includes('peru') && !addr.toLowerCase().includes('pe')) {
      rawWithCountry += ', Peru';
    }
    queriesToTry.push(rawWithCountry);
    queriesToTry.push(addr);

    // Filter out duplicates to be polite with API calls
    const uniqueQueries = Array.from(new Set(queriesToTry));

    let found = false;

    for (const q of uniqueQueries) {
      if (found) break;
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1&accept-language=es`, {
          headers: {
            'User-Agent': 'ReactPlanMapApplet/1.0'
          }
        });
        const data = await res.json();
        
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          updateMarker(lat, lon);
          lastGeocodedAddressRef.current = addr;
          found = true;
          break;
        }
      } catch (err) {
        console.error(`Geocoding failed for subset query "${q}":`, err);
      }
    }

    setLoading(false);
  };

  // Initialize Map canvas once Leaflet assets are fully ready
  useEffect(() => {
    if (!isLeafletLoaded || !containerRef.current || mapRef.current) return;

    const L = (window as any).L;
    if (!L) return;

    // Center on Campo de Marte, Lima as standard elegant default
    const defaultCoords = [-12.0694, -77.0428] as [number, number];

    const mapInstance = L.map(containerRef.current, {
      center: defaultCoords,
      zoom: 14,
      zoomControl: true,
      scrollWheelZoom: true
    });

    // Beautiful slate-colored or clean standard OSM tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapInstance);

    mapRef.current = mapInstance;

    // Handle user clicks in Selection/Create mode to drop a pin
    if (mode === 'select' && onChangeLocation) {
      mapInstance.on('click', async (e: any) => {
        const { lat, lng } = e.latlng;
        
        // Pin place directly on map
        updateMarker(lat, lng, false);

        setLoading(true);
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
            headers: {
              'Accept-Language': 'es',
              'User-Agent': 'ReactPlanMapApplet/1.0'
            }
          });
          const data = await res.json();
          if (data && data.display_name) {
            let friendlyAddr = data.display_name;
            // Shorten address to keep details readable and compact
            const parts = friendlyAddr.split(', ');
            if (parts.length > 4) {
              friendlyAddr = parts.slice(0, 3).join(', ') + ', LIMA';
            }
            lastGeocodedAddressRef.current = friendlyAddr;
            onChangeLocation(friendlyAddr, lat, lng);
          }
        } catch (err) {
          console.error('Nominatim Reverse Geocoding error:', err);
        } finally {
          setLoading(false);
        }
      });
    }

    // Geocode default input if present on mount
    if (address) {
      geocodeAddress(address);
    }

    // Fix map container sizing misalignment (Leaflet bug on loading state)
    setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 400);

    return () => {
      if (mapRef.current) {
        mapRef.current.off();
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [isLeafletLoaded, mode]);

  // Debounced geocoding effect to handle changing input values smoothly
  useEffect(() => {
    if (!address || address.trim() === '' || !isLeafletLoaded) return;

    // Direct immediate load on view mode, debounced ONLY in selection keyboard input
    const delay = mode === 'view' ? 10 : 1200;

    const timer = setTimeout(() => {
      geocodeAddress(address);
    }, delay);

    return () => clearTimeout(timer);
  }, [address, isLeafletLoaded, mode]);

  return (
    <div className={`relative w-full ${heightClass} bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-sm transition-all duration-300`}>
      {!isLeafletLoaded && (
        <div className="absolute inset-0 bg-white flex flex-col items-center justify-center p-4">
          <Loader className="w-7 h-7 text-violet-700 animate-spin mb-2" />
          <span className="text-xs font-semibold text-slate-600 animate-pulse">Cargando mapa interactivo libre...</span>
        </div>
      )}

      {loading && isLeafletLoaded && (
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-slate-200 text-[10px] text-slate-700 font-bold z-[1000] flex items-center gap-1.5 shadow-sm">
          <Loader className="w-3 h-3 text-red-600 animate-spin" />
          <span>Buscando ubicación...</span>
        </div>
      )}

      {/* Actual Map Target Canvas container */}
      <div ref={containerRef} className="w-full h-full z-0" />

      {/* Helpful informative badge regarding OpenStreetMap */}
      <div className="absolute bottom-2 left-2 right-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/80 text-[10px] text-slate-600 font-medium z-[1000] flex items-center justify-between shadow-md select-none">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
          <span>
            {mode === 'select'
              ? 'Haz clic sobre el mapa para colocar el marcador de tu plan.'
              : `Ubicación: ${address || 'No definida'}`}
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-1 text-emerald-600 font-semibold ml-2">
          <span>●</span>
          <span>Gratis 0 S/</span>
        </div>
      </div>
    </div>
  );
}
