"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight, CheckCircle, Shield, Zap, Filter } from "lucide-react";
import { useRootStore } from "@/stores/use-root-store";

export default function InsuranceProductsPage() {
  const router = useRouter();
  const {
    insuranceProducts,
    isLoadingProduct,
    productError,
    fetchProducts,
    setSelectedProduct,
  } = useRootStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true, 
      align: "start",
      containScroll: "trimSnaps",
      dragFree: true
    },
    [Autoplay({ delay: 5000, stopOnInteraction: false })]
  );

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Get unique categories from products
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(insuranceProducts.map(product => product.policyClass)));
    return ["all", ...uniqueCategories];
  }, [insuranceProducts]);

  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    return insuranceProducts.filter(product => {
      const matchesSearch = 
        product.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.productDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.subjectMatter.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === "all" || product.policyClass === selectedCategory;
      
      return matchesSearch && matchesCategory && product.isActive;
    });
  }, [insuranceProducts, searchQuery, selectedCategory]);

  const featuredProducts = filteredProducts.slice(0, 6);

  // Handle product click - navigate to detail page
  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
    router.push(`/product-detail/${product.id}`);
  };

  // Handle "View Policy Details" button click
  const handleViewDetails = (product: any, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click event
    setSelectedProduct(product);
    router.push(`/product-detail/${product.id}`);
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 py-20 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
              <Shield className="h-5 w-5" />
              <span className="text-sm font-medium">Blockchain-Powered Protection</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Smart Contract <span className="text-blue-200">Insurance</span>
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8 leading-relaxed">
            Decentralized insurance protocols protecting your digital assets against 
            smart contract vulnerabilities, protocol failures, and decentralized risks.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50">
              Browse Policies
              <Zap className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Search & Filter Section */}
      <section className="py-12 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            <div className="flex-1 w-full max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search insurance policies by name, description, or coverage type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-3 w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4 w-full lg:w-auto">
              <Filter className="h-5 w-5 text-gray-600" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2.5 focus:border-blue-500 focus:ring-blue-500 bg-white"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Results Info */}
          {searchQuery && (
            <div className="mt-4 text-center">
              <p className="text-gray-600">
                Found {filteredProducts.length} policy{filteredProducts.length !== 1 ? 'ies' : ''} 
                {searchQuery && ` for "${searchQuery}"`}
                {selectedCategory !== "all" && ` in ${selectedCategory}`}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Product Carousel Section */}
      <section className="py-20 bg-transparent">
        <div className="max-w-7xl mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-16">
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 px-4 py-1.5 mb-4 text-sm font-semibold">
              Available Policies
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              On-Chain Insurance Solutions
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Select from our verified smart contract insurance policies to protect your Web3 investments
            </p>
          </div>

          {/* Loading & Error States */}
          {isLoadingProduct && (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading insurance policies...</p>
              </div>
            </div>
          )}

          {productError && (
            <div className="text-center py-20">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                <p className="text-red-700 mb-4">{productError}</p>
                <Button 
                  onClick={fetchProducts}
                  variant="outline" 
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {/* Products Carousel */}
          {!isLoadingProduct && !productError && featuredProducts.length > 0 && (
            <div className="relative">
              <div ref={emblaRef} className="overflow-hidden">
                <div className="flex touch-pan-y -ml-4">
                  {featuredProducts.map((product) => (
                    <div key={product.id} className="flex-[0_0_380px] min-w-0 pl-4">
                      <Card 
                        className="group relative h-full bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-2xl hover:border-blue-200 transition-all duration-300 flex flex-col cursor-pointer"
                        onClick={() => handleProductClick(product)}
                      >
                        {/* Banner Image Container */}
                        <div className="relative w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                          {product.bannerImageUrl ? (
                            <img
                              src={product.bannerImageUrl}
                              alt={product.productName}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100">
                              <Shield className="h-12 w-12 text-blue-400" />
                            </div>
                          )}
                          
                          {/* Overlay Badges */}
                          <div className="absolute top-4 left-4 flex flex-col gap-2">
                            {product.isActive && (
                              <Badge className="bg-green-500 text-white shadow-lg border-0 px-3 py-1">
                                Active
                              </Badge>
                            )}
                            <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-gray-700 shadow-sm">
                              {product.policyClass}
                            </Badge>
                          </div>
                        </div>

                        {/* Card Content */}
                        <div className="flex-1 flex flex-col p-6">
                          <CardHeader className="p-0 mb-4">
                            <CardTitle className="text-xl font-bold text-gray-900 line-clamp-2 leading-tight">
                              {product.productName}
                            </CardTitle>
                            <p className="text-gray-600 text-sm mt-2 line-clamp-3 leading-relaxed">
                              {product.productDescription || "Smart contract-based protection for decentralized applications and assets."}
                            </p>
                          </CardHeader>

                          {/* Benefits List */}
                          {product.productBenefits && product.productBenefits.length > 0 && (
                            <div className="space-y-3 mb-6 flex-1">
                              {product.productBenefits.slice(0, 3).map((benefit, index) => (
                                <div
                                  key={index}
                                  className="flex items-start gap-3 text-gray-700"
                                >
                                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                                  <span className="text-sm leading-tight">{benefit}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Pricing & Coverage */}
                          <div className="space-y-4 mt-auto">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div className="text-center p-3 bg-blue-50 rounded-lg">
                                <p className="text-gray-600 text-xs font-medium">Premium Rate</p>
                                <p className="font-bold text-blue-700 text-lg">
                                  {product.basicRate ? `${product.basicRate}%` : "Dynamic"}
                                </p>
                              </div>
                              <div className="text-center p-3 bg-green-50 rounded-lg">
                                <p className="text-gray-600 text-xs font-medium">Max Coverage</p>
                                <p className="font-bold text-green-700 text-lg">
                                  {product.maximumSumInsured ? `$${product.maximumSumInsured}` : "Flexible"}
                                </p>
                              </div>
                            </div>

                            {/* CTA Button */}
                            <Button 
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 group/btn"
                              onClick={(e) => handleViewDetails(product, e)}
                            >
                              View Policy Details
                              <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Dots */}
              <div className="flex justify-center gap-2 mt-8">
                {featuredProducts.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => emblaApi?.scrollTo(index)}
                    className="w-2 h-2 rounded-full bg-gray-300 hover:bg-blue-600 transition-colors"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty Search Results */}
          {!isLoadingProduct && !productError && searchQuery && filteredProducts.length === 0 && (
            <div className="text-center py-20">
              <div className="bg-gray-50 rounded-2xl p-12 max-w-md mx-auto">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No policies found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your search terms or browse all categories.</p>
                <Button 
                  onClick={() => setSearchQuery("")}
                  variant="outline"
                >
                  Clear Search
                </Button>
              </div>
            </div>
          )}

          {/* Empty State (no products at all) */}
          {!isLoadingProduct && !productError && !searchQuery && filteredProducts.length === 0 && (
            <div className="text-center py-20">
              <div className="bg-gray-50 rounded-2xl p-12 max-w-md mx-auto">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Policies Available</h3>
                <p className="text-gray-600">New insurance policies are being added regularly. Check back soon!</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Blockchain Benefits Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Blockchain Insurance?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience the future of insurance with transparent, automated, and decentralized protection
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Instant Claims</h3>
              <p className="text-gray-600">
                Automated claim processing through smart contracts eliminates delays and bureaucracy
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Transparent Coverage</h3>
              <p className="text-gray-600">
                All policy terms and claim conditions are verifiable on the blockchain
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Global Access</h3>
              <p className="text-gray-600">
                Borderless insurance solutions accessible to anyone with an internet connection
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}






















// "use client";

// import { useEffect, useState, useMemo } from "react";
// import useEmblaCarousel from "embla-carousel-react";
// import Autoplay from "embla-carousel-autoplay";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Input } from "@/components/ui/input";
// import { Search, ArrowRight, CheckCircle, Shield, Zap, Filter } from "lucide-react";
// import { useRootStore } from "@/stores/use-root-store";

// export default function InsuranceProductsPage() {
//   const {
//     insuranceProducts,
//     isLoadingProduct,
//     productError,
//     fetchProducts,
//   } = useRootStore();

//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedCategory, setSelectedCategory] = useState("all");
//   const [emblaRef, emblaApi] = useEmblaCarousel(
//     { 
//       loop: true, 
//       align: "start",
//       containScroll: "trimSnaps",
//       dragFree: true
//     },
//     [Autoplay({ delay: 5000, stopOnInteraction: false })]
//   );

//   useEffect(() => {
//     fetchProducts();
//   }, [fetchProducts]);

//   // Get unique categories from products
//   const categories = useMemo(() => {
//     const uniqueCategories = Array.from(new Set(insuranceProducts.map(product => product.policyClass)));
//     return ["all", ...uniqueCategories];
//   }, [insuranceProducts]);

//   // Filter products based on search and category
//   const filteredProducts = useMemo(() => {
//     return insuranceProducts.filter(product => {
//       const matchesSearch = 
//         product.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         product.productDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         product.subjectMatter.toLowerCase().includes(searchQuery.toLowerCase());
      
//       const matchesCategory = selectedCategory === "all" || product.policyClass === selectedCategory;
      
//       return matchesSearch && matchesCategory && product.isActive;
//     });
//   }, [insuranceProducts, searchQuery, selectedCategory]);

//   const featuredProducts = filteredProducts.slice(0, 6);

//   return (
//     <div className="w-full min-h-screen bg-gradient-to-b from-slate-50 to-white">
//       {/* Hero Section */}
//       <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 py-20 text-white overflow-hidden">
//         <div className="absolute inset-0 bg-black/10"></div>
//         <div className="relative max-w-7xl mx-auto px-4 text-center">
//           <div className="flex justify-center mb-6">
//             <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
//               <Shield className="h-5 w-5" />
//               <span className="text-sm font-medium">Blockchain-Powered Protection</span>
//             </div>
//           </div>
//           <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
//             Smart Contract <span className="text-blue-200">Insurance</span>
//           </h1>
//           <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8 leading-relaxed">
//             Decentralized insurance protocols protecting your digital assets against 
//             smart contract vulnerabilities, protocol failures, and decentralized risks.
//           </p>
//           <div className="flex gap-4 justify-center">
//             <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50">
//               Browse Policies
//               <Zap className="ml-2 h-4 w-4" />
//             </Button>
//             <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
//               Learn More
//             </Button>
//           </div>
//         </div>
//       </section>

//       {/* Search & Filter Section */}
//       <section className="py-12 bg-white border-b">
//         <div className="max-w-7xl mx-auto px-4">
//           <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
//             <div className="flex-1 w-full max-w-2xl">
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
//                 <Input
//                   type="text"
//                   placeholder="Search insurance policies by name, description, or coverage type..."
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   className="pl-10 pr-4 py-3 w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
//                 />
//               </div>
//             </div>
            
//             <div className="flex items-center gap-4 w-full lg:w-auto">
//               <Filter className="h-5 w-5 text-gray-600" />
//               <select
//                 value={selectedCategory}
//                 onChange={(e) => setSelectedCategory(e.target.value)}
//                 className="border border-gray-300 rounded-lg px-4 py-2.5 focus:border-blue-500 focus:ring-blue-500 bg-white"
//               >
//                 {categories.map(category => (
//                   <option key={category} value={category}>
//                     {category === "all" ? "All Categories" : category}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           {/* Search Results Info */}
//           {searchQuery && (
//             <div className="mt-4 text-center">
//               <p className="text-gray-600">
//                 Found {filteredProducts.length} policy{filteredProducts.length !== 1 ? 'ies' : ''} 
//                 {searchQuery && ` for "${searchQuery}"`}
//                 {selectedCategory !== "all" && ` in ${selectedCategory}`}
//               </p>
//             </div>
//           )}
//         </div>
//       </section>

//       {/* Product Carousel Section */}
//       <section className="py-20 bg-transparent">
//         <div className="max-w-7xl mx-auto px-4">
//           {/* Section Header */}
//           <div className="text-center mb-16">
//             <Badge variant="secondary" className="bg-blue-100 text-blue-700 px-4 py-1.5 mb-4 text-sm font-semibold">
//               Available Policies
//             </Badge>
//             <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
//               On-Chain Insurance Solutions
//             </h2>
//             <p className="text-lg text-gray-600 max-w-2xl mx-auto">
//               Select from our verified smart contract insurance policies to protect your Web3 investments
//             </p>
//           </div>

//           {/* Loading & Error States */}
//           {isLoadingProduct && (
//             <div className="flex justify-center items-center py-20">
//               <div className="text-center">
//                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//                 <p className="text-gray-600">Loading insurance policies...</p>
//               </div>
//             </div>
//           )}

//           {productError && (
//             <div className="text-center py-20">
//               <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
//                 <p className="text-red-700 mb-4">{productError}</p>
//                 <Button 
//                   onClick={fetchProducts}
//                   variant="outline" 
//                   className="border-red-300 text-red-700 hover:bg-red-50"
//                 >
//                   Try Again
//                 </Button>
//               </div>
//             </div>
//           )}

//           {/* Products Carousel */}
//           {!isLoadingProduct && !productError && featuredProducts.length > 0 && (
//             <div className="relative">
//               <div ref={emblaRef} className="overflow-hidden">
//                 <div className="flex touch-pan-y -ml-4">
//                   {featuredProducts.map((product) => (
//                     <div key={product.id} className="flex-[0_0_380px] min-w-0 pl-4">
//                       <Card className="group relative h-full bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-2xl hover:border-blue-200 transition-all duration-300 flex flex-col">
//                         {/* Banner Image Container */}
//                         <div className="relative w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
//                           {product.bannerImageUrl ? (
//                             <img
//                               src={product.bannerImageUrl}
//                               alt={product.productName}
//                               className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
//                             />
//                           ) : (
//                             <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100">
//                               <Shield className="h-12 w-12 text-blue-400" />
//                             </div>
//                           )}
                          
//                           {/* Overlay Badges */}
//                           <div className="absolute top-4 left-4 flex flex-col gap-2">
//                             {product.isActive && (
//                               <Badge className="bg-green-500 text-white shadow-lg border-0 px-3 py-1">
//                                 Active
//                               </Badge>
//                             )}
//                             <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-gray-700 shadow-sm">
//                               {product.policyClass}
//                             </Badge>
//                           </div>
//                         </div>

//                         {/* Card Content */}
//                         <div className="flex-1 flex flex-col p-6">
//                           <CardHeader className="p-0 mb-4">
//                             <CardTitle className="text-xl font-bold text-gray-900 line-clamp-2 leading-tight">
//                               {product.productName}
//                             </CardTitle>
//                             <p className="text-gray-600 text-sm mt-2 line-clamp-3 leading-relaxed">
//                               {product.productDescription || "Smart contract-based protection for decentralized applications and assets."}
//                             </p>
//                           </CardHeader>

//                           {/* Benefits List */}
//                           {product.productBenefits && product.productBenefits.length > 0 && (
//                             <div className="space-y-3 mb-6 flex-1">
//                               {product.productBenefits.slice(0, 3).map((benefit, index) => (
//                                 <div
//                                   key={index}
//                                   className="flex items-start gap-3 text-gray-700"
//                                 >
//                                   <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
//                                   <span className="text-sm leading-tight">{benefit}</span>
//                                 </div>
//                               ))}
//                             </div>
//                           )}

//                           {/* Pricing & Coverage */}
//                           <div className="space-y-4 mt-auto">
//                             <div className="grid grid-cols-2 gap-4 text-sm">
//                               <div className="text-center p-3 bg-blue-50 rounded-lg">
//                                 <p className="text-gray-600 text-xs font-medium">Premium Rate</p>
//                                 <p className="font-bold text-blue-700 text-lg">
//                                   {product.basicRate ? `${product.basicRate}%` : "Dynamic"}
//                                 </p>
//                               </div>
//                               <div className="text-center p-3 bg-green-50 rounded-lg">
//                                 <p className="text-gray-600 text-xs font-medium">Max Coverage</p>
//                                 <p className="font-bold text-green-700 text-lg">
//                                   {product.maximumSumInsured ? `$${product.maximumSumInsured}` : "Flexible"}
//                                 </p>
//                               </div>
//                             </div>

//                             {/* CTA Button */}
//                             <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 group/btn">
//                               View Policy Details
//                               <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
//                             </Button>
//                           </div>
//                         </div>
//                       </Card>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Navigation Dots */}
//               <div className="flex justify-center gap-2 mt-8">
//                 {featuredProducts.map((_, index) => (
//                   <button
//                     key={index}
//                     onClick={() => emblaApi?.scrollTo(index)}
//                     className="w-2 h-2 rounded-full bg-gray-300 hover:bg-blue-600 transition-colors"
//                   />
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Empty Search Results */}
//           {!isLoadingProduct && !productError && searchQuery && filteredProducts.length === 0 && (
//             <div className="text-center py-20">
//               <div className="bg-gray-50 rounded-2xl p-12 max-w-md mx-auto">
//                 <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//                 <h3 className="text-lg font-semibold text-gray-900 mb-2">No policies found</h3>
//                 <p className="text-gray-600 mb-4">Try adjusting your search terms or browse all categories.</p>
//                 <Button 
//                   onClick={() => setSearchQuery("")}
//                   variant="outline"
//                 >
//                   Clear Search
//                 </Button>
//               </div>
//             </div>
//           )}

//           {/* Empty State (no products at all) */}
//           {!isLoadingProduct && !productError && !searchQuery && filteredProducts.length === 0 && (
//             <div className="text-center py-20">
//               <div className="bg-gray-50 rounded-2xl p-12 max-w-md mx-auto">
//                 <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//                 <h3 className="text-lg font-semibold text-gray-900 mb-2">No Policies Available</h3>
//                 <p className="text-gray-600">New insurance policies are being added regularly. Check back soon!</p>
//               </div>
//             </div>
//           )}
//         </div>
//       </section>

//       {/* Blockchain Benefits Section */}
//       <section className="py-16 bg-gray-50">
//         <div className="max-w-7xl mx-auto px-4">
//           <div className="text-center mb-12">
//             <h2 className="text-3xl font-bold text-gray-900 mb-4">
//               Why Choose Blockchain Insurance?
//             </h2>
//             <p className="text-lg text-gray-600 max-w-2xl mx-auto">
//               Experience the future of insurance with transparent, automated, and decentralized protection
//             </p>
//           </div>
          
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//             <div className="text-center p-6">
//               <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <Zap className="h-8 w-8 text-blue-600" />
//               </div>
//               <h3 className="text-xl font-semibold text-gray-900 mb-3">Instant Claims</h3>
//               <p className="text-gray-600">
//                 Automated claim processing through smart contracts eliminates delays and bureaucracy
//               </p>
//             </div>
            
//             <div className="text-center p-6">
//               <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <Shield className="h-8 w-8 text-green-600" />
//               </div>
//               <h3 className="text-xl font-semibold text-gray-900 mb-3">Transparent Coverage</h3>
//               <p className="text-gray-600">
//                 All policy terms and claim conditions are verifiable on the blockchain
//               </p>
//             </div>
            
//             <div className="text-center p-6">
//               <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <CheckCircle className="h-8 w-8 text-purple-600" />
//               </div>
//               <h3 className="text-xl font-semibold text-gray-900 mb-3">Global Access</h3>
//               <p className="text-gray-600">
//                 Borderless insurance solutions accessible to anyone with an internet connection
//               </p>
//             </div>
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// }












// "use client";

// import { useEffect } from "react";
// import useEmblaCarousel from "embla-carousel-react";
// import Autoplay from "embla-carousel-autoplay";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { ArrowRight, CheckCircle, Shield, Zap } from "lucide-react";
// import { useRootStore } from "@/stores/use-root-store";

// export default function InsuranceProductsPage() {
//   const {
//     insuranceProducts,
//     isLoadingProduct,
//     productError,
//     fetchProducts,
//   } = useRootStore();

//   const [emblaRef, emblaApi] = useEmblaCarousel(
//     { 
//       loop: true, 
//       align: "start",
//       containScroll: "trimSnaps",
//       dragFree: true
//     },
//     [Autoplay({ delay: 5000, stopOnInteraction: false })]
//   );

//   useEffect(() => {
//     fetchProducts();
//   }, [fetchProducts]);

//   const featuredProducts = insuranceProducts.filter(product => product.isActive).slice(0, 6);

//   return (
//     <div className="w-full min-h-screen bg-gradient-to-b from-slate-50 to-white">
//       {/* Hero Section */}
//       <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 py-20 text-white overflow-hidden">
//         <div className="absolute inset-0 bg-black/10"></div>
//         <div className="relative max-w-7xl mx-auto px-4 text-center">
//           <div className="flex justify-center mb-6">
//             <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
//               <Shield className="h-5 w-5" />
//               <span className="text-sm font-medium">On-Chain Protection</span>
//             </div>
//           </div>
//           <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
//             Secure Your <span className="text-blue-200">Digital Assets</span>
//           </h1>
//           <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8 leading-relaxed">
//             Comprehensive DeFi insurance solutions protecting your crypto investments 
//             against smart contract risks, hacks, and protocol failures.
//           </p>
//           <div className="flex gap-4 justify-center">
//             <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50">
//               Explore Products
//               <Zap className="ml-2 h-4 w-4" />
//             </Button>
//             <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
//               How It Works
//             </Button>
//           </div>
//         </div>
//       </section>

//       {/* Product Carousel Section */}
//       <section className="py-20 bg-transparent">
//         <div className="max-w-7xl mx-auto px-4">
//           {/* Section Header */}
//           <div className="text-center mb-16">
//             <Badge variant="secondary" className="bg-blue-100 text-blue-700 px-4 py-1.5 mb-4 text-sm font-semibold">
//               Featured Products
//             </Badge>
//             <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
//               Tailored Protection for Web3
//             </h2>
//             <p className="text-lg text-gray-600 max-w-2xl mx-auto">
//               Choose from our range of specialized insurance products designed for the modern crypto investor
//             </p>
//           </div>

//           {/* Loading & Error States */}
//           {isLoadingProduct && (
//             <div className="flex justify-center items-center py-20">
//               <div className="text-center">
//                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//                 <p className="text-gray-600">Loading insurance products...</p>
//               </div>
//             </div>
//           )}

//           {productError && (
//             <div className="text-center py-20">
//               <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
//                 <p className="text-red-700 mb-4">{productError}</p>
//                 <Button 
//                   onClick={fetchProducts}
//                   variant="outline" 
//                   className="border-red-300 text-red-700 hover:bg-red-50"
//                 >
//                   Try Again
//                 </Button>
//               </div>
//             </div>
//           )}

//           {/* Products Carousel */}
//           {!isLoadingProduct && !productError && featuredProducts.length > 0 && (
//             <div className="relative">
//               <div ref={emblaRef} className="overflow-hidden">
//                 <div className="flex touch-pan-y -ml-4">
//                   {featuredProducts.map((product) => (
//                     <div key={product.id} className="flex-[0_0_380px] min-w-0 pl-4">
//                       <Card className="group relative h-full bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-2xl hover:border-blue-200 transition-all duration-300 flex flex-col">
//                         {/* Banner Image Container */}
//                         <div className="relative w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
//                           {product.bannerImageUrl ? (
//                             <img
//                               src={product.bannerImageUrl}
//                               alt={product.productName}
//                               className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
//                             />
//                           ) : (
//                             <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100">
//                               <Shield className="h-12 w-12 text-blue-400" />
//                             </div>
//                           )}
                          
//                           {/* Overlay Badges */}
//                           <div className="absolute top-4 left-4 flex flex-col gap-2">
//                             {product.isActive && (
//                               <Badge className="bg-green-500 text-white shadow-lg border-0 px-3 py-1">
//                                 Active
//                               </Badge>
//                             )}
//                             <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-gray-700 shadow-sm">
//                               {product.policyClass}
//                             </Badge>
//                           </div>
//                         </div>

//                         {/* Card Content */}
//                         <div className="flex-1 flex flex-col p-6">
//                           <CardHeader className="p-0 mb-4">
//                             <CardTitle className="text-xl font-bold text-gray-900 line-clamp-2 leading-tight">
//                               {product.productName}
//                             </CardTitle>
//                             <p className="text-gray-600 text-sm mt-2 line-clamp-3 leading-relaxed">
//                               {product.productDescription || "Comprehensive protection for your digital assets and investments."}
//                             </p>
//                           </CardHeader>

//                           {/* Benefits List */}
//                           {product.productBenefits && product.productBenefits.length > 0 && (
//                             <div className="space-y-3 mb-6 flex-1">
//                               {product.productBenefits.slice(0, 3).map((benefit, index) => (
//                                 <div
//                                   key={index}
//                                   className="flex items-start gap-3 text-gray-700"
//                                 >
//                                   <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
//                                   <span className="text-sm leading-tight">{benefit}</span>
//                                 </div>
//                               ))}
//                             </div>
//                           )}

//                           {/* Pricing & Coverage */}
//                           <div className="space-y-4 mt-auto">
//                             <div className="grid grid-cols-2 gap-4 text-sm">
//                               <div className="text-center p-3 bg-blue-50 rounded-lg">
//                                 <p className="text-gray-600 text-xs font-medium">Premium Rate</p>
//                                 <p className="font-bold text-blue-700 text-lg">
//                                   {product.basicRate ? `${product.basicRate}%` : "Flexible"}
//                                 </p>
//                               </div>
//                               <div className="text-center p-3 bg-green-50 rounded-lg">
//                                 <p className="text-gray-600 text-xs font-medium">Max Coverage</p>
//                                 <p className="font-bold text-green-700 text-lg">
//                                   {product.maximumSumInsured ? `$${product.maximumSumInsured}` : "Custom"}
//                                 </p>
//                               </div>
//                             </div>

//                             {/* CTA Button */}
//                             <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 group/btn">
//                               Get Protected
//                               <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
//                             </Button>
//                           </div>
//                         </div>
//                       </Card>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Navigation Arrows (Optional) */}
//               <div className="flex justify-center gap-2 mt-8">
//                 {featuredProducts.map((_, index) => (
//                   <button
//                     key={index}
//                     onClick={() => emblaApi?.scrollTo(index)}
//                     className="w-2 h-2 rounded-full bg-gray-300 hover:bg-blue-600 transition-colors"
//                   />
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Empty State */}
//           {!isLoadingProduct && !productError && featuredProducts.length === 0 && (
//             <div className="text-center py-20">
//               <div className="bg-gray-50 rounded-2xl p-12 max-w-md mx-auto">
//                 <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//                 <h3 className="text-lg font-semibold text-gray-900 mb-2">No Products Available</h3>
//                 <p className="text-gray-600">Check back later for new insurance products.</p>
//               </div>
//             </div>
//           )}
//         </div>
//       </section>

//       {/* Stats Section */}
//       <section className="py-16 bg-gray-50">
//         <div className="max-w-7xl mx-auto px-4">
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
//             <div className="p-6">
//               <div className="text-3xl font-bold text-blue-600 mb-2">$42M+</div>
//               <p className="text-gray-600">Total Value Protected</p>
//             </div>
//             <div className="p-6">
//               <div className="text-3xl font-bold text-green-600 mb-2">98%</div>
//               <p className="text-gray-600">Claim Approval Rate</p>
//             </div>
//             <div className="p-6">
//               <div className="text-3xl font-bold text-purple-600 mb-2">24/7</div>
//               <p className="text-gray-600">On-Chain Support</p>
//             </div>
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// }















// "use client";

// import { useEffect } from "react";
// import useEmblaCarousel from "embla-carousel-react";
// import Autoplay from "embla-carousel-autoplay";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { ArrowRight, CheckCircle } from "lucide-react";
// import { useRootStore } from "@/stores/use-root-store";

// export default function InsuranceProductsPage() {
//   const {
//     insuranceProducts,
//     isLoadingProduct,
//     productError,
//     fetchProducts,
//   } = useRootStore();

//   const [emblaRef] = useEmblaCarousel(
//     { loop: true, align: "start" },
//     [Autoplay({ delay: 4000, stopOnInteraction: false })]
//   );

//   useEffect(() => {
//     fetchProducts();
//   }, [fetchProducts]);

//   return (
//     <div className="w-full">
//       {/* Hero */}
//       <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20 text-center">
//         <div className="max-w-6xl mx-auto px-4">
//           <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
//             Explore Our <span className="text-blue-600">Insurance Products</span>
//           </h1>
//           <p className="text-lg text-gray-600 max-w-3xl mx-auto">
//             Protect your DeFi and crypto activities with innovative on-chain
//             insurance solutions.
//           </p>
//         </div>
//       </section>

//       {/* Product Carousel */}
//       <section className="py-16 bg-white">
//         <div className="max-w-7xl mx-auto px-6">
//           <div className="text-center mb-10">
//             <Badge className="bg-blue-100 text-blue-700 mb-3">Our Products</Badge>
//             <h2 className="text-3xl font-bold text-gray-900">
//               Discover Protection Tailored for You
//             </h2>
//           </div>

//           {isLoadingProduct ? (
//             <p className="text-center text-gray-600">Loading products...</p>
//           ) : productError ? (
//             <p className="text-center text-red-500">{productError}</p>
//           ) : insuranceProducts.length === 0 ? (
//             <p className="text-center text-gray-500">No products available.</p>
//           ) : (
//             <div className="flex justify-center">
//               <div ref={emblaRef} className="overflow-hidden w-[80%]">
//                 <div className="flex gap-8 pb-6">
//                   {insuranceProducts.map((product) => (
//                     <Card
//                       key={product.id}
//                       className="relative min-w-[360px] flex-shrink-0 hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden bg-white"
//                     >
//                       {/* Banner Image */}
//                       <div className="relative w-full h-60 bg-gray-100">
//                         {product.bannerImageUrl ? (
//                           <img
//                             src={product.bannerImageUrl}
//                             alt={product.productName}
//                             className="w-full h-full object-cover"
//                           />
//                         ) : (
//                           <div className="flex items-center justify-center w-full h-full text-gray-400 text-sm">
//                             No image available
//                           </div>
//                         )}
//                         {product.isActive && (
//                           <div className="absolute top-3 left-3">
//                             <Badge className="bg-blue-600 text-white shadow-md">
//                               Active Plan
//                             </Badge>
//                           </div>
//                         )}
//                       </div>

//                       {/* Content */}
//                       <div className="flex flex-col justify-between h-[340px]">
//                         <CardHeader className="px-6 pt-4">
//                           <CardTitle className="text-xl font-semibold text-gray-900 mb-2">
//                             {product.productName}
//                           </CardTitle>
//                           <p className="text-gray-600 text-sm leading-relaxed line-clamp-4">
//                             {product.productDescription ||
//                               "Secure your DeFi assets with flexible on-chain coverage."}
//                           </p>
//                         </CardHeader>

//                         <CardContent className="px-6 pb-6">
//                           <div className="space-y-2 mb-5">
//                             {product.productBenefits?.slice(0, 3).map((item, i) => (
//                               <div
//                                 key={i}
//                                 className="flex items-center space-x-2 text-gray-700"
//                               >
//                                 <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
//                                 <span className="text-sm">{item}</span>
//                               </div>
//                             ))}
//                           </div>

//                           <div className="flex justify-between items-center border-t pt-4">
//                             <div>
//                               <p className="text-sm text-gray-600">
//                                 Basic Premium Rate
//                               </p>
//                               <p className="font-semibold text-gray-900">
//                                 {product.basicRate
//                                   ? `${product.basicRate}%`
//                                   : "Varies"}
//                               </p>
//                             </div>
//                             <div>
//                               <p className="text-sm text-gray-600">Max Coverage</p>
//                               <p className="font-semibold text-gray-900">
//                                 ${product.maximumSumInsured || "N/A"}
//                               </p>
//                             </div>
//                           </div>

//                           <Button className="w-full mt-5">
//                             Get Quote
//                             <ArrowRight className="ml-2 h-4 w-4" />
//                           </Button>
//                         </CardContent>
//                       </div>
//                     </Card>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </section>
//     </div>
//   );
// }








// "use client";

// import { useEffect } from "react";
// import useEmblaCarousel from "embla-carousel-react";
// import Autoplay from "embla-carousel-autoplay";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { ArrowRight, CheckCircle } from "lucide-react";
// import { useRootStore } from "@/stores/use-root-store";

// export default function InsuranceProductsPage() {
//   const {
//     insuranceProducts,
//     isLoadingProduct,
//     productError,
//     fetchProducts,
//   } = useRootStore();

//   const [emblaRef] = useEmblaCarousel(
//     { loop: true, align: "start" },
//     [Autoplay({ delay: 4000, stopOnInteraction: false })]
//   );

//   useEffect(() => {
//     fetchProducts();
//   }, [fetchProducts]);

//   return (
//     <div className="w-full">
//       {/* Hero */}
//       <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20 text-center">
//         <div className="max-w-6xl mx-auto px-4">
//           <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
//             Explore Our{" "}
//             <span className="text-blue-600">Insurance Products</span>
//           </h1>
//           <p className="text-lg text-gray-600 max-w-3xl mx-auto">
//             Protect your DeFi and crypto activities with innovative on-chain
//             insurance solutions.
//           </p>
//         </div>
//       </section>

//       {/* Product Carousel */}
//       <section className="py-16 bg-white">
//         <div className="max-w-6xl mx-auto px-6">
//           <div className="text-center mb-10">
//             <Badge className="bg-blue-100 text-blue-700 mb-3">
//               Our Products
//             </Badge>
//             <h2 className="text-3xl font-bold text-gray-900">
//               Discover Protection Tailored for You
//             </h2>
//           </div>

//           {isLoadingProduct ? (
//             <p className="text-center text-gray-600">Loading products...</p>
//           ) : productError ? (
//             <p className="text-center text-red-500">{productError}</p>
//           ) : insuranceProducts.length === 0 ? (
//             <p className="text-center text-gray-500">No products available.</p>
//           ) : (
//             <div className="flex justify-center">
//               <div
//                 ref={emblaRef}
//                 className="overflow-hidden w-[80%]" // Carousel width limited to 80%
//               >
//                 <div className="flex gap-8">
//                   {insuranceProducts.map((product) => (
//                     <Card
//                       key={product.id}
//                       className="relative min-w-[350px] flex-shrink-0 hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden"
//                     >
//                       {/* Banner Image */}
//                       {product.bannerImageUrl && (
//                         <div className="h-56 w-full overflow-hidden">
//                           <img
//                             src={product.bannerImageUrl}
//                             alt={product.productName}
//                             className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
//                           />
//                         </div>
//                       )}

//                       {/* Active Badge */}
//                       {product.isActive && (
//                         <div className="absolute top-4 left-4">
//                           <Badge className="bg-blue-600 text-white">
//                             Active Plan
//                           </Badge>
//                         </div>
//                       )}

//                       <CardHeader className="px-6 pt-4">
//                         <CardTitle className="text-xl text-gray-900">
//                           {product.productName}
//                         </CardTitle>
//                         <p className="text-gray-600 text-sm line-clamp-3 mt-1">
//                           {product.productDescription ||
//                             "Secure your DeFi assets with flexible on-chain coverage."}
//                         </p>
//                       </CardHeader>

//                       <CardContent className="px-6 pb-6">
//                         <div className="space-y-3 mb-5">
//                           {product.productBenefits?.slice(0, 3).map((item, i) => (
//                             <div
//                               key={i}
//                               className="flex items-center space-x-2 text-gray-700"
//                             >
//                               <CheckCircle className="h-4 w-4 text-green-600" />
//                               <span className="text-sm">{item}</span>
//                             </div>
//                           ))}
//                         </div>

//                         <div className="flex justify-between items-center border-t pt-4">
//                           <div>
//                             <p className="text-sm text-gray-600">
//                               Basic Premium Rate
//                             </p>
//                             <p className="font-semibold text-gray-900">
//                               {product.basicRate
//                                 ? `${product.basicRate}%`
//                                 : "Varies"}
//                             </p>
//                           </div>
//                           <div>
//                             <p className="text-sm text-gray-600">Max Coverage</p>
//                             <p className="font-semibold text-gray-900">
//                               ${product.maximumSumInsured || "N/A"}
//                             </p>
//                           </div>
//                         </div>

//                         <Button className="w-full mt-5">
//                           Get Quote
//                           <ArrowRight className="ml-2 h-4 w-4" />
//                         </Button>
//                       </CardContent>
//                     </Card>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </section>
//     </div>
//   );
// }











// "use client";

// import { useEffect } from "react";
// import useEmblaCarousel from "embla-carousel-react";
// import Autoplay from "embla-carousel-autoplay";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { ArrowRight, CheckCircle } from "lucide-react";
// import { useRootStore } from "@/stores/use-root-store";

// export default function InsuranceProductsPage() {
//   const {
//     insuranceProducts,
//     featuredProducts,
//     isLoadingProduct,
//     productError,
//     fetchProducts,
//   } = useRootStore();

//   const [emblaRef] = useEmblaCarousel(
//     { loop: true, align: "start" },
//     [Autoplay({ delay: 4000, stopOnInteraction: false })]
//   );

//   useEffect(() => {
//     fetchProducts();
//   }, [fetchProducts]);

//   return (
//     <div className="w-full">
//       {/* Hero */}
//       <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20 text-center">
//         <div className="max-w-6xl mx-auto px-4">
//           <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
//             Explore Our{" "}
//             <span className="text-blue-600">Insurance Products</span>
//           </h1>
//           <p className="text-lg text-gray-600 max-w-3xl mx-auto">
//             Protect your DeFi and crypto activities with innovative on-chain
//             insurance solutions.
//           </p>
//         </div>
//       </section>

//       {/* Product Carousel */}
//       <section className="py-16 bg-white">
//         <div className="max-w-7xl mx-auto px-6">
//           <div className="text-center mb-10">
//             <Badge className="bg-blue-100 text-blue-700 mb-3">
//               Featured Products
//             </Badge>
//             <h2 className="text-3xl font-bold text-gray-900">
//               Our Popular Insurance Plans
//             </h2>
//           </div>

//           {isLoadingProduct ? (
//             <p className="text-center text-gray-600">Loading products...</p>
//           ) : productError ? (
//             <p className="text-center text-red-500">{productError}</p>
//           ) : insuranceProducts.length === 0 ? (
//             <p className="text-center text-gray-500">No products available.</p>
//           ) : (
//             <div ref={emblaRef} className="overflow-hidden">
//               <div className="flex gap-6">
//                 {insuranceProducts.map((product) => (
//                   <Card
//                     key={product.id}
//                     className="min-w-[320px] flex-shrink-0 hover:shadow-xl transition-all duration-300"
//                   >
//                     {product.isActive && (
//                       <div className="absolute -top-3 left-6">
//                         <Badge className="bg-blue-600 text-white">
//                           Active Plan
//                         </Badge>
//                       </div>
//                     )}

//                     <CardHeader>
//                       <CardTitle className="text-lg text-gray-900">
//                         {product.productName}
//                       </CardTitle>
//                       <p className="text-gray-600 text-sm">
//                         {product.productDescription ||
//                           "Secure your DeFi assets with flexible on-chain coverage."}
//                       </p>
//                     </CardHeader>

//                     <CardContent>
//                       <div className="space-y-3 mb-4">
//                         {product.productBenefits?.map((item, i) => (
//                           <div key={i} className="flex items-center space-x-2">
//                             <CheckCircle className="h-4 w-4 text-green-600" />
//                             <span className="text-sm text-gray-700">{item}</span>
//                           </div>
//                         ))}
//                       </div>

//                       <div className="flex justify-between items-center border-t pt-4">
//                         <div>
//                           <p className="text-sm text-gray-600">Basic Premium Rate</p>
//                           <p className="font-semibold text-gray-900">
//                             {product.basicRate
//                               ? `${product.basicRate}%`
//                               : "Varies"}
//                           </p>
//                         </div>
//                         <div>
//                           <p className="text-sm text-gray-600">Max Coverage</p>
//                           <p className="font-semibold text-gray-900">
//                             ${product.maximumSumInsured || "N/A"}
//                           </p>
//                         </div>
//                       </div>

//                       <Button className="w-full mt-4">
//                         Get Quote
//                         <ArrowRight className="ml-2 h-4 w-4" />
//                       </Button>
//                     </CardContent>
//                   </Card>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>
//       </section>
//     </div>
//   );
// }













// "use client"

// import { useCallback, useEffect } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Shield, Banknote, Layers, Grid as Bridge, CheckCircle, ArrowRight, TrendingUp, Users } from 'lucide-react';
// import { useWalletStore } from '@/stores/use-wallet-store';
// import { useRootStore } from '@/stores/use-root-store';

// export default function Services() {
//   const services = [
//     {
//       icon: Shield,
//       title: 'Smart Contract Protection',
//       description: 'Comprehensive coverage against smart contract vulnerabilities, exploits, and rug pulls.',
//       features: ['Code audit coverage', 'Flash loan protection', 'Governance attack insurance', 'Upgrade risk coverage'],
//       price: 'From 0.5% annually',
//       coverage: 'Up to $1M',
//       popular: false,
//     },
//     {
//       icon: Banknote,
//       title: 'DeFi Protocol Insurance',
//       description: 'Protection for your investments in lending protocols, DEXs, and yield farming platforms.',
//       features: ['Lending pool coverage', 'DEX exploit protection', 'Yield farming insurance', 'Stablecoin depeg coverage'],
//       price: 'From 1% annually',
//       coverage: 'Up to $5M',
//       popular: true,
//     },
//     {
//       icon: Layers,
//       title: 'Liquidity Pool Coverage',
//       description: 'Safeguard your LP positions against impermanent loss and pool-specific risks.',
//       features: ['Impermanent loss protection', 'Pool exploit coverage', 'Token migration insurance', 'LP token protection'],
//       price: 'From 2% annually',
//       coverage: 'Up to $2M',
//       popular: false,
//     },
//     {
//       icon: Bridge,
//       title: 'Cross-Chain Bridge Safety',
//       description: 'Secure your assets during cross-chain transactions and bridge operations.',
//       features: ['Bridge exploit coverage', 'Cross-chain failure protection', 'Asset recovery insurance', 'Multi-sig security'],
//       price: 'From 1.5% annually',
//       coverage: 'Up to $3M',
//       popular: false,
//     },
//   ];

//   const benefits = [
//     {
//       icon: TrendingUp,
//       title: 'Risk-Based Pricing',
//       description: 'Our advanced algorithms assess risk factors to provide competitive, fair pricing for all coverage types.',
//     },
//     {
//       icon: CheckCircle,
//       title: 'Instant Claim Processing',
//       description: 'Automated claim processing through smart contracts ensures rapid payouts when conditions are met.',
//     },
//     {
//       icon: Users,
//       title: 'Community Governance',
//       description: 'Token holders participate in governance decisions, ensuring the platform evolves with user needs.',
//     },
//   ];


//   const { restoreConnection } = useRootStore();

//   useEffect(() => {
//     restoreConnection();
//   }, [restoreConnection]);

//   return (
//     <div className="w-full">
//       {/* Hero Section */}
//       <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center">
//             <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
//               Professional <span className="text-blue-600">Insurance Services</span>
//             </h1>
//             <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
//               Comprehensive protection for all your DeFi activities. From smart contracts to cross-chain 
//               bridges, we've got you covered with transparent, efficient insurance solutions.
//             </p>
//           </div>
//         </div>
//       </section>

//       {/* Services Grid */}
//       <section className="py-20 bg-white">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center mb-16">
//             <div className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
//               Our Services
//             </div>
//             <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
//               Choose Your Protection Plan
//             </h2>
//             <p className="text-xl text-gray-600 max-w-3xl mx-auto">
//               Select from our range of specialized insurance products designed to protect 
//               every aspect of your DeFi journey.
//             </p>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//             {services.map((service, index) => (
//               <Card key={index} className={`relative hover:shadow-xl transition-all duration-300 ${service.popular ? 'border-blue-500 border-2' : ''}`}>
//                 {service.popular && (
//                   <div className="absolute -top-3 left-6">
//                     <Badge className="bg-blue-600 text-white">Most Popular</Badge>
//                   </div>
//                 )}
                
//                 <CardHeader className="pb-4">
//                   <div className="flex items-center space-x-3 mb-2">
//                     <div className="p-2 bg-blue-100 rounded-lg">
//                       <service.icon className="h-6 w-6 text-blue-600" />
//                     </div>
//                     <CardTitle className="text-xl">{service.title}</CardTitle>
//                   </div>
//                   <p className="text-gray-600">{service.description}</p>
//                 </CardHeader>

//                 <CardContent className="space-y-6">
//                   <div className="space-y-3">
//                     {service.features.map((feature, featureIndex) => (
//                       <div key={featureIndex} className="flex items-center space-x-2">
//                         <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
//                         <span className="text-sm text-gray-600">{feature}</span>
//                       </div>
//                     ))}
//                   </div>

//                   <div className="flex justify-between items-center py-4 border-t border-gray-100">
//                     <div>
//                       <p className="text-sm text-gray-600">Premium</p>
//                       <p className="font-semibold text-lg">{service.price}</p>
//                     </div>
//                     <div>
//                       <p className="text-sm text-gray-600">Max Coverage</p>
//                       <p className="font-semibold text-lg">{service.coverage}</p>
//                     </div>
//                   </div>

//                   <Button className="w-full" variant={service.popular ? 'default' : 'outline'}>
//                     Get Quote
//                     <ArrowRight className="ml-2 h-4 w-4" />
//                   </Button>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Benefits Section */}
//       <section className="py-20 bg-gray-50">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center mb-16">
//             <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
//               Why Choose Starknet-Indemnify?
//             </h2>
//             <p className="text-xl text-gray-600 max-w-3xl mx-auto">
//               Our platform combines the best of traditional insurance with cutting-edge 
//               blockchain technology to deliver superior coverage and user experience.
//             </p>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//             {benefits.map((benefit, index) => (
//               <Card key={index} className="text-center hover:shadow-lg transition-shadow">
//                 <CardContent className="p-8">
//                   <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
//                     <benefit.icon className="h-8 w-8 text-blue-600" />
//                   </div>
//                   <h3 className="text-xl font-semibold text-gray-900 mb-3">{benefit.title}</h3>
//                   <p className="text-gray-600">{benefit.description}</p>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* How It Works */}
//       <section className="py-20 bg-white">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center mb-16">
//             <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
//               How Our Insurance Works
//             </h2>
//             <p className="text-xl text-gray-600 max-w-3xl mx-auto">
//               Simple, transparent, and automated insurance process built on Starknet.
//             </p>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
//             {[
//               { step: '01', title: 'Connect Wallet', description: 'Link your Starknet wallet to access our platform' },
//               { step: '02', title: 'Choose Coverage', description: 'Select the insurance product that fits your needs' },
//               { step: '03', title: 'Pay Premium', description: 'Pay your premium in STRK tokens' },
//               { step: '04', title: 'Get Protected', description: 'Your coverage is active and monitored 24/7' },
//             ].map((item, index) => (
//               <div key={index} className="text-center">
//                 <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
//                   {item.step}
//                 </div>
//                 <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
//                 <p className="text-gray-600">{item.description}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* CTA Section */}
//       <section className="py-20 bg-blue-600">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
//           <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
//             Ready to Protect Your DeFi Assets?
//           </h2>
//           <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
//             Join thousands of users who trust Starknet-Indemnify for comprehensive DeFi protection. 
//             Get a personalized quote in minutes.
//           </p>
//           <div className="flex flex-col sm:flex-row gap-4 justify-center">
//             <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
//               Get Your Quote Now
//             </Button>
//             <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
//               Schedule a Demo
//             </Button>
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// }