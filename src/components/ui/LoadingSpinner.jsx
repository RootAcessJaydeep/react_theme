import React from 'react';

const LoadingSpinner = ({ size = 'medium', color = 'indigo' }) => {
  // Size classes
  const sizeClasses = {
    small: 'h-6 w-6',
    medium: 'h-12 w-12',
    large: 'h-16 w-16'
  };

  // Color classes
  const colorClasses = {
    indigo: 'border-indigo-500',
    blue: 'border-blue-500',
    red: 'border-red-500',
    green: 'border-green-500',
    gray: 'border-gray-500'
  };

  const spinnerSize = sizeClasses[size] || sizeClasses.medium;
  const spinnerColor = colorClasses[color] || colorClasses.indigo;

  return (
    <div className={`animate-spin rounded-full ${spinnerSize} border-t-2 border-b-2 ${spinnerColor}`}></div>
  );
};

export default LoadingSpinner;