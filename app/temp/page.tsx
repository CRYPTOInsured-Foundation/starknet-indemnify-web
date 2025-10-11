"use client"

import { useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Banknote, Layers, Grid as Bridge, CheckCircle, ArrowRight, TrendingUp, Users } from 'lucide-react';
import { useWalletStore } from '@/stores/use-wallet-store';
import { useRootStore } from '@/stores/use-root-store';

export default function Temporary() {
  const services = [
    {
      icon: Shield,
      title: 'Smart Contract Protection',
      description: 'Comprehensive coverage against smart contract vulnerabilities, exploits, and rug pulls.',
      features: ['Code audit coverage', 'Flash loan protection', 'Governance attack insurance', 'Upgrade risk coverage'],
      price: 'From 0.5% annually',
      coverage: 'Up to $1M',
      popular: false,
    },
    {
      icon: Banknote,
      title: 'DeFi Protocol Insurance',
      description: 'Protection for your investments in lending protocols, DEXs, and yield farming platforms.',
      features: ['Lending pool coverage', 'DEX exploit protection', 'Yield farming insurance', 'Stablecoin depeg coverage'],
      price: 'From 1% annually',
      coverage: 'Up to $5M',
      popular: true,
    },
    {
      icon: Layers,
      title: 'Liquidity Pool Coverage',
      description: 'Safeguard your LP positions against impermanent loss and pool-specific risks.',
      features: ['Impermanent loss protection', 'Pool exploit coverage', 'Token migration insurance', 'LP token protection'],
      price: 'From 2% annually',
      coverage: 'Up to $2M',
      popular: false,
    },
    {
      icon: Bridge,
      title: 'Cross-Chain Bridge Safety',
      description: 'Secure your assets during cross-chain transactions and bridge operations.',
      features: ['Bridge exploit coverage', 'Cross-chain failure protection', 'Asset recovery insurance', 'Multi-sig security'],
      price: 'From 1.5% annually',
      coverage: 'Up to $3M',
      popular: false,
    },
  ];

  const benefits = [
    {
      icon: TrendingUp,
      title: 'Risk-Based Pricing',
      description: 'Our advanced algorithms assess risk factors to provide competitive, fair pricing for all coverage types.',
    },
    {
      icon: CheckCircle,
      title: 'Instant Claim Processing',
      description: 'Automated claim processing through smart contracts ensures rapid payouts when conditions are met.',
    },
    {
      icon: Users,
      title: 'Community Governance',
      description: 'Token holders participate in governance decisions, ensuring the platform evolves with user needs.',
    },
  ];


  const { restoreConnection, insuranceProducts, fetchProducts, initializeProducts } = useRootStore();

  useEffect(() => {
    restoreConnection();
  }, [restoreConnection]);
  
  // const initializeProducts = useRootStore((state) => state.initializeProducts);
  
  useEffect(() => {
    initializeProducts();
  }, [initializeProducts]);
  
  console.log("Insurance Products: ", insuranceProducts);

  const { fetchProposalsByUser, proposals, isLoadingProposal, user, proposalError } = useRootStore();

  useEffect(() => {
    (async () => {
    const userId = user?.id; // normally from auth store
    const { success } = await fetchProposalsByUser(userId as string);
    if (success) console.log("Loaded proposals:", proposals);
  })();
}, []);


console.log("User proposals: ", proposals);


const {
  policies,
  claims,
  inspections,
  evidences,
  premiumPayments,
  claimSettlements,
  tokenPurchases,
  tokenRecoveries,
  fetchPoliciesByUser,
  isLoadingPolicy,
  policyError,
  fetchClaimsByUser,
  fetchInspectionsByProposal,
  fetchEvidenceByClaim,
  fetchPremiumPaymentsByUser,
  fetchClaimSettlementsByUser,
  fetchTokenPurchasesByUser,
  fetchTokenRecoveriesBySeller
} = useRootStore();

useEffect(() => {
  fetchPoliciesByUser(user?.id as string);
  fetchClaimsByUser(user?.id as string);
  fetchEvidenceByClaim(user?.id as string);
  fetchInspectionsByProposal(user?.id as string);
  fetchPremiumPaymentsByUser(user?.id as string);
  fetchClaimSettlementsByUser(user?.id as string);
  fetchTokenRecoveriesBySeller(user?.id as string);
  fetchTokenPurchasesByUser(user?.id as string);

}, [
user?.id, 
fetchPoliciesByUser, 
fetchClaimsByUser, 
fetchEvidenceByClaim, 
fetchInspectionsByProposal,
fetchPremiumPaymentsByUser,
fetchClaimSettlementsByUser,
fetchTokenPurchasesByUser,
fetchTokenRecoveriesBySeller
]);

console.log("User Policies: ", policies);
console.log("User Claims: ", claims);
console.log("User Inspection by proposal id: ", inspections);
console.log("User Claim evidence by claim id: ", evidences);
console.log("User Premium payment by user id: ", premiumPayments);
console.log("User Token Purchases by user id: ", tokenPurchases);
console.log("User Token Recoveries by user id: ", tokenRecoveries);








  // useEffect(() => {

  //   fetchProducts().then(prods => console.log("Products: ", prods))
  // },[fetchProducts])

 

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              Professional <span className="text-blue-600">Insurance Services</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Comprehensive protection for all your DeFi activities. From smart contracts to cross-chain 
              bridges, we've got you covered with transparent, efficient insurance solutions.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
              Our Services
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Choose Your Protection Plan
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Select from our range of specialized insurance products designed to protect 
              every aspect of your DeFi journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <Card key={index} className={`relative hover:shadow-xl transition-all duration-300 ${service.popular ? 'border-blue-500 border-2' : ''}`}>
                {service.popular && (
                  <div className="absolute -top-3 left-6">
                    <Badge className="bg-blue-600 text-white">Most Popular</Badge>
                  </div>
                )}
                
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <service.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                  </div>
                  <p className="text-gray-600">{service.description}</p>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    {service.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center py-4 border-t border-gray-100">
                    <div>
                      <p className="text-sm text-gray-600">Premium</p>
                      <p className="font-semibold text-lg">{service.price}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Max Coverage</p>
                      <p className="font-semibold text-lg">{service.coverage}</p>
                    </div>
                  </div>

                  <Button className="w-full" variant={service.popular ? 'default' : 'outline'}>
                    Get Quote
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Starknet-Indemnify?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform combines the best of traditional insurance with cutting-edge 
              blockchain technology to deliver superior coverage and user experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
                    <benefit.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              How Our Insurance Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Simple, transparent, and automated insurance process built on Starknet.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Connect Wallet', description: 'Link your Starknet wallet to access our platform' },
              { step: '02', title: 'Choose Coverage', description: 'Select the insurance product that fits your needs' },
              { step: '03', title: 'Pay Premium', description: 'Pay your premium in STRK tokens' },
              { step: '04', title: 'Get Protected', description: 'Your coverage is active and monitored 24/7' },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Protect Your DeFi Assets?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who trust Starknet-Indemnify for comprehensive DeFi protection. 
            Get a personalized quote in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
              Get Your Quote Now
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              Schedule a Demo
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}