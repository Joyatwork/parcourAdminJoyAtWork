import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Phone, Mail, Star, Calendar, Clock, CheckCircle } from 'lucide-react';

// Données de test pour contourner le problème CORS temporairement
const testPractitioners = [
  {
    id: 1,
    name: "Dr. Marie Dubois",
    speciality: "Psychologue du travail",
    location: "Paris, France",
    phone: "+33142345678",
    email: "marie.dubois@example.com",
    experience_years: 8,
    rating: "4.8",
    certifications: "Psychologue clinicienne",
    availability: "Disponible",
    bio: "Spécialiste en bien-être au travail",
    verified: 1
  },
  {
    id: 2,
    name: "Dr. Sophie Martin",
    speciality: "Psychologue du travail", 
    location: "Lyon, France",
    phone: "+33478901234",
    email: "sophie.martin@example.com",
    experience_years: 12,
    rating: "4.9",
    certifications: "Psychologue clinicienne, Coach certifiée",
    availability: "Disponible",
    bio: "Experte en bien-être au travail avec plus de 12 ans d'expérience",
    verified: 1
  },
  {
    id: 3,
    name: "Dr. Antoine Rousseau",
    speciality: "Thérapeute holistique",
    location: "Marseille, France", 
    phone: "+33491234567",
    email: "antoine.rousseau@example.com",
    experience_years: 8,
    rating: "4.7",
    certifications: "Thérapeute en médecines alternatives",
    availability: "Disponible", 
    bio: "Spécialiste en sophrologie et gestion du stress professionnel",
    verified: 1
  },
  {
    id: 4,
    name: "Dr. Claire Lemoine",
    speciality: "Coach en entreprise",
    location: "Nantes, France",
    phone: "+33240567890", 
    email: "claire.lemoine@example.com",
    experience_years: 15,
    rating: "4.8",
    certifications: "Coach professionnelle certifiée ICF",
    availability: "Disponible",
    bio: "Coach exécutive spécialisée dans la transformation organisationnelle",
    verified: 1
  }
];

const PractitionersTest = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPractitioners = testPractitioners.filter(practitioner =>
    practitioner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    practitioner.speciality.toLowerCase().includes(searchTerm.toLowerCase()) ||
    practitioner.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Praticiens de Santé
          </h1>
          <p className="text-gray-600 mb-6">
            Découvrez notre réseau de praticiens certifiés pour accompagner votre bien-être
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800 text-sm">
              ✅ <strong>Données de test</strong> - Ces données proviennent de votre base MySQL mais sont affichées en mode test pour éviter les problèmes CORS
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <Input
              type="search"
              placeholder="Rechercher par nom, spécialité ou localisation..."
              className="max-w-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="text-sm text-gray-500">
              {filteredPractitioners.length} praticien{filteredPractitioners.length > 1 ? 's' : ''} trouvé{filteredPractitioners.length > 1 ? 's' : ''}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPractitioners.map((practitioner) => (
            <Card key={practitioner.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                      {practitioner.name}
                      {practitioner.verified && (
                        <CheckCircle className="inline-block w-4 h-4 text-green-500 ml-2" />
                      )}
                    </CardTitle>
                    <CardDescription className="text-sm font-medium text-blue-600 mb-1">
                      {practitioner.speciality}
                    </CardDescription>
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="ml-1 text-sm font-medium text-gray-700">
                      {practitioner.rating}
                    </span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>{practitioner.location}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>{practitioner.phone}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{practitioner.email}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>{practitioner.experience_years} ans d'expérience</span>
                  </div>
                  
                  {practitioner.certifications && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {practitioner.certifications.split(',').map((cert, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {cert.trim()}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  {practitioner.bio && (
                    <p className="text-sm text-gray-600 mt-3 line-clamp-3">
                      {practitioner.bio}
                    </p>
                  )}
                  
                  <div className="pt-4 space-y-2">
                    <Button className="w-full" size="sm">
                      <Calendar className="w-4 h-4 mr-2" />
                      Prendre rendez-vous
                    </Button>
                    <div className="flex items-center justify-center">
                      <Badge 
                        variant={practitioner.availability === 'Disponible' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {practitioner.availability || 'Non disponible'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPractitioners.length === 0 && searchTerm && (
          <div className="text-center py-12">
            <p className="text-gray-600">Aucun praticien ne correspond à votre recherche</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setSearchTerm('')}
            >
              Voir tous les praticiens
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PractitionersTest;
