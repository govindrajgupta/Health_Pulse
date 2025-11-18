import React, { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'red' | 'purple' | 'orange';
  link?: string;
  className?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  description,
  icon,
  trend,
  color = 'blue',
  link,
  className = '',
}) => {
  // Map color to tailwind classes
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      icon: 'text-blue-600',
      trend: {
        positive: 'text-green-600 bg-green-50',
        negative: 'text-red-600 bg-red-50',
      },
    },
    green: {
      bg: 'bg-green-50',
      icon: 'text-green-600',
      trend: {
        positive: 'text-green-600 bg-green-50',
        negative: 'text-red-600 bg-red-50',
      },
    },
    red: {
      bg: 'bg-red-50',
      icon: 'text-red-600',
      trend: {
        positive: 'text-green-600 bg-green-50',
        negative: 'text-red-600 bg-red-50',
      },
    },
    purple: {
      bg: 'bg-purple-50',
      icon: 'text-purple-600',
      trend: {
        positive: 'text-green-600 bg-green-50',
        negative: 'text-red-600 bg-red-50',
      },
    },
    orange: {
      bg: 'bg-orange-50',
      icon: 'text-orange-600',
      trend: {
        positive: 'text-green-600 bg-green-50',
        negative: 'text-red-600 bg-red-50',
      },
    },
  };

  const CardContent = () => (
    <>
      <div className="flex justify-between items-start mb-3">
        <div className={`p-2 rounded-lg ${colorClasses[color].bg}`}>
          <div className={`w-8 h-8 ${colorClasses[color].icon}`}>{icon}</div>
        </div>
        {trend && (
          <div
            className={`
              px-2 py-1 rounded-full text-xs font-medium flex items-center
              ${
                trend.isPositive
                  ? colorClasses[color].trend.positive
                  : colorClasses[color].trend.negative
              }
            `}
          >
            {trend.isPositive ? '+' : ''}
            {trend.value}%
          </div>
        )}
      </div>
      
      <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
      <div className="text-2xl font-bold text-slate-800 mb-1">{value}</div>
      {description && <p className="text-sm text-slate-500">{description}</p>}
      
      {link && (
        <div className="mt-3 text-sm font-medium flex items-center">
          <span className={colorClasses[color].icon}>View details</span>
          <ChevronRight size={16} className={`ml-1 ${colorClasses[color].icon}`} />
        </div>
      )}
    </>
  );

  return (
    <div className={`card p-4 ${className}`}>
      {link ? (
        <Link to={link} className="block h-full hover:no-underline">
          <CardContent />
        </Link>
      ) : (
        <CardContent />
      )}
    </div>
  );
};

export default MetricCard;