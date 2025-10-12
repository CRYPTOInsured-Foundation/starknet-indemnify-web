import InspectionDetailPage from "./InspectionDetailPage";

// ✅ This runs **at build time** to generate static pages for each inspection
export async function generateStaticParams() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/inspections`, {
      // Ensure Next.js fetches at build time
      cache: 'force-cache',
    });

    if (!res.ok) {
      console.error("❌ Failed to fetch inspections for static generation");
      return [];
    }

    const json = await res.json();

    // Normalize data structure based on your backend response
    const inspections = json?.data?.data || json?.data || json || [];

    // Return all available inspection IDs
    const params = inspections
      .filter((insp: any) => insp?.id)
      .map((insp: any) => ({
        id: insp.id.toString(),
      }));

    console.log("✅ Static Params Generated:", params);

    return params;
  } catch (error) {
    console.error("❌ Error in generateStaticParams:", error);
    return [];
  }
}

// ✅ Metadata generation for SEO and clarity - FIXED for Next.js 15
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  // Await the params promise
  const { id } = await params;
  
  return {
    title: `Inspection Details | ${id}`,
    description: `Detailed inspection record for ID ${id}`,
  };
}

// ✅ Default export - purely client-rendered component
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <InspectionDetailPage />;
}










// import InspectionDetailPage from "./InspectionDetailPage";

// // ✅ This runs **at build time** to generate static pages for each inspection
// export async function generateStaticParams() {
//   try {
//     const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/inspections`, {
//       // Ensure Next.js fetches at build time
//       cache: 'force-cache',
//     });

//     if (!res.ok) {
//       console.error("❌ Failed to fetch inspections for static generation");
//       return [];
//     }

//     const json = await res.json();

//     // Normalize data structure based on your backend response
//     const inspections = json?.data?.data || json?.data || json || [];

//     // Return all available inspection IDs
//     const params = inspections
//       .filter((insp: any) => insp?.id)
//       .map((insp: any) => ({
//         id: insp.id.toString(),
//       }));

//     console.log("✅ Static Params Generated:", params);

//     return params;
//   } catch (error) {
//     console.error("❌ Error in generateStaticParams:", error);
//     return [];
//   }
// }

// // ✅ Metadata generation for SEO and clarity
// export async function generateMetadata({ params }: { params: { id: string } }) {
//   return {
//     title: `Inspection Details | ${params.id}`,
//     description: `Detailed inspection record for ID ${params.id}`,
//   };
// }

// // ✅ Default export - purely client-rendered component
// export default function Page() {
//   return <InspectionDetailPage />;
// }











// // app/inspection-detail/[id]/page.tsx
// import InspectionDetailPage from "./InspectionDetailPage";

// // 🔹 Required for static export - return empty array for dynamic rendering
// export async function generateStaticParams() {
//   return [];
// }

// // 🔹 Force dynamic rendering since we're loading from client
// export const dynamic = 'force-dynamic';

// export async function generateMetadata({ params }: { params: { id: string } }) {
//   return {
//     title: `Inspection ${params.id}`,
//     description: `Details for inspection ${params.id}`,
//   };
// }

// // ✅ Default export
// export default function Page() {
//   return <InspectionDetailPage />;
// }









// // app/inspection-detail/[id]/page.tsx
// import InspectionDetailPage from "./InspectionDetailPage";

// export async function generateStaticParams() {
//   try {
//     const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
//     if (!baseUrl) {
//       console.warn("⚠️ Missing NEXT_PUBLIC_API_BASE_URL, skipping inspection fetch.");
//       return [{ id: "dummy" }]; // ✅ fallback for static export
//     }

//     const res = await fetch(`${baseUrl}/inspections`, {
//       cache: "no-store",
//     });

//     if (!res.ok) {
//       console.error("❌ Failed to fetch inspections for static generation:", res.statusText);
//       // ✅ return at least one dummy param to satisfy static export
//       return [{ id: "dummy" }];
//     }

//     const result = await res.json();

//     const inspections = result?.data?.data || result?.data || result || [];
//     if (!Array.isArray(inspections) || inspections.length === 0) {
//       console.warn("⚠️ No inspections found; returning fallback param.");
//       return [{ id: "dummy" }];
//     }

//     // ✅ Return real IDs as strings
//     return inspections.map((insp: any) => ({
//       id: insp.id?.toString() ?? "unknown",
//     }));
//   } catch (error) {
//     console.error("❌ Error in generateStaticParams:", error);
//     // ✅ fallback so build won't fail
//     return [{ id: "dummy" }];
//   }
// }

// // ✅ default export required
// export default function Page() {
//   return <InspectionDetailPage />;
// }









// // app/inspection-detail/[id]/page.tsx
// import InspectionDetailPage from "./InspectionDetailPage";

// // 🔹 required only for static export builds
// export async function generateStaticParams() {
//   try {
//     // Fetch available inspection IDs for static generation
//     const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/inspections`);
    
//     if (!res.ok) {
//       console.error('Failed to fetch inspections for static generation');
//       return [];
//     }
    
//     const result = await res.json();
//     console.log('Static generation data:', result); // Debug log

//     // Adjust based on your actual API response structure
//     const inspections = result?.data?.data || result?.data || result || [];
    
//     console.log('Inspections for static generation:', inspections); // Debug log

//     return inspections.map((insp: any) => ({
//       id: insp.id.toString(),
//     }));
//   } catch (error) {
//     console.error('Error in generateStaticParams:', error);
//     return [];
//   }
// }

// // Add this to force dynamic rendering (remove if you want static generation)
// // export const dynamic = 'force-dynamic';

// // ✅ default export required
// export default function Page() {
//   return <InspectionDetailPage />;
// }








// // app/inspection-detail/[id]/page.tsx
// import InspectionDetailPage from "./InspectionDetailPage";

// export async function generateStaticParams() {
//   try {
//     const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/inspections`, {
//       next: { revalidate: 3600 }
//     });

//     if (!res.ok) {
//       console.error("Failed to fetch inspections for static generation");
//       return [];
//     }

//     const result = await res.json();
//     const inspections = result?.data?.data || result?.data || result || [];

//     return inspections.map((insp: any) => ({
//       id: insp.id.toString(),
//     }));
//   } catch (error) {
//     console.error("Error in generateStaticParams:", error);
//     return [];
//   }
// }

// export async function generateMetadata({ params }: { params: { id: string } }) {
//   return {
//     title: `Inspection ${params.id}`,
//     description: `Details for inspection ${params.id}`,
//   };
// }

// // ✅ Remove the params prop since component uses useParams()
// export default function Page() {
//   return <InspectionDetailPage />;
// }


















// // app/inspection-detail/[id]/page.tsx
// import InspectionDetailPage from "./InspectionDetailPage";

// // 🔹 Required only for static export builds
// export async function generateStaticParams() {
//   try {
//     // Fetch all inspections so Next.js can pre-generate detail pages
//     const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/inspections`, {
//       // Add cache and revalidation options
//       next: { revalidate: 3600 } // Revalidate every hour
//     });

//     if (!res.ok) {
//       console.error("Failed to fetch inspections for static generation");
//       return [];
//     }

//     const result = await res.json();

//     console.log("Static generation data (inspections):", result);

//     // Adjust based on your backend's response structure
//     const inspections = result?.data?.data || result?.data || result || [];

//     console.log("Inspections for static generation:", inspections);

//     // Return an array of params objects that match the route structure
//     return inspections.map((insp: any) => ({
//       id: insp.id.toString(),
//     }));
//   } catch (error) {
//     console.error("Error in generateStaticParams:", error);
//     return [];
//   }
// }

// // Add metadata for the page
// export async function generateMetadata({ params }: { params: { id: string } }) {
//   return {
//     title: `Inspection ${params.id}`,
//   };
// }

// // ✅ Default export required
// export default function Page({ params }: { params: { id: string } }) {
//   return <InspectionDetailPage params={params} />;
// }








// // app/inspection-detail/[id]/page.tsx
// import InspectionDetailPage from "./InspectionDetailPage";

// // 🔹 Required only for static export builds
// export async function generateStaticParams() {
//   try {
//     // Fetch all inspections so Next.js can pre-generate detail pages
//     const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/inspections`);

//     if (!res.ok) {
//       console.error("Failed to fetch inspections for static generation");
//       return [];
//     }

//     const result = await res.json();

//     console.log("Static generation data (inspections):", result); // Debug log

//     // Adjust based on your backend’s response structure
//     const inspections = result?.data?.data || result?.data || result || [];

//     console.log("Inspections for static generation:", inspections); // Debug log

//     // Return an array of `{ id }` objects for each inspection
//     return inspections.map((insp: any) => ({
//       id: insp.id.toString(),
//     }));
//   } catch (error) {
//     console.error("Error in generateStaticParams:", error);
//     return [];
//   }
// }

// // ✅ Default export required
// export default function Page() {
//   return <InspectionDetailPage />;
// }










// // app/inspection-detail/[id]/page.tsx
// import InspectionDetailPage from "./InspectionDetailPage";

// export async function generateStaticParams() {
//   try {
//     const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/inspections`, {
//       next: { revalidate: 60 },
//     });
//     if (!res.ok) return [];
//     const data = await res.json();
//     const inspections = data?.data?.data || data?.data || [];
//     return inspections.map((i: any) => ({ id: i.id.toString() }));
//   } catch (error) {
//     console.warn("⚠️ Could not fetch inspections at build time:", error);
//     // Return dummy param to satisfy static export
//     return [{ id: "placeholder" }];
//   }
// }

// export default function Page() {
//   return <InspectionDetailPage />;
// }








// import InspectionDetailPage from "./InspectionDetailPage";

// // 🔹 Static generation (optional)
// export async function generateStaticParams() {
//   try {
//     const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/inspections`);
//     if (!res.ok) return [];

//     const result = await res.json();
//     const inspections = result?.data?.data || result?.data || result || [];
//     return inspections.map((i: any) => ({ id: i.id.toString() }));
//   } catch (error) {
//     console.error("Error in generateStaticParams:", error);
//     return [];
//   }
// }

// export default function Page() {
//   return <InspectionDetailPage />;
// }
