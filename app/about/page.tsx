"use client"

import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Target, Users, Award, ArrowRight } from 'lucide-react';
import { useWalletStore } from '@/stores/use-wallet-store';
import { useRootStore } from '@/stores/use-root-store';

export default function About() {
  const values = [
    {
      icon: Shield,
      title: 'Security First',
      description: 'Every smart contract is thoroughly audited and tested to ensure maximum security for our users.',
    },
    {
      icon: Target,
      title: 'Transparency',
      description: 'Complete transparency in our operations, claims processing, and fund management on-chain.',
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Our platform is governed by the community, ensuring decisions benefit all stakeholders.',
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'Committed to providing the highest quality insurance products and customer service.',
    },
  ];

  const team = [
    {
      name: 'Isenewo Oluwaseyi Ephraim',
      role: 'CEO & Co-Founder',
      experience: '3+ years in traditional insurance and over a year experience developing Cairo smart contracts',
      image: 'https://firebasestorage.googleapis.com/v0/b/daz-course-by-seyi.appspot.com/o/Eph_corporate_psp%20001.jpg?alt=media&token=87d00ed2-134a-4ebe-aebe-9d4be42479b2',
    },
    {
      name: 'Jane Doe',
      role: 'CTO & Co-Founder',
      experience: 'Former blockchain engineer at major DeFi protocols',
      image: 'https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&crop=face',
    },
    {
      name: 'John Doe',
      role: 'Head of Risk Assessment',
      experience: 'PhD in Actuarial Science, 15+ years experience',
      image: 'https://images.pexels.com/photos/3785077/pexels-photo-3785077.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&crop=face',
    },
  ];


  const restoreConnection = useRootStore((s) => s.restoreConnection);

  useEffect(() => {
    restoreConnection();
  }, [restoreConnection]);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              About <span className="text-blue-600">Starknet-Indemnify</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We're building the future of decentralized insurance, making DeFi safer and more accessible 
              for everyone through innovative blockchain technology and community governance.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                To democratize access to comprehensive insurance coverage in the DeFi space, 
                providing peace of mind and financial protection through transparent, 
                efficient, and community-driven solutions.
              </p>
              <p className="text-gray-600">
                Since our founding in 2025, we've been committed to bridging the gap between 
                traditional insurance principles and the innovative world of decentralized finance. 
                Our platform leverages the security and transparency of StarkNet to deliver 
                insurance products that are both accessible and reliable.
              </p>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Join Our Community
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl p-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">$125M+</div>
                    <div className="text-sm text-gray-600">Total Value Protected</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">15,000+</div>
                    <div className="text-sm text-gray-600">Active Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">2,500+</div>
                    <div className="text-sm text-gray-600">Claims Processed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">99.8%</div>
                    <div className="text-sm text-gray-600">Satisfaction Rate</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Our Core Values
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These principles guide everything we do and shape how we build the future of DeFi insurance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                    <value.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our diverse team combines deep expertise in traditional insurance, blockchain technology, 
              and risk management to deliver exceptional products.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="relative w-24 h-24 mx-auto mb-4">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-blue-600 font-medium mb-2">{member.role}</p>
                  <p className="text-sm text-gray-600">{member.experience}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Join the Future of DeFi Insurance?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Connect with our team and discover how StarkInsure can protect your digital assets 
            with comprehensive, transparent coverage.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
              Get Started Today
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              Contact Our Team
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}