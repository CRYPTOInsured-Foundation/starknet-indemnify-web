import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Shield, Calendar, DollarSign, FileText, AlertTriangle } from 'lucide-react';

interface PolicyCardProps {
  id: string;
  policyId: string;
  policyClass: string;
  subjectMatter: string;
  sumInsured: string;
  premium: string;
  premiumFrequency: string;
  startDate: string;
  expirationDate: string;
  isActive: boolean;
  isExpired: boolean;
  claimsCount: number;
  hasClaimed: boolean;
  hasReinsurance: boolean;
  onManage: (id: string) => void;
}

const statusColors = {
  active: 'bg-green-100 text-green-800',
  expired: 'bg-red-100 text-red-800',
  inactive: 'bg-gray-100 text-gray-800',
};

const policyClassIcons = {
  property: '🏠',
  marine: '🚢',
  aviation: '✈️',
  liability: '⚖️',
  life: '❤️',
  health: '🏥',
  travel: '🧳',
  cyber: '💻',
  agriculture: '🌾',
  default: '🛡️'
};

const premiumFrequencyLabels = {
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  semi_annual: 'Semi-Annual',
  annual: 'Annual',
  single_premium: 'Single Premium'
};

const PolicyCard = ({
  id,
  policyId,
  policyClass,
  subjectMatter,
  sumInsured,
  premium,
  premiumFrequency,
  expirationDate,
  isActive,
  isExpired,
  claimsCount,
  hasClaimed,
  hasReinsurance,
  onManage,
}: PolicyCardProps) => {
  // Determine status
  const status = isExpired ? 'expired' : isActive ? 'active' : 'inactive';
  
  // Get icon for policy class
  const policyIcon = policyClassIcons[policyClass as keyof typeof policyClassIcons] || policyClassIcons.default;
  
  // Format dates
  const formattedExpiry = format(new Date(expirationDate), 'MMM dd, yyyy');
  
  // Parse amounts
  const coverageAmount = parseFloat(sumInsured);
  const premiumAmount = parseFloat(premium);
  
  // Format premium frequency
  const frequencyLabel = premiumFrequencyLabels[premiumFrequency as keyof typeof premiumFrequencyLabels] || premiumFrequency;

  return (
    <Card className="hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{policyIcon}</span>
            <div>
              <CardTitle className="text-lg">
                {policyClass.charAt(0).toUpperCase() + policyClass.slice(1)} Insurance
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                {subjectMatter}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge className={statusColors[status]}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
            {hasReinsurance && (
              <Badge variant="outline" className="text-xs">
                Reinsured
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Coverage and Premium */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Coverage</p>
              <p className="font-semibold">${coverageAmount.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Premium</p>
              <p className="font-semibold">${premiumAmount.toLocaleString()}</p>
              <p className="text-xs text-gray-500">{frequencyLabel}</p>
            </div>
          </div>
        </div>

        {/* Claims and Expiry */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600">Claims</p>
              <p className="font-medium">{claimsCount}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-600" />
            <div>
              <p className="text-sm text-gray-600">Expires</p>
              <p className="font-medium">{formattedExpiry}</p>
            </div>
          </div>
        </div>

        {/* Policy ID */}
        <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-2">
          <span>Policy ID: {policyId}</span>
          {hasClaimed && (
            <Badge variant="outline" className="bg-orange-50 text-orange-700">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Claim Filed
            </Badge>
          )}
        </div>

        {/* Action Button */}
        <Button 
          onClick={() => onManage(id)} 
          className="w-full"
          variant={status === 'expired' ? 'outline' : 'default'}
          disabled={status === 'inactive'}
        >
          {status === 'expired' ? 'Renew Policy' : 
           status === 'inactive' ? 'Inactive' : 
           'Manage Policy'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PolicyCard;





// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Button } from '@/components/ui/button';
// import { format } from 'date-fns';
// import { Shield, Calendar, DollarSign } from 'lucide-react';

// interface PolicyCardProps {
//   id: string;
//   name: string;
//   coverage: number;
//   premium: number;
//   status: 'active' | 'expired' | 'pending';
//   expiryDate: Date;
//   type: 'defi' | 'smart-contract' | 'liquidity' | 'bridge';
//   onManage: (id: string) => void;
// }

// const statusColors = {
//   active: 'bg-green-100 text-green-800',
//   expired: 'bg-red-100 text-red-800',
//   pending: 'bg-yellow-100 text-yellow-800',
// };

// const typeIcons = {
//   defi: '🔄',
//   'smart-contract': '📝',
//   liquidity: '💧',
//   bridge: '🌉',
// };

// const PolicyCard = ({
//   id,
//   name,
//   coverage,
//   premium,
//   status,
//   expiryDate,
//   type,
//   onManage,
// }: PolicyCardProps) => {
//   return (
//     <Card className="hover:shadow-md transition-shadow">
//       <CardHeader className="pb-3">
//         <div className="flex items-start justify-between">
//           <div className="flex items-center space-x-2">
//             <span className="text-2xl">{typeIcons[type]}</span>
//             <CardTitle className="text-lg">{name}</CardTitle>
//           </div>
//           <Badge className={statusColors[status]}>
//             {status.charAt(0).toUpperCase() + status.slice(1)}
//           </Badge>
//         </div>
//       </CardHeader>
//       <CardContent className="space-y-4">
//         <div className="grid grid-cols-2 gap-4">
//           <div className="flex items-center space-x-2">
//             <Shield className="h-4 w-4 text-blue-600" />
//             <div>
//               <p className="text-sm text-gray-600">Coverage</p>
//               <p className="font-semibold">${coverage.toLocaleString()}</p>
//             </div>
//           </div>
//           <div className="flex items-center space-x-2">
//             <DollarSign className="h-4 w-4 text-green-600" />
//             <div>
//               <p className="text-sm text-gray-600">Premium</p>
//               <p className="font-semibold">${premium}</p>
//             </div>
//           </div>
//         </div>
        
//         <div className="flex items-center space-x-2">
//           <Calendar className="h-4 w-4 text-gray-600" />
//           <div>
//             <p className="text-sm text-gray-600">Expires</p>
//             <p className="font-medium">{format(expiryDate, 'MMM dd, yyyy')}</p>
//           </div>
//         </div>

//         <Button 
//           onClick={() => onManage(id)} 
//           className="w-full"
//           variant={status === 'expired' ? 'outline' : 'default'}
//         >
//           {status === 'expired' ? 'Renew Policy' : 'Manage Policy'}
//         </Button>
//       </CardContent>
//     </Card>
//   );
// };

// export default PolicyCard;