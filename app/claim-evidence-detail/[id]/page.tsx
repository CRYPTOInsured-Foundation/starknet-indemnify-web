import ClaimEvidenceDetailPage from "./ClaimEvidenceDetailPage";

// ✅ Pre-generate static params for each claim evidence
export async function generateStaticParams() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/claim-evidences`, {
      cache: "force-cache",
    });

    if (!res.ok) return [];

    const json = await res.json();
    const evidences = json?.data?.data || json?.data || json || [];

    return evidences
      .filter((ev: any) => ev?.claim?.id)
      .map((ev: any) => ({
        claimId: ev.claim.id.toString(),
      }));
  } catch (error) {
    console.error("❌ Error generating static params:", error);
    return [];
  }
}

// ✅ Generate metadata for each evidence
export async function generateMetadata({ params }: { params: Promise<{ claimId: string }> }) {
  const { claimId } = await params;
  return {
    title: `Claim Evidence | ${claimId}`,
    description: `Detailed claim evidence record for claim ID ${claimId}`,
  };
}

// ✅ Render client component
export default function Page({ params }: { params: Promise<{ claimId: string }> }) {
  return <ClaimEvidenceDetailPage />;
}
