'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRootStore } from '@/stores/use-root-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Wallet } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const { user, address, connectWallet, isConnecting, restoreConnection } = useRootStore();

  // 🔁 Restore session/wallet on mount
  useEffect(() => {
    restoreConnection();
  }, [restoreConnection]);

  // 🚫 Redirect home if user is not authenticated
  useEffect(() => {
    if (!user) {
      router.replace('/');
    }
  }, [user, router]);

  // 🕒 While checking authentication (initial state)
  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600 text-sm">Checking authentication...</p>
      </div>
    );
  }

  // 🔐 If user is unauthenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md shadow-md">
          <CardContent className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Access Restricted
            </h2>
            <p className="text-gray-600 mb-6">
              You need to be logged in to access this page.
            </p>
            <Button onClick={() => router.push('/auth/login')} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 🧩 If authenticated but wallet not connected
  if (!address) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md shadow-md">
          <CardContent className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-6">
              <Wallet className="h-8 w-8 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Connect Your Wallet
            </h2>
            <p className="text-gray-600 mb-6">
              Please connect your StarkNet wallet to continue.
            </p>
            <Button onClick={() => connectWallet()} disabled={isConnecting} className="w-full">
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ✅ Authenticated + Wallet connected → show protected content
  return <>{children}</>;
}










// 'use client';

// import { useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { useWalletStore } from '@/stores/wallet';
// import { Card, CardContent } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Wallet, Shield } from 'lucide-react';

// interface ProtectedRouteProps {
//   children: React.ReactNode;
// }

// const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
//   const { isConnected, connect, isConnecting } = useWalletStore();
//   const router = useRouter();

//   if (!isConnected) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
//         <Card className="w-full max-w-md">
//           <CardContent className="p-8 text-center">
//             <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
//               <Shield className="h-8 w-8 text-blue-600" />
//             </div>
//             <h2 className="text-2xl font-bold text-gray-900 mb-2">
//               Connect Your Wallet
//             </h2>
//             <p className="text-gray-600 mb-6">
//               To access your dashboard and manage your policies, please connect your StarkNet wallet.
//             </p>
//             <Button onClick={connect} disabled={isConnecting} className="w-full">
//               <Wallet className="h-4 w-4 mr-2" />
//               {isConnecting ? 'Connecting...' : 'Connect Wallet'}
//             </Button>
//             <p className="text-xs text-gray-500 mt-4">
//               Supports ArgentX and Braavos wallets
//             </p>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   return <>{children}</>;
// };

// export default ProtectedRoute;