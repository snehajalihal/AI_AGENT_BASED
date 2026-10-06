import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-footer text-gray-400 py-4 mt-8 border-t border-base-100/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between text-sm">
        <span>Intrusion Detection System with Incremental Majority Voting</span>
        <span>Machine Learning Based IDS</span>
      </div>
    </footer>
  );
};

export default Footer;
