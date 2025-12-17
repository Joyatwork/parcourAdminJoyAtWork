import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const TestNavigation = () => {
  const routes = [
    { path: '/', label: 'Dashboard Principal', description: 'Page d\'accueil avec overview' },
    { path: '/practitioners', label: 'Praticiens', description: 'Gestion des praticiens' },
    { path: '/companies', label: 'Entreprises', description: 'Gestion des entreprises' },
    { path: '/challenges', label: 'Challenges', description: 'Défis et challenges' },
    { path: '/sante-diagnostic', label: 'Diagnostic Santé', description: 'Auto-diagnostic de santé' },
    { path: '/rendez-vous', label: 'Rendez-vous', description: 'Gestion des RDV' },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Test de Navigation - Joyatwork Hub</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {routes.map((route) => (
          <Card key={route.path} className="p-4">
            <h3 className="font-semibold mb-2">{route.label}</h3>
            <p className="text-sm text-muted-foreground mb-4">{route.description}</p>
            <Link to={route.path}>
              <Button className="w-full" size="sm">
                Aller à {route.label}
              </Button>
            </Link>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Test des URLs directes</h2>
        <div className="space-y-2">
          {routes.map((route) => (
            <div key={route.path} className="flex items-center gap-4">
              <code className="bg-gray-100 px-2 py-1 rounded">http://localhost:3001{route.path}</code>
              <a 
                href={`http://localhost:3001${route.path}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Tester dans un nouvel onglet
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestNavigation;