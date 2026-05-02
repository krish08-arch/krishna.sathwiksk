import React, { useState } from 'react';
import { 
  Camera, 
  Upload, 
  Info, 
  CheckCircle2, 
  Zap, 
  Search,
  Sparkles,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Eye,
  Activity,
  ArrowRight,
  ArrowLeft,
  X
} from 'lucide-react';
import { Button, Card, Badge } from '../components/UI';
import { analyzeStreetPhoto, reimagineStreet, StreetAnalysis } from '../services/aiService';
import { resizeImage } from '../lib/imageUtils';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { UserProfile } from '../services/authService';
import { handleFirestoreError } from '../lib/firebaseErrors';

function MetricBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <span className="text-xs font-black uppercase tracking-widest text-slate-400">{label}</span>
        <span className="font-mono font-bold text-base">{value}%</span>
      </div>
      <div className="h-3 bg-slate-100 border border-slate-200">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          className={`h-full bg-slate-900 ${value < 40 ? 'bg-red-500' : value < 70 ? 'bg-orange-500' : 'bg-slate-900'}`}
        />
      </div>
    </div>
  );
}

const WARDS = [
  'Indiranagar', 'Koramangala', 'Whitefield', 'Jayanagar', 'Malleshwaram', 
  'Rajajinagar', 'Frazer Town', 'Banashankari', 'HSR Layout', 'Hebbal', 
  'Sadashivanagar', 'Basavanagudi', 'Ulsoor', 'Electronic City'
];

export default function UrbanLabView({ user, onBack }: { user: UserProfile, onBack?: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<StreetAnalysis | null>(null);
  const [reimaginedUrl, setReimaginedUrl] = useState<string | null>(null);
  const [isReimagining, setIsReimagining] = useState(false);
  const [userVision, setUserVision] = useState('');
  const [selectedWard, setSelectedWard] = useState(WARDS[0]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setAnalysis(null);
      setReimaginedUrl(null);
    }
  };

  const startAnalysis = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    try {
      const compressedBase64 = await resizeImage(file, 1200, 1200, 0.7);
      const rawBase64 = compressedBase64.split(',')[1];
      
      const result = await analyzeStreetPhoto(rawBase64, 'image/jpeg');
      setAnalysis(result);
      
      try {
        await addDoc(collection(db, 'reports'), {
          userId: user.uid,
          imageUrl: compressedBase64,
          location: { latitude: 12.9716, longitude: 77.5946 },
          city: 'Bangalore',
          ward: selectedWard,
          status: 'analyzed',
          timestamp: serverTimestamp(),
          scores: result.scores,
          ...result
        });
      } catch (e: any) {
        handleFirestoreError(e, 'create', 'reports');
      }
      
    } catch (error) {
      console.error("Analysis failed", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const startReimagine = async () => {
    if (!preview) return;
    setIsReimagining(true);
    try {
      // Need the compressed base64
      const compressedBase64 = await resizeImage(file!, 1200, 1200, 0.7);
      const rawBase64 = compressedBase64.split(',')[1];
      const result = await reimagineStreet(rawBase64, 'image/jpeg', userVision);
      setReimaginedUrl(result);
    } catch (error) {
      console.error("Reimagine failed", error);
    } finally {
      setIsReimagining(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-white p-4 md:p-10 scrollbar-hide">
      <header className="mb-8 md:mb-12 border-b-4 border-slate-900 pb-6 md:pb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-6 relative">
        <div>
          {onBack && (
            <button 
              onClick={onBack}
              className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-mono text-[10px] uppercase font-black mb-4 transition-colors group"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              Return to Feed
            </button>
          )}
          <Badge color="orange" className="mb-2 uppercase text-[10px]">Beta Intelligence Lab</Badge>
          <h2 className="text-3xl md:text-5xl font-black font-display tracking-tighter uppercase leading-none">
            Urban <span className="text-civic-accent">AI Lab</span>
          </h2>
          <p className="text-sm md:text-base text-slate-500 mt-4 font-medium max-w-2xl">
            Upload any street photo to perform deep spatial analysis. Calculate betweenness, walkability, 
            and accessibility scores instantly, and use AI to reimagine the space.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start h-full">
        {/* Left Column: Upload & Input */}
        <div className="space-y-8 h-full">
          {!preview ? (
            <label className="block w-full border-4 border-dashed border-slate-200 hover:border-civic-accent transition-colors cursor-pointer group p-10 md:p-20 bg-slate-50">
              <input type="file" onChange={handleFileChange} className="hidden" accept="image/*" />
              <div className="flex flex-col items-center gap-6">
                <div className="h-16 w-16 md:h-20 md:w-20 bg-white border-2 border-slate-100 rounded-full flex items-center justify-center group-hover:bg-civic-accent group-hover:border-slate-900 transition-colors civic-shadow-sm">
                  <Upload className="h-6 w-6 md:h-8 md:w-8 text-slate-400 group-hover:text-white" />
                </div>
                <div className="text-center">
                  <p className="font-display font-black text-xl md:text-2xl uppercase tracking-tight">Drop Street Source</p>
                  <p className="mono-label text-[10px] text-slate-400 mt-2">Support: .JPG, .PNG / MAX 5MB</p>
                </div>
              </div>
            </label>
          ) : (
            <div className="space-y-6">
              <div className="aspect-[4/3] w-full border-4 border-slate-900 shadow-[8px_8px_0_0_rgba(15,23,42,1)] overflow-hidden relative">
                <img src={preview} className="h-full w-full object-cover" />
                <button 
                  onClick={() => { setFile(null); setPreview(null); setAnalysis(null); setReimaginedUrl(null); }}
                  className="absolute top-4 right-4 bg-white border-2 border-slate-900 p-2 hover:bg-red-50 transition-colors"
                  title="Clear Analysis"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="bg-slate-50 p-6 border-4 border-slate-900 civic-shadow">
                <div className="mono-label text-xs mb-4">Intel_Metadata</div>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block tracking-widest">Select Locality</label>
                    <select 
                      value={selectedWard}
                      onChange={(e) => setSelectedWard(e.target.value)}
                      className="w-full bg-white border-2 border-slate-900 p-3 font-bold text-sm focus:outline-none focus:ring-0"
                    >
                      {WARDS.map(w => <option key={w} value={w}>{w}</option>)}
                    </select>
                  </div>
                  
                  <Button 
                    variant="primary" 
                    className="w-full h-14 text-lg"
                    disabled={isAnalyzing}
                    onClick={startAnalysis}
                  >
                    {isAnalyzing ? (
                      <div className="flex items-center gap-3">
                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing Spatial Grid...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <Sparkles className="h-5 w-5" />
                        <span>Run Full Street Analysis</span>
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Dynamic Results */}
        <div className="h-full">
          <AnimatePresence mode="wait">
            {!analysis && !isAnalyzing && (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-10 border-4 border-dashed border-slate-100 rounded-2xl"
              >
                <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <Activity className="h-10 w-10 text-slate-200" />
                </div>
                <p className="font-display font-bold text-xl text-slate-300 uppercase tracking-tight">Intelligence Output Pending</p>
                <p className="mono-label text-slate-300 mt-2">Initialize analysis to view spatial metrics</p>
              </motion.div>
            )}

            {isAnalyzing && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-10 space-y-10"
              >
                {[1,2,3,4].map(i => (
                  <div key={i} className="space-y-4">
                    <div className="flex justify-between">
                      <div className="h-4 w-32 bg-slate-100 animate-pulse"></div>
                      <div className="h-4 w-10 bg-slate-100 animate-pulse"></div>
                    </div>
                    <div className="h-3 w-full bg-slate-50 border border-slate-100 animate-pulse"></div>
                  </div>
                ))}
              </motion.div>
            )}

            {analysis && (
              <motion.div 
                key="results"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-10"
              >
                {/* Score Grid */}
                <section>
                  <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
                     <h3 className="font-display font-black text-xl md:text-2xl uppercase tracking-tighter">Spatial Metrics</h3>
                     <Badge color="slate" className="font-mono text-[9px]">GEMINI_3_FLASH</Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 md:gap-y-8">
                    <MetricBar label="Walkability Index" value={analysis.scores.walkability} />
                    <MetricBar label="Betweenness Centrality" value={analysis.scores.betweenness} />
                    <MetricBar label="Safety Factor" value={analysis.scores.safety} />
                    <MetricBar label="Thermal Comfort" value={analysis.scores.comfort} />
                    <MetricBar label="Green Access" value={analysis.scores.greenAccess} />
                    <MetricBar label="Shaded Spaces" value={analysis.scores.shadedSpaces} />
                  </div>
                </section>

                {/* hidden insights */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card className="p-6 border-slate-900 border-2">
                    <div className="mono-label text-xs mb-4 text-green-600 flex items-center gap-2">
                      <Sparkles size={14} /> Hidden Insights
                    </div>
                    <ul className="text-sm font-medium space-y-3">
                      {analysis.hiddenInsights.map((insight, i) => (
                        <li key={i} className="flex gap-3">
                          <span className="text-slate-300 font-mono">0{i+1}</span>
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </Card>
                  
                  <Card className="p-6 border-slate-900 border-2 bg-slate-900 text-white min-h-[160px] flex flex-col justify-center">
                    <div className="mono-label text-[10px] mb-4 text-civic-accent flex items-center gap-2">
                      <Activity size={14} /> Total Score
                    </div>
                    <div className="text-5xl md:text-7xl font-black font-display tracking-tighter leading-none mb-4">
                      {analysis.overallScore}
                    </div>
                    <p className="text-[9px] font-mono opacity-50 uppercase tracking-widest leading-relaxed">
                      Aggregated spatial health rating.
                    </p>
                  </Card>
                </div>

                {/* Design Critique */}
                <div className="grid grid-cols-2 gap-8">
                  <div className="p-4 border-2 border-slate-900 space-y-3">
                    <div className="text-[10px] font-black uppercase text-green-600">Assets (+)</div>
                    {analysis.designCritique.pros.map((pro, i) => (
                      <div key={i} className="text-xs font-bold leading-tight border-l-2 border-green-500 pl-3 py-1">{pro}</div>
                    ))}
                  </div>
                  <div className="p-4 border-2 border-slate-900 space-y-3">
                    <div className="text-[10px] font-black uppercase text-red-600">Deficits (-)</div>
                    {analysis.designCritique.cons.map((con, i) => (
                      <div key={i} className="text-xs font-bold leading-tight border-l-2 border-red-500 pl-3 py-1">{con}</div>
                    ))}
                  </div>
                </div>

                {/* Reimagine Section */}
                <div className="pt-10 border-t-4 border-slate-900">
                  <h3 className="font-display font-black text-2xl uppercase mb-6 flex items-center gap-3">
                    <Eye className="h-6 w-6 text-civic-accent" /> Urban Designer Vision
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-8">
                    {!reimaginedUrl ? (
                      <div className="bg-slate-50 p-6 border-4 border-slate-900 civic-shadow space-y-4">
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Custom Enhancement Prompt (Optional)</label>
                          <textarea 
                            value={userVision}
                            onChange={(e) => setUserVision(e.target.value)}
                            placeholder="e.g. Add wide cobblestone sidewalks, more oak trees, and outdoor cafe seating..."
                            className="w-full bg-white border-2 border-slate-900 p-4 font-bold text-sm focus:outline-none h-32 resize-none"
                          />
                        </div>
                        <Button 
                          variant="accent" 
                          className="w-full h-14"
                          disabled={isReimagining}
                          onClick={startReimagine}
                        >
                          {isReimagining ? (
                            <div className="flex items-center gap-3">
                              <div className="h-5 w-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                              <span>Rendering Spatial Vision...</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <Zap className="h-5 w-5" />
                              <span>Reimagine This Street</span>
                            </div>
                          )}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="aspect-[16/9] w-full border-4 border-slate-900 shadow-[8px_8px_0_0_rgba(245,158,11,1)] overflow-hidden relative group">
                          <img src={reimaginedUrl} className="h-full w-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-white font-display font-black text-2xl uppercase tracking-tighter">AI Design Render</p>
                            <p className="text-white/60 font-mono text-[10px] mt-2 tracking-widest">GEMINI_3.1_FLASH_VISION</p>
                          </div>
                        </div>
                        <div className="flex gap-4">
                           <Button variant="outline" className="flex-1 bg-white" onClick={() => setReimaginedUrl(null)}>Try Another Prompt</Button>
                           <Button variant="primary" className="flex-1">Export PDF Report</Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="h-20" /> {/* Spacer */}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
