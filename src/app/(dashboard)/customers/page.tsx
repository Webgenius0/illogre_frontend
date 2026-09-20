"use client";

import { useState } from "react";
import { CustomerTable } from "@/components/customers/CustomerTable";
import { AddEditCustomerModal } from "@/components/customers/AddEditCustomerModal";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CustomersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-400">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold mb-1">Customers</h1>
          <p className="text-muted-foreground text-sm font-medium">
            View and manage your customer base
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-linear-to-r from-secondary font-medium to-primary text-foreground px-6 py-6"
        >
          <Plus className="size-4" />
          Add New Customer
        </Button>
      </div>

      {/* Main Table Container */}
      <CustomerTable />

      <AddEditCustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
