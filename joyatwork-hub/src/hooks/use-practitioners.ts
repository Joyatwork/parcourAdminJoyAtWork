import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { practitionersApi, createPractitioner, type Practitioner } from '@/lib/api';

export const usePractitioners = () => {
  return useQuery({
    queryKey: ['practitioners'],
    queryFn: async () => {
      try {
        console.log('Tentative de récupération des praticiens...');
        const response = await practitionersApi.getAll();
        console.log('Réponse reçue:', response);
        return response.data;
      } catch (error) {
        console.error('Erreur détaillée:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      console.log(`Tentative ${failureCount}, erreur:`, error);
      return failureCount < 3;
    },
  });
};

export const useCreatePractitioner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPractitioner,
    onSuccess: () => {
      // Invalide et recharge la liste des praticiens
      queryClient.invalidateQueries({ queryKey: ['practitioners'] });
    },
    onError: (error) => {
      console.error('Erreur lors de la création du praticien:', error);
    },
  });
};
