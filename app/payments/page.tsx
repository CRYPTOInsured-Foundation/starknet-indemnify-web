"use client";

import { useEffect, useState } from "react";
import { useRootStore } from "@/stores/use-root-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  CallData,
  hash,
  uint256,
  type AccountInterface,
  type ProviderInterface,
  type InvokeFunctionResponse,
  type GetTransactionReceiptResponse,
} from "starknet";

export default function PaymentPage() {
  const {
    user,
    account,
    provider,
    proposals,
    fetchProposalsByUser,
    premiumPayments,
    fetchPremiumPaymentsByUser,
    createPremiumPayment,
    claimSettlements,
    fetchClaimSettlementsByUser,
    tokenPurchases,
    fetchTokenPurchasesByUser,
    createTokenPurchase,
    tokenRecoveries,
    fetchTokenRecoveriesBySeller,
    createTokenRecovery,
    restoreConnection,
    address
  } = useRootStore();

  const [selectedProposalId, setSelectedProposalId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [buyQuantity, setBuyQuantity] = useState<string>("100");
  const [sellQuantity, setSellQuantity] = useState<string>("50");

  useEffect(() => {
    restoreConnection();
  }, [restoreConnection]);


  useEffect(() => {
    if (user?.id) {
      fetchProposalsByUser(user.id);
      fetchPremiumPaymentsByUser(user.id);
      fetchClaimSettlementsByUser(user.id);
      fetchTokenPurchasesByUser(user.id);
      fetchTokenRecoveriesBySeller(user.walletAddress);
    }
  }, [user]);

  // Filter approved proposals
  const approvedProposals = proposals.filter(
    (p) => p.riskAnalyticsApproved && p.governanceApproved && !p.isPremiumPaid
  );

  console.log("Approved Propsals: ", approvedProposals)

  // ✅ On-chain Premium Payment
  const handlePayPremium = async () => {
    if (!selectedProposalId) {
      toast.error("Please select an approved proposal to pay for.");
      return;
    }

    const proposal = proposals.find((p) => p.id === selectedProposalId);
    if (!proposal) {
      toast.error("Proposal not found.");
      return;
    }

    setIsSubmitting(true);
    try {

      console.log("prposal id: ", proposal.proposalId)
      const calldata = CallData.compile({
        proposal_id: uint256.bnToUint256(BigInt(parseInt(proposal.proposalId))),
        payer_address: address as string,
      });

      const contractAddress = process.env.NEXT_PUBLIC_TREASURY_CONTRACT!;
      const call = {
        contractAddress,
        entrypoint: "pay_premium",
        calldata: calldata,
      };

      const result: InvokeFunctionResponse = await (account as AccountInterface).execute(call);
      await (provider as ProviderInterface).waitForTransaction(result.transaction_hash);

      const receipt: GetTransactionReceiptResponse =
        await (provider as ProviderInterface).getTransactionReceipt(result.transaction_hash);

      const eventSelector = hash.getSelectorFromName("PremiumPaymentRecorded");
      const event = "events" in receipt
        ? (receipt.events as any[]).find((e) => e.keys[0].toLowerCase() === eventSelector.toLowerCase())
        : null;

      if (!event) throw new Error("PremiumPaymentRecorded event not found");

      const onChainTxnId = event.data[0];
      toast.success("✅ Premium payment successful on-chain!");

      // Save off-chain
      const payload = {
        transactionId: onChainTxnId,
        proposal,
        policyholder: user,
        payerAddress: user?.walletAddress,
        amountPaid: proposal.premiumPayable,
        sumInsured: proposal.sumInsured,
        paymentDate: new Date().toISOString(),
        txnHash: result.transaction_hash,
        paymentStatus: "COMPLETED",
      };

      const resultOffChain = await createPremiumPayment(payload);
      if (resultOffChain.success) {
        toast.success("✅ Premium payment recorded off-chain!");
        fetchPremiumPaymentsByUser(user?.id as string);
      }
    } catch (err: any) {
      toast.error(err?.message || "Premium payment failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ On-chain Token Purchase (Dynamic Quantity)
  const handleBuyToken = async () => {
    if (!buyQuantity || isNaN(Number(buyQuantity)) || Number(buyQuantity) <= 0) {
      toast.error("Please enter a valid quantity to buy.");
      return;
    }

    setIsSubmitting(true);
    try {
      const calldata = CallData.compile({
        buyer_address: user?.walletAddress as string,
        quantity: uint256.bnToUint256(BigInt(buyQuantity)),
      });

      const contractAddress = process.env.NEXT_PUBLIC_TREASURY_CONTRACT!;
      const call = {
        contractAddress,
        entrypoint: "purchase_stindem",
        calldata,
      };

      const result: InvokeFunctionResponse = await (account as AccountInterface).execute(call);
      await (provider as ProviderInterface).waitForTransaction(result.transaction_hash);

      const receipt: GetTransactionReceiptResponse =
        await (provider as ProviderInterface).getTransactionReceipt(result.transaction_hash);

      const eventSelector = hash.getSelectorFromName("StindemPurchased");
      const event = "events" in receipt
        ? (receipt.events as any[]).find((e) => e.keys[0].toLowerCase() === eventSelector.toLowerCase())
        : null;

      if (!event) throw new Error("StindemPurchased event not found");

      const onChainTxnId = event.data[0];
      toast.success(`✅ Purchased ${buyQuantity} STINDEM tokens on-chain!`);

      const payload = {
        transactionId: onChainTxnId,
        buyer: user,
        tokenAddress: process.env.NEXT_PUBLIC_STINDEM_ADDRESS!,
        tokenSymbol: "STINDEM",
        quantity: buyQuantity,
        unitPrice: "1",
        totalPricePaid: buyQuantity,
        paymentDate: new Date().toISOString(),
        txnHash: result.transaction_hash,
        paymentStatus: "COMPLETED",
      };

      const resultOffChain = await createTokenPurchase(payload);
      if (resultOffChain.success) toast.success("✅ Token purchase recorded off-chain!");
    } catch (err: any) {
      toast.error(err?.message || "Token purchase failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ On-chain Token Recovery (Dynamic Quantity)
  const handleSellToken = async () => {
    if (!sellQuantity || isNaN(Number(sellQuantity)) || Number(sellQuantity) <= 0) {
      toast.error("Please enter a valid quantity to sell.");
      return;
    }

    setIsSubmitting(true);
    try {
      const calldata = CallData.compile({
        seller_address: user?.walletAddress as string,
        quantity: uint256.bnToUint256(BigInt(sellQuantity)),
      });

      const contractAddress = process.env.NEXT_PUBLIC_TREASURY_CONTRACT!;
      const call = {
        contractAddress,
        entrypoint: "recover_stindem_from_market",
        calldata,
      };

      const result: InvokeFunctionResponse = await (account as AccountInterface).execute(call);
      await (provider as ProviderInterface).waitForTransaction(result.transaction_hash);

      const receipt: GetTransactionReceiptResponse =
        await (provider as ProviderInterface).getTransactionReceipt(result.transaction_hash);

      const eventSelector = hash.getSelectorFromName("StindemRecovered");
      const event = "events" in receipt
        ? (receipt.events as any[]).find((e) => e.keys[0].toLowerCase() === eventSelector.toLowerCase())
        : null;

      if (!event) throw new Error("StindemRecovered event not found");

      const onChainTxnId = event.data[0];
      toast.success(`✅ Sold ${sellQuantity} STINDEM tokens on-chain!`);

      const payload = {
        transactionId: onChainTxnId,
        sellerAddress: user?.walletAddress,
        buyerAddress: "0xRECOVERY",
        tokenAddress: process.env.NEXT_PUBLIC_NATIVE_TOKEN!,
        tokenSymbol: "STINDEM",
        quantity: sellQuantity,
        unitPrice: "1",
        totalPricePaid: sellQuantity,
        paymentDate: new Date().toISOString(),
        txnHash: result.transaction_hash,
        paymentStatus: "COMPLETED",
      };

      const resultOffChain = await createTokenRecovery(payload);
      if (resultOffChain.success) toast.success("✅ Token sale recorded off-chain!");
    } catch (err: any) {
      toast.error(err?.message || "Token sale failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center">Payment Dashboard</h1>

      <Tabs defaultValue="premium">
        <TabsList className="grid grid-cols-4 gap-2">
          <TabsTrigger value="premium">Premium Payments</TabsTrigger>
          <TabsTrigger value="claims">Claim Settlements</TabsTrigger>
          <TabsTrigger value="purchase">Buy Tokens</TabsTrigger>
          <TabsTrigger value="sales">Sell Tokens</TabsTrigger>
        </TabsList>

        {/* 💰 Premium Payments */}
        <TabsContent value="premium">
          <Card>
            <CardHeader>
              <CardTitle>Pay Premium for Approved Proposals</CardTitle>
            </CardHeader>
            <CardContent>
              <select
                className="border p-2 rounded w-full mb-4"
                value={selectedProposalId}
                onChange={(e) => setSelectedProposalId(e.target.value)}
              >
                <option value="">Select Approved Proposal</option>
                {approvedProposals.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.subjectMatter} — ₦{p.premiumPayable}
                  </option>
                ))}
              </select>

              <Button onClick={() => handlePayPremium()} disabled={isSubmitting}>
                {isSubmitting ? "Processing..." : "Pay Premium"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 🪙 Token Purchases */}
        <TabsContent value="purchase">
          <Card>
            <CardHeader>
              <CardTitle>Buy Native Tokens</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="number"
                placeholder="Enter quantity to buy"
                value={buyQuantity}
                onChange={(e) => setBuyQuantity(e.target.value)}
                className="mb-4"
              />
              <Button onClick={handleBuyToken} disabled={isSubmitting}>
                {isSubmitting ? "Processing..." : `Buy ${buyQuantity || 0} STINDEM Tokens`}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 💸 Token Recoveries (Sales) */}
        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle>Sell Native Tokens</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="number"
                placeholder="Enter quantity to sell"
                value={sellQuantity}
                onChange={(e) => setSellQuantity(e.target.value)}
                className="mb-4"
              />
              <Button onClick={handleSellToken} disabled={isSubmitting}>
                {isSubmitting ? "Processing..." : `Sell ${sellQuantity || 0} STINDEM Tokens`}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}













// "use client";

// import { useEffect, useState } from "react";
// import { useRootStore } from "@/stores/use-root-store";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { toast } from "sonner";
// import { CallData, hash, uint256, type AccountInterface, type ProviderInterface, type InvokeFunctionResponse, type GetTransactionReceiptResponse } from "starknet";

// export default function PaymentPage() {
//   const {
//     user,
//     account,
//     provider,
//     proposals,
//     fetchProposalsByUser,
//     premiumPayments,
//     fetchPremiumPaymentsByUser,
//     createPremiumPayment,
//     claimSettlements,
//     fetchClaimSettlementsByUser,
//     tokenPurchases,
//     fetchTokenPurchasesByUser,
//     createTokenPurchase,
//     tokenRecoveries,
//     fetchTokenRecoveriesBySeller,
//     createTokenRecovery,
//   } = useRootStore();

//   const [selectedProposalId, setSelectedProposalId] = useState<string>("");
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   useEffect(() => {
//     if (user?.id) {
//       fetchProposalsByUser(user.id);
//       fetchPremiumPaymentsByUser(user.id);
//       fetchClaimSettlementsByUser(user.id);
//       fetchTokenPurchasesByUser(user.id);
//       fetchTokenRecoveriesBySeller(user.walletAddress);
//     }
//   }, [user]);

//   // Filter approved proposals
//   const approvedProposals = proposals.filter(
//     (p) => p.riskAnalyticsApproved && p.governanceApproved && !p.isPremiumPaid
//   );

//   // ✅ On-chain Premium Payment
//   const handlePayPremium = async () => {
//     if (!selectedProposalId) {
//       toast.error("Please select an approved proposal to pay for.");
//       return;
//     }

//     const proposal = proposals.find((p) => p.id === selectedProposalId);
//     if (!proposal) {
//       toast.error("Proposal not found.");
//       return;
//     }

//     setIsSubmitting(true);
//     try {
//       const calldata = CallData.compile({
//         proposal_id: uint256.bnToUint256(BigInt(proposal.id)),
//         payer_address: user?.walletAddress as string,
//       });

//       const contractAddress = process.env.NEXT_PUBLIC_TREASURY_CONTRACT!;
//       const call = {
//         contractAddress,
//         entrypoint: "pay_premium",
//         calldata,
//       };

//       const result: InvokeFunctionResponse = await (account as AccountInterface).execute(call);
//       await (provider as ProviderInterface).waitForTransaction(result.transaction_hash);

//       const receipt: GetTransactionReceiptResponse =
//         await (provider as ProviderInterface).getTransactionReceipt(result.transaction_hash);

//       const eventSelector = hash.getSelectorFromName("PremiumPaymentRecorded");
//       const event = "events" in receipt
//         ? (receipt.events as any[]).find((e) => e.keys[0].toLowerCase() === eventSelector.toLowerCase())
//         : null;

//       if (!event) throw new Error("PremiumPaymentRecorded event not found");

//       const onChainTxnId = event.data[0];
//       toast.success("✅ Premium payment successful on-chain!");

//       // Save off-chain
//       const payload = {
//         transactionId: onChainTxnId,
//         proposal,
//         policyholder: user,
//         payerAddress: user?.walletAddress,
//         amountPaid: proposal.premiumPayable,
//         sumInsured: proposal.sumInsured,
//         paymentDate: new Date().toISOString(),
//         txnHash: result.transaction_hash,
//         paymentStatus: "COMPLETED",
//       };

//       const resultOffChain = await createPremiumPayment(payload);
//       if (resultOffChain.success) {
//         toast.success("✅ Premium payment recorded off-chain!");
//         fetchPremiumPaymentsByUser(user?.id as string);
//       }
//     } catch (err: any) {
//       toast.error(err?.message || "Premium payment failed");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // ✅ On-chain Token Purchase
//   const handleBuyToken = async () => {
//     setIsSubmitting(true);
//     try {
//       const calldata = CallData.compile({
//         buyer_address: user?.walletAddress as string,
//         quantity: uint256.bnToUint256(BigInt(100)),
//       });

//       const contractAddress = process.env.NEXT_PUBLIC_TREASURY_CONTRACT!;
//       const call = {
//         contractAddress,
//         entrypoint: "purchase_stindem",
//         calldata,
//       };

//       const result: InvokeFunctionResponse = await (account as AccountInterface).execute(call);
//       await (provider as ProviderInterface).waitForTransaction(result.transaction_hash);

//       const receipt: GetTransactionReceiptResponse =
//         await (provider as ProviderInterface).getTransactionReceipt(result.transaction_hash);

//       const eventSelector = hash.getSelectorFromName("StindemPurchased");
//       const event = "events" in receipt
//         ? (receipt.events as any[]).find((e) => e.keys[0].toLowerCase() === eventSelector.toLowerCase())
//         : null;

//       if (!event) throw new Error("StindemPurchased event not found");

//       const onChainTxnId = event.data[0];
//       toast.success("✅ STINDEM tokens purchased on-chain!");

//       const payload = {
//         transactionId: onChainTxnId,
//         buyer: user,
//         tokenAddress: process.env.NEXT_PUBLIC_STINDEM_ADDRESS!,
//         tokenSymbol: "STINDEM",
//         quantity: "100",
//         unitPrice: "1",
//         totalPricePaid: "100",
//         paymentDate: new Date().toISOString(),
//         txnHash: result.transaction_hash,
//         paymentStatus: "COMPLETED",
//       };

//       const resultOffChain = await createTokenPurchase(payload);
//       if (resultOffChain.success) toast.success("✅ Token purchase recorded off-chain!");
//     } catch (err: any) {
//       toast.error(err?.message || "Token purchase failed");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // ✅ On-chain Token Recovery (Sell)
//   const handleSellToken = async () => {
//     setIsSubmitting(true);
//     try {
//       const calldata = CallData.compile({
//         seller_address: user?.walletAddress as string,
//         quantity: uint256.bnToUint256(BigInt(50)),
//       });

//       const contractAddress = process.env.NEXT_PUBLIC_TREASURY_CONTRACT!;
//       const call = {
//         contractAddress,
//         entrypoint: "recover_stindem_from_market",
//         calldata,
//       };

//       const result: InvokeFunctionResponse = await (account as AccountInterface).execute(call);
//       await (provider as ProviderInterface).waitForTransaction(result.transaction_hash);

//       const receipt: GetTransactionReceiptResponse =
//         await (provider as ProviderInterface).getTransactionReceipt(result.transaction_hash);

//       const eventSelector = hash.getSelectorFromName("StindemRecovered");
//       const event = "events" in receipt
//         ? (receipt.events as any[]).find((e) => e.keys[0].toLowerCase() === eventSelector.toLowerCase())
//         : null;

//       if (!event) throw new Error("StindemRecovered event not found");

//       const onChainTxnId = event.data[0];
//       toast.success("✅ STINDEM recovery successful on-chain!");

//       const payload = {
//         transactionId: onChainTxnId,
//         sellerAddress: user?.walletAddress,
//         buyerAddress: "0xRECOVERY",
//         tokenAddress: process.env.NEXT_PUBLIC_NATIVE_TOKEN!,
//         tokenSymbol: "STINDEM",
//         quantity: "50",
//         unitPrice: "1",
//         totalPricePaid: "50",
//         paymentDate: new Date().toISOString(),
//         txnHash: result.transaction_hash,
//         paymentStatus: "COMPLETED",
//       };

//       const resultOffChain = await createTokenRecovery(payload);
//       if (resultOffChain.success) toast.success("✅ Token sale recorded off-chain!");
//     } catch (err: any) {
//       toast.error(err?.message || "Token sale failed");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="p-6 space-y-6">
//       <h1 className="text-3xl font-bold text-center">Payment Dashboard</h1>

//       <Tabs defaultValue="premium">
//         <TabsList className="grid grid-cols-4 gap-2">
//           <TabsTrigger value="premium">Premium Payments</TabsTrigger>
//           <TabsTrigger value="claims">Claim Settlements</TabsTrigger>
//           <TabsTrigger value="purchase">Buy Tokens</TabsTrigger>
//           <TabsTrigger value="sales">Sell Tokens</TabsTrigger>
//         </TabsList>

//         {/* 💰 Premium Payments */}
//         <TabsContent value="premium">
//           <Card>
//             <CardHeader>
//               <CardTitle>Pay Premium for Approved Proposals</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <select
//                 className="border p-2 rounded w-full mb-4"
//                 value={selectedProposalId}
//                 onChange={(e) => setSelectedProposalId(e.target.value)}
//               >
//                 <option value="">Select Approved Proposal</option>
//                 {approvedProposals.map((p) => (
//                   <option key={p.id} value={p.id}>
//                     {p.subjectMatter} — ₦{p.premiumPayable}
//                   </option>
//                 ))}
//               </select>

//               <Button onClick={handlePayPremium} disabled={isSubmitting}>
//                 {isSubmitting ? "Processing..." : "Pay Premium"}
//               </Button>

//               <div className="mt-6">
//                 <h3 className="text-lg font-semibold">Your Premium Payments</h3>
//                 <ul className="mt-2 space-y-2">
//                   {premiumPayments.map((p) => (
//                     <li key={p.id} className="border p-2 rounded">
//                       {p.proposal?.subjectMatter} — ₦{p.amountPaid} ({p.paymentStatus})
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* 🏦 Claim Settlements */}
//         <TabsContent value="claims">
//           <Card>
//             <CardHeader>
//               <CardTitle>Your Claim Settlements</CardTitle>
//             </CardHeader>
//             <CardContent>
//               {claimSettlements.length === 0 ? (
//                 <p>No settlements found.</p>
//               ) : (
//                 <ul className="space-y-2">
//                   {claimSettlements.map((s) => (
//                     <li key={s.id} className="border p-2 rounded">
//                       Claim: {s.claim?.id} — ₦{s.approvedSettlementAmount} ({s.settlementStatus})
//                     </li>
//                   ))}
//                 </ul>
//               )}
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* 🪙 Token Purchases */}
//         <TabsContent value="purchase">
//           <Card>
//             <CardHeader>
//               <CardTitle>Buy Native Tokens</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <Button onClick={handleBuyToken} disabled={isSubmitting}>
//                 {isSubmitting ? "Processing..." : "Buy 100 STINDEM Tokens"}
//               </Button>

//               <div className="mt-6">
//                 <h3 className="text-lg font-semibold">Purchase History</h3>
//                 <ul className="mt-2 space-y-2">
//                   {tokenPurchases.map((p) => (
//                     <li key={p.id} className="border p-2 rounded">
//                       {p.quantity} STINDEM — ₦{p.totalPricePaid} ({p.paymentStatus})
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* 💸 Token Recoveries (Sales) */}
//         <TabsContent value="sales">
//           <Card>
//             <CardHeader>
//               <CardTitle>Sell Native Tokens (Recovered)</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <Button onClick={handleSellToken} disabled={isSubmitting}>
//                 {isSubmitting ? "Processing..." : "Sell 50 STINDEM Tokens"}
//               </Button>

//               <div className="mt-6">
//                 <h3 className="text-lg font-semibold">Sales History</h3>
//                 <ul className="mt-2 space-y-2">
//                   {tokenRecoveries.map((r) => (
//                     <li key={r.id} className="border p-2 rounded">
//                       {r.quantity} STINDEM — ₦{r.totalPricePaid} ({r.paymentStatus})
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// }













// "use client";

// import { useEffect, useState } from "react";
// import { useRootStore } from "@/stores/use-root-store"; 
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { toast } from "sonner";

// export default function PaymentPage() {
//   const {
//     user,
//     proposals,
//     fetchProposalsByUser,
//     premiumPayments,
//     fetchPremiumPaymentsByUser,
//     createPremiumPayment,
//     claimSettlements,
//     fetchClaimSettlementsByUser,
//     tokenPurchases,
//     fetchTokenPurchasesByUser,
//     createTokenPurchase,
//     tokenRecoveries,
//     fetchTokenRecoveriesBySeller,
//     createTokenRecovery,
//   } = useRootStore();


//   const [selectedProposalId, setSelectedProposalId] = useState<string>("");

//   useEffect(() => {
//     if (user?.id) {
//       fetchProposalsByUser(user.id);
//       fetchPremiumPaymentsByUser(user.id);
//       fetchClaimSettlementsByUser(user.id);
//       fetchTokenPurchasesByUser(user.id);
//       fetchTokenRecoveriesBySeller(user.walletAddress);
//     }
//   }, [user]);

//   // ✅ Filter approved proposals eligible for premium payment
//   const approvedProposals = proposals.filter(
//     (p) => p.riskAnalyticsApproved && p.governanceApproved && !p.isPremiumPaid
//   );

//   // ✅ Handle premium payment
//   const handlePayPremium = async () => {
//     if (!selectedProposalId) {
//       toast.error("Please select an approved proposal to pay for.");
//       return;
//     }

//     const proposal = proposals.find((p) => p.id === selectedProposalId);
//     if (!proposal) {
//       toast.error("Proposal not found.");
//       return;
//     }

//     try {
//       const payload = {
//         transactionId: `txn_${Date.now()}`,
//         proposal,
//         policyholder: user,
//         payerAddress: user?.walletAddress,
//         amountPaid: proposal.premiumPayable,
//         sumInsured: proposal.sumInsured,
//         paymentDate: new Date().toISOString(),
//         txnHash: `0xTEMP${Date.now().toString(16)}`, // temporary hash (simulate)
//         paymentStatus: "COMPLETED",
//       };

//       const result = await createPremiumPayment(payload);
//       if (result.success) {
//         toast.success("✅ Premium payment recorded successfully!");
//       } else {
//         toast.error("❌ Failed to create premium payment");
//       }
//     } catch (err: any) {
//       toast.error(err?.message || "Failed to process payment");
//     }
//   };

//   // ✅ Handle token purchase
//   const handleBuyToken = async () => {
//     try {
//       const payload = {
//         transactionId: `buy_${Date.now()}`,
//         buyer: user,
//         tokenAddress: process.env.NEXT_PUBLIC_NATIVE_TOKEN!,
//         tokenSymbol: "INDM",
//         quantity: "100",
//         unitPrice: "1",
//         totalPricePaid: "100",
//         paymentDate: new Date().toISOString(),
//         txnHash: `0xBUY${Date.now().toString(16)}`,
//         paymentStatus: "COMPLETED",
//       };

//       const result = await createTokenPurchase(payload);
//       if (result.success) toast.success("✅ Token purchase successful!");
//       else toast.error("❌ Failed to record token purchase");
//     } catch (err: any) {
//       toast.error(err?.message || "Token purchase failed");
//     }
//   };

//   // ✅ Handle token sale (recovery)
//   const handleSellToken = async () => {
//     try {
//       const payload = {
//         transactionId: `sell_${Date.now()}`,
//         sellerAddress: user?.walletAddress,
//         buyerAddress: "0xRECOVERY",
//         tokenAddress: process.env.NEXT_PUBLIC_NATIVE_TOKEN!,
//         tokenSymbol: "STINDEM",
//         quantity: "50",
//         unitPrice: "1",
//         totalPricePaid: "50",
//         paymentDate: new Date().toISOString(),
//         txnHash: `0xSELL${Date.now().toString(16)}`,
//         paymentStatus: "COMPLETED",
//       };

//       const result = await createTokenRecovery(payload);
//       if (result.success) toast.success("✅ Token sale recorded!");
//       else toast.error("❌ Failed to record token recovery");
//     } catch (err: any) {
//       toast.error(err?.message || "Token sale failed");
//     }
//   };

//   return (
//     <div className="p-6 space-y-6">
//       <h1 className="text-3xl font-bold text-center">Payment Dashboard</h1>

//       <Tabs defaultValue="premium">
//         <TabsList className="grid grid-cols-4 gap-2">
//           <TabsTrigger value="premium">Premium Payments</TabsTrigger>
//           <TabsTrigger value="claims">Claim Settlements</TabsTrigger>
//           <TabsTrigger value="purchase">Buy Tokens</TabsTrigger>
//           <TabsTrigger value="sales">Sell Tokens</TabsTrigger>
//         </TabsList>

//         {/* 💰 Premium Payments */}
//         <TabsContent value="premium">
//           <Card>
//             <CardHeader>
//               <CardTitle>Pay Premium for Approved Proposals</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <select
//                 className="border p-2 rounded w-full mb-4"
//                 value={selectedProposalId}
//                 onChange={(e) => setSelectedProposalId(e.target.value)}
//               >
//                 <option value="">Select Approved Proposal</option>
//                 {approvedProposals.map((p) => (
//                   <option key={p.id} value={p.id}>
//                     {p.subjectMatter} — ₦{p.premiumPayable}
//                   </option>
//                 ))}
//               </select>

//               <Button onClick={handlePayPremium}>Pay Premium</Button>

//               <div className="mt-6">
//                 <h3 className="text-lg font-semibold">Your Premium Payments</h3>
//                 <ul className="mt-2 space-y-2">
//                   {premiumPayments.map((p) => (
//                     <li key={p.id} className="border p-2 rounded">
//                       {p.proposal?.subjectMatter} — ₦{p.amountPaid} ({p.paymentStatus})
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* 🏦 Claim Settlements */}
//         <TabsContent value="claims">
//           <Card>
//             <CardHeader>
//               <CardTitle>Your Claim Settlements</CardTitle>
//             </CardHeader>
//             <CardContent>
//               {claimSettlements.length === 0 ? (
//                 <p>No settlements found.</p>
//               ) : (
//                 <ul className="space-y-2">
//                   {claimSettlements.map((s) => (
//                     <li key={s.id} className="border p-2 rounded">
//                       Claim: {s.claim?.id} — ₦{s.approvedSettlementAmount} ({s.settlementStatus})
//                     </li>
//                   ))}
//                 </ul>
//               )}
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* 🪙 Token Purchases */}
//         <TabsContent value="purchase">
//           <Card>
//             <CardHeader>
//               <CardTitle>Buy Native Tokens</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <Button onClick={handleBuyToken}>Buy 100 STINDEM Tokens</Button>

//               <div className="mt-6">
//                 <h3 className="text-lg font-semibold">Purchase History</h3>
//                 <ul className="mt-2 space-y-2">
//                   {tokenPurchases.map((p) => (
//                     <li key={p.id} className="border p-2 rounded">
//                       {p.quantity} STINDEM — ₦{p.totalPricePaid} ({p.paymentStatus})
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* 💸 Token Recoveries (Sales) */}
//         <TabsContent value="sales">
//           <Card>
//             <CardHeader>
//               <CardTitle>Sell Native Tokens (Recovered)</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <Button onClick={handleSellToken}>Sell 50 STINDEM Tokens</Button>

//               <div className="mt-6">
//                 <h3 className="text-lg font-semibold">Sales History</h3>
//                 <ul className="mt-2 space-y-2">
//                   {tokenRecoveries.map((r) => (
//                     <li key={r.id} className="border p-2 rounded">
//                       {r.quantity} STINDEM — ₦{r.totalPricePaid} ({r.paymentStatus})
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// }
