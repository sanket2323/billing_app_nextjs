import { FarmerProfileForm } from "@/components/ProfileForm";

export default function InvoicePage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="w-full max-w-full p-4 md:p-8">
        <div className="mb-8 border-b border-gray-800 pb-4">
          <h1 className="text-3xl font-bold text-white">Invoice Page</h1>
          <p className="text-gray-400 mt-2">
            Create and manage farmer invoices
          </p>
        </div>

        <div className="w-full bg-gray-800 rounded-lg shadow-lg p-4 md:p-6 border border-gray-700">
          <FarmerProfileForm />
        </div>

        <div className="mt-6 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Farm Management System</p>
        </div>
      </div>
    </div>
  );
}
