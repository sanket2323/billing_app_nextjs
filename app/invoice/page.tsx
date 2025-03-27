import React from 'react';
import FarmerBillingForm from './FarmerBillingForm';

const Page = () => {
  return (
    <div className="min-h-screen min-w-screen flex flex-col ">
       <h2 className="text-xl sm:text-2xl font-bold text-white text-center">
          बिल नोंदणी
        </h2>
      <div className="w-full">
        <FarmerBillingForm />
        {/* this is updated code */}
      </div>
    </div>
  );
};

export default Page;