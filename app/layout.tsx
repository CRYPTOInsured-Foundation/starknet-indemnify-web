import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
// import WalletProvider from '@/components/providers/WalletProvider';
import Script from 'next/script'; // <-- add this
import { ChipiProvider, useChipiContext, type ChipiSDKConfig } from '@chipi-pay/chipi-sdk';

import { StoreProvider } from '@/stores/store-provider';
import { StarknetProvider } from '@/providers/StarknetProvider';
import ChipiClientProvider from '@/components/providers/ChipiClientProvider';
import { useRootStore } from '@/stores/use-root-store';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Starknet-Indemnify - DeFi Insurance on Starknet',
  description: 'Protect your digital assets with comprehensive on-chain insurance solutions on Starknet.',
};

let PUB_KEY = process.env.NEXT_PUBLIC_CHIPI_PUBLIC_KEY!;


const chipiConfig: ChipiSDKConfig = {
  apiPublicKey: process.env.NEXT_PUBLIC_CHIPI_PUBLIC_KEY as string,
  // environment: 'sandbox', // or 'production'
  // enableLogging: true, // optional
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

   
  return (
    <html lang="en">
      <head>
        {/* Persona SDK via next/script */}
        <Script
          src="https://withpersona.com/dist/persona-v4.0.0.js"
          strategy="afterInteractive"
        />
      </head>
      <body className={inter.className}>
              {/* <ChipiClientProvider> */}

          <StoreProvider>
            <StarknetProvider>
                <div className="min-h-screen flex flex-col">
                  <Header />
                  <main className="flex-1">{children}</main>
                  <Footer />
                </div>
            </StarknetProvider>
          </StoreProvider>
              {/* </ChipiClientProvider> */}
      </body>
    </html>
  );
}


// echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p


















// import './globals.css';
// import type { Metadata } from 'next';
// import { Inter } from 'next/font/google';
// import Header from '@/components/layout/Header';
// import Footer from '@/components/layout/Footer';
// import WalletProvider from '@/components/providers/WalletProvider';

// const inter = Inter({ subsets: ['latin'] });

// export const metadata: Metadata = {
//   title: 'StarkInsure - DeFi Insurance on StarkNet',
//   description: 'Protect your digital assets with comprehensive on-chain insurance solutions on StarkNet.',
// };

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html lang="en">
//       <body className={inter.className}>
//         <WalletProvider>
//           <div className="min-h-screen flex flex-col">
//             <Header />
//             <main className="flex-1">
//               {children}
//             </main>
//             <Footer />
//           </div>
//         </WalletProvider>
//       </body>
//     </html>
//   );
// }