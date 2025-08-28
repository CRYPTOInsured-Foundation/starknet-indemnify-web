import { create } from 'zustand';
import { connect, disconnect } from '@starknet-io/get-starknet';

interface WalletState {
  isConnected: boolean;
  address: string | null;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  isConnected: true,
  address: null,
  isConnecting: false,
  
  connect: async () => {
    set({ isConnecting: true });
    try {
      const starknet = await connect();
      // if (starknet?.isConnected) {
      //   const accounts = await starknet.account.address;
      //   set({ 
      //     isConnected: true, 
      //     address: accounts,
      //     isConnecting: false 
      //   });
      // }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      set({ isConnecting: false });
    }
  },
  
  disconnect: () => {
    disconnect();
    set({ 
      isConnected: false, 
      address: null, 
      isConnecting: false 
    });
  },
}));