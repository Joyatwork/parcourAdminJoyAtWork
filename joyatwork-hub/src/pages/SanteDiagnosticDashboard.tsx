import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Heart, Brain, Zap, Moon, Smile, Target, Shield, Building, User, Filter, Search, Loader2 
} from 'lucide-react';

const SanteDiagnosticDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [companyHealthData, setCompanyHealthData] = useState([]);
  const [usersHealthData, setUsersHealthData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtres
  const [selectedMonth, setSelectedMonth] = useState(0); 
  const [selectedYear, setSelectedYear] = useState(2025);
  const [searchTerm, setSearchTerm] = useState(""); 

  const months = [
    { value: 0, label: 'Tous les mois' },
    { value: 1, label: 'Janvier' }, { value: 2, label: 'Février' }, { value: 3, label: 'Mars' },
    { value: 4, label: 'Avril' }, { value: 5, label: 'Mai' }, { value: 6, label: 'Juin' },
    { value: 7, label: 'Juillet' }, { value: 8, label: 'Août' }, { value: 9, label: 'Septembre' },
    { value: 10, label: 'Octobre' }, { value: 11, label: 'Novembre' }, { value: 12, label: 'Décembre' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [resCompany, resUser] = await Promise.all([
          fetch('http://localhost:8001/api/diagnostics/company-health'),
          fetch('http://localhost:8001/api/diagnostics/user-health')
        ]);
        setCompanyHealthData(await resCompany.json());
        setUsersHealthData(await resUser.json());
      } catch (err) {
        console.error("Erreur API:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filterLogic = (data, searchKey) => {
    return data.filter(item => {
      const matchYear = item.month.startsWith(selectedYear.toString());
      const monthStr = String(selectedMonth).padStart(2, '0');
      const matchMonth = selectedMonth === 0 ? true : item.month === `${selectedYear}-${monthStr}`;
      
      const searchTarget = searchKey === 'user' 
        ? `${item.first_name} ${item.last_name}`.toLowerCase() 
        : item.company_name.toLowerCase();
      
      return matchYear && matchMonth && searchTarget.includes(searchTerm.toLowerCase());
    });
  };

  const filteredCompanies = filterLogic(companyHealthData, 'company');
  const filteredUsers = filterLogic(usersHealthData, 'user');

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-slate-900">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Santé & Diagnostic</h1>
            <p className="text-sm text-gray-500">Portails de suivi analytique (Port 8001)</p>
          </div>
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium">
            <Heart className="w-4 h-4 mr-2" /> Nouveau Bilan
          </Button>
        </div>

        {/* Métriques (Taille normale) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard title="Stress" value="4.2/10" color="red" icon={<Brain className="w-5 h-5"/>} />
          <StatCard title="Énergie" value="7.8/10" color="orange" icon={<Zap className="w-5 h-5"/>} />
          <StatCard title="Sommeil" value="85%" color="purple" icon={<Moon className="w-5 h-5"/>} />
          <StatCard title="Humeur" value="Bien" color="blue" icon={<Smile className="w-5 h-5"/>} />
          <StatCard title="Focus" value="92%" color="teal" icon={<Target className="w-5 h-5"/>} />
          <StatCard title="Score" value="78" color="green" icon={<Shield className="w-5 h-5"/>} />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-white border p-1 h-11 shadow-sm">
            <TabsTrigger value="overview" className="text-sm px-6">Overview</TabsTrigger>
            <TabsTrigger value="entreprises" className="text-sm px-6">Entreprises</TabsTrigger>
            <TabsTrigger value="users" className="text-sm px-6">Utilisateurs</TabsTrigger>
          </TabsList>
          

          {/* TABLEAU ENTREPRISES */}
          <TabsContent value="entreprises" className="space-y-4">
            <FilterBar 
              searchTerm={searchTerm} setSearchTerm={setSearchTerm}
              selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth}
              selectedYear={selectedYear} setSelectedYear={setSelectedYear}
              months={months} placeholder="Rechercher une entreprise..."
            />
            <Card className="border shadow-sm overflow-hidden">
              <table className="w-full text-left bg-white">
                <thead className="bg-gray-100 border-b text-xs uppercase text-gray-600 font-bold">
                  <tr>
                    <th className="px-6 py-4">Entreprise</th>
                    <th className="px-6 py-4">Période</th>
                    <th className="px-6 py-4 text-center">Stress (/10)</th>
                    <th className="px-6 py-4 text-center">Énergie (/10)</th>
                    <th className="px-6 py-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm text-gray-700">
                  {filteredCompanies.map((c, i) => (
                    <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-blue-800">{c.company_name}</td>
                      <td className="px-6 py-4 text-gray-500 font-medium">{c.month}</td>
                      <td className="px-6 py-4 text-center font-bold text-lg">{Number(c.avg_stress).toFixed(1)}</td>
                      <td className="px-6 py-4 text-center font-bold text-lg text-orange-600">{Number(c.avg_energy).toFixed(1)}</td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant="outline" className="px-3 py-1 border-green-200 text-green-700 bg-green-50">Stable</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </TabsContent>

          {/* TABLEAU UTILISATEURS */}
          <TabsContent value="users" className="space-y-4">
            <FilterBar 
              searchTerm={searchTerm} setSearchTerm={setSearchTerm}
              selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth}
              selectedYear={selectedYear} setSelectedYear={setSelectedYear}
              months={months} placeholder="Rechercher un collaborateur..."
            />
            <Card className="border shadow-sm overflow-hidden">
              <table className="w-full text-left bg-white">
                <thead className="bg-gray-100 border-b text-xs uppercase text-gray-600 font-bold">
                  <tr>
                    <th className="px-6 py-4">Collaborateur</th>
                    <th className="px-6 py-4">Mois</th>
                    <th className="px-6 py-4 text-center">Note Stress</th>
                    <th className="px-6 py-4 text-center">Note Énergie</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm text-gray-700">
                  {filteredUsers.map((u, i) => (
                    <tr key={i} className="hover:bg-indigo-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 text-base">
                            {u.first_name} {u.last_name}
                          </span>
                          <span className="text-xs text-blue-600 font-medium">
                            {u.company_name || `Entreprise #${u.entreprise_id}`}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500 font-medium">{u.month}</td>
                      <td className={`px-6 py-4 text-center font-bold text-lg ${Number(u.avg_stress) > 6 ? 'text-red-500' : 'text-gray-900'}`}>
                        {Number(u.avg_stress).toFixed(1)}
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-lg text-orange-500">
                        {Number(u.avg_energy).toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// --- Composants Internes ---

const StatCard = ({ title, value, color, icon }: any) => {
  const themes: any = {
    red: "bg-red-50 border-red-100 text-red-600",
    orange: "bg-orange-50 border-orange-100 text-orange-600",
    green: "bg-green-50 border-green-100 text-green-600",
    blue: "bg-blue-50 border-blue-100 text-blue-600",
    purple: "bg-purple-50 border-purple-100 text-purple-600",
    teal: "bg-teal-50 border-teal-100 text-teal-600",
  };
  return (
    <Card className={`p-4 border flex items-center justify-between shadow-sm ${themes[color]}`}>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">{title}</p>
        <p className="text-xl font-bold text-slate-900">{value}</p>
      </div>
      <div className="p-2 bg-white/80 rounded shadow-sm">{icon}</div>
    </Card>
  );
};

const FilterBar = ({ searchTerm, setSearchTerm, selectedMonth, setSelectedMonth, selectedYear, setSelectedYear, months, placeholder }: any) => (
  <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 border rounded-xl shadow-sm">
    <div className="relative flex-1 max-w-md">
      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
      <input 
        type="text" 
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 text-sm border rounded-lg outline-none bg-gray-50 focus:ring-2 ring-blue-500/20 focus:border-blue-500"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
    <div className="flex gap-3">
      <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} className="text-sm border rounded-lg px-3 py-2 bg-gray-50 outline-none focus:ring-2 ring-blue-500/20">
        {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
      </select>
      <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="text-sm border rounded-lg px-3 py-2 bg-gray-50 outline-none focus:ring-2 ring-blue-500/20">
        <option value={2025}>2025</option>
        <option value={2024}>2024</option>
      </select>
    </div>
  </div>
);

export default SanteDiagnosticDashboard;