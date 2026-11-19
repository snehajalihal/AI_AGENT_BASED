import React from 'react';
import { AccuracyIcon, PrecisionIcon, RecallIcon, F1Icon } from './icons/Icons';

interface MetricCardProps {
  title: string;
  value: number;
  type: 'accuracy' | 'precision' | 'recall' | 'f1';
}

const icons = {
  accuracy: <AccuracyIcon className="w-8 h-8" />,
  precision: <PrecisionIcon className="w-8 h-8" />,
  recall: <RecallIcon className="w-8 h-8" />,
  f1: <F1Icon className="w-8 h-8" />,
};

const colors = {
  accuracy: 'text-primary',
  precision: 'text-secondary',
  recall: 'text-accent',
  f1: 'text-danger'
};

const MetricCard: React.FC<MetricCardProps> = ({ title, value, type }) => {
  return (
    <div className="bg-base-200 p-6 border border-base-300 rounded-lg shadow-lg text-center flex flex-col justify-between">
      <div className={`flex justify-center items-center mb-3 ${colors[type]}`}>
        {icons[type]}
      </div>
      <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">{title}</p>
      <p className={`text-4xl font-bold mt-2 ${colors[type]}`}>
        {(value * 100).toFixed(2)}%
      </p>
    </div>
  );
};

export default MetricCard;
