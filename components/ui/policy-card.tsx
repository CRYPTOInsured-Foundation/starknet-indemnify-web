import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Shield, Calendar, DollarSign } from 'lucide-react';

interface PolicyCardProps {
  id: string;
  name: string;
  coverage: number;
  premium: number;
  status: 'active' | 'expired' | 'pending';
  expiryDate: Date;
  type: 'defi' | 'smart-contract' | 'liquidity' | 'bridge';
  onManage: (id: string) => void;
}

const statusColors = {
  active: 'bg-green-100 text-green-800',
  expired: 'bg-red-100 text-red-800',
  pending: 'bg-yellow-100 text-yellow-800',
};

const typeIcons = {
  defi: '🔄',
  'smart-contract': '📝',
  liquidity: '💧',
  bridge: '🌉',
};

const PolicyCard = ({
  id,
  name,
  coverage,
  premium,
  status,
  expiryDate,
  type,
  onManage,
}: PolicyCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{typeIcons[type]}</span>
            <CardTitle className="text-lg">{name}</CardTitle>
          </div>
          <Badge className={statusColors[status]}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Coverage</p>
              <p className="font-semibold">${coverage.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Premium</p>
              <p className="font-semibold">${premium}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-600" />
          <div>
            <p className="text-sm text-gray-600">Expires</p>
            <p className="font-medium">{format(expiryDate, 'MMM dd, yyyy')}</p>
          </div>
        </div>

        <Button 
          onClick={() => onManage(id)} 
          className="w-full"
          variant={status === 'expired' ? 'outline' : 'default'}
        >
          {status === 'expired' ? 'Renew Policy' : 'Manage Policy'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PolicyCard;