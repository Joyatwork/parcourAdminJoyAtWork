import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Heart, Brain, Zap, Moon, Smile, Target, Shield, Search, Loader2, Building2, Users, Calendar 
} from 'lucide-react';

const SanteDiagnosticDashboard = () => {
  const [activeTab, setActiveTab] = useState('entreprises');
  const [companyHealthData, setCompanyHealthData] = useState([]);
  const [usersHealthData, setUsersHealthData] = useState([]);
  const [globalStats, setGlobalStats] = useState(null);
  
  const [initialLoading, setInitialLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);

  const [tableMonth, setTableMonth] = useState(0); 
  const [tableYear, setTableYear] = useState(2025);
  const [searchTerm, setSearchTerm] = useState(""); 

  const [globalMonth, setGlobalMonth] = useState(11); 
  const [globalYear, setGlobalYear] = useState(2025);

  const months = [
    { value: 1, label: 'Janvier' }, { value: 2, label: 'Février' }, { value: 3, label: 'Mars' },
    { value: 4, label: 'Avril' }, { value: 5, label: 'Mai' }, { value: 6, label: 'Juin' },
    { value: 7, label: 'Juillet' }, { value: 8, label: 'Août' }, { value: 9, label: 'Septembre' },
    { value: 10, label: 'Octobre' }, { value: 11, label: 'Novembre' }, { value: 12, label: 'Décembre' }
  ];

  useEffect(() => {
    const initData = async () => {
      try {
        setInitialLoading(true);
        const [resCompany, resUser, resGlobal] = await Promise.all([
          fetch('http://localhost:8001/api/diagnostics/company-health'),
          fetch('http://localhost:8001/api/diagnostics/user-health'),
          fetch(`http://localhost:8001/api/kpi-company-health/global-health?year=${globalYear}&month=${globalMonth}`)
        ]);
        setCompanyHealthData(await resCompany.json());
        setUsersHealthData(await resUser.json());
        const gData = await resGlobal.json();
        setGlobalStats(gData.length > 0 ? gData[0] : null);
      } catch (err) { console.error(err); } 
      finally { setInitialLoading(false); }
    };
    initData();
  }, []);

  useEffect(() => {
    if (initialLoading) return;
    const updateStats = async () => {
      setStatsLoading(true);
      try {
        const res = await fetch(`http://localhost:8001/api/kpi-company-health/global-health?year=${globalYear}&month=${globalMonth}`);
        const gData = await res.json();
        setGlobalStats(gData.length > 0 ? gData[0] : null);
      } catch (err) { console.error(err); } 
      finally { setTimeout(() => setStatsLoading(false), 300); }
    };
    updateStats();
  }, [globalMonth, globalYear]);

  const filterLogic = (data, searchKey) => {
    return data.filter(item => {
      const matchYear = item.month.startsWith(tableYear.toString());
      const monthStr = String(tableMonth).padStart(2, '0');
      const matchMonth = tableMonth === 0 ? true : item.month === `${tableYear}-${monthStr}`;
      const searchTarget = searchKey === 'user' 
        ? `${item.first_name} ${item.last_name}`.toLowerCase() 
        : item.company_name.toLowerCase();
      return matchYear && matchMonth && searchTarget.includes(searchTerm.toLowerCase());
    });
  };

  const filteredCompanies = filterLogic(companyHealthData, 'company');
  const filteredUsers = filterLogic(usersHealthData, 'user');

  const stats = globalStats || { moyen_stress: 0, moyen_energie: 0, moyen_sommeil: 0, moyen_mood: 0, moyen_pression: 0 };
  const globalScore = stats.moyen_stress === 0 ? 0 : (
    (Number(stats.moyen_energie) + Number(stats.moyen_mood) + Number(stats.moyen_sommeil) + (10 - Number(stats.moyen_stress))) / 4 * 10
  ).toFixed(0);

  if (initialLoading) return (
    <div className="h-screen w-full flex items-center justify-center bg-gray-50">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-slate-900 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header - Filtre aligné sur le style global */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Santé & Diagnostic</h1>
            <div className="flex items-center gap-3 mt-3">
               <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm">
                 <Calendar className="w-3.5 h-3.5 text-slate-400" />
                 <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Global :</span>
                 <select 
                   value={globalMonth} 
                   onChange={(e) => setGlobalMonth(Number(e.target.value))} 
                   className="text-xs font-bold text-slate-700 border-none bg-transparent p-0 focus:ring-0 cursor-pointer"
                 >
                   {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                 </select>
                 <div className="w-px h-3 bg-slate-200 mx-1"></div>
                 <select 
                   value={globalYear} 
                   onChange={(e) => setGlobalYear(Number(e.target.value))} 
                   className="text-xs font-bold text-slate-700 border-none bg-transparent p-0 focus:ring-0 cursor-pointer"
                 >
                   <option value={2025}>2025</option>
                   <option value={2024}>2024</option>
                 </select>
                 {statsLoading && <Loader2 className="w-3 h-3 animate-spin text-blue-600 ml-1" />}
               </div>
            </div>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md h-11 px-6 rounded-xl font-semibold transition-all hover:scale-[1.02]">
            <Heart className="w-4 h-4 mr-2 fill-white" /> Nouveau Bilan
          </Button>
        </div>

        {/* Section Stats avec Loader ciblé */}
        <div className="relative group">
          {statsLoading && (
            <div className="absolute inset-0 z-10 bg-gray-50/60 backdrop-blur-[2px] flex items-center justify-center rounded-2xl transition-all">
               <div className="bg-white p-4 rounded-full shadow-2xl border border-blue-50">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
               </div>
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard title="Stress" value={`${Number(stats.moyen_stress).toFixed(1)}`} color="red" icon={<Brain className="w-5 h-5"/>} />
            <StatCard title="Énergie" value={`${Number(stats.moyen_energie).toFixed(1)}`} color="orange" icon={<Zap className="w-5 h-5"/>} />
            <StatCard title="Sommeil" value={`${Number(stats.moyen_sommeil).toFixed(1)}`} color="purple" icon={<Moon className="w-5 h-5"/>} />
            <StatCard title="Humeur" value={`${Number(stats.moyen_mood).toFixed(1)}`} color="blue" icon={<Smile className="w-5 h-5"/>} />
            <StatCard title="Pression" value={`${Number(stats.moyen_pression).toFixed(1)}`} color="teal" icon={<Target className="w-5 h-5"/>} />
            <StatCard title="Score" value={`${globalScore}%`} color="green" icon={<Shield className="w-5 h-5"/>} />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border border-slate-200 p-1 h-12 shadow-sm rounded-xl">
            <TabsTrigger value="entreprises" className="flex items-center gap-2 px-8 font-semibold rounded-lg data-[state=active]:bg-slate-100 data-[state=active]:text-blue-600">
              <Building2 className="w-4 h-4" /> Entreprises
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2 px-8 font-semibold rounded-lg data-[state=active]:bg-slate-100 data-[state=active]:text-blue-600">
              <Users className="w-4 h-4" /> Utilisateurs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="entreprises" className="space-y-4">
            <FilterBar 
              searchTerm={searchTerm} setSearchTerm={setSearchTerm}
              selectedMonth={tableMonth} setSelectedMonth={setTableMonth}
              selectedYear={tableYear} setSelectedYear={setTableYear}
              months={[{value: 0, label: 'Tous les mois'}, ...months]} 
              placeholder="Rechercher une entreprise..."
            />
            <TableCard data={filteredCompanies} type="company" />
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <FilterBar 
              searchTerm={searchTerm} setSearchTerm={setSearchTerm}
              selectedMonth={tableMonth} setSelectedMonth={setTableMonth}
              selectedYear={tableYear} setSelectedYear={setTableYear}
              months={[{value: 0, label: 'Tous les mois'}, ...months]}
              placeholder="Rechercher un collaborateur..."
            />
            <TableCard data={filteredUsers} type="user" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// --- COMPOSANTS INTERNES HARMONISÉS ---

const StatCard = ({ title, value, color, icon }) => {
  const themes = {
    red: "bg-red-50 text-red-600 border-red-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
    green: "bg-green-50 text-green-600 border-green-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    teal: "bg-teal-50 text-teal-600 border-teal-100",
  };
  return (
    <Card className={`p-5 border flex items-center justify-between shadow-sm rounded-2xl transition-transform hover:scale-[1.02] ${themes[color]}`}>
      <div>
        <p className="text-[10px] font-bold uppercase opacity-60 mb-0.5 tracking-wider">{title}</p>
        <p className="text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
      </div>
      <div className="p-2.5 bg-white/90 rounded-xl shadow-sm border border-white/50">{icon}</div>
    </Card>
  );
};

const FilterBar = ({ searchTerm, setSearchTerm, selectedMonth, setSelectedMonth, selectedYear, setSelectedYear, months, placeholder }) => (
  <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 border border-slate-200 rounded-2xl shadow-sm">
    <div className="relative flex-1 max-w-md">
      <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
      <input 
        type="text" 
        placeholder={placeholder}
        className="w-full pl-11 pr-4 py-2.5 text-sm border border-slate-100 rounded-xl bg-slate-50 focus:ring-2 ring-blue-500/10 focus:border-blue-400 focus:bg-white outline-none transition-all placeholder:text-slate-400"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
    <div className="flex gap-2">
      <div className="flex items-center bg-slate-50 border border-slate-100 rounded-xl px-3 py-1">
        <select 
          value={selectedMonth} 
          onChange={(e) => setSelectedMonth(Number(e.target.value))} 
          className="text-xs font-bold text-slate-600 bg-transparent border-none focus:ring-0 cursor-pointer py-1.5"
        >
          {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
        <div className="w-px h-4 bg-slate-200 mx-2"></div>
        <select 
          value={selectedYear} 
          onChange={(e) => setSelectedYear(Number(e.target.value))} 
          className="text-xs font-bold text-slate-600 bg-transparent border-none focus:ring-0 cursor-pointer py-1.5"
        >
          <option value={2025}>2025</option>
          <option value={2024}>2024</option>
        </select>
      </div>
    </div>
  </div>
);

const TableCard = ({ data, type }) => (
  <Card className="border border-slate-200 shadow-sm overflow-hidden bg-white rounded-2xl">
    <table className="w-full text-left">
      <thead className="bg-slate-50/50 border-b border-slate-100 text-[10px] uppercase text-slate-400 font-bold tracking-widest">
        <tr>
          <th className="px-6 py-5">{type === 'user' ? 'Collaborateur' : 'Entreprise'}</th>
          <th className="px-6 py-5">Période</th>
          <th className="px-6 py-5 text-center">Stress</th>
          <th className="px-6 py-5 text-center text-orange-600">Énergie</th>
          <th className="px-6 py-5 text-center text-purple-600">Sommeil</th>
          <th className="px-6 py-5 text-center text-blue-600">Humeur</th>
          <th className="px-6 py-5 text-center">Pression</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-50">
        {data.map((item, i) => (
          <tr key={i} className="hover:bg-slate-50/50 transition-colors">
            <td className="px-6 py-5">
              {type === 'user' ? (
                <div className="flex flex-col">
                  <span className="font-bold text-slate-800">{item.first_name} {item.last_name}</span>
                  <span className="text-[10px] text-blue-600 font-bold uppercase">{item.company_name}</span>
                </div>
              ) : (
                <span className="font-bold text-slate-800">{item.company_name}</span>
              )}
            </td>
            <td className="px-6 py-5 text-slate-400 text-sm">{item.month}</td>
            <td className={`px-6 py-5 text-center font-bold text-lg ${type === 'user' && Number(item.avg_stress) > 7 ? 'text-red-500' : 'text-slate-700'}`}>
              {Number(item.avg_stress || item.avg_stress).toFixed(1)}
            </td>
            <td className="px-6 py-5 text-center font-bold text-lg text-orange-500">{Number(item.avg_energy || item.avg_energy).toFixed(1)}</td>
            <td className="px-6 py-5 text-center font-bold text-lg text-purple-500">{Number(item.avg_sleep || item.avg_sleep).toFixed(1)}</td>
            <td className="px-6 py-5 text-center font-bold text-lg text-blue-500">{Number(item.avg_mood || item.avg_mood).toFixed(1)}</td>
            <td className="px-6 py-5 text-center font-bold text-lg text-slate-400">{Number(item.avg_pressure || item.avg_pressure).toFixed(1)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </Card>
);

export default SanteDiagnosticDashboard;