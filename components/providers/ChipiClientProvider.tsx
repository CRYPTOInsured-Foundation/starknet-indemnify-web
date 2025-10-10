







// // app/providers/ChipiClientProvider.tsx
// 'use client';

// import React from 'react';
// import { ChipiProvider } from '@chipi-pay/chipi-sdk';

// const CHIPI_PUBLIC_KEY = process.env.NEXT_PUBLIC_CHIPI_PUBLIC_KEY || '';
// app/providers/ChipiPayProvider.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ChipiProvider } from '@chipi-pay/chipi-sdk';

// Create context
interface ChipiPayContextType {
  isConnected: boolean;
  walletAddress: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  makePayment: (amount: number, currency?: string) => Promise<any>;
  isLoading: boolean;
  error: string | null;
}

const ChipiPayContext = createContext<ChipiPayContextType>({
  isConnected: false,
  walletAddress: null,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  makePayment: async () => ({}),
  isLoading: false,
  error: null,
});

// Configuration
const CHIPI_PUBLIC_KEY = process.env.NEXT_PUBLIC_CHIPI_PUBLIC_KEY || '';

export default function ChipiClientProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for existing connection on mount
  useEffect(() => {
    const checkConnection = () => {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('chipipay_connection');
        if (saved) {
          const { connected, address } = JSON.parse(saved);
          setIsConnected(connected);
          setWalletAddress(address);
        }
      }
    };
    
    checkConnection();
  }, []);

  const connectWallet = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if ChipiPay is available
      if (typeof window === 'undefined' || !(window as any).chipiPay) {
        throw new Error('ChipiPay wallet not found. Please install the extension.');
      }

      // Use ChipiPay window object directly
      const accounts = await (window as any).chipiPay.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts && accounts.length > 0) {
        const address = accounts[0];
        setWalletAddress(address);
        setIsConnected(true);
        
        // Save to localStorage
        localStorage.setItem('chipipay_connection', JSON.stringify({
          connected: true,
          address: address
        }));
        
        console.log('Connected to ChipiPay:', address);
      }
    } catch (err: any) {
      console.error('Failed to connect to ChipiPay:', err);
      setError(err.message || 'Failed to connect wallet');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setIsConnected(false);
    setError(null);
    
    // Clear localStorage
    localStorage.removeItem('chipipay_connection');
    
    // If ChipiPay has disconnect method
    if ((window as any).chipiPay?.disconnect) {
      (window as any).chipiPay.disconnect();
    }
    
    console.log('Disconnected from ChipiPay');
  };

  const makePayment = async (amount: number, currency: string = 'NGN') => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!isConnected || !walletAddress) {
        throw new Error('Please connect your wallet first');
      }

      // Create payment via your backend API
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
          walletAddress,
          reference: `payment_${Date.now()}`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Payment creation failed');
      }

      const paymentData = await response.json();
      
      // If payment requires redirect to ChipiPay
      if (paymentData.paymentUrl) {
        window.location.href = paymentData.paymentUrl;
        return { redirect: true };
      }
      
      return paymentData;
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const contextValue: ChipiPayContextType = {
    isConnected,
    walletAddress,
    connectWallet,
    disconnectWallet,
    makePayment,
    isLoading,
    error,
  };

  const chipiConfig = {
    apiPublicKey: CHIPI_PUBLIC_KEY,
    enableLogging: process.env.NODE_ENV === 'development',
  };

  return (
    <ChipiProvider config={chipiConfig}>
      <ChipiPayContext.Provider value={contextValue}>
        {children}
      </ChipiPayContext.Provider>
    </ChipiProvider>
  );
}
// export default function ChipiClientProvider({ children }: { children: React.ReactNode }) {
//   const chipiConfig = {
//     apiPublicKey: CHIPI_PUBLIC_KEY,
//     enableLogging: true,
    
//   } as any;

//   return <ChipiProvider 
//   config={chipiConfig}
  
//   >
//     {children}
//     </ChipiProvider>;
// }
