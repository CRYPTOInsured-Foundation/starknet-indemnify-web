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
import { PaymentStatus, StarknetEvent, hexToBigInt } from "@/lib/utils";
import ProtectedRoute from "@/components/guards/ProtectedRoute";

import treasuryAbi from "../../contract_abis/treasury_contract.json" assert { type: "json" }; 



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
    connectWallet,
    address
  } = useRootStore();

  const [selectedProposalId, setSelectedProposalId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [buyQuantity, setBuyQuantity] = useState<string>("100");
  const [sellQuantity, setSellQuantity] = useState<string>("50");




  useEffect(() => {
    if (user?.id) {
      fetchProposalsByUser(user.id);
      fetchPremiumPaymentsByUser(user.id);
      fetchClaimSettlementsByUser(user.id);
      fetchTokenPurchasesByUser(user.id);
      fetchTokenRecoveriesBySeller(user.walletAddress);
    }
  }, [user]);

  useEffect(() => {
    connectWallet();
  }, [connectWallet]);

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
      if (!address) {
        throw new Error("Wallet not connected — payer address is null");
      }
  
      console.log("Proposal ID: ", proposal.proposalId);
  
      // ✅ Prepare calldata for Starknet contract
      const calldata = new CallData(treasuryAbi).compile("pay_premium", {
        proposal_id: uint256.bnToUint256(BigInt(parseInt(proposal.proposalId))),
        payer_address: address,
      });
  
      const contractAddress = process.env.NEXT_PUBLIC_TREASURY_CONTRACT!;
      console.log("Treasury Contract: ", contractAddress);
  
      const call = {
        contractAddress,
        entrypoint: "pay_premium",
        calldata,
      };
  
      // 🧩 On-chain logic as a Promise
      const onChainCall = (): Promise<[string, string, string, string, string, string, string, string, string]> =>
        new Promise(async (resolve, reject) => {
          try {
            // 🔹 Execute on-chain transaction
            const result: InvokeFunctionResponse = await (account as AccountInterface).execute(call);
            await (provider as ProviderInterface).waitForTransaction(result.transaction_hash);
  
            // 🔹 Retrieve transaction receipt
            const receipt: GetTransactionReceiptResponse =
              await (provider as ProviderInterface).getTransactionReceipt(result.transaction_hash);
  
            if (!("events" in receipt)) return reject(new Error("No events found in transaction receipt"));
  
            // 🔹 Match event selector
            const eventSelector = hash.getSelectorFromName("PremiumPaymentRecorded");
            const pseudoEvents = receipt.events as StarknetEvent[];
  
            const event = pseudoEvents.find(
              (e) => e.keys[0].toLowerCase() === eventSelector.toLowerCase()
            );
  
            if (!event) return reject(new Error("PremiumPaymentRecorded event not found"));
  
            // 🔹 Decode event data based on your struct
            const transactionId = hexToBigInt(event.keys[1]).toString(); // first key after selector
            const proposalId = hexToBigInt(event.data[0]).toString();
            const policyId = hexToBigInt(event.data[1]).toString();
            const payerAddress = event.data[2];
            const policyholder = event.data[3];
            const amountPaid = hexToBigInt(event.data[4]).toString();
            const sumInsured = hexToBigInt(event.data[5]).toString();
            const paymentDate = hexToBigInt(event.data[6]).toString();
            const txnHash = event.data[7];
  
            console.log("✅ PremiumPaymentRecorded event parsed:", {
              transactionId,
              proposalId,
              policyId,
              payerAddress,
              policyholder,
              amountPaid,
              sumInsured,
              paymentDate,
              txnHash,
            });
  
            toast.success("✅ Premium payment confirmed on-chain!");
            resolve([
              transactionId,
              proposalId,
              policyId,
              payerAddress,
              policyholder,
              amountPaid,
              sumInsured,
              paymentDate,
              txnHash,
            ]);
          } catch (error: any) {
            console.error("❌ On-chain premium payment failed:", error.message);
            reject(error);
          }
        });
  
      // ✅ Run off-chain logic only after on-chain success
      onChainCall()
        .then(async ([transactionId, proposalId, policyId, payerAddress, policyholder, amountPaid, sumInsured, paymentDate, txnHash]) => {
          const payload = {
            transactionId,
            proposal,
            policyholder: user,
            payerAddress,
            amountPaid,
            sumInsured,
            paymentDate: new Date().toISOString(),
            txnHash,
            paymentStatus: PaymentStatus.Successful,
          };
  
          const resultOffChain = await createPremiumPayment(payload);
          if (resultOffChain.success) {
            toast.success("✅ Premium payment recorded off-chain!");
            fetchPremiumPaymentsByUser(user?.id as string);
          } else {
            toast.error("⚠️ Failed to record premium payment off-chain");
          }
        })
        .catch((error: any) => {
          toast.error(error?.message || "❌ On-chain payment failed");
        })
        .finally(() => {
          setIsSubmitting(false);
        });
    } catch (err: any) {
      toast.error(err?.message || "Unexpected error occurred during payment");
      setIsSubmitting(false);
    }
  };
  

  // ✅ On-chain Token Purchase (Dynamic Quantity)
  const handleBuyToken = async () => {
    if (!buyQuantity || isNaN(Number(buyQuantity)) || Number(buyQuantity) <= 0) {
      toast.error("Please enter a valid quantity to buy.");
      return;
    }
  
    if (!address) {
      toast.error("Wallet not connected — buyer address missing.");
      return;
    }
  
    setIsSubmitting(true);
  
    try {
      // ✅ Prepare calldata for Starknet contract
      const calldata = new CallData(treasuryAbi).compile("purchase_stindem", {
        buyer_address: address,
        quantity: uint256.bnToUint256(BigInt(buyQuantity)),
      });
  
      const contractAddress = process.env.NEXT_PUBLIC_TREASURY_CONTRACT!;
      console.log("Treasury Contract:", contractAddress);
  
      const call = {
        contractAddress,
        entrypoint: "purchase_stindem",
        calldata,
      };
  
      // 🧩 Wrap on-chain logic into a Promise
      const onChainCall = (): Promise<[string, string, string, string, string, string, string, string, string]> =>
        new Promise(async (resolve, reject) => {
          try {
            // 🔹 Execute transaction on-chain
            const result: InvokeFunctionResponse = await (account as AccountInterface).execute(call);
            await (provider as ProviderInterface).waitForTransaction(result.transaction_hash);
  
            // 🔹 Fetch receipt
            const receipt: GetTransactionReceiptResponse =
              await (provider as ProviderInterface).getTransactionReceipt(result.transaction_hash);
  
            if (!("events" in receipt)) return reject(new Error("No events found in transaction receipt"));
  
            // 🔹 Parse emitted event
            const purchaseSelector = hash.getSelectorFromName("StindemPurchased");
            const pseudoEvents = receipt.events as StarknetEvent[];
  
            const event = pseudoEvents.find(
              (e) => e.keys[0].toLowerCase() === purchaseSelector.toLowerCase()
            );
  
            if (!event) return reject(new Error("StindemPurchased event not found"));
  
            // 🔹 Decode event data
            const transactionId = hexToBigInt(event.keys[1]).toString(); // first key after selector
            const buyerAddress = event.data[0];
            const sellerAddress = event.data[1];
            const tokenAddress = event.data[2];
            const quantity = hexToBigInt(event.data[3]).toString();
            const unitPrice = hexToBigInt(event.data[4]).toString();
            const totalPricePaid = hexToBigInt(event.data[5]).toString();
            const paymentDate = hexToBigInt(event.data[6]).toString();
            const txnHash = event.data[7];
  
            console.log("✅ StindemPurchased Event Parsed:", {
              transactionId,
              buyerAddress,
              sellerAddress,
              tokenAddress,
              quantity,
              unitPrice,
              totalPricePaid,
              paymentDate,
              txnHash,
            });
  
            toast.success(`✅ Purchased ${buyQuantity} STINDEM tokens on-chain!`);
            resolve([
              transactionId,
              buyerAddress,
              sellerAddress,
              tokenAddress,
              quantity,
              unitPrice,
              totalPricePaid,
              paymentDate,
              txnHash,
            ]);
          } catch (error: any) {
            console.error("❌ On-chain token purchase failed:", error.message);
            reject(error);
          }
        });
  
      // ✅ Run off-chain logic only when on-chain succeeds
      onChainCall()
        .then(async ([transactionId, buyerAddress, sellerAddress, tokenAddress, quantity, unitPrice, totalPricePaid, paymentDate, txnHash]) => {
          const payload = {
            transactionId,
            buyer: user,
            tokenAddress: tokenAddress || process.env.NEXT_PUBLIC_STINDEM_ADDRESS!,
            tokenSymbol: "STINDEM",
            quantity,
            unitPrice,
            totalPricePaid,
            paymentDate: new Date().toISOString(),
            txnHash,
            paymentStatus: PaymentStatus.Successful,
          };
  
          const resultOffChain = await createTokenPurchase(payload);
          if (resultOffChain.success) {
            toast.success("✅ Token purchase recorded off-chain!");
          } else {
            toast.error("⚠️ Failed to record token purchase off-chain");
          }
        })
        .catch((error: any) => {
          toast.error(error?.message || "❌ On-chain token purchase failed");
        })
        .finally(() => {
          setIsSubmitting(false);
        });
    } catch (err: any) {
      toast.error(err?.message || "Unexpected error occurred during token purchase");
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
      if (!address) {
        throw new Error("Wallet not connected — proposer address is null");
      }
  
      // ✅ Prepare calldata
      const calldata = new CallData(treasuryAbi).compile("recover_stindem_from_market", {
        seller_address: address,
        quantity: uint256.bnToUint256(BigInt(sellQuantity)),
      });
  
      const contractAddress = process.env.NEXT_PUBLIC_TREASURY_CONTRACT!;
      console.log("Treasury Contract:", contractAddress);
  
      const call = {
        contractAddress,
        entrypoint: "recover_stindem_from_market",
        calldata,
      };
  
      // 🧩 On-chain logic as a Promise
      const onChainCall = (): Promise<[string, string, string, string, string, string, string, string, string, string]> =>
        new Promise(async (resolve, reject) => {
          try {
            // 🔹 Execute transaction
            const result: InvokeFunctionResponse = await (account as AccountInterface).execute(call);
            await (provider as ProviderInterface).waitForTransaction(result.transaction_hash);
  
            // 🔹 Fetch receipt
            const receipt: GetTransactionReceiptResponse =
              await (provider as ProviderInterface).getTransactionReceipt(result.transaction_hash);
  
            if (!("events" in receipt)) return reject(new Error("No events found in transaction receipt"));
  
            // 🔹 Find StindemRecovered event
            const eventSelector = hash.getSelectorFromName("StindemRecovered");
            const pseudoEvents = receipt.events as StarknetEvent[];
  
            const event = pseudoEvents.find(
              (e) => e.keys[0].toLowerCase() === eventSelector.toLowerCase()
            );
  
            if (!event) return reject(new Error("StindemRecovered event not found"));
  
            // 🔹 Decode event data (in struct order)
            const transactionId = hexToBigInt(event.keys[1]).toString();
            const sellerAddress = event.data[0];
            const buyerAddress = event.data[1];
            const stindemTokenAddress = event.data[2];
            const strkTokenAddress = event.data[3];
            const stindemQuantity = hexToBigInt(event.data[4]).toString();
            const strkAmountPaid = hexToBigInt(event.data[5]).toString();
            const unitPrice = hexToBigInt(event.data[6]).toString();
            const recoveryDate = hexToBigInt(event.data[7]).toString();
            const txnHash = event.data[8];
  
            console.log("✅ StindemRecovered event parsed:", {
              transactionId,
              sellerAddress,
              buyerAddress,
              stindemTokenAddress,
              strkTokenAddress,
              stindemQuantity,
              strkAmountPaid,
              unitPrice,
              recoveryDate,
              txnHash,
            });
  
            toast.success(`✅ Sold ${sellQuantity} STINDEM tokens on-chain!`);
            resolve([
              transactionId,
              sellerAddress,
              buyerAddress,
              stindemTokenAddress,
              strkTokenAddress,
              stindemQuantity,
              strkAmountPaid,
              unitPrice,
              recoveryDate,
              txnHash,
            ]);
          } catch (error: any) {
            console.error("❌ On-chain token recovery failed:", error.message);
            reject(error);
          }
        });
  
      // ✅ Off-chain logic only after on-chain success
      onChainCall()
        .then(async ([transactionId, sellerAddress, buyerAddress, stindemTokenAddress, strkTokenAddress, stindemQuantity, strkAmountPaid, unitPrice, recoveryDate, txnHash]) => {
          const payload = {
            transactionId,
            sellerAddress,
            buyerAddress,
            tokenAddress: stindemTokenAddress,
            tokenSymbol: "STINDEM",
            quantity: stindemQuantity,
            unitPrice,
            totalPricePaid: strkAmountPaid,
            paymentDate: new Date().toISOString(),
            txnHash,
            paymentStatus: PaymentStatus.Successful,
          };
  
          const resultOffChain = await createTokenRecovery(payload);
          if (resultOffChain.success) {
            toast.success("✅ Token sale recorded off-chain!");
          } else {
            toast.error("⚠️ Failed to record token sale off-chain");
          }
        })
        .catch((error: any) => {
          toast.error(error?.message || "❌ On-chain token sale failed");
        })
        .finally(() => {
          setIsSubmitting(false);
        });
    } catch (err: any) {
      toast.error(err?.message || "Unexpected error occurred during token sale");
      setIsSubmitting(false);
    }
  };
  
  
  return (
    <ProtectedRoute>
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
                    {p.subjectMatter} — ${p.premiumPayable}
                  </option>
                ))}
              </select>

              <Button onClick={() => handlePayPremium()} disabled={isSubmitting}>
                {isSubmitting ? "Processing..." : "Pay Premium"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="claims">
          <Card>
             <CardHeader>
               <CardTitle>Your Claim Settlements</CardTitle>
             </CardHeader>
             <CardContent>
               {claimSettlements.length === 0 ? (
                <p>No settlements found.</p>
              ) : (
                <ul className="space-y-2">
                  {claimSettlements.map((s) => (
                    <li key={s.id} className="border p-2 rounded">
                      Claim: {s.claim?.id} — ${s.approvedSettlementAmount} ({s.settlementStatus})
                    </li>
                  ))}
                </ul>
              )}
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
    </ProtectedRoute>
  );
}
