import { OrderList } from '@/components/orders/OrderList';
import { CreateOrderButton } from '@/components/orders/CreateOrderButton';

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Orders</h1>
        <CreateOrderButton />
      </div>
      <OrderList />
    </div>
  );
} 