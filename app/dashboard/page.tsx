'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/guards/ProtectedRoute';
import PolicyCard from '@/components/ui/policy-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRootStore } from '@/stores/use-root-store';
import { Shield, TrendingUp, Clock, Plus, ArrowUpRight, DollarSign, FileText, AlertTriangle } from 'lucide-react';

function DashboardContent() {
  const {
    user,
    address,
    restoreConnection,

    // Policy slice
    policies,
    isLoadingPolicy,
    fetchPoliciesByUser,

    // Claim slice
    claims,
    isLoadingClaim,
    fetchClaimsByUser,

    // Premium slice
    premiumPayments,
    isLoadingPremium,
    fetchPremiumPaymentsByUser,
    loginWithOAuth,

    // Claim settlement slice
    claimSettlements,
    isLoadingClaimSettlement,
    fetchClaimSettlementsByUser,
  } = useRootStore();

  useEffect(() => {
    loginWithOAuth()
  },[]);

  const [selectedPolicy, setSelectedPolicy] = useState<string | null>(null);
  const loading = isLoadingPolicy || isLoadingClaim || isLoadingPremium || isLoadingClaimSettlement;

  const router = useRouter();

  // Fetch all user-related data on mount
  useEffect(() => {
    if (user?.id) {
      fetchPoliciesByUser(user.id);
      fetchClaimsByUser(user.id);
      fetchPremiumPaymentsByUser(user.id);
      fetchClaimSettlementsByUser(user.id);
    }
  }, [user?.id, fetchPoliciesByUser, fetchClaimsByUser, fetchPremiumPaymentsByUser, fetchClaimSettlementsByUser]);

  const handleManagePolicy = (policyId: string) => {
    setSelectedPolicy(policyId);
    console.log('Managing policy:', policyId);
  };

  /** Stats computation */
  const stats = useMemo(() => {
    const totalCoverage = policies.reduce((sum, p) => sum + parseFloat(p.sumInsured || '0'), 0);
    const totalPremium = premiumPayments.reduce((sum, p) => sum + parseFloat(p.amountPaid || '0'), 0);
    const activePolicies = policies.filter(p => p.isActive && !p.isExpired).length;
    const pendingClaims = claims.filter(c => ['submitted', 'under_review'].includes(c.claimStatus)).length;

    return [
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
        change: `+${activePolicies}`,
        changeType: 'positive' as const,
      },
      {
        title: 'Total Premium Paid',
        value: `$${totalPremium.toLocaleString()}`,
        icon: DollarSign,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        change: `$${totalPremium > 0 ? '+' : ''}${totalPremium.toLocaleString()}`,
        changeType: totalPremium > 0 ? 'positive' as const : 'neutral' as const,
      },
      {
        title: 'Pending Claims',
        value: pendingClaims.toString(),
        icon: Clock,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
        change: pendingClaims > 0 ? `+${pendingClaims}` : '0',
        changeType: pendingClaims > 0 ? 'negative' as const : 'neutral' as const,
      },
    ];
  }, [policies, premiumPayments, claims]);

  const handleManageStatCard = (title: string) => {

    switch(title) {
      case 'Active Policies': router.push("/policies");
                              break;
      case 'Total Premium Paid': router.push("/payments");
                              break;
      case 'Pending Claims': router.push("/claims");
                              break;
      default: null;
    }

  }

  /** Format policies for PolicyCard */
  const formattedPolicies = useMemo(
    () =>
      policies.map(p => ({
        id: p.id,
        policyId: p.policyId,
        policyClass: p.policyClass,
        subjectMatter: p.subjectMatter || '',
        sumInsured: p.sumInsured,
        premium: p.premium,
        premiumFrequency: p.premiumFrequency,
        startDate: p.startDate,
        expirationDate: p.expirationDate,
        isActive: p.isActive,
        isExpired: p.isExpired,
        claimsCount: p.claimsCount || 0,
        hasClaimed: p.claimsCount > 0,
        hasReinsurance: p.hasReinsurance || false,
        onManage: handleManagePolicy,
      })),
    [policies]
  );

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
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back{user?.name ? `, ${user.name}` : ''}! Here's an overview of your insurance portfolio.
            </p>
            {address && (
              <p className="text-sm text-gray-500 mt-1">
                Wallet: {address.slice(0, 8)}...{address.slice(-6)}
              </p>
            )}
          </div>
          <div className="mt-4 sm:mt-0">
            <Button onClick={() => router.push("/products")} className="bg-blue-600 hover:bg-blue-700 flex items-center">
              <Plus className="h-4 w-4 mr-2" /> New Policy
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, i) => (
            <Card key={i} className="hover:shadow-md transition-shadow">
              <CardContent onClick={() => handleManageStatCard(stat.title)} className="p-6 cursor-pointer">
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
                  <span
                    className={`text-sm font-medium ${
                      stat.changeType === 'positive'
                        ? 'text-green-600'
                        : stat.changeType === 'negative'
                        ? 'text-red-600'
                        : 'text-gray-600'
                    }`}
                  >
                    {stat.changeType === 'positive' && <ArrowUpRight className="h-4 w-4 inline mr-1" />}
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-600 ml-1">this period</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Policies */}
          <div className="lg:col-span-2">
        <Card>
              <CardHeader className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold">Your Policies</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/policies")} // ✅ Navigates to /policies
                >
                  View All
                </Button>
              </CardHeader>

              <CardContent>
                {formattedPolicies.length === 0 ? (
                  <div className="text-center py-12">
                    <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No policies yet</h3>
                    <p className="text-gray-600 mb-6">
                      Start protecting your assets by purchasing your first insurance policy.
                    </p>
                    <Button
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => router.push("/coverage")} // optional redirect to browse page
                    >
                      Browse Coverage Options
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {formattedPolicies.map((p) => (
                      <PolicyCard key={p.id} {...p} />
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
                  <TrendingUp className="h-5 w-5 mr-2 text-green-600" /> Risk Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Overall Risk Level</span>
                    <Badge className={stats[3].value !== '0' ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}>
                      {stats[3].value !== '0' ? 'Medium' : 'Low'}
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className={`h-2 rounded-full ${stats[3].value !== '0' ? 'bg-yellow-600' : 'bg-green-600'}`} 
                      style={{ width: stats[3].value !== '0' ? '50%' : '25%' }} />
                  </div>
                  <p className="text-sm text-gray-600">
                    {stats[3].value !== '0' ? `You have ${stats[3].value} pending claim(s). Monitor closely.` : 'Your portfolio shows low risk exposure.'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {premiumPayments.slice(0, 3).map(p => (
                  <div key={p.id} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Premium paid: ${parseFloat(p.amountPaid || '0').toLocaleString()}</p>
                      <p className="text-xs text-gray-600">{new Date(p.paymentDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
                {claims.slice(0, 2).map(c => (
                  <div key={c.id} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      c.claimStatus === 'approved' ? 'bg-green-600' :
                      c.claimStatus === 'rejected' ? 'bg-red-600' : 'bg-yellow-600'
                    }`}></div>
                    <div>
                      <p className="text-sm font-medium">Claim {c.claimStatus}: ${parseFloat(c.claimAmount || '0').toLocaleString()}</p>
                      <p className="text-xs text-gray-600">{new Date(c.submissionDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
                {premiumPayments.length === 0 && claims.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-2">No recent activity</p>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={() => router.push("/products")} variant="outline" className="w-full justify-start"><Plus className="h-4 w-4 mr-2" /> Purchase New Policy</Button>
                <Button onClick={() => router.push("/claims")} variant="outline" className="w-full justify-start"><FileText className="h-4 w-4 mr-2" /> File a Claim</Button>
                <Button onClick={() => router.push("/proposal-form")} variant="outline" className="w-full justify-start"><AlertTriangle className="h-4 w-4 mr-2" /> Risk Assessment</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { restoreConnection } = useRootStore();
  useEffect(() => { restoreConnection(); }, [restoreConnection]);



  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

