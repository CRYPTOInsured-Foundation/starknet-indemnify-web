// "use client";

// import React, { createContext, useContext, useMemo } from "react";
// // import { Atomiq, type AtomiqOptions } from "@atomiqlabs/sdk";
// // import { StarknetChain } from "@atomiqlabs/chain-starknet";
// // import Atomiq from "@atomiqlabs/sdk";
// // import { SDK } from "@atomiqlabs/sdk";
// // import { Atomiq } from "@atomiqlabs/sdk/lib";
// // import { default as Atomiq } from "@atomiqlabs/sdk";





// // Define a React context
// const AtomiqContext = createContext<Atomiq | null>(null);

// export function useAtomiq() {
//   const ctx = useContext(AtomiqContext);
//   if (!ctx) {
//     throw new Error("useAtomiq must be used inside AtomiqProvider");
//   }
//   return ctx;
// }

// // Provider component
// export default function AtomiqProvider({ children }: { children: React.ReactNode }) {
//   const options: AtomiqOptions = {
//     chain: "starknet", // or other chain identifier
//     // supply additional options like network, RPC, etc, if needed
//   };

//   const atomiqClient = useMemo(() => {
//     return new Atomiq(options);
//   }, []);

//   return (
//     <AtomiqContext.Provider value={atomiqClient}>
//       {children}
//     </AtomiqContext.Provider>
//   );
// }
