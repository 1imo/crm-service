import { CustomerList } from '@/components/customers/CustomerList';
import { CreateCustomerButton } from '@/components/customers/CreateCustomerButton';

export default function CustomersPage() {
  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your customer relationships</p>
        </div>
        <CreateCustomerButton />
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <CustomerList />
      </div>
    </div>
  );
} 