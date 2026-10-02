import React from 'react';
import {
  Utensils,
  Car,
  Home,
  Receipt,
  ShoppingBag,
  HeartPulse,
  Film,
  MoreHorizontal,
  Coffee,
  Briefcase,
  Gift,
  Book,
  Smartphone,
  Zap,
  Dumbbell,
  Plane,
  LucideProps,
} from 'lucide-react';

export const AVAILABLE_ICONS = [
  { name: 'Utensils', label: 'Food & Dining', component: Utensils },
  { name: 'Car', label: 'Transport', component: Car },
  { name: 'Home', label: 'Housing', component: Home },
  { name: 'Receipt', label: 'Bills & Utilities', component: Receipt },
  { name: 'ShoppingBag', label: 'Shopping', component: ShoppingBag },
  { name: 'HeartPulse', label: 'Health & Care', component: HeartPulse },
  { name: 'Film', label: 'Entertainment', component: Film },
  { name: 'Coffee', label: 'Café & Snacks', component: Coffee },
  { name: 'Briefcase', label: 'Work', component: Briefcase },
  { name: 'Gift', label: 'Gifts', component: Gift },
  { name: 'Book', label: 'Education', component: Book },
  { name: 'Smartphone', label: 'Tech & Mobile', component: Smartphone },
  { name: 'Zap', label: 'Electricity / Power', component: Zap },
  { name: 'Dumbbell', label: 'Fitness', component: Dumbbell },
  { name: 'Plane', label: 'Travel', component: Plane },
  { name: 'MoreHorizontal', label: 'Other', component: MoreHorizontal },
];

interface CategoryIconProps extends LucideProps {
  name: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, ...props }) => {
  switch (name) {
    case 'Utensils':
      return <Utensils {...props} />;
    case 'Car':
      return <Car {...props} />;
    case 'Home':
      return <Home {...props} />;
    case 'Receipt':
      return <Receipt {...props} />;
    case 'ShoppingBag':
      return <ShoppingBag {...props} />;
    case 'HeartPulse':
      return <HeartPulse {...props} />;
    case 'Film':
      return <Film {...props} />;
    case 'Coffee':
      return <Coffee {...props} />;
    case 'Briefcase':
      return <Briefcase {...props} />;
    case 'Gift':
      return <Gift {...props} />;
    case 'Book':
      return <Book {...props} />;
    case 'Smartphone':
      return <Smartphone {...props} />;
    case 'Zap':
      return <Zap {...props} />;
    case 'Dumbbell':
      return <Dumbbell {...props} />;
    case 'Plane':
      return <Plane {...props} />;
    default:
      return <MoreHorizontal {...props} />;
  }
};
