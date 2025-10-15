'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
// import { useWalletStore } from '@/stores/wallet';
import { useWalletStore } from '@/stores/use-wallet-store';
import { useRootStore } from '@/stores/use-root-store';
import { Shield, Menu, X, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

// encodeURIComponent("http://localhost:3000")

const Header = () => {
  const pathname = usePathname();
  const router = useRouter();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { 
    isConnected, 
    address, 
    isConnecting, 
    connectWallet, 
    disconnectWallet,
    user,
    isAuthenticated,
    logout,
    loading,
    setLoading

  } = useRootStore();

  console.log("User is Authenticated: ", isAuthenticated);
  console.log("User: ", user);


  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Products', href: '/products' },
    { name: 'Dashboard', href: '/dashboard', protected: true },
  ];

  const formatAddress = (addr: string | null) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <header style={{position: "sticky", top: "0", zIndex: "1"}} className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Starknet-Indemnify</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => {
              if (item.protected && !isAuthenticated) return null;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-blue-600',
                    pathname === item.href
                      ? 'text-blue-600'
                      : 'text-gray-700'
                  )}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

        
          {/* Wallet + Auth Actions */}
<div className="hidden md:flex items-center space-x-4">
  {isConnected ? (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-lg">
        <Wallet className="h-4 w-4 text-green-600" />
        <span className="text-sm font-medium text-gray-700">
          {formatAddress(address)}
        </span>
      </div>
      <Button variant="outline" size="sm" onClick={() => disconnectWallet()}>
        Disconnect
      </Button>
    </div>
  ) : (
    <Button onClick={() => connectWallet()} disabled={isConnecting}>
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </Button>
  )}

   {/* 👇 Auth button toggles between Login and Logout */}
    <Button
  variant={isAuthenticated ? "destructive" : "default"}
  size="sm"
  onClick={async () => {
    if (isAuthenticated) {
      await logout();
    } else {
      router.push("/auth/login");
    }
  }}
>
  {isAuthenticated ? "Logout" : "Login"}
</Button>

</div>


          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t pt-4 pb-4">
            <nav className="flex flex-col space-y-4">
              {navigation.map((item) => {
                if (item.protected && !isConnected) return null;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'text-sm font-medium transition-colors hover:text-blue-600',
                      pathname === item.href
                        ? 'text-blue-600'
                        : 'text-gray-700'
                    )}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Wallet Connection */}
<div className="mt-4 pt-4 border-t space-y-2">
  {isConnected ? (
    <>
      <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg">
        <Wallet className="h-4 w-4 text-green-600" />
        <span className="text-sm font-medium text-gray-700">
          {formatAddress(address)}
        </span>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => disconnectWallet()}
        className="w-full"
      >
        Disconnect
      </Button>
    </>
  ) : (
    <Button
      onClick={() => connectWallet()}
      disabled={isConnecting}
      className="w-full"
    >
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </Button>
  )}

  {/* 👇 Logout button for mobile */}

  <Button
  variant={isAuthenticated ? "destructive" : "default"}
  size="sm"
  className="w-full"
  onClick={async () => {
    if (isAuthenticated) {
      await logout();
    } else {
      window.location.href = "/auth/login";
    }
    setIsMenuOpen(false);
  }}
>
  {isAuthenticated ? "Logout" : "Login"}
</Button>
  
</div>

          </div>
        )}
      </div>
    </header>
  );
};

export default Header;