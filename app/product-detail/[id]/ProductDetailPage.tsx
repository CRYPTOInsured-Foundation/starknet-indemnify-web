"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Shield,
  CheckCircle,
  FileText,
  Zap,
  Globe,
  Clock,
  Users,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import { useRootStore } from "@/stores/use-root-store";

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const {
    selectedProduct,
    isLoadingProduct,
    productError,
    fetchProductById,
    clearSelectedProduct,
  } = useRootStore();

  useEffect(() => {
    console.log("ProductDetail mounted with ID:", productId);
    if (productId) {
      fetchProductById(productId);
    }
    return () => clearSelectedProduct();
  }, [productId, fetchProductById, clearSelectedProduct]);

  // Enhanced debug logs
  console.log("=== PRODUCT DETAIL DEBUG ===");
  console.log("Selected Product:", selectedProduct);
  console.log("Product Benefits:", selectedProduct?.productBenefits);
  console.log("Required Documents:", selectedProduct?.requiredDocuments);
  console.log("Product FAQs:", selectedProduct?.productFAQs);
  console.log("Loading:", isLoadingProduct);
  console.log("Error:", productError);
  console.log("=== END DEBUG ===");

  if (isLoadingProduct) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading policy details...</p>
        </div>
      </div>
    );
  }

  if (productError || !selectedProduct) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Policy Not Found</h2>
          <p className="text-gray-600 mb-6">
            {productError || "The requested insurance policy could not be found."}
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => router.back()} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
            <Button onClick={() => router.push("/insurance")}>Browse Policies</Button>
          </div>
        </div>
      </div>
    );
  }

  // Safe destructuring with fallbacks
  const {
    productName,
    productDescription,
    productCode,
    policyClass,
    subjectMatter,
    basicRate,
    defaultPremiumFrequency,
    frequencyFactor,
    minimumSumInsured,
    maximumSumInsured,
    bannerImageUrl,
    productBenefits,
    requiredDocuments,
    productFAQs,
    isActive,
    createdAt,
  } = selectedProduct;

  // Convert to arrays if they're null/undefined
  const benefitsArray = Array.isArray(productBenefits) ? productBenefits : [];
  const documentsArray = Array.isArray(requiredDocuments) ? requiredDocuments : [];
  const faqsArray = Array.isArray(productFAQs) ? productFAQs : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header Navigation */}
      <header className="bg-white border-b sticky top-0 z-40 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Policies
          </Button>
          <div className="flex items-center gap-3">
            {isActive && (
              <Badge className="bg-green-500 text-white px-3 py-1">Active</Badge>
            )}
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              {policyClass}
            </Badge>
          </div>
        </div>
      </header>

      {/* Banner Image Section */}
      {bannerImageUrl && (
        <section className="relative h-64 md:h-80 bg-gray-100 overflow-hidden">
          <img
            src={bannerImageUrl}
            alt={productName}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20"></div>
        </section>
      )}

      {/* Hero Section */}
      <section className={`relative ${bannerImageUrl ? 'bg-transparent -mt-20' : 'bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800'} text-white`}>
        <div className={`${bannerImageUrl ? 'bg-gradient-to-t from-black/60 to-transparent pt-32 pb-16' : 'bg-black/20 py-16'}`}>
          <div className="relative max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                  <Shield className="h-6 w-6" />
                </div>
                <span className="text-blue-100 font-medium">
                  Smart Contract Insurance
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold">{productName}</h1>
              <p className="text-lg text-blue-100 leading-relaxed">
                {productDescription}
              </p>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
                  <Zap className="h-4 w-4" />
                  <span className="text-sm">Code: {productCode}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
                  <Globe className="h-4 w-4" />
                  <span className="text-sm">{subjectMatter}</span>
                </div>
              </div>
            </div>

            {/* Stats Card */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="text-center">
                    <p className="text-blue-200 text-sm">Premium Rate</p>
                    <p className="text-4xl font-bold">
                      {basicRate ? `${basicRate}%` : "Dynamic"}
                    </p>
                    <p className="text-blue-200 text-sm mt-1">
                      {defaultPremiumFrequency} • {frequencyFactor}x
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-blue-200 text-sm">Min Coverage</p>
                      <p className="text-lg font-semibold mt-1">
                        {minimumSumInsured ? `$${minimumSumInsured}` : "Flexible"}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-blue-200 text-sm">Max Coverage</p>
                      <p className="text-lg font-semibold mt-1">
                        {maximumSumInsured ? `$${maximumSumInsured}` : "Custom"}
                      </p>
                    </div>
                  </div>
                  <Button
                        onClick={() => router.push(`/proposal-form?productId=${productId}`)}
                        className="w-full bg-white text-blue-700 hover:bg-blue-50 font-semibold py-3 text-lg"
                  >
                        Get Protected Now
                  <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>

                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <Tabs defaultValue="overview" className="space-y-8">
            <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1 rounded-xl">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="benefits">Benefits</TabsTrigger>
              <TabsTrigger value="documents">Requirements</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
            </TabsList>

            {/* Overview */}
            <TabsContent value="overview" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Policy Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <p>
                    <span className="text-sm text-gray-600">Policy Class:</span>{" "}
                    <span className="font-semibold">{policyClass}</span>
                  </p>
                  <p>
                    <span className="text-sm text-gray-600">Subject Matter:</span>{" "}
                    <span className="font-semibold">{subjectMatter}</span>
                  </p>
                  <p>
                    <span className="text-sm text-gray-600">Premium Frequency:</span>{" "}
                    <span className="font-semibold">{defaultPremiumFrequency}</span>
                  </p>
                  <p>
                    <span className="text-sm text-gray-600">Frequency Factor:</span>{" "}
                    <span className="font-semibold">{frequencyFactor}x</span>
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Benefits */}
            <TabsContent value="benefits" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Policy Benefits ({benefitsArray.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {benefitsArray.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {benefitsArray.map((benefit, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg"
                        >
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p>No benefits information available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Documents */}
            <TabsContent value="documents">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Required Documents ({documentsArray.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {documentsArray.length > 0 ? (
                    <div className="space-y-3">
                      {documentsArray.map((doc, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-700">{doc}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p>No documents required</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* FAQ */}
            <TabsContent value="faq">
              <Card>
                <CardHeader>
                  <CardTitle>Frequently Asked Questions ({faqsArray.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {faqsArray.length > 0 ? (
                    <div className="space-y-6">
                      {faqsArray.map(([q, a], i) => (
                        <div key={i} className="border-b pb-4 last:border-0">
                          <h4 className="font-semibold text-gray-900 mb-2">{q}</h4>
                          <p className="text-gray-600">{a}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p>No FAQs available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}
