'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CustomerSearch } from '@/components/customers/CustomerSearch';
import { ProductSearch } from '@/components/products/ProductSearch';
import { CompanySearch } from '@/components/companies/CompanySearch';
import { Customer } from '@/types/customer';
import { Product } from '@/types/product';
import { Company } from '@/types/company';
import { motion, AnimatePresence } from 'framer-motion';

interface OrderFormData {
  customerId: string;
  companyId: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
  }>;
}

const initialFormData: OrderFormData = {
  customerId: '',
  companyId: '',
  items: [{
    productId: '',
    quantity: 1,
    unitPrice: 0
  }]
};

const steps = [
  { number: 1, title: '' },
  { number: 2, title: '' },
  { number: 3, title: '' }
];

export function CreateOrderForm({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [productQuantities, setProductQuantities] = useState<{ [key: string]: number }>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Initialize formData without any items
  const [formData, setFormData] = useState<{
    items: Array<{
      productId: string;
      quantity: number;
      unitPrice: number;
    }>;
  }>({
    items: [] // Initialize with empty array instead of an empty item
  });

  const handleCustomerSelect = (customer: Customer | null) => {
    setSelectedCustomer(customer);
    setFormData(prev => ({
      ...prev,
      customerId: customer?.id || ''
    }));
  };

  const handleCompanySelect = (company: Company) => {
    setFormData(prev => ({
      ...prev,
      companyId: company.id
    }));
  };

  const handleProductSelect = (product: Product | null, quantity: number = 1) => {
    if (!product) return;

    const isSelected = selectedProducts.some(p => p.id === product.id);
    
    if (isSelected) {
      // Remove product
      setSelectedProducts(prev => prev.filter(p => p.id !== product.id));
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter(item => item.productId !== product.id)
      }));
      setProductQuantities(prev => {
        const newQuantities = { ...prev };
        delete newQuantities[product.id];
        return newQuantities;
      });
    } else {
      // Add new product
      const newItem = {
        productId: product.id,
        quantity: quantity || 1,
        unitPrice: parseFloat(product.price.toString()) || 0
      };

      setSelectedProducts(prev => [...prev, product]);
      setFormData(prev => ({
        ...prev,
        items: [...prev.items, newItem]
      }));
      setProductQuantities(prev => ({
        ...prev,
        [product.id]: quantity
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // If not on the final step, just move to next step
    if (currentStep < 3) {
      // Validate current step before proceeding
      if (currentStep === 1) {
        if (!selectedCustomer) {
          setError('Please select a customer');
          return;
        }
        setError('');
        setCurrentStep(2);
        return;
      }

      if (currentStep === 2) {
        if (selectedProducts.length === 0) {
          setError('Please select at least one product');
          return;
        }
        setError('');
        setCurrentStep(3);
        return;
      }
    }

    // Final step validation and submission
    if (currentStep === 3) {
      if (!selectedCustomer) {
        setError('Please select a customer');
        return;
      }

      if (selectedProducts.length === 0) {
        setError('Please select at least one product');
        return;
      }

      // Only use non-empty items for submission
      const items = formData.items.filter(item => item.productId !== "");

      // Validate items
      const hasInvalidItems = items.some(
        item => 
          !item.productId || 
          typeof item.productId !== 'string' ||
          !item.quantity || 
          item.quantity <= 0 ||
          !item.unitPrice || 
          item.unitPrice <= 0
      );

      if (hasInvalidItems || items.length === 0) {
        setError('Please complete all item details');
        return;
      }

      try {
        setLoading(true);
        const orderData = {
          customerId: selectedCustomer.id,
          items: items // Use filtered items
        };

        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderData),
        });

        if (!response.ok) {
          throw new Error('Failed to create order');
        }

        onComplete();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create order');
      } finally {
        setLoading(false);
      }
    }
  };

  const renderFormStep = () => {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {(() => {
            switch (currentStep) {
              case 1:
                return (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Customer
                      </label>
                      <CustomerSearch 
                        onSelect={handleCustomerSelect}
                        selectedCustomerId={selectedCustomer?.id}
                      />
                    </div>
                  </div>
                );

              case 2:
                return (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Product
                      </label>
                      <ProductSearch
                        onSelect={handleProductSelect}
                        selectedProductIds={selectedProducts.map(p => p.id)}
                        quantities={productQuantities}
                      />
                    </div>
                  </div>
                );

              case 3:
                return (
                  <div className="space-y-6">
                    <h2 className="text-xl font-medium text-gray-900">Verify Order Details</h2>
                    
                    {/* Customer Details */}
                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                      <h3 className="text-sm font-medium text-gray-900 mb-4">Customer</h3>
                      <div className="text-sm text-gray-600">
                        <p>{selectedCustomer?.first_name}  {selectedCustomer?.last_name}</p>
                        <p>{selectedCustomer?.email}</p>
                        <p>{selectedCustomer?.phone}</p>
                      </div>
                    </div>

                    {/* Products List */}
                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                      <h3 className="text-sm font-medium text-gray-900 mb-4">Products</h3>
                      <div className="space-y-4">
                        {selectedProducts.map((product, index) => {
                          const item = formData.items.find(i => i.productId === product.id);
                          return (
                            <div key={product.id} className="flex justify-between items-center text-sm">
                              <div>
                                <p className="font-medium text-gray-900">{product.name}</p>
                                <p className="text-gray-500">Quantity: {item?.quantity || 1}</p>
                              </div>
                              <p className="text-gray-900">£{((item?.quantity || 1) * (item?.unitPrice || 0)).toFixed(2)}</p>
                            </div>
                          );
                        })}
                        
                        {/* Total */}
                        <div className="pt-4 border-t border-gray-200">
                          <div className="flex justify-between items-center font-medium text-gray-900">
                            <p>Total</p>
                            <p>£{formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0).toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );

              default:
                return null;
            }
          })()}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className="max-w-2xl w-full mx-auto">
      {/* Progress Tracker */}
      <div className="bg-white">
        <div className="relative px-0">
          {/* Connecting Lines */}
          <div className="absolute top-6 left-6 right-6 h-0.5 bg-gray-200">
            <div 
              className="h-full bg-[#00603A] transition-all duration-300"
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            />
          </div>
          
          {/* Step Numbers */}
          <div className="flex justify-between relative z-10">
            {steps.map((step) => (
              <div key={step.number}>
                <motion.div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-medium ${
                    currentStep >= step.number 
                      ? 'bg-[#00603A] text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}
                  animate={{
                    scale: currentStep === step.number ? 1.1 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  {step.number}
                </motion.div>
                <div className="mt-2 text-xs text-center text-gray-600">{step.title}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 mt-8">
          {renderFormStep()}
          
          {error && (
            <div className="text-red-600 text-sm mt-2">
              {error}
            </div>
          )}
          
          <div className="flex justify-end pt-6 space-x-6">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00603A]"
              >
                Previous
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#00603A] hover:bg-[#004D2E] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00603A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </span>
              ) : (
                currentStep === 3 ? 'Create Order' : 'Next'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 