"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRootStore } from "@/stores/use-root-store";
import { 
  PolicyClass, 
  PremiumFrequency, 
  convertPolicyClassToCode, 
  convertPremiumFrequencyToCode, 
  StarknetEvent,
  stringToHex
 } from "@/lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ProtectedRoute from "@/components/guards/ProtectedRoute";


import { 
  CallData, 
  hash, 
  InvokeFunctionResponse, 
  AccountInterface, 
  GetTransactionReceiptResponse,
  ProviderInterface,
  uint256,
 
} from "starknet";

import proposalAbi from "../../contract_abis/proposal_contract.json" assert { type: "json" }; 


export default function ProposalPage() {
  const router = useRouter();

  const {
    insuranceProducts,
    fetchProducts,
    createProposal,
    fetchProposalsByUser,
    proposals,
    isLoadingProposal,
    user,
    executeTransaction,
    account,
    address,
    provider,
    restoreConnection,
    connectWallet,
  } = useRootStore();

  const [form, setForm] = useState({
    policyClass: "",
    subjectMatter: "",
    sumInsured: "",
    premiumFrequency: "",
    frequencyFactor: 1,
  });

  const [calculatedPremium, setCalculatedPremium] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [isSubmitting, setIsSubmitting] = useState(false);


 


  // Fetch products and user proposals
  useEffect(() => {
    if (insuranceProducts.length === 0) fetchProducts();
    if (user?.id) fetchProposalsByUser(user.id);
  }, [fetchProducts, fetchProposalsByUser, insuranceProducts.length, user?.id]);

  const handleChange = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // 🔹 Calculate premium dynamically
  useEffect(() => {
    if (!form.policyClass || !form.sumInsured) return;

    const selectedProduct = insuranceProducts.find(
      (p) => p.policyClass === form.policyClass
    );

    if (selectedProduct?.basicRate) {
      const premium =
        (Number(form.sumInsured) * Number(selectedProduct.basicRate)) / 100;
      setCalculatedPremium(premium);
    } else {
      setCalculatedPremium(null);
    }
  }, [form.sumInsured, form.policyClass, insuranceProducts]);


  useEffect(() => {
    connectWallet();
  }, [connectWallet]);
  


const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  console.log("Form data: ", form)

  if (!form.policyClass || !form.sumInsured || !form.premiumFrequency || !calculatedPremium) {
    toast.error("Please fill all required fields");
    return;
  }

  setIsSubmitting(true);

  try {
    const policyClassCode = convertPolicyClassToCode(form.policyClass as PolicyClass);
    const premiumFrequencyCode = convertPremiumFrequencyToCode(form.premiumFrequency as PremiumFrequency);

  if (!address) {
    throw new Error("Wallet not connected — proposer address is null");
  }

// const subjectBytes = new TextEncoder().encode(form.subjectMatter.slice(0, 31)); // converts to Uint8Array
const calldata = new CallData(proposalAbi).compile("submit_proposal", {
  proposer: address,
  policy_class_code: BigInt(policyClassCode),
  subject_matter: new TextEncoder().encode(form.subjectMatter.slice(0, 31)),
  sum_insured: uint256.bnToUint256(BigInt(form.sumInsured)),
  premium_frequency_code: BigInt(premiumFrequencyCode),
  frequency_factor: BigInt(form.frequencyFactor)
});


console.log("Compiled calldata:", calldata);



    let contractAddress = process.env.NEXT_PUBLIC_PROPOSAL_CONTRACT!;

    console.log("Proposal Contract Address: ", contractAddress);

    const call = {
      contractAddress: process.env.NEXT_PUBLIC_PROPOSAL_CONTRACT!,
      entrypoint: 'submit_proposal',
      calldata: calldata
    };


    let events: any[] = []

    try {
      // 🔹 Execute transaction on-chain
    const result: InvokeFunctionResponse = await (account as AccountInterface).execute(call);

    // 🔹 Wait for confirmation
   let pseudoReceipt = await (provider as ProviderInterface).waitForTransaction(result.transaction_hash);

   const status =
  (pseudoReceipt as any).execution_status ||
  (pseudoReceipt as any).status ||
  (pseudoReceipt as any).finality_status;

const revertReason =
  (pseudoReceipt as any).revert_reason ||
  (pseudoReceipt as any).revert_error ||
  (pseudoReceipt as any).reason;

console.log("Execution status:", status);
console.log("Revert reason:", revertReason);
    // 🔹 Fetch receipt and read ProposalSubmitted event
    const receipt: GetTransactionReceiptResponse =
      await (provider as ProviderInterface).getTransactionReceipt(result.transaction_hash);

//       const selector = hash.getSelectorFromName("ProposalCreated");

//       const { events } = await (provider as ProviderInterface).getEvents({
//         address: process.env.NEXT_PUBLIC_PROPOSAL_CONTRACT!,
//         from_block: { block_number: 0 },
//         to_block: "latest",
//         keys: [[selector]],
//         chunk_size: 100, // ✅ required field
//       });



// for (const ev of events) {
//   const decoded = new CallData(proposalAbi).decodeEvent("ProposalCreated", ev.data);
//   const subject = new TextDecoder().decode(decoded.subject_matter);
//   console.log({
//     proposer: decoded.proposer,
//     policy_class_code: decoded.policy_class_code,
//     subject,
//     sum_insured: decoded.sum_insured,
//     premium_frequency_code: decoded.premium_frequency_code,
//     frequency_factor: decoded.frequency_factor,
//   });
// }


    if ("events" in receipt) {
      const pseudoEvents = receipt.events as StarknetEvent[];

      // 5. Compute selector for CollectionCreated
      const proposalCreatedSelector = hash.getSelectorFromName("ProposalCreated");   

      // 6. Find event
      const event = pseudoEvents.find(
        (e) => e.keys[0].toLowerCase() === proposalCreatedSelector.toLowerCase()
      );

      if (!event) throw new Error("ProposalCreated event not found");

      // 7. Decode event (from ABI we know [creator, collection])
      const proposalId = event.data[0];
      const proposer = event.data[1];

      events = [proposalId, proposer];
    }


    } catch (err) {
      console.log("Error: ", err instanceof Error ? err.message : "Contract call failed");
    }

    
    if (!events) throw new Error("ProposalSubmitted event not found on-chain");

    const onChainProposalId = events[0]; // Assuming the contract emits proposalId first

    toast.success("Proposal submitted on-chain successfully!");

    // 🔹 Step 2: Submit proposal off-chain
    const payload = {
      proposalId: onChainProposalId,
      proposer: user,
      policyClass: form.policyClass,
      subjectMatter: form.subjectMatter,
      sumInsured: form.sumInsured,
      premiumPayable: calculatedPremium.toString(),
      premiumFrequency: form.premiumFrequency,
      frequencyFactor: form.frequencyFactor,
      submissionDate: new Date().toISOString(),
    };

    const resultOffChain = await createProposal(payload);

    if (resultOffChain.success) {
      toast.success("Proposal recorded off-chain successfully!");
      fetchProposalsByUser(user?.id as string);
      resetForm();
    } else {
      toast.error("Failed to submit proposal off-chain");
    }
  } catch (err: any) {
    toast.error(err?.message || "Failed to submit proposal");
  } finally {
    setIsSubmitting(false);
  }
};


  const resetForm = () => {
    setForm({
      policyClass: "",
      subjectMatter: "",
      sumInsured: "",
      premiumFrequency: "",
      frequencyFactor: 1,
    });
    setCalculatedPremium(null);
  };

  const paginatedProposals = proposals
    ?.slice()
    .sort(
      (a: any, b: any) =>
        new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime()
    )
    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const totalPages = Math.ceil(proposals.length / itemsPerPage);

  return (
    <ProtectedRoute>
    <div className="max-w-6xl mx-auto py-12 px-6 space-y-10">
      {/* --- Proposal Form --- */}
      <Card className="shadow-md border border-gray-200">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Submit New Insurance Proposal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Policy Class */}
            <div>
              <Label>Policy Class</Label>
              <Select
                value={form.policyClass}
                onValueChange={(v) => handleChange("policyClass", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select policy class" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(PolicyClass)
                    .filter((v) => v !== PolicyClass.InvalidClassOfInsurance)
                    .map((cls) => (
                      <SelectItem key={cls} value={cls}>
                        {cls.replace(/([A-Z])/g, " $1").trim()}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subject Matter */}
            <div>
              <Label>Subject Matter</Label>
              <Textarea
                value={form.subjectMatter}
                onChange={(e) => handleChange("subjectMatter", e.target.value)}
                placeholder="Describe the property or activity to be insured..."
              />
            </div>

            {/* Sum Insured */}
            <div>
              <Label>Sum Insured (USD)</Label>
              <Input
                type="number"
                value={form.sumInsured}
                onChange={(e) => handleChange("sumInsured", e.target.value)}
                placeholder="Enter sum insured"
              />
            </div>

            {/* Computed Premium */}
            <div>
              <Label>Estimated Premium (USD)</Label>
              <Input
                type="text"
                value={
                  calculatedPremium
                    ? calculatedPremium.toFixed(2)
                    : "Select a policy and enter sum insured"
                }
                readOnly
                className="bg-gray-100 cursor-not-allowed"
              />
            </div>

            {/* Premium Frequency */}
            <div>
              <Label>Premium Frequency</Label>
              <Select
                value={form.premiumFrequency}
                onValueChange={(v) => handleChange("premiumFrequency", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment frequency" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(PremiumFrequency)
                    .filter((v) => v !== PremiumFrequency.INVALID)
                    .map((freq) => (
                      <SelectItem key={freq} value={freq}>
                        {freq}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Frequency Factor */}
            <div>
              <Label>Frequency Factor</Label>
              <Input
                type="number"
                value={form.frequencyFactor}
                onChange={(e) =>
                  handleChange("frequencyFactor", Number(e.target.value))
                }
                min={1}
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-3">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Proposal"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* --- User Proposals Table --- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">My Proposals</CardTitle>
        </CardHeader>
        <CardContent>
          {proposals.length === 0 ? (
            <p className="text-gray-500 text-center py-6">
              No proposals yet. Submit one above!
            </p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Policy Class</TableHead>
                    <TableHead>Sum Insured</TableHead>
                    <TableHead>Premium</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedProposals.map((proposal) => (
                    <TableRow key={proposal.id}>
                      <TableCell>{proposal.policyClass}</TableCell>
                      <TableCell>${proposal.sumInsured}</TableCell>
                      <TableCell>${proposal.premiumPayable}</TableCell>
                      <TableCell>{proposal.premiumFrequency}</TableCell>
                      <TableCell>{proposal.proposalStatus || "Pending"}</TableCell>
                      <TableCell className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            router.push(`/proposal-detail/${proposal.id}`)
                          }
                        >
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() =>
                            router.push(
                              `/inspection-form?proposalId=${proposal.id}`
                            )
                          }
                        >
                          Inspect
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-4 gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Prev
                  </Button>
                  <span>
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
    </ProtectedRoute>
  );
}



// export default function Proposal() {
//   const { restoreConnection } = useRootStore();
//   useEffect(() => { restoreConnection(); }, [restoreConnection]);



//   return (
//     <ProtectedRoute>
//       <ProposalPage />
//     </ProtectedRoute>
//   );
// }