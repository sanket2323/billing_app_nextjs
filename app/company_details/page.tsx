import React from 'react';
import CompanyRegistrationForm from './CompanyForm';


const Page = () => {
  return (
    <div className="min-h-screen min-w-screen flex flex-col ">
       <h2 className="text-xl sm:text-2xl font-bold text-white text-center">
       कंपनी तपशील
        </h2>
      <div className="w-full">
       <CompanyRegistrationForm/>
      </div>
    </div>
  );
};

export default Page;