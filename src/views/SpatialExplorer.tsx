import React, { useState, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { kml } from '@tmcw/togeojson';
import { Card, Badge, Button } from '../components/UI';
import { Search, Filter, Activity, Thermometer, Wind, Eye, Users, Crosshair, ArrowLeft, X, Upload, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import wardsData from '../data/wards-bangalore.json';
import { getWardStats } from '../data/urbanRegistry';

// Mock Data for Bangalore Localities (Expanded for GeoJSON coverage)
const NEIGHBORHOODS = [
  {
    name: 'Indiranagar',
    coords: [12.9784, 77.6408],
    intensity: 85,
    kpis: { walkability: 72, vibrancy: 95, shade: 40, safety: 82 },
    activityTrend: 'Increasing'
  },
  {
    name: 'Koramangala',
    coords: [12.9352, 77.6245],
    intensity: 88,
    kpis: { walkability: 65, vibrancy: 92, shade: 35, safety: 78 },
    activityTrend: 'Stable'
  },
  {
    name: 'Whitefield',
    coords: [12.9698, 77.7499],
    intensity: 60,
    kpis: { walkability: 35, vibrancy: 55, shade: 20, safety: 65 },
    activityTrend: 'Decreasing'
  },
  {
    name: 'Jayanagar',
    coords: [12.9308, 77.5838],
    intensity: 75,
    kpis: { walkability: 90, vibrancy: 80, shade: 85, safety: 94 },
    activityTrend: 'Increasing'
  },
  {
    name: 'Malleshwaram',
    coords: [12.9988, 77.5714],
    intensity: 78,
    kpis: { walkability: 82, vibrancy: 88, shade: 75, safety: 88 },
    activityTrend: 'Stable'
  },
  {
    name: 'Rajaji Nagar',
    coords: [12.9893, 77.5501],
    intensity: 72,
    kpis: { walkability: 78, vibrancy: 70, shade: 65, safety: 85 },
    activityTrend: 'Stable'
  },
  {
    name: 'Basaveshwara Nagar',
    coords: [12.9918, 77.5394],
    intensity: 81,
    kpis: { walkability: 75, vibrancy: 82, shade: 60, safety: 88 },
    activityTrend: 'Increasing'
  },
  {
    name: 'Nandini Layout',
    coords: [13.0105, 77.5276],
    intensity: 68,
    kpis: { walkability: 62, vibrancy: 65, shade: 45, safety: 72 },
    activityTrend: 'Stable'
  },
  {
    name: 'Sampangiram Nagar',
    coords: [12.9724, 77.5946],
    intensity: 92,
    kpis: { walkability: 88, vibrancy: 96, shade: 40, safety: 85 },
    activityTrend: 'Stable'
  },
  {
    name: 'Varthuru',
    coords: [12.9384, 77.6975],
    intensity: 55,
    kpis: { walkability: 45, vibrancy: 50, shade: 30, safety: 62 },
    activityTrend: 'Increasing'
  },
  {
    name: 'Domlur',
    coords: [12.9610, 77.6387],
    intensity: 74,
    kpis: { walkability: 68, vibrancy: 80, shade: 45, safety: 78 },
    activityTrend: 'Stable'
  },
  {
    name: 'Frazer Town',
    coords: [13.0000, 77.6162],
    intensity: 82,
    kpis: { walkability: 85, vibrancy: 90, shade: 55, safety: 72 },
    activityTrend: 'Increasing'
  },
  {
    name: 'Banashankari',
    coords: [12.9156, 77.5736],
    intensity: 65,
    kpis: { walkability: 60, vibrancy: 58, shade: 70, safety: 80 },
    activityTrend: 'Stable'
  },
  {
    name: 'HSR Layout',
    coords: [12.9121, 77.6446],
    intensity: 84,
    kpis: { walkability: 68, vibrancy: 85, shade: 45, safety: 88 },
    activityTrend: 'Increasing'
  },
  {
    name: 'Hebbal',
    coords: [13.0354, 77.5975],
    intensity: 55,
    kpis: { walkability: 30, vibrancy: 45, shade: 35, safety: 60 },
    activityTrend: 'Stable'
  },
  {
    name: 'Electronic City',
    coords: [12.8452, 77.6632],
    intensity: 50,
    kpis: { walkability: 25, vibrancy: 40, shade: 15, safety: 62 },
    activityTrend: 'Decreasing'
  },
  {
    name: 'Chickpete',
    coords: [12.9696, 77.5794],
    intensity: 94,
    kpis: { walkability: 70, vibrancy: 98, shade: 20, safety: 75 },
    activityTrend: 'Stable'
  },
  {
    name: 'Govindarajanagara',
    coords: [12.9642, 77.5255],
    intensity: 65,
    kpis: { walkability: 60, vibrancy: 65, shade: 55, safety: 72 },
    activityTrend: 'Increasing'
  },
  {
    name: 'Kempegowda Ward',
    coords: [13.0906, 77.5975],
    intensity: 55,
    kpis: { walkability: 45, vibrancy: 50, shade: 60, safety: 68 },
    activityTrend: 'Increasing'
  }
];

function MapController({ center }: { center: [number, number] | null }) {
  const map = useMap();
  React.useEffect(() => {
    if (center) {
      map.flyTo(center, 14, { duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

export default function SpatialExplorer({ onBack }: { onBack?: () => void }) {
  const [selectedArea, setSelectedArea] = useState<typeof NEIGHBORHOODS[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [uploadedGeoJSON, setUploadedGeoJSON] = useState<any>(null);
  const [remotewardsData, setRemoteWardsData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch Full Bangalore Wards GeoJSON (198 Wards) to resolve "messed up/missing" geometries
  React.useEffect(() => {
    const fetchWards = async () => {
      try {
        // High-quality boundaries from Open Bangalore initiative
        const response = await fetch('https://raw.githubusercontent.com/openbangalore/bangalore-ward-boundaries/master/bbmp-wards-2015.geojson');
        if (response.ok) {
          const data = await response.json();
          setRemoteWardsData(data);
          console.log("Full Ward Dataset Integrated: 198 Spatial Units Loaded.");
        } else {
          throw new Error("Remote data unavailable");
        }
      } catch (err) {
        console.warn("Falling back to internal low-res technical subset:", err);
        setRemoteWardsData(wardsData); // Fallback to local 10-ward set
      }
    };
    fetchWards();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, 'text/xml');
        const converted = kml(xmlDoc);
        setUploadedGeoJSON(converted);
        
        // Show success or feedback
        console.log("KML Converted:", converted);
        if (converted.features.length > 0) {
          setShowAnalysis(false); // Close sidebar on mobile to show map
        }
      } catch (err) {
        console.error("Error parsing KML:", err);
        alert("Failed to parse KML file. Please ensure it is a valid format.");
      }
    };
    reader.readAsText(file);
  };

  const filteredNeighborhoods = NEIGHBORHOODS.filter(area => 
    area.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const wardStats = selectedArea ? getWardStats(selectedArea.name) : null;

  return (
    <div className="flex-1 flex flex-col md:flex-row h-screen overflow-hidden relative">
      {onBack && (
        <button 
          onClick={onBack}
          className="fixed bottom-24 right-6 md:top-6 md:right-6 md:bottom-auto z-[1001] bg-slate-900 text-white p-3 civic-shadow hover:bg-red-600 transition-all group"
          title="Return to Main Interface"
        >
          <X size={24} className="group-hover:rotate-90 transition-transform" />
        </button>
      )}

      {/* Toggle Sidebar Button for Mobile */}
      <button 
        onClick={() => setShowAnalysis(!showAnalysis)}
        className="fixed bottom-24 left-6 md:hidden z-[1001] bg-civic-accent text-slate-900 p-4 border-2 border-slate-900 civic-shadow font-black uppercase text-[10px] tracking-widest flex items-center gap-2"
      >
        {showAnalysis ? <X size={20} /> : <Activity size={20} />}
        {showAnalysis ? 'Close Data' : 'View Stats'}
      </button>

      {/* Left Pane: Analysis Feed */}
      <div className={`
        fixed inset-0 md:relative z-[1000] md:z-10
        w-full md:w-[450px] bg-slate-50 border-r-4 border-slate-900 overflow-y-auto p-6 scrollbar-hide
        transition-transform duration-500 ease-in-out
        ${showAnalysis ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <header className="mb-8">
          {onBack && (
            <button 
              onClick={onBack}
              className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-mono text-[10px] uppercase font-black mb-4 transition-colors group"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              Return to Feed
            </button>
          )}
          <div className="mono-label text-base text-slate-500 mb-2">Platform / Spatial Intelligence</div>
          <h2 className="text-5xl font-black uppercase tracking-tighter leading-none mb-4">
            Urban <span className="text-slate-400 font-serif italic lowercase font-medium">Intensity</span>
          </h2>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search ward or locality..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-900 font-mono text-lg focus:outline-none focus:ring-0 civic-shadow"
            />
          </div>

          <div className="flex gap-2">
            <input 
              type="file" 
              accept=".kml" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileUpload}
            />
            <Button 
              variant="outline" 
              className="flex-1 gap-2 border-2 border-slate-900 bg-white"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={16} /> Import KML
            </Button>
            {uploadedGeoJSON && (
              <Button 
                variant="outline" 
                className="w-12 p-0 border-2 border-red-200 text-red-500 bg-white hover:bg-red-50 hover:border-red-500"
                onClick={() => setUploadedGeoJSON(null)}
                title="Clear Layer"
              >
                <Trash2 size={16} />
              </Button>
            )}
          </div>
        </header>

        {/* Global Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card className="p-4 bg-slate-900 text-white">
            <div className="mono-label opacity-60 text-sm text-white">Avg Street Quality</div>
            <div className="text-4xl font-black">68.4</div>
          </Card>
          <Card className="p-4 border-2 border-slate-900">
            <div className="mono-label text-sm">Daily Reports</div>
            <div className="text-4xl font-black">1.2K</div>
          </Card>
        </div>

        {/* Neighborhood List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b-2 border-slate-200 pb-2">
            <h3 className="mono-label text-base">Locality Performance</h3>
            <Filter className="w-5 h-5 text-slate-400" />
          </div>

          {filteredNeighborhoods.map((area) => (
            <motion.div 
              key={area.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ x: 4 }}
              onClick={() => setSelectedArea(area)}
              className={`p-4 border-2 border-slate-900 cursor-pointer transition-colors ${selectedArea?.name === area.name ? 'bg-slate-900 text-white' : 'bg-white hover:bg-slate-50'}`}
            >
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-black uppercase tracking-tight text-xl">{area.name}</h4>
                <Badge variant={area.intensity > 80 ? 'accent' : 'outline'} className={`text-xs ${selectedArea?.name === area.name ? 'bg-white text-slate-900 border-none' : ''}`}>
                  {area.intensity}% Intensity
                </Badge>
              </div>
              
              <div className="grid grid-cols-4 gap-2">
                <KPIMini label="🚶" value={area.kpis.walkability} />
                <KPIMini label="🌳" value={area.kpis.shade} />
                <KPIMini label="✨" value={area.kpis.vibrancy} />
                <KPIMini label="🛡️" value={area.kpis.safety} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Right Pane: Interactive Map */}
      <div className="flex-1 relative bg-slate-200">
        <MapContainer 
          center={[12.9716, 77.5946]} 
          zoom={12} 
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <MapController center={selectedArea?.coords as [number, number] | null} />
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />

          {/* Ward Boundaries Layer - Permanent Technical Integration */}
          {remotewardsData && (
            <GeoJSON 
              key={`wards-layer-${selectedArea?.name || 'none'}`}
              data={remotewardsData} 
              style={(feature) => {
                const name = feature?.properties.WARD_NAME || feature?.properties.ward_name;
                const isSelected = selectedArea?.name === name;
                return {
                  fillColor: isSelected ? '#facc15' : '#1e293b',
                  weight: isSelected ? 3 : 1,
                  opacity: 0.8,
                  color: isSelected ? '#000000' : '#475569',
                  fillOpacity: isSelected ? 0.4 : 0.05,
                  dashArray: isSelected ? '' : '5, 5'
                };
              }}
              onEachFeature={(feature, layer) => {
                const name = feature.properties.WARD_NAME || feature.properties.ward_name;
                const wardNo = feature.properties.WARD_NO || feature.properties.ward_no;

                layer.bindTooltip(`<div class="font-mono text-[10px] font-black uppercase">${name} <span class="opacity-50">#${wardNo}</span></div>`, { 
                  sticky: true,
                  className: 'civic-tooltip'
                });
                
                layer.on({
                  mouseover: (e) => {
                    const l = e.target;
                    if (selectedArea?.name !== name) {
                      l.setStyle({ fillOpacity: 0.2, weight: 2 });
                    }
                  },
                  mouseout: (e) => {
                    const l = e.target;
                    if (selectedArea?.name !== name) {
                      l.setStyle({ fillOpacity: 0.05, weight: 1 });
                    }
                  },
                  click: (e) => {
                    const l = e.target;
                    const map = l._map;
                    if (map) {
                      map.fitBounds(l.getBounds(), { padding: [20, 20] });
                    }
                    
                    const bounds = l.getBounds();
                    const center = bounds.getCenter();
                    
                    // Look for matching neighborhood data or create temporary one
                    const match = NEIGHBORHOODS.find(n => n.name.toLowerCase() === (name?.toLowerCase()));
                    if (match) {
                      setSelectedArea({
                        ...match,
                        coords: [center.lat, center.lng]
                      });
                    } else {
                      setSelectedArea({
                        name: name,
                        coords: [center.lat, center.lng], 
                        intensity: 65,
                        kpis: { walkability: 62, vibrancy: 58, shade: 45, safety: 72 },
                        activityTrend: 'Stable'
                      });
                    }
                    setShowAnalysis(true);
                  }
                });
              }}
            />
          )}

          {uploadedGeoJSON && (
            <GeoJSON 
              data={uploadedGeoJSON}
              style={{
                color: '#f97316',
                weight: 4,
                opacity: 0.8,
                fillColor: '#fdba74',
                fillOpacity: 0.3
              }}
              onEachFeature={(feature, layer) => {
                const name = feature.properties?.name || "Uploaded Intelligence Unit";
                layer.bindPopup(`<div class="font-mono p-2"><strong>${name}</strong><br/>Spatial Unit Detected</div>`);
              }}
            />
          )}

          {NEIGHBORHOODS.map((area) => (
            <CircleMarker
              key={area.name}
              center={area.coords as [number, number]}
              radius={area.intensity / 4}
              pathOptions={{
                fillColor: area.intensity > 80 ? '#f97316' : (area.intensity < 60 ? '#64748b' : '#0f172a'),
                fillOpacity: 0.6,
                color: selectedArea?.name === area.name ? '#facc15' : '#000',
                weight: selectedArea?.name === area.name ? 4 : 2
              }}
              eventHandlers={{
                click: () => setSelectedArea(area)
              }}
            >
              <Popup>
                <div className="font-mono text-base p-2">
                  <div className="font-black uppercase mb-2 border-b-2 border-slate-200 pb-2 text-lg">{area.name}</div>
                  <div className="flex justify-between gap-4"><span>Intensity:</span> <span className="font-black">{area.intensity}%</span></div>
                  <div className="flex justify-between gap-4"><span>Walkability:</span> <span className="font-black">{area.kpis.walkability}/100</span></div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>

        {/* Selected Area HUD Overlay */}
        {selectedArea && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-20 md:bottom-8 left-4 right-4 md:left-8 md:right-auto md:w-[600px] z-[900]"
          >
            <Card className="bg-white border-4 border-slate-900 p-4 md:p-6 civic-shadow overflow-hidden relative">
              <div className="absolute top-0 right-0 p-2 bg-slate-900 text-white mono-label text-[8px] md:text-sm uppercase">
                Detailed Intelligence / {selectedArea.name}
              </div>
              
              <div className="flex flex-col md:flex-row gap-4 md:gap-8 pt-6 md:pt-0">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">{selectedArea.name}</h3>
                    {wardStats && <Badge color="amber">Registry ID: {wardStats.wardNo}</Badge>}
                  </div>
                  
                  {wardStats ? (
                    <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="p-3 bg-slate-900 text-white civic-shadow-sm border border-white/10">
                        <p className="mono-label text-[8px] text-white/50 leading-none mb-1">Spatial Units</p>
                        <p className="text-xl font-mono font-black">{wardStats.totalStreets}</p>
                      </div>
                      <div className="p-3 bg-white border-2 border-slate-900 civic-shadow-sm">
                        <p className="mono-label text-[8px] text-slate-400 leading-none mb-1">Grid Length</p>
                        <p className="text-xl font-mono font-black">{wardStats.totalLengthKm}km</p>
                      </div>
                      <div className="p-3 bg-white border-2 border-slate-900 civic-shadow-sm">
                        <p className="mono-label text-[8px] text-slate-400 leading-none mb-1">Road Types</p>
                        <p className="text-lg font-mono font-black">{Object.keys(wardStats.distribution).length}</p>
                      </div>
                      <div className="p-3 bg-civic-accent border-2 border-slate-900 civic-shadow-sm">
                        <p className="mono-label text-[8px] text-slate-900/60 leading-none mb-1">Registry</p>
                        <p className="text-lg font-display font-bold">VERIFIED</p>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-6 p-4 bg-slate-50 border-2 border-dashed border-slate-300 rounded-sm">
                      <p className="mono-label text-[10px] text-slate-500 mb-1">Metadata Lookup Pending</p>
                      <p className="text-[10px] font-medium leading-relaxed">No infrastructure registry entries found for this spatial unit in the current session.</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-y-3 md:gap-y-4 gap-x-4 md:gap-x-8">
                    <DetailedKPI icon={<Users size={14} className="md:w-[18px] md:h-[18px]"/>} label="Vibrancy" value={selectedArea.kpis.vibrancy} />
                    <DetailedKPI icon={<Thermometer size={14} className="md:w-[18px] md:h-[18px]"/>} label="Shade Access" value={selectedArea.kpis.shade} />
                    <DetailedKPI icon={<Eye size={14} className="md:w-[18px] md:h-[18px]"/>} label="Active Edges" value={selectedArea.kpis.vibrancy} />
                    <DetailedKPI icon={<Activity size={14} className="md:w-[18px] md:h-[18px]"/>} label="Traffic Flux" value={64} />
                  </div>
                </div>

                <div className="w-full md:w-32 flex flex-row md:flex-col justify-between items-end md:items-stretch border-t-2 md:border-t-0 md:border-l-2 border-slate-100 pt-4 md:pt-0 md:pl-8">
                  <div>
                    <div className="mono-label text-[10px] md:text-sm mb-1">Urban Score</div>
                    <div className="text-3xl md:text-5xl font-black leading-none">{selectedArea.intensity}</div>
                  </div>
                  <Button size="sm" className="md:size-lg w-auto md:w-full mt-0 md:mt-4">Focus Area</Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Legend Overlay */}
        <div className="absolute top-4 right-4 bg-white border-2 border-slate-900 p-4 z-[1000] font-mono text-xs space-y-3 civic-shadow">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 opacity-60 rounded-full border border-black"></div>
            <span>High Intensity Pulse</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-slate-900 opacity-60 rounded-full border border-black"></div>
            <span>Urban Dead Zones</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function KPIMini({ label, value }: { label: string, value: number }) {
  return (
    <div className="text-center">
      <div className="text-2xl mb-1">{label}</div>
      <div className={`text-sm font-mono font-bold ${value < 40 ? 'text-red-500' : 'text-slate-400'}`}>
        {value}%
      </div>
    </div>
  );
}

function DetailedKPI({ icon, label, value }: { icon: React.ReactNode, label: string, value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 mono-label text-sm">
        {icon}
        <span>{label}</span>
      </div>
      <div className="h-2.5 bg-slate-100 border border-slate-200">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          className="h-full bg-slate-900"
        />
      </div>
      <div className="text-right text-sm font-mono font-bold">{value}%</div>
    </div>
  );
}
