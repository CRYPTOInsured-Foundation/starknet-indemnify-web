// // pages/_app.tsx  (or /src/pages/_app.tsx)
// 'use client';

// import type { AppProps } from 'next/app';
// import { ChipiProvider } from '@chipi-pay/chipi-sdk';

// const CHIPI_PUBLIC_KEY = process.env.NEXT_PUBLIC_CHIPI_PUBLIC_KEY || '';

// export default function MyApp({ Component, pageProps }: AppProps) {
//   // Build config using only known/inspected fields.
//   // Replace `apiPublicKey` / `environment` with exact property names from SDK types.
//   const chipiConfig = {
//     apiPublicKey: CHIPI_PUBLIC_KEY,
//     // environment: 'sandbox', // add only if type shows it
//     enableLogging: true, // if present in the types
//   } as any; // temporarily `any` until you confirm types

//   return (
//     <ChipiProvider config={chipiConfig}>
//       <Component {...pageProps} />
//     </ChipiProvider>
//   );
// }
