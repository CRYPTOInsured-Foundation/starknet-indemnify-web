import ClaimDetailPage  from "./ClaimDetailPage";

// 🔹 For static export builds (optional)
export async function generateStaticParams() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/claims`);
    if (!res.ok) {
      console.error("❌ Failed to fetch claims for static generation");
      return [];
    }

    const result = await res.json();
    const claims = result?.data?.data || result?.data || [];

    return claims.map((c: any) => ({
      id: c.id.toString(),
    }));
  } catch (error) {
    console.error("❌ Error in generateStaticParams:", error);
    return [];
  }
}

// ✅ Required default export
export default function Page() {
  return <ClaimDetailPage />;
}
