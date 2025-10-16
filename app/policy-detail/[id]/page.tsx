import  PolicyDetailPage  from "./PolicyDetailPage";

// 🔹 For static export builds (optional)
export async function generateStaticParams() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/policies`);
    if (!res.ok) {
      console.error("❌ Failed to fetch policies for static generation");
      return [];
    }

    const result = await res.json();
    const policies = result?.data?.data || result?.data || [];

    return policies.map((p: any) => ({
      id: p.id.toString(),
    }));
  } catch (error) {
    console.error("❌ Error in generateStaticParams:", error);
    return [];
  }
}

// ✅ Required default export
export default function Page() {
  return <PolicyDetailPage />;
}







