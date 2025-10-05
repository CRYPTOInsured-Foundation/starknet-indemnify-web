'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { useRootStore } from '@/stores/use-root-store';
import { Wallet, PlugZap, Shield } from 'lucide-react';
import ProtectedRoute from '@/components/guards/ProtectedRoute';

const PUB_KEY = process.env.NEXT_PUBLIC_CHIPI_PUBLIC_KEY;

const walletOptions = [
  { id: 'chipi', name: 'Chipi Wallet', description: 'Use Chipi’s built-in DeFi wallet with on-ramp integration.', icon: PlugZap, gradient: 'from-purple-500 to-pink-500' },
  { id: 'argentx', name: 'ArgentX', description: 'Connect via ArgentX browser extension or mobile app.', icon: Shield, gradient: 'from-blue-500 to-teal-400' },
  { id: 'braavos', name: 'Braavos', description: 'Connect securely through the Braavos smart wallet.', icon: Wallet, gradient: 'from-indigo-500 to-purple-400' },
];

export default function SettingsPage() {
  const [selectedWallet, setSelectedWallet] = useState('chipi');
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Use separate selectors for stability
  const connect = useRootStore((s) => s.connect);
  const disconnect = useRootStore((s) => s.disconnect);
  const connectWallet = useRootStore((s) => s.connectWallet);
  const disconnectWallet = useRootStore((s) => s.disconnectWallet);

  // ✅ Restore saved preference once on mount
  useEffect(() => {
    const saved = localStorage.getItem('preferredWallet');
    if (saved) setSelectedWallet(saved);
  }, []);

  // ✅ Only update local state here
  const handleSelectWallet = useCallback((walletId: string) => {
    setSelectedWallet(walletId);
  }, []);

  // ✅ Perform async wallet connection once on click
  const handleSavePreference = useCallback(async () => {
    setIsLoading(true);
    try {
      localStorage.setItem('preferredWallet', selectedWallet);

      // Disconnect both safely (no dependency loop)
      await Promise.allSettled([
        disconnect?.(),
        disconnectWallet?.(),
      ]);

      if (selectedWallet === 'argentx' || selectedWallet === 'braavos') {
        await connectWallet?.();
      } else {
        await connect?.({ encryptKey: PUB_KEY } as any);
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedWallet, connect, disconnect, connectWallet, disconnectWallet]);

  const handleReset = useCallback(() => {
    localStorage.removeItem('preferredWallet');
    setSelectedWallet('chipi');
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0b0b1f] text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Wallet Settings
            </h1>
            <p className="text-gray-400 mt-2">
              Choose your preferred wallet connection method.
            </p>
          </div>

          <Card className="bg-[#141429] border border-gray-800 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Select Wallet</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={selectedWallet}
                onValueChange={handleSelectWallet}
                className="space-y-4"
              >
                {walletOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = selectedWallet === option.id;
                  return (
                    <label
                      key={option.id}
                      htmlFor={option.id}
                      className={cn(
                        'flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer',
                        isSelected
                          ? `border-transparent bg-gradient-to-r ${option.gradient}`
                          : 'border-gray-700 bg-[#1a1a33]'
                      )}
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={cn(
                            'p-3 rounded-xl bg-opacity-10',
                            isSelected
                              ? 'bg-white/20'
                              : 'bg-gradient-to-br from-gray-700 to-gray-800'
                          )}
                        >
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{option.name}</h3>
                          <p className="text-sm text-gray-300">{option.description}</p>
                        </div>
                      </div>
                      {isSelected ? (
                        <Badge
                          variant="secondary"
                          className="bg-white/20 text-white border-none"
                        >
                          Selected
                        </Badge>
                      ) : (
                        <RadioGroupItem value={option.id} id={option.id} />
                      )}
                    </label>
                  );
                })}
              </RadioGroup>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
              onClick={handleReset}
            >
              Reset
            </Button>
            <Button
              disabled={isLoading}
              className={cn(
                'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white',
                isLoading && 'opacity-70 cursor-not-allowed'
              )}
              onClick={handleSavePreference}
            >
              {isLoading ? 'Connecting...' : 'Save Preference'}
            </Button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}














// 'use client';

// import { useState, useEffect } from 'react';
// import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
// import { cn } from '@/lib/utils';
// import { useRootStore } from '@/stores/use-root-store';
// import { Wallet, PlugZap, Shield } from 'lucide-react';
// import ProtectedRoute from '@/components/guards/ProtectedRoute';

// const PUB_KEY = process.env.NEXT_PUBLIC_CHIPI_PUBLIC_KEY;

// const walletOptions = [
//   {
//     id: 'chipi',
//     name: 'Chipi Wallet',
//     description: 'Use Chipi’s built-in DeFi wallet with on-ramp integration.',
//     icon: PlugZap,
//     gradient: 'from-purple-500 to-pink-500',
//   },
//   {
//     id: 'argentx',
//     name: 'ArgentX',
//     description: 'Connect via ArgentX browser extension or mobile app.',
//     icon: Shield,
//     gradient: 'from-blue-500 to-teal-400',
//   },
//   {
//     id: 'braavos',
//     name: 'Braavos',
//     description: 'Connect securely through the Braavos smart wallet.',
//     icon: Wallet,
//     gradient: 'from-indigo-500 to-purple-400',
//   },
// ];

// export default function SettingsPage() {
//   const [selectedWallet, setSelectedWallet] = useState<string>('chipi');

//   // ✅ Zustand stores
//   const { connect: connect, disconnect: disconnect } = useRootStore((s) => ({
//     connect: s.connect,
//     disconnect: s.disconnect,
//   }));

//   const {
//     connectWallet,
//     disconnectWallet,
//     walletType,
//   } = useRootStore((s) => ({
//     connectWallet: s.connectWallet,
//     disconnectWallet: s.disconnectWallet,
//     walletType: s.walletType,
//   }));

//   useEffect(() => {
//     // auto-connect based on saved preference
//     const saved = localStorage.getItem('preferredWallet');
//     if (saved) setSelectedWallet(saved);
//   }, []);

//   const handleSelectWallet = async (walletId: string) => {
//     setSelectedWallet(walletId);
//     localStorage.setItem('preferredWallet', walletId);

//     // Disconnect all first
//     disconnect();
//     await disconnectWallet();

//     // Connect based on choice
//     if (walletId === 'argentX' || 'braavos') {
//       await connectWallet();
//     } else {
//       await connect({ encryptKey: PUB_KEY} as any);
//     }
//   };

//   return (
//     <ProtectedRoute>
//       <div className="min-h-screen bg-[#0b0b1f] text-white py-12 px-4 sm:px-6 lg:px-8">
//         <div className="max-w-3xl mx-auto space-y-8">
//           <div>
//             <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
//               Wallet Settings
//             </h1>
//             <p className="text-gray-400 mt-2">
//               Choose your preferred wallet connection method.
//             </p>
//           </div>

//           <Card className="bg-[#141429] border border-gray-800 shadow-lg">
//             <CardHeader>
//               <CardTitle className="text-xl font-semibold">Select Wallet</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <RadioGroup
//                 value={selectedWallet}
//                 onValueChange={handleSelectWallet}
//                 className="space-y-4"
//               >
//                 {walletOptions.map((option) => {
//                   const Icon = option.icon;
//                   const isSelected = selectedWallet === option.id;
//                   return (
//                     <label
//                       key={option.id}
//                       htmlFor={option.id}
//                       className={cn(
//                         'flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer',
//                         isSelected
//                           ? 'border-transparent bg-gradient-to-r ' + option.gradient
//                           : 'border-gray-700 bg-[#1a1a33]'
//                       )}
//                     >
//                       <div className="flex items-center space-x-4">
//                         <div
//                           className={cn(
//                             'p-3 rounded-xl bg-opacity-10',
//                             isSelected
//                               ? 'bg-white/20'
//                               : 'bg-gradient-to-br from-gray-700 to-gray-800'
//                           )}
//                         >
//                           <Icon className="w-6 h-6 text-white" />
//                         </div>
//                         <div>
//                           <h3 className="font-semibold text-lg">{option.name}</h3>
//                           <p className="text-sm text-gray-300">
//                             {option.description}
//                           </p>
//                         </div>
//                       </div>
//                       {isSelected ? (
//                         <Badge
//                           variant="secondary"
//                           className="bg-white/20 text-white border-none"
//                         >
//                           Selected
//                         </Badge>
//                       ) : (
//                         <RadioGroupItem value={option.id} id={option.id} />
//                       )}
//                     </label>
//                   );
//                 })}
//               </RadioGroup>
//             </CardContent>
//           </Card>

//           <div className="flex justify-end space-x-3">
//             <Button
//               variant="outline"
//               className="border-gray-700 text-gray-300 hover:bg-gray-800"
//               onClick={() => {
//                 localStorage.removeItem('preferredWallet');
//                 setSelectedWallet('chipi');
//               }}
//             >
//               Reset
//             </Button>
//             <Button
//               className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
//               onClick={() => handleSelectWallet(selectedWallet)}
//             >
//               Save Preference
//             </Button>
//           </div>
//         </div>
//       </div>
//     </ProtectedRoute>
//   );
// }
