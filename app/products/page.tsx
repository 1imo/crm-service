import { ProductList } from '@/components/products/ProductList';
import { CreateProductButton } from '@/components/products/CreateProductButton';

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Products</h1>
        <CreateProductButton />
      </div>
      <ProductList />
    </div>
  );
} 