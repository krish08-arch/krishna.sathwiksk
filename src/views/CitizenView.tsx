import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  doc,
  getDoc,
  deleteDoc
} from 'firebase/firestore';
import { Camera, MapPin, Search, Filter, Plus, Info, CheckCircle2, Clock, AlertTriangle, ShieldCheck, X, ChevronRight, Eye, Activity, Trash2 } from 'lucide-react';
import { db } from '../lib/firebase';
import { UserProfile } from '../services/authService';
import { Button, Card, Badge } from '../components/UI';
import { analyzeStreetPhoto, reimagineStreet, StreetAnalysis } from '../services/aiService';
import { motion, AnimatePresence } from 'motion/react';
import { resizeImage } from '../lib/imageUtils';
import { handleFirestoreError } from '../lib/firebaseErrors';

interface Report extends StreetAnalysis {
  id: string;
  imageUrl: string;
  city: string;
  ward: string;
  status: string;
  timestamp: any;
  userId: string;
  location: { latitude: number, longitude: number };
}

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

export default function CitizenView({ user }: { user: UserProfile }) {
  const [reports, setReports] = useState<Report[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isReimagining, setIsReimagining] = useState(false);
  const [reimaginedImageUrl, setReimaginedImageUrl] = useState<string | null>(null);
  const [selectedWard, setSelectedWard] = useState('Central');
  const [userVisionPrompt, setUserVisionPrompt] = useState('');

  useEffect(() => {
    const q = query(
      collection(db, 'reports'), 
      orderBy('timestamp', 'desc'),
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const raw = doc.data();
        // Handle legacy/typo data where scores were saved as categoryScores
        return { 
          id: doc.id, 
          ...raw,
          scores: raw.scores || raw.categoryScores || {}
        } as Report;
      });
      setReports(data);
    });

    return () => unsubscribe();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) return;
    setIsAnalyzing(true);

    try {
      // Compress image before upload to avoid Firestore size limits
      const compressedBase64 = await resizeImage(uploadFile, 1200, 1200, 0.7);
      const rawBase64 = compressedBase64.split(',')[1];
      
      const location = { latitude: 12.9716, longitude: 77.5946 };
      const { scores, ...analysisRest } = await analyzeStreetPhoto(rawBase64, 'image/jpeg');
      
      try {
        await addDoc(collection(db, 'reports'), {
          userId: user.uid,
          imageUrl: compressedBase64,
          location,
          city: 'Bangalore',
          ward: selectedWard,
          status: 'reported',
          timestamp: serverTimestamp(),
          scores: scores,
          ...analysisRest
        });
      } catch (e: any) {
        handleFirestoreError(e, 'create', 'reports');
      }

      setIsAnalyzing(false);
      setShowUpload(false);
      setUploadFile(null);
      setPreviewUrl(null);
    } catch (error) {
      console.error("Upload failed", error);
      setIsAnalyzing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("CAUTION: Permanent data purge. Proceed with removal of this intelligence unit?")) return;
    try {
      await deleteDoc(doc(db, 'reports', id));
      if (selectedReport?.id === id) {
        setSelectedReport(null);
      }
    } catch (e: any) {
      handleFirestoreError(e, 'delete', `reports/${id}`);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-10 scrollbar-hide">
      <header className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-6 md:pb-8 border-b-4 border-slate-900">
        <div>
          <p className="mono-label mb-2 text-[10px] md:text-sm">Live Registry</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tighter text-slate-900 leading-none">
            NEIGHBORHOOD <span className="text-civic-accent">FEED</span>
          </h2>
          <div className="flex flex-wrap items-center gap-2 mt-3 md:mt-2">
            <Badge color="slate">Bangalore</Badge>
            <Badge color="slate">Mysore</Badge>
            <span className="text-[10px] md:text-sm font-bold text-slate-400 ml-0 md:ml-2">DATA REFRESH: JUST NOW</span>
          </div>
        </div>
        <div className="flex gap-4">
          <Button variant="accent" onClick={() => setShowUpload(true)} className="gap-3 w-full md:w-auto h-12 md:h-auto">
            <Plus className="h-5 w-5" /> Sub-Registry Upload
          </Button>
        </div>
      </header>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-8 mb-12">
        <div className="bg-civic-dark p-6 border-4 border-slate-900 civic-shadow text-white">
          <p className="mono-label text-civic-accent mb-2 text-[10px]">Ward Quality Index</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl md:text-5xl font-black font-display tracking-tighter text-civic-accent">64</span>
            <span className="text-sm md:text-lg font-mono opacity-50">/100</span>
          </div>
          <p className="text-[10px] mt-4 font-bold opacity-60 flex items-center gap-2">
            <AlertTriangle className="h-3 w-3" /> AGGREGATE CONDITION: FAIR
          </p>
        </div>
        <div className="bg-white p-6 border-4 border-slate-900 civic-shadow">
          <p className="mono-label text-slate-400 mb-2 text-[10px]">Resolved Units</p>
          <div className="flex items-baseline justify-between">
            <span className="text-4xl md:text-5xl font-black font-display tracking-tighter">12</span>
            <span className="text-xs md:text-sm text-green-600 font-black">+20%</span>
          </div>
          <div className="mt-4 h-1 w-full bg-slate-100 bg-gradient-to-r from-green-500 to-transparent rounded-full overflow-hidden">
            <div className="w-[60%] h-full bg-green-500" />
          </div>
        </div>
        <div className="bg-white p-6 border-4 border-slate-900 civic-shadow">
          <p className="mono-label text-slate-400 mb-2 text-[10px]">Community Trust</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl md:text-5xl font-black font-display tracking-tighter">8.4</span>
            <span className="text-sm md:text-lg font-mono opacity-50">K</span>
          </div>
          <p className="text-[10px] mt-4 font-bold text-civic-accent">VERIFIED DATA CONTRIBUTORS</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-8">
        <h3 className="font-display font-black text-2xl tracking-tight uppercase">Recent Intelligence</h3>
        <Button variant="ghost" size="sm" className="gap-2">
          <Filter className="h-4 w-4" /> Data Sorting
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-32">
        {reports.map((report, idx) => (
          <motion.div 
            key={report.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="h-full group" title={`${report.id.substring(0, 8)} // REG_UNIT`}>
              <div className="relative aspect-[4/3] overflow-hidden border-b-2 border-slate-900">
                <img 
                  src={report.imageUrl} 
                  alt={report.issueCategory} 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4">
                  <div className={`px-2 py-1 text-xs font-black uppercase text-white ${report.severity === 'high' ? 'bg-red-600' : 'bg-slate-900'}`}>
                    {report.severity} SEVERITY
                  </div>
                </div>
                <div className="absolute bottom-4 right-4 bg-white border-2 border-slate-900 px-3 py-1 font-mono font-bold text-lg civic-shadow">
                  {report.overallScore}
                </div>
              </div>
                <div className="flex border-t-2 border-slate-900 overflow-hidden">
                  <div className="flex-1 bg-slate-900 text-[11px] text-white p-3 text-center uppercase font-black tracking-widest border-r-2 border-slate-900/10">
                    {report.city}
                  </div>
                  <div className="flex-1 bg-civic-accent text-[11px] text-slate-900 p-3 text-center uppercase font-black tracking-widest border-r-2 border-slate-900/10">
                    {report.ward}
                  </div>
                  <div className="flex-1 bg-white text-[11px] text-slate-900 p-3 text-center uppercase font-black tracking-widest truncate">
                    LOC: {report.location.latitude.toFixed(3)}, {report.location.longitude.toFixed(3)}
                  </div>
                </div>
                <div className="p-6">
                <h4 className="font-display font-black text-xl mb-3 leading-none uppercase tracking-tight">{report.issueCategory}</h4>
                <p className="text-sm font-medium text-slate-500 line-clamp-2 mb-6 leading-relaxed">
                  {report.summary}
                </p>
                <div className="flex items-center justify-between pt-4 border-t-2 border-slate-900 border-dashed">
                  <div className="flex items-center gap-2">
                    {report.status === 'resolved' ? (
                      <Badge color="green">RESOLVED</Badge>
                    ) : (
                      <Badge color="orange">ACTION_PENDING</Badge>
                    )}
                  </div>
                    <div className="flex items-center gap-4">
                      {(user.uid === report.userId || user.role === 'admin' || user.role === 'official') && (
                        <Button 
                          variant="ghost"
                          className="h-10 w-10 p-0 text-red-500 hover:bg-red-50 hover:text-red-700 border-2 border-transparent hover:border-red-200" 
                          onClick={(e: any) => {
                            e.stopPropagation();
                            handleDelete(report.id);
                          }}
                          title="Purge Intelligence Unit"
                        >
                          <Trash2 size={20} />
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-10 w-10 border-2 border-slate-900 bg-white" 
                        onClick={() => setSelectedReport(report)}
                      >
                         <ChevronRight className="h-6 w-6" />
                      </Button>
                    </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Detailed Intelligence Modal (Selected Report) */}
      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 md:p-10 bg-civic-dark/95 backdrop-blur-xl overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border-4 md:border-8 border-slate-900 w-full max-w-6xl civic-shadow min-h-[90vh] md:min-h-[90vh] max-h-[95vh] flex flex-col md:flex-row relative overflow-hidden"
            >
              {/* Standard Close Icon - High Prominence */}
              <button 
                onClick={() => { setSelectedReport(null); setReimaginedImageUrl(null); }}
                className="absolute top-4 right-4 md:top-6 md:right-6 z-[120] flex items-center justify-center h-10 w-10 md:h-12 md:w-12 bg-slate-900 text-white hover:bg-red-600 transition-all group civic-shadow-sm select-none"
                title="Close Analysis"
              >
                <X size={24} className="group-hover:rotate-90 transition-transform" />
              </button>

              {/* Delete Button - Only for Author or Admin/Official */}
              {(user.uid === selectedReport.userId || user.role === 'admin' || user.role === 'official') && (
                <button 
                  onClick={() => handleDelete(selectedReport.id)}
                  className="absolute top-6 left-6 z-[120] flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-mono text-[10px] uppercase font-black hover:bg-slate-900 transition-all group civic-shadow-sm border-2 border-slate-900"
                >
                  <Trash2 size={16} className="group-hover:scale-110 transition-transform" />
                  Purge Unit
                </button>
              )}

              {/* Visualization Column */}
              <div className="w-full md:w-1/2 border-r-4 border-slate-900 bg-slate-100 relative group overflow-hidden">
                <div className="absolute top-0 left-0 p-4 z-10 bg-slate-900 text-white mono-label text-xs">
                  {reimaginedImageUrl ? "Generative Vision / Augmented" : "Source Evidence / Raw"}
                </div>
                
                <img 
                  src={reimaginedImageUrl || selectedReport.imageUrl} 
                  className="w-full h-full object-cover transition-all duration-700" 
                  referrerPolicy="no-referrer"
                />

                {reimaginedImageUrl && (
                  <button 
                    onClick={() => setReimaginedImageUrl(null)}
                    className="absolute bottom-4 left-4 z-10 bg-white border-2 border-slate-900 px-3 py-1 font-mono text-[10px] uppercase font-black hover:bg-slate-900 hover:text-white transition-colors"
                  >
                    View Original Source
                  </button>
                )}

                 {!reimaginedImageUrl && (
                    <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent flex flex-col items-center">
                      <div className="w-full max-w-sm mb-6 space-y-2">
                        <label className="mono-label text-white/60 text-xs">What does this street need?</label>
                        <textarea 
                          value={userVisionPrompt}
                          onChange={(e) => setUserVisionPrompt(e.target.value)}
                          placeholder="e.g. 'Add a cycle track and more flowering trees'"
                          className="w-full p-4 bg-white/10 border-2 border-white/20 text-sm text-white font-mono placeholder:opacity-30 focus:outline-none focus:border-civic-accent h-24 resize-none"
                        />
                      </div>
                      <Button 
                        variant="accent" 
                        onClick={async () => {
                          setIsReimagining(true);
                          try {
                            const base64 = selectedReport.imageUrl.split(',')[1];
                            const visual = await reimagineStreet(base64, 'image/jpeg', userVisionPrompt);
                            setReimaginedImageUrl(visual);
                          } catch (e) {
                            console.error(e);
                          } finally {
                            setIsReimagining(false);
                          }
                        }}
                        disabled={isReimagining}
                        className="gap-2 civic-shadow-lg w-full max-w-sm"
                      >
                        {isReimagining ? <Clock className="animate-spin" /> : <Eye />}
                        {isReimagining ? 'Generating Future...' : 'Reimagine Urban Space'}
                      </Button>
                      <p className="mt-2 text-white font-mono text-[8px] uppercase tracking-widest opacity-80">PROMPT-DRIVEN AI AUGMENTATION</p>
                    </div>
                 )}
              </div>

              {/* Intelligence Column */}
              <div className="flex-1 overflow-y-auto p-8 md:p-12 scrollbar-hide">
                <header className="mb-8 border-b-4 border-slate-900 pb-8">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <Badge color="slate" className="bg-slate-900 text-white border-none">{selectedReport.status}</Badge>
                    <span className="mono-label text-[10px] md:text-xs">ID: {selectedReport.id.substring(0, 8)}...</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter leading-tight mb-4">{selectedReport.issueCategory}</h2>
                  <p className="text-lg md:text-xl font-medium text-slate-500 leading-tight italic font-serif opacity-80">{selectedReport.summary}</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {/* Expert Insights */}
                  <div className="space-y-8">
                    <section>
                      <h3 className="mono-label flex items-center gap-2 mb-4 text-civic-accent">
                        <Activity size={14}/> Hidden Intelligence
                      </h3>
                      <div className="space-y-3">
                        {(selectedReport.hiddenInsights || []).map((insight, i) => (
                          <div key={i} className="flex gap-4 p-4 bg-slate-50 border-l-4 border-slate-900 group">
                            <div className="text-slate-900 font-mono font-bold">0{i+1}</div>
                            <p className="text-sm font-medium leading-relaxed group-hover:translate-x-1 transition-transform">{insight}</p>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section>
                      <h3 className="mono-label flex items-center gap-2 mb-4">
                        <CheckCircle2 size={14}/> Design Critique
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 border-2 border-slate-900">
                          <div className="text-[10px] font-black uppercase mb-2 text-green-600">Working +</div>
                          <ul className="text-[11px] font-medium space-y-1 opacity-70">
                            {selectedReport.designCritique?.pros.map((p, i) => <li key={i}>• {p}</li>)}
                          </ul>
                        </div>
                        <div className="p-4 border-2 border-slate-900">
                          <div className="text-[10px] font-black uppercase mb-2 text-red-600">Failing -</div>
                          <ul className="text-[11px] font-medium space-y-1 opacity-70">
                            {selectedReport.designCritique?.cons.map((c, i) => <li key={i}>• {c}</li>)}
                          </ul>
                        </div>
                      </div>
                    </section>
                  </div>

                  {/* KPI Visualization */}
                  <div className="space-y-8">
                    <section>
                      <h3 className="mono-label mb-6">Street Quality Metrics</h3>
                      <div className="space-y-6">
                        <MetricBar label="Walkability Index" value={selectedReport.scores?.walkability || 0} />
                        <MetricBar label="Betweenness Centrality" value={selectedReport.scores?.betweenness || 0} />
                        <MetricBar label="Social Safety Factor" value={selectedReport.scores?.safety || 0} />
                        <MetricBar label="Universal Access" value={selectedReport.scores?.accessibility || 0} />
                        <MetricBar label="Thermal Comfort / Shade" value={selectedReport.scores?.comfort || 0} />
                        <MetricBar label="Shaded Spaces (%)" value={selectedReport.scores?.shadedSpaces || 0} />
                        <MetricBar label="Access to Green Space" value={selectedReport.scores?.greenAccess || 0} />
                        <MetricBar label="Active Edges (%)" value={selectedReport.scores?.edgeQuality || 0} />
                      </div>
                    </section>

                    <Card className="p-6 bg-slate-900 text-white">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <div className="mono-label opacity-60 mb-1 leading-none text-[8px]">Overall Quality Score</div>
                          <div className="text-5xl font-black tracking-tighter leading-none">{selectedReport.overallScore}</div>
                        </div>
                        <Badge variant="accent" className="bg-white text-slate-900 border-none">BENGALURU_REG_X</Badge>
                      </div>
                      <p className="text-[10px] font-mono opacity-50 uppercase leading-relaxed tracking-widest">Calculated based on 12 design weighted parameters including permeability, accessibility, and shade coverage.</p>
                    </Card>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-civic-dark/80 backdrop-blur-md">
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white border-4 border-slate-900 w-full max-w-xl civic-shadow overflow-hidden"
          >
             <div className="p-6 bg-civic-dark text-white border-b-4 border-slate-900 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black font-display uppercase tracking-tight">Intelligence Sub-Registry</h3>
                  <p className="mono-label text-civic-accent">System.Upload_Interface</p>
                </div>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => setShowUpload(false)}><X className="h-6 w-6" /></Button>
             </div>
             
             <div className="p-8 space-y-8">
                {!previewUrl ? (
                  <label className="flex flex-col items-center justify-center w-full aspect-[16/9] border-4 border-dashed border-slate-200 cursor-pointer hover:border-civic-accent transition-colors group relative overflow-hidden">
                    <div className="z-10 flex flex-col items-center">
                      <Camera className="h-16 w-16 text-slate-200 mb-4 group-hover:text-civic-accent transition-all transform group-hover:scale-110" />
                      <span className="font-display font-black text-sm uppercase tracking-widest text-slate-400 group-hover:text-slate-900">Attach Urban Evidence</span>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                ) : (
                  <div className="relative aspect-[16/9] border-4 border-slate-900 civic-shadow overflow-hidden">
                    <img src={previewUrl} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                      <Button 
                        variant="danger" 
                        size="sm"
                        onClick={() => { setUploadFile(null); setPreviewUrl(null); }}
                      >
                        Reset Source
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="mono-label text-slate-500 text-[10px]">Registry_Locality / Ward Selection</label>
                  <select 
                    value={selectedWard}
                    onChange={(e) => setSelectedWard(e.target.value)}
                    className="w-full p-3 bg-white border-2 border-slate-900 font-bold uppercase text-[11px] tracking-widest focus:ring-0 civic-shadow"
                  >
                    <option value="Central">Default / Central</option>
                    {WARDS.map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
                
                <div className="p-6 bg-slate-900 text-white font-mono text-[10px] leading-relaxed relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-2 opacity-10">
                      <Info className="h-12 w-12" />
                   </div>
                   <p className="relative z-10"><span className="text-civic-accent">[LOG]</span> Locational metadata will be appended automatically. AI processing will identify Potholes, Waste, and Side-walk deficit upon submission.</p>
                </div>
             </div>

             <div className="p-8 border-t-2 border-slate-900 flex gap-4">
                <Button variant="outline" onClick={() => setShowUpload(false)} className="flex-1">Abort</Button>
                <Button 
                  variant="accent"
                  onClick={handleUpload} 
                  disabled={!uploadFile || isAnalyzing} 
                  className="flex-1"
                >
                  {isAnalyzing ? (
                    <div className="flex items-center gap-3">
                      <div className="h-4 w-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </div>
                  ) : (
                    <>Commit Report</>
                  )}
                </Button>
             </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
