import { CreateCustomerForm } from '@/components/customers/CreateCustomerForm';

export default function CreateCustomerPage() {
  return (
    <div>
      {/* Header Section */}
      <div className="bg-[#00603A] text-white">
        <div className="px-12 py-16">
          <div className="flex flex-col h-full">
            <div>
              <h1 className="text-3xl font-semibold">Create Customer</h1>
              <p className="mt-1 text-[#B8E1D3]">Add a new customer to your CRM</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-12">
        <div className="bg-white shadow rounded-lg p-8">
          <CreateCustomerForm />
        </div>
      </div>
    </div>
  );
} 