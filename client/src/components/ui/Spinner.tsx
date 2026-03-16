import React from 'react';

export const Spinner: React.FC = () => {
  return (
    <div
      className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"
      aria-label="loading"
    />
  );
};
