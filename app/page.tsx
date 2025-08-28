"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import FeatureCard from '@/components/ui/feature-card';
import { 
  Shield, 
  TrendingUp, 
  Zap, 
  Lock, 
  BarChart3, 
  Users,
  ArrowRight,
  CheckCircle
} from 'lucide-react';



const backgroundImages = [
  "/assets/family_one.jpg",
  "/assets/industry_one.webp",
  "/assets/family_two.webp",
  "/assets/industry_two.webp"
];

const textColors = ["#FFFFFF", "#5541D7", "#11142D"];
const paragraphColors = ["#9CA3AF", "#FFFFFF", "#000000"];


  
  // return (
  //   <div className="w-full">
  //     {heroSection}
  //     {/* Rest of your page sections */}
  //   </div>
  // );

















export default function Home() {
  const features = [
    {
      icon: Shield,
      title: 'Trusted Protection',
      description: 'Comprehensive coverage for your DeFi investments with transparent, on-chain policies.',
    },
    {
      icon: Zap,
      title: 'Instant Claims',
      description: 'Fast claim processing with automated smart contract execution on StarkNet L2.',
    },
    {
      icon: Lock,
      title: 'Secure & Audited',
      description: 'Battle-tested smart contracts audited by leading security firms in the space.',
    },
    {
      icon: BarChart3,
      title: 'Risk Analytics',
      description: 'Advanced risk assessment tools to help you make informed coverage decisions.',
    },
  ];

  const stats = [
    { label: 'Total Value Protected', value: '$125M+' },
    { label: 'Claims Processed', value: '2,500+' },
    { label: 'Average Claim Time', value: '< 24hrs' },
    { label: 'User Satisfaction', value: '99.8%' },
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentTextColorIndex, setCurrentTextColorIndex] = useState(0);
  const [currentParagraphColorIndex, setCurrentParagraphColorIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
      setCurrentTextColorIndex((prev) => (prev + 1) % textColors.length);
      setCurrentParagraphColorIndex((prev) => (prev + 1) % paragraphColors.length);
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  const backgroundStyle = {
    backgroundImage: `url(${backgroundImages[currentImageIndex]})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    transition: 'background-image 1s ease-in-out',   
  };

  // Hero section with dynamic background and text colors
  const heroSection = (
    <section 
      className="relative overflow-hidden transition-all duration-1000 ease-in-out"
      style={backgroundStyle}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 
                className="text-4xl lg:text-6xl font-bold leading-tight transition-colors duration-1000 ease-in-out"
                style={{ color: textColors[currentTextColorIndex] }}
              >
                Starknet-Indemnify
                <span className="block text-blue-600">Makes You Secure</span>
              </h1>
              <p 
                className="text-xl leading-relaxed transition-colors duration-1000 ease-in-out"
                style={{ color: paragraphColors[currentParagraphColorIndex] }}
              >
                Protect your digital assets with comprehensive on-chain insurance solutions. 
                Built on Starknet for lightning-fast claims and minimal fees.
              </p>
            </div>
            
            {/* Rest of your hero section content */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Get Coverage Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </div>

            <div className="flex items-center space-x-6 pt-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm transition-colors duration-1000 ease-in-out" style={{ color: paragraphColors[currentParagraphColorIndex] }}>
                  Little KYC Requirement
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm transition-colors duration-1000 ease-in-out" style={{ color: paragraphColors[currentParagraphColorIndex] }}>
                  Instant Payouts
                </span>
              </div>
            </div>
          </div>
           {/* <div className="relative">
              <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-lg mx-auto">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Policy Dashboard</h3>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">Total Coverage</span>
                      <span className="font-semibold text-blue-600">$75,000</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">Active Policies</span>
                      <span className="font-semibold">3</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-sm">Claim Status</span>
                      <span className="font-semibold text-green-600">Protected</span>
                    </div>
                  </div>
                </div>
              </div>
            </div> */}
        </div>
      </div>
    </section>
  );


  return (
    <div className="w-full">
      {/* Hero Section */}
      {heroSection}

      {/* <section style={{border: "solid red 1px"}} className="relative bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  StarkInsure
                  <span className="block text-blue-600">Makes You Secure</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Protect your digital assets with comprehensive on-chain insurance solutions. 
                  Built on StarkNet for lightning-fast claims and minimal fees.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Get Coverage Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </div>

              <div className="flex items-center space-x-6 pt-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-gray-600">Little KYC Requirement</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-gray-600">Instant Payouts</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-lg mx-auto">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Policy Dashboard</h3>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">Total Coverage</span>
                      <span className="font-semibold text-blue-600">$75,000</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">Active Policies</span>
                      <span className="font-semibold">3</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-sm">Claim Status</span>
                      <span className="font-semibold text-green-600">Protected</span>
                    </div>
                  </div>
                </div>
              </div>
            </div> 
          </div>
        </div>
      </section> */}

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-blue-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
              Our Features
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Insurance Provides You a Better Future
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built with cutting-edge technology to provide seamless, secure, and efficient 
              insurance solutions for the DeFi ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="aspect-square bg-blue-100 rounded-2xl p-6 flex items-center justify-center">
                    <TrendingUp className="h-12 w-12 text-blue-600" />
                  </div>
                  <div className="aspect-video bg-green-100 rounded-2xl p-6 flex items-center justify-center">
                    <Users className="h-12 w-12 text-green-600" />
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="aspect-video bg-purple-100 rounded-2xl p-6 flex items-center justify-center">
                    <Shield className="h-12 w-12 text-purple-600" />
                  </div>
                  <div className="aspect-square bg-orange-100 rounded-2xl p-6 flex items-center justify-center">
                    <Lock className="h-12 w-12 text-orange-600" />
                  </div>
                </div>
              </div>
              
              {/* Stats overlay */}
              <div className="absolute -bottom-6 -right-6 bg-blue-600 text-white rounded-2xl p-6 shadow-xl">
                <div className="text-center">
                  <div className="text-3xl font-bold">5+</div>
                  <div className="text-sm opacity-90">Years Experience</div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                About Our Platform
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                We Provide the Best Insurance Solutions for DeFi
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Stark-Indemnify is pioneering the future of decentralized insurance on Starknet. 
                Our platform combines traditional insurance principles with cutting-edge blockchain 
                technology to provide comprehensive protection for your digital assets.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Smart Contract Coverage</h3>
                  <p className="text-sm text-gray-600">Protect against smart contract vulnerabilities and exploits</p>
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">DeFi Protocol Insurance</h3>
                  <p className="text-sm text-gray-600">Coverage for lending, DEX, and yield farming protocols</p>
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Bridge Protection</h3>
                  <p className="text-sm text-gray-600">Secure your cross-chain transactions and bridge operations</p>
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Liquidity Pool Safety</h3>
                  <p className="text-sm text-gray-600">Insurance against impermanent loss and pool exploits</p>
                </div>
              </div>

              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Learn More About Us
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Secure Your DeFi Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who trust Starknet-Indemnify to protect their digital assets. 
            Get started with comprehensive coverage today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
              Get Your Quote
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              Connect Wallet
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}