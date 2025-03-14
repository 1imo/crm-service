'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Customer } from '@/types/customer';
import { Product } from '@/types/product';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckIcon, PlusIcon } from "lucide-react";

export function CreateOrderForm({ onComplete }: { onComplete: () => void }) {
  const router = useRouter();
  // Form state
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [productQuantities, setProductQuantities] = useState<{ [key: string]: number }>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Search states
  const [customerQuery, setCustomerQuery] = useState('');
  const [customerResults, setCustomerResults] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  
  const [productQuery, setProductQuery] = useState('');
  const [productResults, setProductResults] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [localQuantities, setLocalQuantities] = useState<{ [key: string]: number | null }>(productQuantities);

  // Add new state variables for tracking initial loads
  const [initialCustomerLoad, setInitialCustomerLoad] = useState(false);
  const [initialProductLoad, setInitialProductLoad] = useState(false);

  const [formData, setFormData] = useState<{
    items: Array<{
      productId: string;
      quantity: number;
      unitPrice: number;
    }>;
  }>({
    items: []
  });

  // Customer search
  useEffect(() => {
    const searchCustomers = async () => {
      try {
        setLoadingCustomers(true);
        const response = await fetch(`/api/customers/search?q=${encodeURIComponent(customerQuery)}&limit=3`);
        if (!response.ok) throw new Error('Search failed');
        const data = await response.json();
        setCustomerResults(data);
      } catch (error) {
        console.error('Search error:', error);
        setCustomerResults([]);
      } finally {
        setLoadingCustomers(false);
        setInitialCustomerLoad(true);
      }
    };

    const debounce = setTimeout(searchCustomers, 300);
    return () => clearTimeout(debounce);
  }, [customerQuery]);

  // Product search
  useEffect(() => {
    const searchProducts = async () => {
      try {
        setLoadingProducts(true);
        const response = await fetch(`/api/products/search?q=${encodeURIComponent(productQuery)}&limit=3`);
        if (!response.ok) throw new Error('Search failed');
        const data = await response.json();
        setProductResults(data);
      } catch (error) {
        console.error('Search error:', error);
        setProductResults([]);
      } finally {
        setLoadingProducts(false);
        setInitialProductLoad(true);
      }
    };

    const debounce = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounce);
  }, [productQuery]);

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
  };

  const handleProductSelect = (product: Product) => {
    if (selectedProducts.some(p => p.id === product.id)) {
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
      const quantity = localQuantities[product.id] || 1;
      setSelectedProducts(prev => [...prev, product]);
      setFormData(prev => ({
        ...prev,
        items: [...prev.items, {
          productId: product.id,
          quantity,
          unitPrice: parseFloat(product.price.toString()) || 0
        }]
      }));
      setProductQuantities(prev => ({
        ...prev,
        [product.id]: quantity
      }));
    }
  };

  const handleQuantityChange = (productId: string, value: string) => {
    const numericValue = value === '' ? null : parseInt(value);
    
    setLocalQuantities(prev => ({
      ...prev,
      [productId]: numericValue
    }));

    if (numericValue !== null && !isNaN(numericValue)) {
      const product = selectedProducts.find(p => p.id === productId);
      if (product) {
        setFormData(prev => ({
          ...prev,
          items: prev.items.map(item => 
            item.productId === productId 
              ? { ...item, quantity: numericValue }
              : item
          )
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) {
      setError('Please select a customer');
      return;
    }

    if (selectedProducts.length === 0) {
      setError('Please select at least one product');
      return;
    }

    const items = formData.items.filter(item => item.productId !== "");

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
        items: items
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
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Customer Selection */}
          <div className="grid grid-cols-3 gap-6">
            <Card className="col-span-2 w-full py-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 py-2">
                <CardTitle>Select Customer</CardTitle>
                <div className="w-72">
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardHeader>
            </Card>

            <Card className="w-full py-0">
              <CardHeader>
                <CardTitle>Selected Customer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Product Selection */}
          <div className="grid grid-cols-3 gap-6">
            <Card className="col-span-2 w-full py-0">
              <CardHeader>
                <CardTitle>Select Products</CardTitle>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>

            <Card className="w-full py-0">
              <CardHeader>
                <CardTitle>Selected Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-1/3" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <Card className="w-full py-0">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Customer Selection */}
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-4">
            <Card className="py-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 py-2">
                <CardTitle>Select Customer</CardTitle>
                <div className="w-72">
                  <Input
                    type="text"
                    value={customerQuery}
                    onChange={(e) => setCustomerQuery(e.target.value)}
                    placeholder="Search customers..."
                    className="w-full"
                  />
                </div>
              </CardHeader>
            </Card>

            {!initialCustomerLoad || loadingCustomers ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="py-0">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                            <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                            <div className="h-4 w-40 bg-muted rounded animate-pulse" />
                            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                          </div>
                        </div>
                        <div className="h-8 w-8 bg-muted rounded animate-pulse" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : customerResults.length > 0 ? (
              <div className="space-y-4">
                {customerResults.map((customer) => (
                  <Card 
                    key={customer.id}
                    className={`hover:bg-muted/50 transition-colors cursor-pointer py-0 ${
                      selectedCustomer?.id === customer.id ? 'bg-muted' : ''
                    }`}
                    onClick={() => handleCustomerSelect(customer)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-medium">
                            {customer.first_name?.[0]}{customer.last_name?.[0]}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium truncate">{customer.first_name} {customer.last_name}</p>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                              Customer
                            </span>
                            <p className="text-xs text-muted-foreground">Email: {customer.email}</p>
                            {customer.phone && (
                              <p className="text-xs text-muted-foreground">Phone: {customer.phone}</p>
                            )}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 ml-2">
                          {selectedCustomer?.id === customer.id ? (
                            <CheckIcon className="h-4 w-4 text-primary" />
                          ) : (
                            <PlusIcon className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {[...Array(3 - customerResults.length)].map((_, i) => (
                  <Card key={`skeleton-${i}`} className="py-0">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                            <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                            <div className="h-4 w-40 bg-muted rounded animate-pulse" />
                            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                          </div>
                        </div>
                        <div className="h-8 w-8 bg-muted rounded animate-pulse" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-2 text-sm text-muted-foreground text-center">
                  No customers found
                </CardContent>
              </Card>
            )}
          </div>

          <Card className="w-full py-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Selected Customer</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedCustomer ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-lg font-semibold">
                      {selectedCustomer.first_name} {selectedCustomer.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">Customer #{selectedCustomer.id}</p>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium">Contact Details</p>
                      <div className="text-sm text-muted-foreground">
                        <p>{selectedCustomer.email}</p>
                        {selectedCustomer.phone && <p>{selectedCustomer.phone}</p>}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Shipping Address</p>
                      <div className="text-sm text-muted-foreground">
                        <p>{selectedCustomer.address_line1}</p>
                        {selectedCustomer.address_line2 && <p>{selectedCustomer.address_line2}</p>}
                        <p>{selectedCustomer.city}, {selectedCustomer.postcode}</p>
                        <p>{selectedCustomer.county && `${selectedCustomer.county}, `}{selectedCustomer.country}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No customer selected</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Product Selection */}
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-4">
            <Card className="py-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 py-2">
                <CardTitle>Select Products</CardTitle>
                <div className="w-72">
                  <Input
                    type="text"
                    value={productQuery}
                    onChange={(e) => setProductQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full"
                  />
                </div>
              </CardHeader>
            </Card>

            {!initialProductLoad || loadingProducts ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="py-0">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                            <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                            <div className="h-4 w-40 bg-muted rounded animate-pulse" />
                            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                          </div>
                        </div>
                        <div className="h-8 w-8 bg-muted rounded animate-pulse" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : productResults.length > 0 ? (
              <div className="space-y-4">
                {productResults.map((product) => (
                  <Card 
                    key={product.id}
                    className={`hover:bg-muted/50 transition-colors cursor-pointer py-0 ${
                      selectedProducts.some(p => p.id === product.id) ? 'bg-muted' : ''
                    }`}
                    onClick={() => handleProductSelect(product)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-medium">
                            {product.name[0]}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium truncate">{product.name}</p>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                              £{product.price}
                            </span>
                            <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                            <span className={`text-xs ${
                              product.stock_quantity > 10 ? 'text-green-600' : 
                              product.stock_quantity > 0 ? 'text-amber-600' : 'text-red-600'
                            }`}>
                              {product.stock_quantity} in stock
                            </span>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProductSelect(product);
                          }}
                        >
                          {selectedProducts.some(p => p.id === product.id) ? (
                            <CheckIcon className="h-4 w-4 text-primary" />
                          ) : (
                            <PlusIcon className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {[...Array(3 - productResults.length)].map((_, i) => (
                  <Card key={`skeleton-${i}`} className="py-0">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                            <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                            <div className="h-4 w-40 bg-muted rounded animate-pulse" />
                            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                          </div>
                        </div>
                        <div className="h-8 w-8 bg-muted rounded animate-pulse" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-2 text-sm text-muted-foreground text-center">
                  No products found
                </CardContent>
              </Card>
            )}
          </div>

          <Card className="w-full py-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Selected Products</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedProducts.length > 0 ? (
                <div className="space-y-6">
                  {selectedProducts.map((product, index) => {
                    const quantity = productQuantities[product.id] || 1;
                    const totalPrice = (quantity * parseFloat(product.price.toString()));
                    
                    return (
                      <div key={product.id} className="space-y-3">
                        <div>
                          <div className="flex items-center justify-between">
                            <p className="text-base font-medium">{product.name}</p>
                            <p className="text-sm font-semibold">£{totalPrice.toFixed(2)}</p>
                          </div>
                          <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="space-x-4">
                            <span>£{product.price} × {quantity}</span>
                            <span className={
                              product.stock_quantity > 10 ? 'text-green-600' : 
                              product.stock_quantity > 0 ? 'text-amber-600' : 'text-red-600'
                            }>
                              {product.stock_quantity} in stock
                            </span>
                          </div>
                          <Input
                            type="number"
                            min="1"
                            max={product.stock_quantity}
                            value={quantity}
                            onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                            className="w-20 h-8 text-sm"
                          />
                        </div>
                        {product.description && (
                          <p className="text-sm text-muted-foreground">{product.description}</p>
                        )}
                        {index < selectedProducts.length - 1 && <hr className="mt-4" />}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No products selected</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <Card className="py-0">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span>Total Items:</span>
                <span className="font-medium">{selectedProducts.length}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>Total Amount:</span>
                <span className="font-medium">
                  £{formData.items.reduce((sum, item) => {
                    const product = selectedProducts.find(p => p.id === item.productId);
                    return sum + (item.quantity * (product?.price || 0));
                  }, 0).toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="text-destructive text-sm">
            {error}
          </div>
        )}
        
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Order...
              </>
            ) : (
              'Create Order'
            )}
          </Button>
        </div>
      </div>
    </form>
  );
} 