import ProposalDetailPage  from "./ProposalDetailPage";

// 🔹 For static exports (optional)
export async function generateStaticParams() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/proposals`);
    if (!res.ok) {
      console.error("Failed to fetch proposals for static generation");
      return [];
    }

    const result = await res.json();
    const proposals = result?.data?.data || result?.data || [];

    return proposals.map((p: any) => ({
      id: p.id.toString(),
    }));
  } catch (error) {
    console.error("Error in generateStaticParams:", error);
    return [];
  }
}

// ✅ Required default export for Next.js App Router
export default function Page() {
  return <ProposalDetailPage />;
}
