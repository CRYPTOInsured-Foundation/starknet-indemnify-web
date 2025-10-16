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
import { PaymentStatus } from "@/lib/utils";
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

      console.log("prposal id: ", proposal.proposalId)

      if (!address) {
        throw new Error("Wallet not connected — proposer address is null");
      }
      const calldata = new CallData(treasuryAbi).compile("pay_premium", {
        proposal_id: uint256.bnToUint256(BigInt(parseInt(proposal.proposalId))),
        payer_address: address
      });

      const contractAddress = process.env.NEXT_PUBLIC_TREASURY_CONTRACT!;
      console.log("Treasury Contract: ", contractAddress)

      const call = {
        contractAddress: contractAddress,
        entrypoint: 'pay_premium',
        calldata: calldata
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
        paymentStatus: PaymentStatus.Successful,
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
    if (!address) {
      throw new Error("Wallet not connected — proposer address is null");
    }
    try {
      const calldata = new CallData(treasuryAbi).compile("purchase_stindem", {
        buyer_address: address,
        quantity: uint256.bnToUint256(BigInt(buyQuantity))
      });

      const contractAddress = process.env.NEXT_PUBLIC_TREASURY_CONTRACT!;
      console.log("Treasury Contract: ", contractAddress)

      const call = {
        contractAddress: process.env.NEXT_PUBLIC_TREASURY_CONTRACT!,
        entrypoint: 'purchase_stindem',
        calldata: calldata
      };

      const result: InvokeFunctionResponse = await (account as AccountInterface).execute(call);
      await (provider as ProviderInterface).waitForTransaction(result.transaction_hash);

      const selector = hash.getSelectorFromName("StindemPurchased");

      const eventsT = await (provider as ProviderInterface).getEvents({
        address: process.env.NEXT_PUBLIC_PROPOSAL_CONTRACT!,
        from_block: { block_number: 0 },
        to_block: "latest",
        keys: [[selector]],
        chunk_size: 100, // ✅ required field
      });

      console.log("Events: ", eventsT);

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
        paymentStatus: PaymentStatus.Successful,
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

    if (!address) {
      throw new Error("Wallet not connected — proposer address is null");
    }

    try {
      const calldata = new CallData(treasuryAbi).compile("recover_stindem_from_market", {
        seller_address: address,
        quantity: uint256.bnToUint256(BigInt(sellQuantity))
      });


      const contractAddress = process.env.NEXT_PUBLIC_TREASURY_CONTRACT!;
      console.log("Treasury Contract: ", contractAddress)

      const call = {
        contractAddress: contractAddress,
        entrypoint: 'recover_stindem_from_market',
        calldata: calldata,
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
        paymentStatus: PaymentStatus.Successful,
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



// export default function Payment() {
//   const { restoreConnection } = useRootStore();
//   useEffect(() => { restoreConnection(); }, [restoreConnection]);



//   return (
//     <ProtectedRoute>
//       <PaymentPage />
//     </ProtectedRoute>
//   );
// }