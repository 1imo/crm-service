import { ClientList } from '@/components/clients/ClientList';
import { CreateClientButton } from '@/components/clients/CreateClientButton';

export default function ClientsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Clients</h1>
        <CreateClientButton />
      </div>
      <ClientList />
    </div>
  );
} 