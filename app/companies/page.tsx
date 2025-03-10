import { CompanyList } from '@/components/companies/CompanyList';
import { CreateCompanyButton } from '@/components/companies/CreateCompanyButton';

export default function CompaniesPage() {
  return (
    <div>
      {/* Header Section */}
      <div className="bg-[#00603A] text-white">
        <div className="px-12 py-16">
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-semibold">Companies</h1>
                <p className="mt-1 text-[#B8E1D3]">Manage your company relationships</p>
              </div>
              <CreateCompanyButton />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-12">
        <div className="bg-white">
          <CompanyList />
        </div>
      </div>
    </div>
  );
} 