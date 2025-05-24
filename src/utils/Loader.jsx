import React from "react";

function Loader() {
  return (
    <>
      <div className="text-center py-4">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-600"></div>
        <span className="ml-2 text-gray-600">Loading ...</span>
      </div>
    </>
  );
}

export default Loader;
