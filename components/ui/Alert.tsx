import React from 'react';

interface AlertProps {
  variant: 'error' | 'success' | 'info';
  children: React.ReactNode;
}

const Alert: React.FC<AlertProps> = ({ variant, children }) => {
  const variantClasses = {
    error: 'bg-red-50 text-red-700',
    success: 'bg-green-50 text-green-700',
    info: 'bg-blue-50 text-blue-700',
  };

  return (
    <div className={`p-4 rounded-lg ${variantClasses[variant]}`}>
      {children}
    </div>
  );
};

export default Alert; 