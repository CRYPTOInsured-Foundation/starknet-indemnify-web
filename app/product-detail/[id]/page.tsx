// app/product-detail/[id]/page.tsx
import ProductDetailPage from "./ProductDetailPage";

// 🔹 required only for static export builds
export async function generateStaticParams() {
  try {
    // Fetch available product IDs for static generation
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/insurance-products`);
    
    if (!res.ok) {
      console.error('Failed to fetch products for static generation');
      return [];
    }
    
    const result = await res.json();
    console.log('Static generation data:', result); // Debug log

    // Adjust based on your actual API response structure
    const products = result?.data?.data || result?.data || result || [];
    
    console.log('Products for static generation:', products); // Debug log

    return products.map((p: any) => ({
      id: p.id.toString(),
    }));
  } catch (error) {
    console.error('Error in generateStaticParams:', error);
    return [];
  }
}

// Add this to force dynamic rendering (remove if you want static generation)
// export const dynamic = 'force-dynamic';

// ✅ default export required
export default function Page() {
  return <ProductDetailPage />;
}








// // app/product-detail/[id]/page.tsx
// import ProductDetailPage from "./ProductDetailPage";

// // 🔹 required only for static export builds
// export async function generateStaticParams() {
//   // Fetch available product IDs for static generation
//   const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/insurance-products`);
//   const result = await res.json();

//   const products = result?.data.data;

//   return products.map((p: { id: string }) => ({
//     id: p.id.toString(),
//   }));
// }

// // ✅ default export required
// export default function Page() {
//   return <ProductDetailPage />;
// }












// "use client";

// import { useEffect } from "react";
// import { useParams, useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { 
//   ArrowLeft, 
//   Shield, 
//   CheckCircle, 
//   FileText, 
//   Zap, 
//   Globe, 
//   Clock,
//   Users,
//   AlertTriangle,
//   ChevronRight
// } from "lucide-react";
// import { useRootStore } from "@/stores/use-root-store";

// export default function ProductDetailPage() {
//   const router = useRouter();
//   const params = useParams();
//   const productId = params.id as string;

//   const {
//     selectedProduct,
//     isLoadingProduct,
//     productError,
//     fetchProductById,
//     clearSelectedProduct,
//   } = useRootStore();

//   useEffect(() => {
//     console.log("Product ID from params:", productId); // Debug log
    
//     if (productId) {
//       fetchProductById(productId);
//     }

//     return () => {
//       clearSelectedProduct();
//     };
//   }, [productId, fetchProductById, clearSelectedProduct]);

//   // Debug logs to see what's happening
//   console.log("Selected Product:", selectedProduct);
//   console.log("Loading:", isLoadingProduct);
//   console.log("Error:", productError);

//   if (isLoadingProduct) {
//     return (
//       <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-gray-600 text-lg">Loading policy details...</p>
//         </div>
//       </div>
//     );
//   }

//   if (productError || !selectedProduct) {
//     return (
//       <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
//         <div className="text-center max-w-md mx-auto p-6">
//           <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
//           <h2 className="text-2xl font-bold text-gray-900 mb-2">Policy Not Found</h2>
//           <p className="text-gray-600 mb-6">
//             {productError || "The requested insurance policy could not be found."}
//           </p>
//           <div className="flex gap-4 justify-center">
//             <Button onClick={() => router.back()} variant="outline">
//               <ArrowLeft className="h-4 w-4 mr-2" />
//               Go Back
//             </Button>
//             <Button onClick={() => router.push("/insurance")}>
//               Browse Policies
//             </Button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   const {
//     productName,
//     productDescription,
//     productCode,
//     policyClass,
//     subjectMatter,
//     basicRate,
//     defaultPremiumFrequency,
//     frequencyFactor,
//     minimumSumInsured,
//     maximumSumInsured,
//     bannerImageUrl,
//     productBenefits = [],
//     requiredDocuments = [],
//     productFAQs = [],
//     isActive,
//     createdAt
//   } = selectedProduct;

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
//       {/* Header Navigation */}
//       <header className="bg-white border-b sticky top-0 z-40 backdrop-blur-sm bg-white/95">
//         <div className="max-w-7xl mx-auto px-4 py-4">
//           <div className="flex items-center justify-between">
//             <Button
//               variant="ghost"
//               onClick={() => router.back()}
//               className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
//             >
//               <ArrowLeft className="h-4 w-4" />
//               Back to Policies
//             </Button>
            
//             <div className="flex items-center gap-4">
//               {isActive && (
//                 <Badge className="bg-green-500 text-white px-3 py-1">
//                   Active Policy
//                 </Badge>
//               )}
//               <Badge variant="secondary" className="bg-blue-100 text-blue-700">
//                 {policyClass}
//               </Badge>
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Hero Section */}
//       <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
//         <div className="absolute inset-0 bg-black/20"></div>
//         <div className="relative max-w-7xl mx-auto px-4 py-16">
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
//             {/* Content */}
//             <div className="space-y-6">
//               <div className="flex items-center gap-3">
//                 <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
//                   <Shield className="h-6 w-6" />
//                 </div>
//                 <span className="text-blue-100 font-medium">Smart Contract Insurance</span>
//               </div>

//               <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
//                 {productName}
//               </h1>

//               <p className="text-xl text-blue-100 leading-relaxed">
//                 {productDescription}
//               </p>

//               <div className="flex flex-wrap gap-4">
//                 <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
//                   <Zap className="h-4 w-4" />
//                   <span className="text-sm">Policy Code: {productCode}</span>
//                 </div>
//                 <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
//                   <Globe className="h-4 w-4" />
//                   <span className="text-sm">{subjectMatter}</span>
//                 </div>
//               </div>
//             </div>

//             {/* Stats Card */}
//             <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
//               <CardContent className="p-6">
//                 <div className="space-y-6">
//                   <div className="text-center">
//                     <p className="text-blue-200 text-sm font-medium">Premium Rate</p>
//                     <p className="text-4xl font-bold mt-2">
//                       {basicRate ? `${basicRate}%` : "Dynamic"}
//                     </p>
//                     <p className="text-blue-200 text-sm mt-1">
//                       {defaultPremiumFrequency} • {frequencyFactor}x
//                     </p>
//                   </div>

//                   <div className="grid grid-cols-2 gap-4">
//                     <div className="text-center">
//                       <p className="text-blue-200 text-sm">Min Coverage</p>
//                       <p className="text-lg font-semibold mt-1">
//                         {minimumSumInsured ? `$${minimumSumInsured}` : "Flexible"}
//                       </p>
//                     </div>
//                     <div className="text-center">
//                       <p className="text-blue-200 text-sm">Max Coverage</p>
//                       <p className="text-lg font-semibold mt-1">
//                         {maximumSumInsured ? `$${maximumSumInsured}` : "Custom"}
//                       </p>
//                     </div>
//                   </div>

//                   <Button className="w-full bg-white text-blue-700 hover:bg-blue-50 font-semibold py-3 text-lg">
//                     Get Protected Now
//                     <ChevronRight className="ml-2 h-5 w-5" />
//                   </Button>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </section>

//       {/* Main Content */}
//       <section className="py-16">
//         <div className="max-w-7xl mx-auto px-4">
//           <Tabs defaultValue="overview" className="space-y-8">
//             <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1 rounded-xl">
//               <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-white">
//                 Overview
//               </TabsTrigger>
//               <TabsTrigger value="benefits" className="rounded-lg data-[state=active]:bg-white">
//                 Benefits
//               </TabsTrigger>
//               <TabsTrigger value="documents" className="rounded-lg data-[state=active]:bg-white">
//                 Requirements
//               </TabsTrigger>
//               <TabsTrigger value="faq" className="rounded-lg data-[state=active]:bg-white">
//                 FAQ
//               </TabsTrigger>
//             </TabsList>

//             {/* Overview Tab */}
//             <TabsContent value="overview" className="space-y-8">
//               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//                 {/* Main Content */}
//                 <div className="lg:col-span-2 space-y-8">
//                   {/* Policy Details */}
//                   <Card>
//                     <CardHeader>
//                       <CardTitle className="flex items-center gap-2">
//                         <FileText className="h-5 w-5 text-blue-600" />
//                         Policy Details
//                       </CardTitle>
//                     </CardHeader>
//                     <CardContent className="space-y-4">
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div>
//                           <p className="text-sm text-gray-600">Policy Class</p>
//                           <p className="font-semibold">{policyClass}</p>
//                         </div>
//                         <div>
//                           <p className="text-sm text-gray-600">Subject Matter</p>
//                           <p className="font-semibold">{subjectMatter}</p>
//                         </div>
//                         <div>
//                           <p className="text-sm text-gray-600">Premium Frequency</p>
//                           <p className="font-semibold">{defaultPremiumFrequency}</p>
//                         </div>
//                         <div>
//                           <p className="text-sm text-gray-600">Frequency Factor</p>
//                           <p className="font-semibold">{frequencyFactor}x</p>
//                         </div>
//                       </div>
//                     </CardContent>
//                   </Card>

//                   {/* Coverage Information */}
//                   <Card>
//                     <CardHeader>
//                       <CardTitle className="flex items-center gap-2">
//                         <Shield className="h-5 w-5 text-green-600" />
//                         Coverage Information
//                       </CardTitle>
//                     </CardHeader>
//                     <CardContent>
//                       <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                           <div className="text-center">
//                             <div className="bg-white rounded-lg p-4 shadow-sm">
//                               <p className="text-sm text-gray-600 mb-2">Minimum Coverage</p>
//                               <p className="text-2xl font-bold text-green-700">
//                                 {minimumSumInsured ? `$${minimumSumInsured}` : "Flexible"}
//                               </p>
//                             </div>
//                           </div>
//                           <div className="text-center">
//                             <div className="bg-white rounded-lg p-4 shadow-sm">
//                               <p className="text-sm text-gray-600 mb-2">Maximum Coverage</p>
//                               <p className="text-2xl font-bold text-blue-700">
//                                 {maximumSumInsured ? `$${maximumSumInsured}` : "Custom"}
//                               </p>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 </div>

//                 {/* Sidebar */}
//                 <div className="space-y-6">
//                   {/* Quick Actions */}
//                   <Card>
//                     <CardHeader>
//                       <CardTitle className="text-lg">Quick Actions</CardTitle>
//                     </CardHeader>
//                     <CardContent className="space-y-3">
//                       <Button className="w-full justify-start" variant="outline">
//                         <FileText className="h-4 w-4 mr-2" />
//                         Download Policy PDF
//                       </Button>
//                       <Button className="w-full justify-start" variant="outline">
//                         <Users className="h-4 w-4 mr-2" />
//                         Contact Support
//                       </Button>
//                       <Button className="w-full justify-start" variant="outline">
//                         <Clock className="h-4 w-4 mr-2" />
//                         Calculate Premium
//                       </Button>
//                     </CardContent>
//                   </Card>

//                   {/* Policy Status */}
//                   <Card>
//                     <CardHeader>
//                       <CardTitle className="text-lg">Policy Status</CardTitle>
//                     </CardHeader>
//                     <CardContent className="space-y-3">
//                       <div className="flex justify-between">
//                         <span className="text-gray-600">Status</span>
//                         <Badge className={isActive ? "bg-green-500" : "bg-gray-500"}>
//                           {isActive ? "Active" : "Inactive"}
//                         </Badge>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-gray-600">Created</span>
//                         <span className="font-medium">
//                           {new Date(createdAt).toLocaleDateString()}
//                         </span>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 </div>
//               </div>
//             </TabsContent>

//             {/* Benefits Tab */}
//             <TabsContent value="benefits" className="space-y-6">
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="flex items-center gap-2">
//                     <CheckCircle className="h-5 w-5 text-green-600" />
//                     Policy Benefits & Features
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     {productBenefits.map((benefit, index) => (
//                       <div
//                         key={index}
//                         className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg"
//                       >
//                         <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
//                         <span className="text-gray-700">{benefit}</span>
//                       </div>
//                     ))}
//                   </div>
//                 </CardContent>
//               </Card>
//             </TabsContent>

//             {/* Documents Tab */}
//             <TabsContent value="documents" className="space-y-6">
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="flex items-center gap-2">
//                     <FileText className="h-5 w-5 text-blue-600" />
//                     Required Documents
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-3">
//                     {requiredDocuments.map((document, index) => (
//                       <div
//                         key={index}
//                         className="flex items-center gap-3 p-3 border rounded-lg"
//                       >
//                         <FileText className="h-4 w-4 text-gray-400" />
//                         <span className="text-gray-700">{document}</span>
//                       </div>
//                     ))}
//                   </div>
//                 </CardContent>
//               </Card>
//             </TabsContent>

//             {/* FAQ Tab */}
//             <TabsContent value="faq" className="space-y-6">
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Frequently Asked Questions</CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-6">
//                     {productFAQs.map(([question, answer], index) => (
//                       <div key={index} className="border-b pb-6 last:border-b-0">
//                         <h4 className="font-semibold text-lg mb-2 text-gray-900">
//                           {question}
//                         </h4>
//                         <p className="text-gray-600 leading-relaxed">{answer}</p>
//                       </div>
//                     ))}
//                   </div>
//                 </CardContent>
//               </Card>
//             </TabsContent>
//           </Tabs>

//           {/* CTA Section */}
//           <div className="mt-16 text-center">
//             <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white">
//               <h3 className="text-2xl md:text-3xl font-bold mb-4">
//                 Ready to Get Protected?
//               </h3>
//               <p className="text-blue-100 text-lg mb-6 max-w-2xl mx-auto">
//                 Join thousands of Web3 users who trust our smart contract insurance 
//                 for their digital asset protection.
//               </p>
//               <div className="flex flex-col sm:flex-row gap-4 justify-center">
//                 <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50">
//                   Purchase Policy
//                   <ChevronRight className="ml-2 h-5 w-5" />
//                 </Button>
//                 <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
//                   Contact Sales
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// }












// "use client";

// import { useEffect, useState } from "react";
// import { useParams, useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { 
//   ArrowLeft, 
//   Shield, 
//   CheckCircle, 
//   FileText, 
//   Zap, 
//   Globe, 
//   Clock,
//   Users,
//   AlertTriangle,
//   ChevronRight
// } from "lucide-react";
// import { useRootStore } from "@/stores/use-root-store";

// export default function InsuranceProductDetailPage() {
//   const router = useRouter();
//   const params = useParams();
//   const productId = params.id as string;

//   const {
//     selectedProduct,
//     isLoadingProduct,
//     productError,
//     fetchProductById,
//     clearSelectedProduct,
//   } = useRootStore();

//   const [activeTab, setActiveTab] = useState("overview");

//   useEffect(() => {
//     if (productId) {
//       fetchProductById(productId);
//     }

//     return () => {
//       clearSelectedProduct();
//     };
//   }, [productId, fetchProductById, clearSelectedProduct]);

//   if (isLoadingProduct) {
//     return (
//       <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-gray-600 text-lg">Loading policy details...</p>
//         </div>
//       </div>
//     );
//   }

//   if (productError || !selectedProduct) {
//     return (
//       <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
//         <div className="text-center max-w-md mx-auto p-6">
//           <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
//           <h2 className="text-2xl font-bold text-gray-900 mb-2">Policy Not Found</h2>
//           <p className="text-gray-600 mb-6">
//             {productError || "The requested insurance policy could not be found."}
//           </p>
//           <div className="flex gap-4 justify-center">
//             <Button onClick={() => router.back()} variant="outline">
//               <ArrowLeft className="h-4 w-4 mr-2" />
//               Go Back
//             </Button>
//             <Button onClick={() => router.push("/insurance")}>
//               Browse Policies
//             </Button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   const {
//     productName,
//     productDescription,
//     productCode,
//     policyClass,
//     subjectMatter,
//     basicRate,
//     defaultPremiumFrequency,
//     frequencyFactor,
//     minimumSumInsured,
//     maximumSumInsured,
//     bannerImageUrl,
//     productBenefits = [],
//     requiredDocuments = [],
//     productFAQs = [],
//     isActive,
//     createdAt
//   } = selectedProduct;

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
//       {/* Header Navigation */}
//       <header className="bg-white border-b sticky top-0 z-40 backdrop-blur-sm bg-white/95">
//         <div className="max-w-7xl mx-auto px-4 py-4">
//           <div className="flex items-center justify-between">
//             <Button
//               variant="ghost"
//               onClick={() => router.back()}
//               className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
//             >
//               <ArrowLeft className="h-4 w-4" />
//               Back to Policies
//             </Button>
            
//             <div className="flex items-center gap-4">
//               {isActive && (
//                 <Badge className="bg-green-500 text-white px-3 py-1">
//                   Active Policy
//                 </Badge>
//               )}
//               <Badge variant="secondary" className="bg-blue-100 text-blue-700">
//                 {policyClass}
//               </Badge>
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Hero Section */}
//       <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
//         <div className="absolute inset-0 bg-black/20"></div>
//         <div className="relative max-w-7xl mx-auto px-4 py-16">
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
//             {/* Content */}
//             <div className="space-y-6">
//               <div className="flex items-center gap-3">
//                 <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
//                   <Shield className="h-6 w-6" />
//                 </div>
//                 <span className="text-blue-100 font-medium">Smart Contract Insurance</span>
//               </div>

//               <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
//                 {productName}
//               </h1>

//               <p className="text-xl text-blue-100 leading-relaxed">
//                 {productDescription}
//               </p>

//               <div className="flex flex-wrap gap-4">
//                 <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
//                   <Zap className="h-4 w-4" />
//                   <span className="text-sm">Policy Code: {productCode}</span>
//                 </div>
//                 <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
//                   <Globe className="h-4 w-4" />
//                   <span className="text-sm">{subjectMatter}</span>
//                 </div>
//               </div>
//             </div>

//             {/* Stats Card */}
//             <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
//               <CardContent className="p-6">
//                 <div className="space-y-6">
//                   <div className="text-center">
//                     <p className="text-blue-200 text-sm font-medium">Premium Rate</p>
//                     <p className="text-4xl font-bold mt-2">
//                       {basicRate ? `${basicRate}%` : "Dynamic"}
//                     </p>
//                     <p className="text-blue-200 text-sm mt-1">
//                       {defaultPremiumFrequency} • {frequencyFactor}x
//                     </p>
//                   </div>

//                   <div className="grid grid-cols-2 gap-4">
//                     <div className="text-center">
//                       <p className="text-blue-200 text-sm">Min Coverage</p>
//                       <p className="text-lg font-semibold mt-1">
//                         {minimumSumInsured ? `$${minimumSumInsured}` : "Flexible"}
//                       </p>
//                     </div>
//                     <div className="text-center">
//                       <p className="text-blue-200 text-sm">Max Coverage</p>
//                       <p className="text-lg font-semibold mt-1">
//                         {maximumSumInsured ? `$${maximumSumInsured}` : "Custom"}
//                       </p>
//                     </div>
//                   </div>

//                   <Button className="w-full bg-white text-blue-700 hover:bg-blue-50 font-semibold py-3 text-lg">
//                     Get Protected Now
//                     <ChevronRight className="ml-2 h-5 w-5" />
//                   </Button>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </section>

//       {/* Main Content */}
//       <section className="py-16">
//         <div className="max-w-7xl mx-auto px-4">
//           <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
//             <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1 rounded-xl">
//               <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-white">
//                 Overview
//               </TabsTrigger>
//               <TabsTrigger value="benefits" className="rounded-lg data-[state=active]:bg-white">
//                 Benefits
//               </TabsTrigger>
//               <TabsTrigger value="documents" className="rounded-lg data-[state=active]:bg-white">
//                 Requirements
//               </TabsTrigger>
//               <TabsTrigger value="faq" className="rounded-lg data-[state=active]:bg-white">
//                 FAQ
//               </TabsTrigger>
//             </TabsList>

//             {/* Overview Tab */}
//             <TabsContent value="overview" className="space-y-8">
//               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//                 {/* Main Content */}
//                 <div className="lg:col-span-2 space-y-8">
//                   {/* Policy Details */}
//                   <Card>
//                     <CardHeader>
//                       <CardTitle className="flex items-center gap-2">
//                         <FileText className="h-5 w-5 text-blue-600" />
//                         Policy Details
//                       </CardTitle>
//                     </CardHeader>
//                     <CardContent className="space-y-4">
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div>
//                           <p className="text-sm text-gray-600">Policy Class</p>
//                           <p className="font-semibold">{policyClass}</p>
//                         </div>
//                         <div>
//                           <p className="text-sm text-gray-600">Subject Matter</p>
//                           <p className="font-semibold">{subjectMatter}</p>
//                         </div>
//                         <div>
//                           <p className="text-sm text-gray-600">Premium Frequency</p>
//                           <p className="font-semibold">{defaultPremiumFrequency}</p>
//                         </div>
//                         <div>
//                           <p className="text-sm text-gray-600">Frequency Factor</p>
//                           <p className="font-semibold">{frequencyFactor}x</p>
//                         </div>
//                       </div>
//                     </CardContent>
//                   </Card>

//                   {/* Coverage Information */}
//                   <Card>
//                     <CardHeader>
//                       <CardTitle className="flex items-center gap-2">
//                         <Shield className="h-5 w-5 text-green-600" />
//                         Coverage Information
//                       </CardTitle>
//                     </CardHeader>
//                     <CardContent>
//                       <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                           <div className="text-center">
//                             <div className="bg-white rounded-lg p-4 shadow-sm">
//                               <p className="text-sm text-gray-600 mb-2">Minimum Coverage</p>
//                               <p className="text-2xl font-bold text-green-700">
//                                 {minimumSumInsured ? `$${minimumSumInsured}` : "Flexible"}
//                               </p>
//                             </div>
//                           </div>
//                           <div className="text-center">
//                             <div className="bg-white rounded-lg p-4 shadow-sm">
//                               <p className="text-sm text-gray-600 mb-2">Maximum Coverage</p>
//                               <p className="text-2xl font-bold text-blue-700">
//                                 {maximumSumInsured ? `$${maximumSumInsured}` : "Custom"}
//                               </p>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 </div>

//                 {/* Sidebar */}
//                 <div className="space-y-6">
//                   {/* Quick Actions */}
//                   <Card>
//                     <CardHeader>
//                       <CardTitle className="text-lg">Quick Actions</CardTitle>
//                     </CardHeader>
//                     <CardContent className="space-y-3">
//                       <Button className="w-full justify-start" variant="outline">
//                         <FileText className="h-4 w-4 mr-2" />
//                         Download Policy PDF
//                       </Button>
//                       <Button className="w-full justify-start" variant="outline">
//                         <Users className="h-4 w-4 mr-2" />
//                         Contact Support
//                       </Button>
//                       <Button className="w-full justify-start" variant="outline">
//                         <Clock className="h-4 w-4 mr-2" />
//                         Calculate Premium
//                       </Button>
//                     </CardContent>
//                   </Card>

//                   {/* Policy Status */}
//                   <Card>
//                     <CardHeader>
//                       <CardTitle className="text-lg">Policy Status</CardTitle>
//                     </CardHeader>
//                     <CardContent className="space-y-3">
//                       <div className="flex justify-between">
//                         <span className="text-gray-600">Status</span>
//                         <Badge className={isActive ? "bg-green-500" : "bg-gray-500"}>
//                           {isActive ? "Active" : "Inactive"}
//                         </Badge>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-gray-600">Created</span>
//                         <span className="font-medium">
//                           {new Date(createdAt).toLocaleDateString()}
//                         </span>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 </div>
//               </div>
//             </TabsContent>

//             {/* Benefits Tab */}
//             <TabsContent value="benefits" className="space-y-6">
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="flex items-center gap-2">
//                     <CheckCircle className="h-5 w-5 text-green-600" />
//                     Policy Benefits & Features
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     {productBenefits.map((benefit, index) => (
//                       <div
//                         key={index}
//                         className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg"
//                       >
//                         <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
//                         <span className="text-gray-700">{benefit}</span>
//                       </div>
//                     ))}
//                   </div>
//                 </CardContent>
//               </Card>
//             </TabsContent>

//             {/* Documents Tab */}
//             <TabsContent value="documents" className="space-y-6">
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="flex items-center gap-2">
//                     <FileText className="h-5 w-5 text-blue-600" />
//                     Required Documents
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-3">
//                     {requiredDocuments.map((document, index) => (
//                       <div
//                         key={index}
//                         className="flex items-center gap-3 p-3 border rounded-lg"
//                       >
//                         <FileText className="h-4 w-4 text-gray-400" />
//                         <span className="text-gray-700">{document}</span>
//                       </div>
//                     ))}
//                   </div>
//                 </CardContent>
//               </Card>
//             </TabsContent>

//             {/* FAQ Tab */}
//             <TabsContent value="faq" className="space-y-6">
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Frequently Asked Questions</CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-6">
//                     {productFAQs.map(([question, answer], index) => (
//                       <div key={index} className="border-b pb-6 last:border-b-0">
//                         <h4 className="font-semibold text-lg mb-2 text-gray-900">
//                           {question}
//                         </h4>
//                         <p className="text-gray-600 leading-relaxed">{answer}</p>
//                       </div>
//                     ))}
//                   </div>
//                 </CardContent>
//               </Card>
//             </TabsContent>
//           </Tabs>

//           {/* CTA Section */}
//           <div className="mt-16 text-center">
//             <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white">
//               <h3 className="text-2xl md:text-3xl font-bold mb-4">
//                 Ready to Get Protected?
//               </h3>
//               <p className="text-blue-100 text-lg mb-6 max-w-2xl mx-auto">
//                 Join thousands of Web3 users who trust our smart contract insurance 
//                 for their digital asset protection.
//               </p>
//               <div className="flex flex-col sm:flex-row gap-4 justify-center">
//                 <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50">
//                   Purchase Policy
//                   <ChevronRight className="ml-2 h-5 w-5" />
//                 </Button>
//                 <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
//                   Contact Sales
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// }