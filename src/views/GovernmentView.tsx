import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Map as MapIcon, 
  AlertCircle, 
  TrendingUp, 
  Users, 
  Layers, 
  Search,
  ArrowUpRight,
  MoreVertical,
  CheckCircle,
  Clock,
  Filter,
  ArrowLeft,
  Trash2
} from 'lucide-react';
import { db } from '../lib/firebase';
import { UserProfile } from '../services/authService';
import { handleFirestoreError } from '../lib/firebaseErrors';
import { Button, Card, Badge } from '../components/UI';
import { URBAN_REGISTRY } from '../data/urbanRegistry';

interface Report {
  id: string;
  issueCategory: string;
  city: string;
  ward: string;
  severity: 'low' | 'medium' | 'high';
  status: string;
  overallScore: number;
  timestamp: any;
  summary: string;
  imageUrl: string;
  userId: string;
  userTrustScore?: number;
}

const COLORS = ['#0ea5e9', '#f97316', '#ef4444', '#10b981', '#6366f1'];

export default function GovernmentView({ user, onBack }: { user: UserProfile, onBack?: () => void }) {
  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState<'all' | 'reported' | 'resolved'>('all');

  useEffect(() => {
    const q = query(collection(db, 'reports'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setReports(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Report)));
    });
    return () => unsubscribe();
  }, []);

  const updateStatus = async (reportId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'reports', reportId), {
        status: newStatus,
        verifiedDate: new Date().toISOString(),
        verifiedBy: user.uid
      });
    } catch (e: any) {
      handleFirestoreError(e, 'update', `reports/${reportId}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("CAUTION: Permanent data purge. Proceed with removal of this intelligence unit?")) return;
    try {
      await deleteDoc(doc(db, 'reports', id));
    } catch (e: any) {
      handleFirestoreError(e, 'delete', `reports/${id}`);
    }
  };

  const highSeverityCount = reports.filter(r => r.severity === 'high').length;
  const pendingCount = reports.filter(r => r.status === 'reported').length;
  
  const typeData = Object.entries(
    reports.reduce((acc, r) => {
      acc[r.issueCategory] = (acc[r.issueCategory] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const wardData = Object.entries(
    reports.reduce((acc, r) => {
      acc[r.ward] = (acc[r.ward] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, count]) => ({ name, count })).slice(0, 5);

  return (
    <div className="flex-1 overflow-y-auto bg-white">
      {/* Top Header */}
      <div className="bg-civic-dark border-b-4 border-slate-900 px-6 md:px-10 py-6 md:py-10 flex flex-col md:flex-row items-start md:items-center justify-between text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 visible-grid pointer-events-none"></div>
        <div className="relative z-10 w-full md:w-auto">
          {onBack && (
            <button 
              onClick={onBack}
              className="flex items-center gap-2 text-white/50 hover:text-white font-mono text-[10px] uppercase font-black mb-4 transition-colors group"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              Return to Feed
            </button>
          )}
          <p className="mono-label text-civic-accent mb-2 text-[10px] md:text-sm">Authenticated: Governance_Mode</p>
          <h2 className="text-3xl md:text-5xl font-black font-display tracking-tighter uppercase leading-none mb-4 md:mb-0">Command <span className="text-civic-accent">Center</span></h2>
          <div className="flex items-center gap-4 mt-4">
             <div className="flex -space-x-2">
                {[1,2,3].map(i => (
                  <div key={i} className="h-6 w-6 md:h-8 md:w-8 rounded-full border-2 border-slate-900 bg-civic-accent"></div>
                ))}
             </div>
             <span className="text-[10px] font-bold opacity-60 uppercase tracking-widest tracking-tighter">3 Officials Online</span>
          </div>
        </div>
        <div className="flex gap-2 md:gap-4 mt-6 md:mt-0 relative z-10 w-full md:w-auto">
          <Button variant="accent" size="sm" className="flex-1 md:flex-none gap-2 text-[10px] md:text-sm h-10">
            <Layers className="h-4 w-4" /> Deploy Map
          </Button>
          <Button variant="outline" size="sm" className="flex-1 md:flex-none gap-2 bg-white text-slate-900 text-[10px] md:text-sm h-10">
            <Filter className="h-4 w-4" /> Region.Filter()
          </Button>
        </div>
      </div>

      <div className="p-4 md:p-10 scrollbar-hide overflow-x-hidden">
        {/* KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mb-12">
          <div className="bg-white p-4 md:p-8 border-4 border-slate-900 civic-shadow">
            <div className="flex justify-between items-start mb-4 md:mb-6">
              <div className="p-1.5 md:p-2 bg-red-600 border-2 border-slate-900 text-white">
                <AlertCircle className="h-4 w-4 md:h-6 md:w-6" />
              </div>
              <Badge color="red" className="text-[8px] md:text-xs">URGENT</Badge>
            </div>
            <p className="mono-label text-slate-400 mb-2 text-[10px] md:text-sm leading-none">Critical Incidents</p>
            <h3 className="text-3xl md:text-5xl font-black font-display tracking-tighter">{highSeverityCount}</h3>
            <p className="text-[9px] md:text-xs text-red-600 mt-4 font-black flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> +4 DELTA_24H
            </p>
          </div>

          <div className="bg-white p-4 md:p-8 border-4 border-slate-900 civic-shadow">
             <div className="flex justify-between items-start mb-4 md:mb-6">
              <div className="p-1.5 md:p-2 bg-slate-900 border-2 border-slate-900 text-white">
                <Clock className="h-4 w-4 md:h-6 md:w-6" />
              </div>
            </div>
            <p className="mono-label text-slate-400 mb-2 text-[10px] md:text-sm leading-none">Sync.Queue</p>
            <h3 className="text-3xl md:text-5xl font-black font-display tracking-tighter">{pendingCount}</h3>
            <p className="text-[9px] md:text-xs text-slate-500 mt-4 font-black uppercase">
              LATENCY: 4.2H
            </p>
          </div>

          <div className="bg-white p-4 md:p-8 border-4 border-slate-900 civic-shadow">
             <div className="flex justify-between items-start mb-4 md:mb-6">
              <div className="p-1.5 md:p-2 bg-green-500 border-2 border-slate-900 text-white">
                <CheckCircle className="h-4 w-4 md:h-6 md:w-6" />
              </div>
            </div>
            <p className="mono-label text-slate-400 mb-2 text-[10px] md:text-sm leading-none">Resolved Units</p>
            <h3 className="text-3xl md:text-5xl font-black font-display tracking-tighter">128</h3>
            <p className="text-[9px] md:text-xs text-green-600 mt-4 font-black flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3" /> +15%
            </p>
          </div>

          <div className="bg-white p-4 md:p-8 border-4 border-slate-900 civic-shadow">
             <div className="flex justify-between items-start mb-4 md:mb-6">
              <div className="p-1.5 md:p-2 bg-civic-dark border-2 border-slate-900 text-white">
                <Users className="h-4 w-4 md:h-6 md:w-6" />
              </div>
            </div>
            <p className="mono-label text-slate-400 mb-2 text-[10px] md:text-sm leading-none">Data Nodes</p>
            <h3 className="text-3xl md:text-5xl font-black font-display tracking-tighter">842</h3>
            <p className="text-[9px] md:text-xs text-slate-500 mt-4 font-black uppercase tracking-tight">Active Nodes</p>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-12">
          <div className="lg:col-span-2 bg-white border-4 border-slate-900 p-6 md:p-8 civic-shadow">
            <div className="flex items-center justify-between mb-8 md:mb-10">
              <h4 className="font-display font-black text-xl md:text-2xl uppercase tracking-tight flex items-center gap-3">
                <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-civic-accent" /> Spatial Intensity
              </h4>
              <div className="hidden sm:flex gap-2">
                 <div className="h-2 w-10 bg-slate-100 border-2 border-slate-900"></div>
                 <div className="h-2 w-10 bg-civic-accent border-2 border-slate-900"></div>
              </div>
            </div>
            <div className="h-[250px] md:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={wardData}>
                  <XAxis dataKey="name" fontSize={9} fontWeight={800} tickLine={false} axisLine={false} />
                  <YAxis fontSize={9} fontWeight={800} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: '#f1f5f9' }} />
                  <Bar dataKey="count" fill="#0F172A" radius={0} barSize={window.innerWidth < 768 ? 20 : 40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white border-4 border-slate-900 p-8 civic-shadow">
            <h4 className="font-display font-black text-2xl mb-10 uppercase tracking-tight">Issue Breakdown</h4>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeData}
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={0}
                    dataKey="value"
                    stroke="#0F172A"
                    strokeWidth={2}
                  >
                    {typeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#F59E0B' : '#0F172A'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-8 space-y-3 font-mono text-xs font-bold">
               {typeData.map((t, i) => (
                 <div key={t.name} className="flex items-center justify-between border-b pb-1 border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-none border border-slate-900" style={{ background: i === 0 ? '#F59E0B' : '#0F172A' }}></div>
                      <span className="uppercase text-slate-500">{t.name}</span>
                    </div>
                    <span>{t.value} UNITS</span>
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/* Management Registry */}
        <div className="bg-white border-4 border-slate-900 civic-shadow overflow-hidden mb-20 md:mb-10">
          <div className="p-6 md:p-8 border-b-4 border-slate-900 flex flex-col md:flex-row md:items-center justify-between bg-slate-50 gap-6">
            <div>
              <p className="mono-label text-slate-400 text-[10px]">Database.Query()</p>
              <h4 className="font-display font-black text-xl md:text-2xl uppercase tracking-tight">Active Intelligence</h4>
            </div>
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search Database..." 
                className="pl-12 pr-6 py-3 border-2 border-slate-900 font-bold text-sm focus:outline-none focus:ring-0 focus:border-civic-accent bg-white w-full md:w-[300px]"
              />
            </div>
          </div>
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-left min-w-[800px] md:min-w-0">
              <thead>
                <tr className="bg-civic-dark text-white font-mono text-xs uppercase font-bold tracking-[0.2em] border-b-2 border-slate-900">
                  <th className="px-8 py-6">Intel_Source</th>
                  <th className="px-8 py-6">Locator_Metadata</th>
                  <th className="px-8 py-6 text-center">Quality_Score</th>
                  <th className="px-8 py-6">System_Status</th>
                  <th className="px-8 py-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-100 text-sm font-medium">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-6">
                        <div className="h-12 w-16 border-2 border-slate-900 bg-slate-100 overflow-hidden shrink-0">
                           <img src={report.imageUrl} className="h-full w-full object-cover grayscale brightness-90 hover:grayscale-0 transition-all" />
                        </div>
                        <div>
                          <p className="font-black text-slate-900 uppercase tracking-tight text-base">{report.issueCategory}</p>
                          <p className="font-mono text-xs text-slate-400 mt-1 uppercase">ID: {report.id.substring(0, 12)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <p className="font-bold uppercase text-sm">{report.ward}</p>
                       <p className="font-mono text-xs text-slate-400 tracking-widest mt-1">{report.city.toUpperCase()}_ZONE</p>
                    </td>
                    <td className="px-8 py-6 text-center">
                       <span className={`inline-flex items-center justify-center font-mono font-black h-10 w-10 border-2 border-slate-900 ${report.overallScore > 70 ? 'bg-green-100 text-green-700' : report.overallScore > 40 ? 'bg-civic-accent text-slate-900' : 'bg-red-100 text-red-700'}`}>
                         {report.overallScore}
                       </span>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex flex-col gap-1">
                         <Badge color={report.status === 'resolved' ? 'green' : report.status === 'verified' ? 'blue' : 'slate'} className="w-fit text-xs px-2 py-0.5">
                           {report.status.toUpperCase()}
                         </Badge>
                         {report.severity === 'high' && <span className="text-[11px] font-black text-red-600 tracking-tight uppercase pl-1">! High Urgency</span>}
                       </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {report.status === 'reported' && (
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="text-xs py-1.5 px-4 shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
                            onClick={() => updateStatus(report.id, 'verified')}
                          >
                            Verify
                          </Button>
                        )}
                        {report.status === 'verified' && (
                          <Button 
                            variant="accent" 
                            size="sm"
                            className="text-xs py-1.5 px-4 shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
                            onClick={() => updateStatus(report.id, 'resolved')}
                          >
                            Resolve
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-10 w-10 text-red-500 hover:bg-red-50 border-2 border-transparent hover:border-red-200"
                          onClick={(e: any) => {
                            e.stopPropagation();
                            handleDelete(report.id);
                          }}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-10 w-10"><MoreVertical className="h-5 w-5" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Street Inventory Registry */}
        <div className="bg-white border-4 border-slate-900 civic-shadow overflow-hidden mb-10">
          <div className="p-6 md:p-8 border-b-4 border-slate-900 flex flex-col md:flex-row md:items-center justify-between bg-civic-dark text-white gap-6">
            <div>
              <p className="mono-label text-civic-accent text-[10px]">Reference.Inventory()</p>
              <h4 className="font-display font-black text-xl md:text-2xl uppercase tracking-tight">Urban Infrastructure Registry</h4>
            </div>
            <div className="flex gap-4">
               <div className="bg-white/10 px-4 py-2 border border-white/20">
                  <p className="text-[8px] uppercase font-bold text-white/50">Total Length</p>
                  <p className="font-mono font-black text-lg">{(URBAN_REGISTRY.reduce((acc, s) => acc + s.lengthMeters, 0) / 1000).toFixed(1)} km</p>
               </div>
               <div className="bg-white/10 px-4 py-2 border border-white/20">
                  <p className="text-[8px] uppercase font-bold text-white/50">Stored Units</p>
                  <p className="font-mono font-black text-lg">{URBAN_REGISTRY.length}</p>
               </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-mono text-[10px] uppercase font-bold tracking-widest border-b-2 border-slate-900">
                  <th className="px-8 py-4">Street_Name</th>
                  <th className="px-8 py-4">Registry_Id</th>
                  <th className="px-8 py-4">Locality</th>
                  <th className="px-8 py-4">Type</th>
                  <th className="px-8 py-4 text-right">Ext_Meters</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[10px]">
                {URBAN_REGISTRY.slice(0, 10).map((street, idx) => (
                  <tr key={`${street.streetId}-${idx}`} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-4 font-black">{street.streetName || 'UNNAMED_SEGMENT'}</td>
                    <td className="px-8 py-4 text-slate-400">{street.streetId}</td>
                    <td className="px-8 py-4">
                       <span className="font-bold">{street.wardName}</span>
                       <span className="ml-2 opacity-40">#{street.wardNo}</span>
                    </td>
                    <td className="px-8 py-4 uppercase font-bold">{street.roadType}</td>
                    <td className="px-8 py-4 text-right font-black text-slate-900">{street.lengthMeters}m</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-6 bg-slate-50 text-center border-t-2 border-slate-900">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Showing Top 10 Reference Units / Full Registry Available via API Export</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
