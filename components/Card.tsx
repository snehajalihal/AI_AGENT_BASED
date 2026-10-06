import React from 'react';

interface InfoCardProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, icon, children, className = '' }) => {
  return (
    <div className={`bg-base-200 border border-base-300 rounded-lg shadow-lg transition-shadow hover:shadow-xl hover:border-primary/50 ${className}`}>
      <div className="bg-base-100/30 text-gray-100 px-5 py-3 rounded-t-lg flex items-center border-b border-base-300">
        {icon && <span className="mr-3 text-primary">{icon}</span>}
        <h2 className="font-bold text-lg">{title}</h2>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default InfoCard;
