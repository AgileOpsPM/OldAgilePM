import React from 'react';

const Loading = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      <p className="ml-4 text-lg text-gray-700">Loading...</p>
    </div>
  );
}
export default Loading;