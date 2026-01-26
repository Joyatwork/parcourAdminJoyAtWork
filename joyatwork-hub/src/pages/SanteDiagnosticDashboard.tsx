import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Heart, Brain, Zap, Moon, Smile, Target, Shield, Search, Loader2, Building2, Users 
} from 'lucide-react';

const SanteDiagnosticDashboard = () => {
  const [activeTab, setActiveTab] = useState('entreprises'); // Par défaut sur Entreprises
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

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-gray-50">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-slate-900">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header simple */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Santé & Diagnostic</h1>
            <p className="text-sm text-gray-500">Gestion des indicateurs de bien-être</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium">
            <Heart className="w-4 h-4 mr-2" /> Nouveau Bilan
          </Button>
        </div>

        {/* Métriques Globales (Résumé) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard title="Stress Moyen" value="4.2/10" color="red" icon={<Brain className="w-5 h-5"/>} />
          <StatCard title="Énergie Moyenne" value="7.8/10" color="orange" icon={<Zap className="w-5 h-5"/>} />
          <StatCard title="Qualité Sommeil" value="85%" color="purple" icon={<Moon className="w-5 h-5"/>} />
          <StatCard title="Humeur" value="Bien" color="blue" icon={<Smile className="w-5 h-5"/>} />
          <StatCard title="Focus" value="92%" color="teal" icon={<Target className="w-5 h-5"/>} />
          <StatCard title="Global Score" value="78" color="green" icon={<Shield className="w-5 h-5"/>} />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-white border p-1 h-11 shadow-sm">
            <TabsTrigger value="entreprises" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" /> Entreprises
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" /> Utilisateurs
            </TabsTrigger>
          </TabsList>

          {/* TABLEAU ENTREPRISES */}
          <TabsContent value="entreprises" className="space-y-4">
            <FilterBar 
              searchTerm={searchTerm} setSearchTerm={setSearchTerm}
              selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth}
              selectedYear={selectedYear} setSelectedYear={setSelectedYear}
              months={months} placeholder="Rechercher une entreprise..."
            />
            <Card className="border shadow-sm overflow-hidden bg-white">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b text-xs uppercase text-gray-500 font-bold">
                  <tr>
                    <th className="px-6 py-4">Entreprise</th>
                    <th className="px-6 py-4">Période</th>
                    <th className="px-6 py-4 text-center">Moy. Stress (/10)</th>
                    <th className="px-6 py-4 text-center">Moy. Énergie (/10)</th>
                    <th className="px-6 py-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredCompanies.map((c, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-blue-800">{c.company_name}</td>
                      <td className="px-6 py-4 text-gray-500 font-medium">{c.month}</td>
                      <td className="px-6 py-4 text-center font-bold text-lg">{Number(c.avg_stress).toFixed(1)}</td>
                      <td className="px-6 py-4 text-center font-bold text-lg text-orange-600">{Number(c.avg_energy).toFixed(1)}</td>
                      <td className="px-6 py-4 text-center">
                        <Badge className="bg-green-50 text-green-700 border-green-200 px-3">Stable</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredCompanies.length === 0 && (
                <div className="p-10 text-center text-gray-400">Aucune entreprise trouvée pour ces filtres.</div>
              )}
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
            <Card className="border shadow-sm overflow-hidden bg-white">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b text-xs uppercase text-gray-500 font-bold">
                  <tr>
                    <th className="px-6 py-4">Collaborateur</th>
                    <th className="px-6 py-4">Mois</th>
                    <th className="px-6 py-4 text-center">Score Stress</th>
                    <th className="px-6 py-4 text-center">Score Énergie</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredUsers.map((u, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900">{u.first_name} {u.last_name}</span>
                          <span className="text-xs text-blue-600 font-medium uppercase">{u.company_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500 font-medium">{u.month}</td>
                      <td className={`px-6 py-4 text-center font-bold text-lg ${Number(u.avg_stress) > 6 ? 'text-red-500' : ''}`}>
                        {Number(u.avg_stress).toFixed(1)}
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-lg text-orange-500">
                        {Number(u.avg_energy).toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <div className="p-10 text-center text-gray-400">Aucun collaborateur trouvé pour ces filtres.</div>
              )}
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
    red: "bg-red-50 text-red-600 border-red-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
    green: "bg-green-50 text-green-600 border-green-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    teal: "bg-teal-50 text-teal-600 border-teal-100",
  };
  return (
    <Card className={`p-4 border flex items-center justify-between shadow-sm ${themes[color]}`}>
      <div>
        <p className="text-[10px] font-bold uppercase opacity-70">{title}</p>
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
        className="w-full pl-10 pr-4 py-2 text-sm border rounded-lg outline-none bg-gray-50 focus:ring-2 ring-blue-500/20"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
    <div className="flex gap-3">
      <select 
        value={selectedMonth} 
        onChange={(e) => setSelectedMonth(Number(e.target.value))} 
        className="text-sm border rounded-lg px-3 py-2 bg-gray-50 outline-none focus:border-blue-500"
      >
        {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
      </select>
      <select 
        value={selectedYear} 
        onChange={(e) => setSelectedYear(Number(e.target.value))} 
        className="text-sm border rounded-lg px-3 py-2 bg-gray-50 outline-none focus:border-blue-500"
      >
        <option value={2025}>2025</option>
        <option value={2024}>2024</option>
      </select>
    </div>
  </div>
);

export default SanteDiagnosticDashboard;