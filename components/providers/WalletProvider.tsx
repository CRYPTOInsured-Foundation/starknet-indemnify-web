'use client';

import { useEffect } from 'react';
import { useWalletStore } from '@/stores/wallet';
import { setAuthenticated } from '@/lib/auth';

interface WalletProviderProps {
  children: React.ReactNode;
}

const WalletProvider = ({ children }: WalletProviderProps) => {
  const { isConnected } = useWalletStore();

  useEffect(() => {
    setAuthenticated(isConnected);
  }, [isConnected]);

  return <>{children}</>;
};

export default WalletProvider;