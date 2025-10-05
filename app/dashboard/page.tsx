'use client';

import { useEffect, useState, useCallback } from 'react';
import ProtectedRoute from '@/components/guards/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PolicyCard from '@/components/ui/policy-card';
import { usePoliciesStore } from '@/stores/policies';

import { useWalletStore } from '@/stores/use-wallet-store';
import { useRootStore } from '@/stores/use-root-store';

import { 
  Shield, 
  TrendingUp, 
  AlertTriangle, 
  Clock,
  Plus,
  ArrowUpRight,
  DollarSign,
  FileText
} from 'lucide-react';

function DashboardContent() {
  const { policies, loading, fetchPolicies } = usePoliciesStore();
  const { address, createWallet } = useRootStore();
  const [selectedPolicy, setSelectedPolicy] = useState<string | null>(null);

  const PUB_KEY = process.env.NEXT_PUBLIC_CHIPI_PUBLIC_KEY;
  const ENC_KEY = process.env.NEXT_PUBLIC_CHIPI_SECRET_KEY;

  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  const handleManagePolicy = (policyId: string) => {
    setSelectedPolicy(policyId);
    // In a real app, this would navigate to policy details page
    console.log('Managing policy:', policyId);
  };

  const totalCoverage = policies.reduce((sum, policy) => sum + policy.coverage, 0);
  const totalPremium = policies.reduce((sum, policy) => sum + policy.premium, 0);
  const activePolicies = policies.filter(policy => policy.status === 'active').length;
  const pendingClaims = 0; // This would come from a claims store

  const stats = [
    {
      title: 'Total Coverage',
      value: `$${totalCoverage.toLocaleString()}`,
      icon: Shield,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: '+12.5%',
      changeType: 'positive' as const,
    },
    {
      title: 'Active Policies',
      value: activePolicies.toString(),
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: '+2',
      changeType: 'positive' as const,
    },
    {
      title: 'Monthly Premium',
      value: `$${totalPremium.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      change: '-5.2%',
      changeType: 'negative' as const,
    },
    {
      title: 'Pending Claims',
      value: pendingClaims.toString(),
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      change: '0',
      changeType: 'neutral' as const,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Welcome back! Here's an overview of your insurance portfolio.
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                New Policy
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <span className={`text-sm font-medium ${
                    stat.changeType === 'positive' ? 'text-green-600' : 
                    stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {stat.changeType === 'positive' && <ArrowUpRight className="h-4 w-4 inline mr-1" />}
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-600 ml-1">vs last month</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Policies Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Your Policies</CardTitle>
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {policies.length === 0 ? (
                  <div className="text-center py-12">
                    <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No policies yet</h3>
                    <p className="text-gray-600 mb-6">
                      Start protecting your DeFi assets by purchasing your first insurance policy.
                    </p>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Browse Coverage Options
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {policies.map((policy) => (
                      <PolicyCard
                        key={policy.id}
                        {...policy}
                        onManage={handleManagePolicy}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Risk Assessment */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                  Risk Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Overall Risk Level</span>
                    <Badge className="bg-green-100 text-green-800">Low</Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Your portfolio shows low risk exposure. Consider diversifying across more protocols.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Premium payment processed</p>
                      <p className="text-xs text-gray-600">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Policy activated</p>
                      <p className="text-xs text-gray-600">1 day ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Risk assessment updated</p>
                      <p className="text-xs text-gray-600">3 days ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  Purchase New Policy
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  File a Claim
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Risk Assessment
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {

  // const restoreConnection = useRootStore((s) => s.restoreConnection);

  const PUB_KEY  = process.env.NEXT_PUBLIC_CHIPI_PUBLIC_KEY!;
  const ENC_KEY = process.env.NEXT_PUBLIC_CHIPI_SECRET_KEY!;

  const { restoreConnection, createWallet } = useRootStore();

  let newWallet = useCallback(async () => {

    let myWallet = await createWallet({
      encryptKey: ENC_KEY,
      externalUserId: "a233f-c3a3-bcd1-cba34",
      bearerToken: PUB_KEY
  
    });

    return myWallet
  }, []);

  newWallet().then(wallet => console.log("Chipi Wallet: ", wallet));


  
  
  useEffect(() => {
      

  },[]);


  useEffect(() => {
    restoreConnection();
  }, [restoreConnection]);



  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}