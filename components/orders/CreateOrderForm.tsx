'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CustomerSearch } from '@/components/customers/CustomerSearch';
import { ProductSearch } from '@/components/products/ProductSearch';
import { CompanySearch } from '@/components/companies/CompanySearch';
import { Customer } from '@/types/customer';
import { Product } from '@/types/product';
import { Company } from '@/types/company';

interface OrderFormData {
  customerId: string;
  companyId: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
  }>;
}

export function CreateOrderForm() {
  const [formData, setFormData] = useState<OrderFormData>({
    customerId: '',
    companyId: '',
    items: [{
      productId: '',
      quantity: 1,
      unitPrice: 0
    }]
  });
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData(prev => ({
      ...prev,
      customerId: customer.id
    }));
  };

  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company);
    setFormData(prev => ({
      ...prev,
      companyId: company.id
    }));
  };

  const handleProductSelect = (index: number, product: Product) => {
    updateItem(index, 'productId', product.id);
    updateItem(index, 'unitPrice', product.price);
  };

  const updateItem = (index: number, field: keyof OrderFormData['items'][0], value: string | number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { productId: '', quantity: 1, unitPrice: 0 }]
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('Submitting order:', formData); // Debug log

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      router.push('/orders');
      router.refresh();
    } catch (err) {
      console.error('Order creation failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Company
            <CompanySearch onSelect={handleCompanySelect} />
          </label>
          {selectedCompany && (
            <div className="mt-2 p-3 bg-gray-50 rounded-md">
              <div className="font-medium">{selectedCompany.name}</div>
              <div className="text-sm text-gray-600">{selectedCompany.email}</div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Customer
            <CustomerSearch onSelect={handleCustomerSelect} />
          </label>
          {selectedCustomer && (
            <div className="mt-2 p-3 bg-gray-50 rounded-md">
              <div className="font-medium">{selectedCustomer.firstName} {selectedCustomer.lastName}</div>
              <div className="text-sm text-gray-600">{selectedCustomer.email}</div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {formData.items.map((item, index) => (
          <div key={`item-${index}`} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">
                Product
                <ProductSearch
                  onSelect={(product) => handleProductSelect(index, product)}
                />
                <input
                  type="hidden"
                  value={item.productId}
                />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Quantity
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Unit Price
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={item.unitPrice}
                  onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </label>
            </div>
            {formData.items.length > 1 && (
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={addItem}
          className="text-blue-600 hover:text-blue-800"
        >
          Add Item
        </button>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Order'}
        </button>
      </div>

      {error && (
        <div className="text-red-500 mt-2">
          {error}
        </div>
      )}
    </form>
  );
} 