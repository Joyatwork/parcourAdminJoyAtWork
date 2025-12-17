import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createPractitioner } from '@/lib/api';
import { toast } from 'sonner';

export const AddPractitionerForm: React.FC = () => {
  const [formData, setFormData] = useState({
    id: '',
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    experience_years: 0,
    rating: 0,
    certifications: '',
    availability: 'Disponible',
    bio: '',
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const practitioner = await createPractitioner({
        ...formData,
        rating: 0,
        availability: 'Disponible',
        verified: false
      });
      
      toast.success('Praticien ajouté avec succès!');
      
      // Reset form
      setFormData({
        id: '',
        first_name: '',
        last_name: '',
        phone: '',
        email: '',
        experience_years: 0,
        rating: 0,
        certifications: '',
        availability: 'Disponible',
        bio: '',
      });
      
      console.log('Praticien créé:', practitioner);
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      toast.error('Erreur lors de l\'ajout du praticien');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'experience_years' ? Number.parseInt(value) || 0 : 
              name === 'rating' ? Number.parseFloat(value) || 0 : value
    }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Ajouter un nouveau praticien</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="id">ID *</Label>
              <Input
                id="id"
                name="id"
                value={formData.id}
                onChange={handleChange}
                required
                placeholder="1"
                type="number"
              />
            </div>

            <div>
              <Label htmlFor="first_name">Prénom *</Label>
              <Input
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                placeholder="Marie"
              />
            </div>

            <div>
              <Label htmlFor="last_name">Nom de famille *</Label>
              <Input
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                placeholder="Dupont"
              />
            </div>
            
            <div>
              <Label htmlFor="phone">Téléphone *</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="+33 6 12 34 56 78"
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="marie.dupont@example.com"
              />
            </div>
            
            <div>
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+33 1 42 34 56 78"
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="jean.dupont@example.com"
              />
            </div>
            
            <div>
              <Label htmlFor="experience_years">Années d'expérience</Label>
              <Input
                id="experience_years"
                name="experience_years"
                type="number"
                min="0"
                value={formData.experience_years}
                onChange={handleChange}
                placeholder="5"
              />
            </div>

            <div>
              <Label htmlFor="rating">Note (0-5)</Label>
              <Input
                id="rating"
                name="rating"
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={formData.rating}
                onChange={handleChange}
                placeholder="4.5"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="certifications">Certifications</Label>
            <Input
              id="certifications"
              name="certifications"
              value={formData.certifications}
              onChange={handleChange}
              placeholder="Psychologue clinicien, Spécialiste RPS"
            />
          </div>

          <div>
            <Label htmlFor="availability">Disponibilité</Label>
            <select
              id="availability"
              name="availability"
              value={formData.availability}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="Disponible">Disponible</option>
              <option value="Occupé">Occupé</option>
              <option value="En congé">En congé</option>
              <option value="Non disponible">Non disponible</option>
            </select>
          </div>
          
          <div>
            <Label htmlFor="bio">Biographie</Label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Décrivez l'expérience et l'expertise du praticien..."
              rows={4}
            />
          </div>
          
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Ajout en cours...' : 'Ajouter le praticien'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
