import { CustomerDetails } from '@/components/customers/CustomerDetails';

interface CustomerPageProps {
  params: {
    id: string;
  };
}

export default function CustomerPage({ params }: CustomerPageProps) {
  return (
    <div className="space-y-6">
      <CustomerDetails customerId={params.id} />
    </div>
  );
} 