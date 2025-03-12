import { OrderList } from '@/components/orders/OrderList';
import { CreateOrderButton } from '@/components/orders/CreateOrderButton';

export default function OrdersPage() {
  return (
    <div>
      {/* Header Section */}
      <div className="bg-[#00603A] text-white">
        <div className="px-12 py-16">
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-semibold">Orders</h1>
                <p className="mt-1 text-[#B8E1D3]">Manage your orders</p>
              </div>
              <CreateOrderButton />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-12">
        <div className="bg-white">
          <OrderList />
        </div>
      </div>
    </div>
  );
} 