import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  Cell,
  LineChart,
  Line
} from "recharts";
import { MediaContent } from "@/types/content";
import { TrendingUp, TrendingDown, Eye, Clock, Star } from "lucide-react";

interface ContentStatsProps {
  contents: MediaContent[];
}

export function ContentStats({ contents }: ContentStatsProps) {
  const totalViews = contents.reduce((acc, c) => acc + c.views, 0);
  const avgRating = contents.filter(c => c.rating).length > 0
    ? contents.reduce((acc, c) => acc + (c.rating || 0), 0) / contents.filter(c => c.rating).length
    : 0;
  const avgCompletion = contents.length > 0
    ? contents.reduce((acc, c) => acc + c.completionRate, 0) / contents.length
    : 0;

  const topPerformers = contents
    .filter(c => c.status === 'published')
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  const typeDistribution = contents.reduce((acc, content) => {
    const type = content.type;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const typeData = Object.entries(typeDistribution).map(([type, count]) => ({
    name: type,
    value: count,
    percentage: ((count / contents.length) * 100).toFixed(1)
  }));

  const thematicStats = contents.reduce((acc, content) => {
    content.thematic.forEach(theme => {
      if (!acc[theme]) {
        acc[theme] = { name: theme, usage: 0, views: 0 };
      }
      acc[theme].usage += 1;
      acc[theme].views += content.views;
    });
    return acc;
  }, {} as Record<string, { name: string; usage: number; views: number }>);

  const thematicData = Object.values(thematicStats)
    .sort((a, b) => b.views - a.views)
    .slice(0, 6);

  const monthlyTrend = [
    { month: 'Jan', views: 1200, contents: 45 },
    { month: 'Fév', views: 1350, contents: 48 },
    { month: 'Mar', views: 1100, contents: 46 },
    { month: 'Avr', views: 1600, contents: 52 },
    { month: 'Mai', views: 1800, contents: 55 },
    { month: 'Juin', views: 2100, contents: 58 },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vues totales</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
            <p className="text-xs text-green-600">+15% vs mois dernier</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux complétion</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgCompletion.toFixed(1)}%</div>
            <p className="text-xs text-green-600">+3.2% vs mois dernier</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Note moyenne</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgRating.toFixed(1)}/5</div>
            <p className="text-xs text-muted-foreground">Très satisfaisant</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.4/10</div>
            <p className="text-xs text-green-600">Score d'engagement</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Évolution des vues mensuelles</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Répartition par type de contenu</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                >
                  {typeData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thématiques les plus populaires</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={thematicData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="views" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contenus à optimiser</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 border-l-4 border-red-500 bg-red-50 rounded">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <span className="font-medium text-red-700">3 contenus peu consultés</span>
                </div>
                <p className="text-sm text-red-600 mt-1">Moins de 50 vues en 30 jours</p>
                <Button size="sm" variant="outline" className="mt-2">
                  Voir détails
                </Button>
              </div>

              <div className="p-3 border-l-4 border-yellow-500 bg-yellow-50 rounded">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium text-yellow-700">5 contenus à rafraîchir</span>
                </div>
                <p className="text-sm text-yellow-600 mt-1">Taux de complétion en baisse</p>
                <Button size="sm" variant="outline" className="mt-2">
                  Analyser
                </Button>
              </div>

              <div className="p-3 border-l-4 border-green-500 bg-green-50 rounded">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-700">2 contenus à promouvoir</span>
                </div>
                <p className="text-sm text-green-600 mt-1">Excellent potentiel détecté</p>
                <Button size="sm" variant="outline" className="mt-2">
                  Promouvoir
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top 5 des contenus les plus consultés</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contenu</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Vues</TableHead>
                <TableHead>Taux complétion</TableHead>
                <TableHead>Note</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topPerformers.map((content) => (
                <TableRow key={content.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div>{content.title}</div>
                      <div className="text-xs text-muted-foreground">{content.author}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{content.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      {content.views.toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${content.completionRate}%` }}
                        />
                      </div>
                      <span className="text-sm">{content.completionRate}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {content.rating ? (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{content.rating.toFixed(1)}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {content.isHotContent && (
                      <Badge className="bg-orange-100 text-orange-800">🔥 Populaire</Badge>
                    )}
                    {content.isPinned && (
                      <Badge className="bg-blue-100 text-blue-800">📌 Épinglé</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
