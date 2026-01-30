import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Heart, Brain, Zap, Moon, Smile, Target, Shield, Search, Loader2, Building2, Users, Calendar, User, 
  BarChart3
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
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Santé & Diagnostic</h1>
            <div className="flex items-center gap-3 mt-3">
               <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm">
                 <Calendar className="w-3.5 h-3.5 text-slate-400" />
                 <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Global :</span>
                 <select value={globalMonth} onChange={(e) => setGlobalMonth(Number(e.target.value))} className="text-xs font-bold text-slate-700 border-none bg-transparent p-0 focus:ring-0 cursor-pointer">
                   {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                 </select>
                 <div className="w-px h-3 bg-slate-200 mx-1"></div>
                 <select value={globalYear} onChange={(e) => setGlobalYear(Number(e.target.value))} className="text-xs font-bold text-slate-700 border-none bg-transparent p-0 focus:ring-0 cursor-pointer">
                   <option value={2026}>2026</option>
                   <option value={2025}>2025</option>
                   <option value={2024}>2024</option>
                 </select>
               </div>
            </div>
          </div>
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md h-11 px-6 rounded-xl font-semibold">
            <Heart className="w-4 h-4 mr-2 fill-white" /> Nouveau Bilan
          </Button>
        </div>

        {/* Progression générale */}
        <Card className="p-6 border border-slate-200 shadow-sm rounded-xl">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Progression des métriques
          </h3>
          <div className="space-y-4">
            <ProgressMetric 
              label="Score Global" 
              value={statsLoading ? 0 : globalScore} 
              max={100}
              loading={statsLoading}
            />
            <ProgressMetric 
              label="Niveau d'énergie" 
              value={statsLoading ? 0 : Number(stats.moyen_energie).toFixed(1)} 
              max={10}
              loading={statsLoading}
            />
            <ProgressMetric 
              label="Niveau de stress" 
              value={statsLoading ? 0 : Number(stats.moyen_stress).toFixed(1)} 
              max={10}
              loading={statsLoading}
            />
            <ProgressMetric 
              label="Qualité du sommeil" 
              value={statsLoading ? 0 : Number(stats.moyen_sommeil).toFixed(1)} 
              max={10}
              loading={statsLoading}
            />
            <ProgressMetric 
              label="Pression travail" 
              value={statsLoading ? 0 : Number(stats.moyen_pression).toFixed(1)} 
              max={10}
              loading={statsLoading}
            />
            <ProgressMetric 
              label="Humeur" 
              value={statsLoading ? 0 : Number(stats.moyen_mood).toFixed(1)} 
              max={10}
              loading={statsLoading}
            />
          </div>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border border-slate-200 p-1 h-12 shadow-sm rounded-xl">
            <TabsTrigger value="entreprises" className="flex items-center gap-2 px-8 font-semibold rounded-lg">
              <Building2 className="w-4 h-4" /> Entreprises
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2 px-8 font-semibold rounded-lg">
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

// --- COMPOSANT PROGRESS METRIC ---

const ProgressMetric = ({ label, value, max, loading }) => {
  const percentage = (Number(value) / max) * 100;
  
  const getScoreColor = (val, maximum) => {
    const pct = (val / maximum) * 100;
    if (pct >= 70) return 'text-green-600';
    if (pct >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-slate-700">{label}</span>
        <span className={`font-bold ${loading ? 'text-slate-400' : getScoreColor(value, max)}`}>
          {loading ? '...' : `${value}${max === 100 ? '' : '/10'}`}
        </span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${
            percentage >= 70 ? 'bg-green-500' : 
            percentage >= 40 ? 'bg-orange-500' : 
            'bg-red-500'
          }`}
          style={{ width: `${loading ? 0 : percentage}%` }}
        />
      </div>
    </div>
  );
};

// --- COMPOSANT STAT CARD (STYLE ANCIEN) ---

const StatCard = ({ title, value, subtext, color, icon }) => {
  const themes = {
    red: "from-red-50 to-red-100 border-red-200 text-red-600 icon-red-600",
    orange: "from-orange-50 to-orange-100 border-orange-200 text-orange-600 icon-orange-600",
    green: "from-green-50 to-green-100 border-green-200 text-green-600 icon-green-600",
    blue: "from-blue-50 to-blue-100 border-blue-200 text-blue-600 icon-blue-600",
    purple: "from-purple-50 to-purple-100 border-purple-200 text-purple-600 icon-purple-600",
    teal: "from-teal-50 to-teal-100 border-teal-200 text-teal-600 icon-teal-600",
  };

  const currentTheme = themes[color];

  return (
    <Card className={`p-4 bg-gradient-to-br border ${currentTheme.split(' icon-')[0]} shadow-sm rounded-xl`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium mb-0.5">{title}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          <p className="text-xs opacity-80 mt-1">{subtext}</p>
        </div>
        <div className={`${currentTheme.split('icon-')[1]}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
};

// --- AUTRES COMPOSANTS ---

const FilterBar = ({ searchTerm, setSearchTerm, selectedMonth, setSelectedMonth, selectedYear, setSelectedYear, months, placeholder }) => (
  <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 border border-slate-200 rounded-xl shadow-sm">
    <div className="relative flex-1 max-w-md">
      <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
      <input 
        type="text" 
        placeholder={placeholder}
        className="w-full pl-11 pr-4 py-2 text-sm border border-slate-100 rounded-xl bg-slate-50 focus:ring-2 ring-blue-500/10 outline-none transition-all"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
    <div className="flex gap-2">
      <div className="flex items-center bg-white border border-slate-200 rounded-lg px-2">
        <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} className="text-xs font-bold text-slate-600 border-none bg-transparent focus:ring-0 cursor-pointer py-2">
          {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
        <div className="w-px h-4 bg-slate-200 mx-2"></div>
        <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="text-xs font-bold text-slate-600 border-none bg-transparent focus:ring-0 cursor-pointer py-2">
          <option value={2026}>2026</option>
          <option value={2025}>2025</option>
          <option value={2024}>2024</option>
        </select>
      </div>
    </div>
  </div>
);

const TableCard = ({ data, type }) => (
  <Card className="border border-slate-200 shadow-sm overflow-hidden bg-white rounded-xl">
    <table className="w-full text-left">
      <thead className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase text-slate-400 font-bold tracking-wider">
        <tr>
          <th className="px-6 py-5 text-slate-700">{type === 'user' ? 'Collaborateur' : 'Entreprise'}</th>
          <th className="px-6 py-5 text-slate-700">Période</th>
          <th className="px-6 py-5 text-center text-slate-700">Stress</th>
          <th className="px-6 py-5 text-center text-slate-700">Énergie</th>
          <th className="px-6 py-5 text-center text-slate-700">Sommeil</th>
          <th className="px-6 py-5 text-center text-slate-700">Humeur</th>
          <th className="px-6 py-5 text-center text-slate-700">Pression</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
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
            <td className="px-6 py-5 text-slate-400 text-sm text-slate-700">{item.month}</td>
            <td className="px-6 py-5 text-center font-bold text-lg text-slate-700">{Number(item.avg_stress).toFixed(1)}</td>
            <td className="px-6 py-5 text-center font-bold text-lg text-slate-700">{Number(item.avg_energy).toFixed(1)}</td>
            <td className="px-6 py-5 text-center font-bold text-lg text-slate-700">{Number(item.avg_sleep).toFixed(1)}</td>
            <td className="px-6 py-5 text-center font-bold text-lg text-slate-700">{Number(item.avg_mood).toFixed(1)}</td>
            <td className="px-6 py-5 text-center font-bold text-lg text-slate-700">{Number(item.avg_pressure).toFixed(1)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </Card>
);

export default SanteDiagnosticDashboard;