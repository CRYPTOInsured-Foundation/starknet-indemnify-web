'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/guards/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  FileText, 
  Plus, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Upload,
  ExternalLink
} from 'lucide-react';

interface Claim {
  id: string;
  policyName: string;
  type: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'investigating';
  submittedDate: Date;
  description: string;
}

function ClaimsContent() {
  const [showNewClaimForm, setShowNewClaimForm] = useState(false);
  const [claims] = useState<Claim[]>([
    {
      id: '1',
      policyName: 'DeFi Protocol Coverage',
      type: 'Smart Contract Exploit',
      amount: 15000,
      status: 'investigating',
      submittedDate: new Date('2024-01-15'),
      description: 'Funds lost due to reentrancy attack on protocol',
    },
    {
      id: '2',
      policyName: 'Bridge Protection',
      type: 'Bridge Failure',
      amount: 8500,
      status: 'approved',
      submittedDate: new Date('2024-01-10'),
      description: 'Assets stuck due to bridge downtime',
    },
  ]);

  const statusConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    investigating: { color: 'bg-blue-100 text-blue-800', icon: AlertTriangle },
    approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
    rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
  };

  const handleSubmitClaim = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle claim submission
    setShowNewClaimForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Claims Management</h1>
              <p className="text-gray-600 mt-1">
                File and track your insurance claims.
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => setShowNewClaimForm(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                File New Claim
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Claims</p>
                  <p className="text-2xl font-bold text-gray-900">{claims.length}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Under Review</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {claims.filter(c => c.status === 'investigating' || c.status === 'pending').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-green-600">
                    {claims.filter(c => c.status === 'approved').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Paid</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${claims.filter(c => c.status === 'approved').reduce((sum, c) => sum + c.amount, 0).toLocaleString()}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* New Claim Form */}
        {showNewClaimForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>File New Claim</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitClaim} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="policy">Policy</Label>
                    <select id="policy" className="w-full mt-1 rounded-md border border-gray-300 px-3 py-2">
                      <option>Select a policy</option>
                      <option>DeFi Protocol Coverage</option>
                      <option>Smart Contract Protection</option>
                      <option>Bridge Protection</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="claimType">Claim Type</Label>
                    <select id="claimType" className="w-full mt-1 rounded-md border border-gray-300 px-3 py-2">
                      <option>Select claim type</option>
                      <option>Smart Contract Exploit</option>
                      <option>Bridge Failure</option>
                      <option>Protocol Hack</option>
                      <option>Rug Pull</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="amount">Claim Amount ($)</Label>
                  <Input id="amount" type="number" placeholder="Enter claim amount" className="mt-1" />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Provide detailed description of the incident..."
                    className="mt-1"
                    rows={4}
                  />
                </div>

                <div>
                  <Label>Supporting Documents</Label>
                  <div className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Upload transaction hashes, screenshots, or other evidence</p>
                    <Button variant="outline" type="button">Choose Files</Button>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setShowNewClaimForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    Submit Claim
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Claims List */}
        <div className="space-y-6">
          {claims.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No claims yet</h3>
                <p className="text-gray-600 mb-6">
                  If you experience a covered incident, you can file a claim here.
                </p>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => setShowNewClaimForm(true)}
                >
                  File Your First Claim
                </Button>
              </CardContent>
            </Card>
          ) : (
            claims.map((claim) => {
              const statusInfo = statusConfig[claim.status];
              const StatusIcon = statusInfo.icon;

              return (
                <Card key={claim.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Claim #{claim.id}
                          </h3>
                          <Badge className={statusInfo.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-1">{claim.policyName}</p>
                        <p className="text-sm text-gray-500">
                          Submitted {claim.submittedDate.toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">
                          ${claim.amount.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">{claim.type}</p>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4">{claim.description}</p>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex space-x-4">
                        <Button variant="outline" size="sm">
                          View Details
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </Button>
                        {claim.status === 'pending' && (
                          <Button variant="outline" size="sm">
                            Upload Documents
                          </Button>
                        )}
                      </div>
                      
                      {claim.status === 'investigating' && (
                        <p className="text-sm text-blue-600">
                          Estimated review time: 3-5 business days
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default function Claims() {
  return (
    <ProtectedRoute>
      <ClaimsContent />
    </ProtectedRoute>
  );
}