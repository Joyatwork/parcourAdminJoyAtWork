import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { companiesApi, practitionersApi, challengesApi, Company, Practitioner, Challenge } from '@/lib/api';

// Companies Hooks
export const useCompanies = () => {
  return useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const response = await companiesApi.getAll();
      return response.data;
    },
  });
};

export const useCompany = (id: number) => {
  return useQuery({
    queryKey: ['companies', id],
    queryFn: async () => {
      const response = await companiesApi.getById(id);
      return response.data;
    },
  });
};

export const useCreateCompany = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<Company>) => companiesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
};

export const useUpdateCompany = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Company> }) => 
      companiesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
};

// Practitioners Hooks
export const usePractitioners = () => {
  return useQuery({
    queryKey: ['practitioners'],
    queryFn: async () => {
      const response = await practitionersApi.getAll();
      return response.data;
    },
  });
};

export const usePractitioner = (id: number) => {
  return useQuery({
    queryKey: ['practitioners', id],
    queryFn: async () => {
      const response = await practitionersApi.getById(id);
      return response.data;
    },
  });
};

export const useCreatePractitioner = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<Practitioner>) => practitionersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['practitioners'] });
    },
  });
};

// Challenges Hooks
export const useChallenges = () => {
  return useQuery({
    queryKey: ['challenges'],
    queryFn: async () => {
      const response = await challengesApi.getAll();
      return response.data;
    },
  });
};

export const useChallenge = (id: number) => {
  return useQuery({
    queryKey: ['challenges', id],
    queryFn: async () => {
      const response = await challengesApi.getById(id);
      return response.data;
    },
  });
};

export const useCreateChallenge = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<Challenge>) => challengesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
    },
  });
};
