"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useRootStore } from "@/stores/use-root-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Shield, CheckCircle, AlertTriangle } from "lucide-react";
import ProtectedRoute from "@/components/guards/ProtectedRoute";

function PoliciesPage() {
  const router = useRouter();
  const {
    policies,
    isLoadingPolicy,
    policyError,
    fetchPoliciesByUser,
    user
  } = useRootStore();

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  const totalPages = Math.ceil(policies.length / pageSize);

  const userId = user?.id;
  // Fetch user policies on mount
  useEffect(() => {
    if (userId) fetchPoliciesByUser(userId);
  }, [userId, fetchPoliciesByUser]);

  // Paginate policies
  const paginatedPolicies = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return policies.slice(start, start + pageSize);
  }, [policies, currentPage]);

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-slate-50 to-white py-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Page Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="bg-blue-100 text-blue-700 px-4 py-1.5 text-sm font-semibold mb-4">
            My Active Policies
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Your Blockchain-Backed Insurance
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Manage your on-chain insurance policies, monitor coverage, and view claim history.
          </p>
        </div>

        <Card className="shadow-lg border border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              My Policies
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Loading State */}
            {isLoadingPolicy && (
              <div className="flex justify-center items-center py-10 text-gray-500">
                <Loader2 className="h-6 w-6 mr-2 animate-spin" />
                Loading your policies...
              </div>
            )}

            {/* Error State */}
            {!isLoadingPolicy && policyError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-md mx-auto">
                <AlertTriangle className="h-10 w-10 text-red-600 mx-auto mb-3" />
                <p className="text-red-700 mb-3">{policyError}</p>
                <Button variant="outline" onClick={() => fetchPoliciesByUser(userId!)}>
                  Retry
                </Button>
              </div>
            )}

            {/* Empty State */}
            {!isLoadingPolicy && !policyError && policies.length === 0 && (
              <div className="text-center py-16 text-gray-500">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p>No active policies found.</p>
              </div>
            )}

            {/* Policies Table */}
            {!isLoadingPolicy && !policyError && policies.length > 0 && (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Policy ID</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Sum Insured</TableHead>
                      <TableHead>Premium</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedPolicies.map((policy) => (
                      <TableRow key={policy.id} className="hover:bg-blue-50/50 transition">
                        <TableCell className="font-mono text-sm text-gray-700">
                          {policy.policyId.slice(0, 8)}…
                        </TableCell>
                        <TableCell>{policy.policyClass}</TableCell>
                        <TableCell>${Number(policy.sumInsured).toLocaleString()}</TableCell>
                        <TableCell>${Number(policy.premium).toLocaleString()}</TableCell>
                        <TableCell>{policy.premiumFrequency}</TableCell>
                        <TableCell>
                          {policy.isActive ? (
                            <Badge className="bg-green-100 text-green-700 border-green-200 flex items-center gap-1">
                              <CheckCircle size={14} />
                              Active
                            </Badge>
                          ) : policy.isExpired ? (
                            <Badge className="bg-gray-200 text-gray-700 border-gray-300">Expired</Badge>
                          ) : (
                            <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/policy-detail/${policy.id}`)}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center mt-6 gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Prev
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


// ✅ Default export wrapped in ProtectedRoute
export default function Policies() {
    const { restoreConnection } = useRootStore();
    useEffect(() => {
      restoreConnection();
    }, [restoreConnection]);
  
    return (
      <ProtectedRoute>
        <PoliciesPage />
      </ProtectedRoute>
    );
  }