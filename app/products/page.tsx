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

export default function ProductsPage() {
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

