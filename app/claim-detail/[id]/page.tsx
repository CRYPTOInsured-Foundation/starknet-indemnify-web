import ClaimDetailPage from "./ClaimDetailPage";

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














// import ClaimDetailPage from "./ClaimDetailPage";

// // ✅ This runs **at build time** to generate static pages for each claim
// export async function generateStaticParams() {
//   try {
//     const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/claims`, {
//       // Ensure Next.js fetches at build time
//       cache: 'force-cache',
//     });

//     if (!res.ok) {
//       console.error("❌ Failed to fetch claims for static generation");
//       return [];
//     }

//     const json = await res.json();

//     // Normalize data structure based on your backend response
//     const claims = json?.data?.data || json?.data || json || [];

//     // Return all available claim IDs
//     const params = claims
//       .filter((claim: any) => claim?.id)
//       .map((claim: any) => ({
//         id: claim.id.toString(),
//       }));

//     console.log("✅ Static Params Generated:", params);

//     return params;
//   } catch (error) {
//     console.error("❌ Error in generateStaticParams:", error);
//     return [];
//   }
// }

// // ✅ Metadata generation for SEO and clarity - FIXED for Next.js 15
// export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
//   // Await the params promise
//   const { id } = await params;
  
//   return {
//     title: `Claim Details | ${id}`,
//     description: `Detailed claim record for ID ${id}`,
//   };
// }

// // ✅ Default export - purely client-rendered component
// export default function Page({ params }: { params: Promise<{ id: string }> }) {
//   return <ClaimDetailPage />;
// }







