import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import Card from './ui/Card';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
  color: string;
  bgColor: string;
  borderColor: string;
  delay?: number;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  trend = 'neutral',
  icon: Icon,
  color,
  bgColor,
  borderColor,
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -2, scale: 1.02 }}
    >
      <Card className={`border ${borderColor} hover:shadow-lg`}>
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg ${bgColor}`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
          {change && (
            <div className={`flex items-center space-x-1 text-sm ${
              trend === 'up' ? 'text-green-600' : 
              trend === 'down' ? 'text-red-600' : 
              'text-slate-600'
            }`}>
              {trend !== 'neutral' && (
                trend === 'up' ? 
                  <TrendingUp className="w-4 h-4" /> : 
                  <TrendingDown className="w-4 h-4" />
              )}
              <span>{change}</span>
            </div>
          )}
        </div>
        <div>
          <p className="text-3xl font-bold text-slate-800 mb-1">{value}</p>
          <p className="text-slate-600 text-sm">{title}</p>
        </div>
      </Card>
    </motion.div>
  );
};

export default StatsCard;
