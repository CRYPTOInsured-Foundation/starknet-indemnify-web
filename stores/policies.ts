import { create } from 'zustand';

interface Policy {
  id: string;
  name: string;
  coverage: number;
  premium: number;
  status: 'active' | 'expired' | 'pending';
  expiryDate: Date;
  type: 'defi' | 'smart-contract' | 'liquidity' | 'bridge';
}

interface PoliciesState {
  policies: Policy[];
  loading: boolean;
  addPolicy: (policy: Omit<Policy, 'id'>) => void;
  updatePolicy: (id: string, updates: Partial<Policy>) => void;
  removePolicy: (id: string) => void;
  fetchPolicies: () => Promise<void>;
}

export const usePoliciesStore = create<PoliciesState>((set, get) => ({
  policies: [],
  loading: false,
  
  addPolicy: (policy) => {
    const newPolicy: Policy = {
      ...policy,
      id: Math.random().toString(36).substr(2, 9),
    };
    set((state) => ({
      policies: [...state.policies, newPolicy],
    }));
  },
  
  updatePolicy: (id, updates) => {
    set((state) => ({
      policies: state.policies.map((policy) =>
        policy.id === id ? { ...policy, ...updates } : policy
      ),
    }));
  },
  
  removePolicy: (id) => {
    set((state) => ({
      policies: state.policies.filter((policy) => policy.id !== id),
    }));
  },
  
  fetchPolicies: async () => {
    set({ loading: true });
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockPolicies: Policy[] = [
      {
        id: '1',
        name: 'DeFi Protocol Coverage',
        coverage: 50000,
        premium: 500,
        status: 'active',
        expiryDate: new Date('2024-12-31'),
        type: 'defi',
      },
      {
        id: '2',
        name: 'Smart Contract Protection',
        coverage: 25000,
        premium: 250,
        status: 'active',
        expiryDate: new Date('2024-11-15'),
        type: 'smart-contract',
      },
    ];
    
    set({ policies: mockPolicies, loading: false });
  },
}));