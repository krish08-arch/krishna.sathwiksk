import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  doc,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Card, Badge, Button } from '../components/UI';
import { handleFirestoreError } from '../lib/firebaseErrors';
import { Bell, AlertTriangle, Shield, MapPin, ArrowRight, Zap, Info, ArrowLeft, X, Activity, CheckCircle2, Clock, Eye, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { StreetAnalysis } from '../services/aiService';
import { UserProfile } from '../services/authService';

interface Alert extends StreetAnalysis {
  id: string;
  issueCategory: string;
  ward: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: any;
  summary: string;
  city: string;
  imageUrl: string;
  status: string;
  userId: string;
  location?: { latitude: number, longitude: number };
}

function MetricBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <span className="text-xs font-black uppercase tracking-widest text-slate-400">{label}</span>
        <span className="font-mono font-bold text-base">{value}%</span>
      </div>
      <div className="h-2 bg-slate-100 border border-slate-200">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          className={`h-full bg-slate-900 ${value < 40 ? 'bg-red-500' : value < 70 ? 'bg-orange-500' : 'bg-slate-900'}`}
        />
      </div>
    </div>
  );
}

export default function IntelligenceAlerts({ user, onBack }: { user: UserProfile, onBack?: () => void }) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  const handleDelete = async (id: string) => {
    if (!window.confirm("CAUTION: Permanent data purge. Proceed with removal of this intelligence unit?")) return;
    try {
      await deleteDoc(doc(db, 'reports', id));
      if (selectedAlert?.id === id) {
        setSelectedAlert(null);
      }
    } catch (e: any) {
      handleFirestoreError(e, 'delete', `reports/${id}`);
    }
  };

  useEffect(() => {
    console.log("IntelligenceAlerts: Initializing listener");
    // We filter for high/medium severity as "Intelligence Alerts"
    const q = query(
      collection(db, 'reports'),
      where('severity', 'in', ['high', 'medium']),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log(`IntelligenceAlerts: Received ${snapshot.size} alerts`);
      const data = snapshot.docs.map(doc => {
        const raw = doc.data();
        return { 
          id: doc.id, 
          ...raw,
          scores: raw.scores || raw.categoryScores || {}
        } as unknown as Alert;
      });
      setAlerts(data);
      setLoading(false);
    }, (error) => {
      console.error("IntelligenceAlerts listener error:", error);
      handleFirestoreError(error, 'list', 'reports');
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto bg-white p-4 md:p-10 relative scrollbar-hide">
      {onBack && (
        <button 
          onClick={onBack}
          className="fixed bottom-24 right-6 md:top-6 md:right-6 md:bottom-auto z-[90] bg-slate-900 text-white p-3 civic-shadow hover:bg-red-600 transition-all group"
          title="Return to Main Interface"
        >
          <X size={24} className="group-hover:rotate-90 transition-transform" />
        </button>
      )}
      <header className="mb-8 md:mb-12 border-b-4 border-slate-900 pb-6 md:pb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
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
          <div className="flex items-center gap-2 mb-2">
            <Badge color="red" className="animate-pulse text-[10px]">LIVE SYSTEM</Badge>
            <p className="mono-label text-[10px] md:text-sm">Urban Intelligence / Alerts</p>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tighter uppercase leading-none">
            Intelligence <span className="text-red-600">Alerts</span>
          </h2>
          <p className="text-sm md:text-base text-slate-500 mt-4 font-medium max-w-2xl">
            Real-time critical urban failure monitoring system. These alerts are generated from verified high-severity citizen reports and AI spatial anomalies.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 text-white p-4 civic-shadow flex items-center gap-6 w-full md:w-auto">
            <div className="text-center">
              <p className="text-[10px] uppercase font-bold opacity-50 mb-1 leading-none">Active Alerts</p>
              <p className="text-3xl font-black leading-none">{alerts.length}</p>
            </div>
            <div className="w-px h-10 bg-white/20"></div>
            <div className="text-center text-red-500">
              <p className="text-[10px] uppercase font-bold opacity-50 mb-1 leading-none text-white">Critical</p>
              <p className="text-3xl font-black leading-none">{alerts.filter(a => a.severity === 'high').length}</p>
            </div>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <Zap className="animate-pulse text-civic-accent h-12 w-12" />
          <p className="mono-label">Scanning Spatial Grid...</p>
        </div>
      ) : alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-96 border-4 border-dashed border-slate-200">
          <Shield className="h-16 w-16 text-slate-200 mb-4" />
          <p className="font-display font-bold text-xl text-slate-400">NO ACTIVE CRITICAL ANOMALIES</p>
          <p className="mono-label mt-2">All Urban Units Stable</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 pb-20">
          {alerts.map((alert, idx) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className={`relative overflow-hidden group flex flex-col md:flex-row border-4 ${alert.severity === 'high' ? 'border-red-600 shadow-[8px_8px_0_0_rgba(220,38,38,1)]' : 'border-slate-900 shadow-[8px_8px_0_0_rgba(15,23,42,1)]'}`}>
                {/* Visual Side */}
                <div className="w-full md:w-48 h-48 md:h-auto overflow-hidden relative">
                   <img 
                    src={alert.imageUrl} 
                    className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-700" 
                    referrerPolicy="no-referrer"
                   />
                   <div className={`absolute inset-0 opacity-20 pointer-events-none ${alert.severity === 'high' ? 'bg-red-600' : 'bg-slate-900'}`}></div>
                   <div className="absolute top-2 left-2">
                     <Badge color={alert.severity === 'high' ? 'red' : 'orange'} className="border-none shadow-sm font-black">
                       {alert.severity} PRIORITY
                     </Badge>
                   </div>
                </div>

                {/* Content Side */}
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-slate-500 font-mono text-[10px] uppercase font-bold tracking-widest">
                        <MapPin size={12} className={alert.severity === 'high' ? 'text-red-500' : ''} />
                        {alert.ward}, {alert.city}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {alert.timestamp?.toDate ? format(alert.timestamp.toDate(), 'HH:mm:ss') : 'LIVE'}
                      </div>
                    </div>
                    <h4 className="text-2xl font-black uppercase tracking-tighter mb-2 leading-none group-hover:text-red-600 transition-colors">
                      {alert.issueCategory}
                    </h4>
                    <p className="text-sm font-medium text-slate-600 leading-relaxed mb-6 line-clamp-2 italic">
                      " {alert.summary} "
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t-2 border-slate-100 border-dashed">
                    <div className="flex items-center gap-4">
                       <div className="flex items-center gap-1">
                          <div className={`h-2 w-2 rounded-full ${alert.severity === 'high' ? 'bg-red-600 animate-ping' : 'bg-slate-900'}`}></div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Live_Trace</span>
                       </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {(user.uid === alert.userId || user.role === 'admin' || user.role === 'official') && (
                        <Button 
                          variant="ghost" 
                          className="h-10 w-10 p-0 text-red-500 hover:bg-red-50 hover:text-red-700 border-2 border-transparent hover:border-red-200"
                          onClick={(e: any) => {
                            e.stopPropagation();
                            handleDelete(alert.id);
                          }}
                          title="Purge Intelligence Unit"
                        >
                          <Trash2 size={20} />
                        </Button>
                      )}
                      
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className="gap-2 group/btn h-10 px-4 border-2 border-slate-900 shadow-none hover:translate-x-0 hover:translate-y-0"
                        onClick={() => {
                          console.log("Opening Analysis for:", alert.id);
                          setSelectedAlert(alert);
                        }}
                      >
                        Analyze Root Cause <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Severity Accent */}
                {alert.severity === 'high' && (
                  <div className="absolute top-0 right-0 p-1 bg-red-600 text-white font-black text-[8px] uppercase tracking-[0.2em] -rotate-45 translate-x-3 translate-y-1 w-20 text-center">
                    Critical
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Detailed Analysis Modal */}
      <AnimatePresence>
        {selectedAlert && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 md:p-10 bg-civic-dark/95 backdrop-blur-xl overflow-y-auto scrollbar-hide">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border-4 md:border-8 border-slate-900 w-full max-w-6xl civic-shadow min-h-[90vh] md:min-h-[90vh] max-h-[95vh] flex flex-col md:flex-row relative overflow-hidden"
            >
              {/* Standard Close Icon */}
              <button 
                onClick={() => setSelectedAlert(null)}
                className="absolute top-4 right-4 md:top-6 md:right-6 z-[120] flex items-center justify-center h-10 w-10 md:h-12 md:w-12 bg-slate-900 text-white hover:bg-red-600 transition-all group civic-shadow-sm select-none"
                title="Discard View"
              >
                <X size={24} className="group-hover:rotate-90 transition-transform" />
              </button>

              {/* Delete Button - Only for Author or Admin/Official */}
              {(user.uid === selectedAlert.userId || user.role === 'admin' || user.role === 'official') && (
                <button 
                  onClick={() => handleDelete(selectedAlert.id)}
                  className="absolute top-6 left-6 z-[120] flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-mono text-[10px] uppercase font-black hover:bg-slate-900 transition-all group civic-shadow-sm border-2 border-slate-900"
                >
                  <Trash2 size={16} className="group-hover:scale-110 transition-transform" />
                  Purge Unit
                </button>
              )}

              {/* Visual Side */}
              <div className="w-full md:w-1/2 border-r-4 border-slate-900 bg-slate-100 relative group overflow-hidden">
                <img 
                  src={selectedAlert.imageUrl} 
                  className="w-full h-full object-cover transition-all duration-700" 
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-0 left-0 p-4 z-10 bg-slate-900 text-white mono-label text-xs">
                  CRITICAL_UNIT_VISUALIZATION
                </div>
              </div>

              {/* Data Side */}
              <div className="flex-1 overflow-y-auto p-8 md:p-12 scrollbar-hide">
                <header className="mb-8 border-b-4 border-slate-900 pb-8">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <Badge color={selectedAlert.severity === 'high' ? 'red' : 'orange'} className="text-[10px]">{selectedAlert.severity} SEVERITY</Badge>
                    <span className="mono-label text-[10px] md:text-sm">UNIT_ID: {selectedAlert.id.substring(0, 8)}...</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter leading-tight mb-4">{selectedAlert.issueCategory}</h2>
                  <p className="text-lg md:text-xl font-medium text-slate-500 leading-tight italic font-serif opacity-80">{selectedAlert.summary}</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <section>
                      <h3 className="mono-label flex items-center gap-2 mb-4 text-red-600">
                        <Activity size={14}/> Failure Diagnostics
                      </h3>
                      <div className="space-y-3">
                        {(selectedAlert.hiddenInsights || []).map((insight, i) => (
                          <div key={i} className="flex gap-4 p-4 bg-slate-50 border-l-4 border-red-600 group">
                            <div className="text-slate-900 font-mono font-bold">ERR_0{i+1}</div>
                            <p className="text-sm font-medium leading-relaxed group-hover:translate-x-1 transition-transform">{insight}</p>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section>
                      <h3 className="mono-label flex items-center gap-2 mb-4">
                        <CheckCircle2 size={14}/> Spatial Impact
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 border-2 border-slate-900">
                          <div className="text-[10px] font-black uppercase mb-2 text-green-600">Resilience +</div>
                          <ul className="text-[11px] font-medium space-y-1 opacity-70">
                            {selectedAlert.designCritique?.pros.map((p, i) => <li key={i}>• {p}</li>)}
                          </ul>
                        </div>
                        <div className="p-4 border-2 border-slate-900">
                          <div className="text-[10px] font-black uppercase mb-2 text-red-600">Vulnerability -</div>
                          <ul className="text-[11px] font-medium space-y-1 opacity-70">
                            {selectedAlert.designCritique?.cons.map((c, i) => <li key={i}>• {c}</li>)}
                          </ul>
                        </div>
                      </div>
                    </section>
                  </div>

                  <div className="space-y-8">
                    <section>
                      <h3 className="mono-label mb-6">Risk Vector Metrics</h3>
                      <div className="space-y-6">
                        <MetricBar label="Safety Depletion" value={selectedAlert.scores?.safety || 0} />
                        <MetricBar label="Stability Index" value={selectedAlert.scores?.betweenness || 0} />
                        <MetricBar label="Access Obstruction" value={selectedAlert.scores?.accessibility || 0} />
                        <MetricBar label="Infrastructure Quality" value={selectedAlert.overallScore || 0} />
                      </div>
                    </section>
                    
                    <Card className="p-6 bg-red-600 text-white border-4 border-slate-900">
                      <div className="mono-label text-white/80 mb-2">System.Urgency_Score</div>
                      <div className="text-6xl font-black mb-4">CRIT</div>
                      <p className="text-[10px] font-mono leading-relaxed opacity-80 uppercase tracking-widest">Immediate field protocols required for site {selectedAlert.ward}. Resource allocation prioritized.</p>
                    </Card>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* System Status Footer */}
      <footer className="mt-10 p-8 bg-slate-900 text-white border-4 border-slate-900 civic-shadow flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="h-10 w-10 border-2 border-white flex items-center justify-center text-red-500 bg-white shadow-[2px_2px_0_0_rgba(255,255,255,0.4)]">
            <Bell size={24} />
          </div>
          <div>
            <p className="font-mono text-xs font-black uppercase tracking-widest text-red-500">System Monitoring Active</p>
            <p className="text-sm opacity-50 mt-1 max-w-sm leading-tight uppercase font-mono">
              Listening for spatial volatility and high-intensity reports from Bengaluru urban clusters.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-8">
           <div className="text-right">
             <p className="text-[10px] uppercase font-black opacity-40 mb-1">Network Latency</p>
             <p className="font-mono font-bold">14ms</p>
           </div>
           <div className="text-right">
             <p className="text-[10px] uppercase font-black opacity-40 mb-1">API Reliability</p>
             <p className="font-mono font-bold text-green-500">99.9%</p>
           </div>
        </div>
      </footer>
    </div>
  );
}
