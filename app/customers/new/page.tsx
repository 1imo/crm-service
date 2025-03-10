'use client';

import { CreateCustomerForm } from '@/components/customers/CreateCustomerForm';
import { motion } from 'framer-motion';

export default function CreateCustomerPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="min-h-screen bg-white"
    >
      {/* Header Section */}
      <div className="bg-[#00603A] text-white">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
        >
          <h1 className="text-3xl font-semibold">Create Customer</h1>
          <p className="mt-1 text-[#B8E1D3]">Add a new customer to your CRM</p>
        </motion.div>
      </div>

      {/* Main Content */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-white"
      >
        <div className="bg-white rounded-lg overflow-hidden">
          <div className="p-12">
            <CreateCustomerForm />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
} 