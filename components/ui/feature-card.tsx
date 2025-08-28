// import { DivideIcon as LucideIcon } from 'lucide-react';
// import { Card, CardContent } from '@/components/ui/card';

// interface FeatureCardProps {
//   icon: LucideIcon;
//   title: string;
//   description: string;
//   className?: string;
// }

// const FeatureCard = ({ icon: Icon, title, description, className = '' }: FeatureCardProps) => {
//   return (
//     <Card className={`group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${className}`}>
//       <CardContent className="p-6 text-center">
//         <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4 group-hover:bg-blue-200 transition-colors">
//           <Icon className="h-8 w-8 text-blue-600" />
//         </div>
//         <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
//         <p className="text-gray-600">{description}</p>
//       </CardContent>
//     </Card>
//   );
// };

// export default FeatureCard;


import { DivideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react'; // ✅ Use the provided type instead

interface FeatureCardProps {
  icon: LucideIcon;   // <-- Now it's a proper type
  title: string;
  description: string;
  className?: string;
}

const FeatureCard = ({ icon: Icon, title, description, className = '' }: FeatureCardProps) => {
  return (
    <Card className={`group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${className}`}>
      <CardContent className="p-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4 group-hover:bg-blue-200 transition-colors">
          <Icon className="h-8 w-8 text-blue-600" />  {/* ✅ works now */}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </CardContent>
    </Card>
  );
};

export default FeatureCard;
