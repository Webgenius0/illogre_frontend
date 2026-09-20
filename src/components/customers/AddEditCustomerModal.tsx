import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Customer } from "./CustomerTable";
import { useCreateCustomer, useUpdateCustomer } from "@/hooks/customers.api";
import { Spinner } from "../ui/spinner";

interface AddEditCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: Customer; // If provided, we are editing
  onSuccessAction?: (title: string, message: string) => void;
}

export function AddEditCustomerModal({
  isOpen,
  onClose,
  customer,
  onSuccessAction,
}: AddEditCustomerModalProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: customer?.name || "",
      email: customer?.email || "",
      country: customer?.country || "",
      status: customer?.status || "New",
      total_orders: customer?.total_orders || 0,
      total_spent: customer?.total_spent || 0,
    },
  });

  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer(customer?.id || null);

  useEffect(() => {
    if (customer) {
      reset({
        name: customer.name,
        email: customer.email,
        country: customer.country,
        status: customer.status,
        total_orders: customer.total_orders || 0,
        total_spent: customer.total_spent || 0,
      });
    } else {
      reset({
        name: "",
        email: "",
        country: "",
        status: "New",
        total_orders: 0,
        total_spent: 0,
      }); 
    }
  }, [customer, reset, isOpen]);

  const onSubmitHandler = (data: any) => {
    if (customer) {
      updateCustomer.mutate(data, {
        onSuccess: () => {
          if (onSuccessAction) {
            onSuccessAction(
              "Customer Updated Successfully",
              "The customer information has been successfully updated.",
            );
          } else {
            onClose();
          }
        },
      });
    } else {
      createCustomer.mutate(data, {
        onSuccess: () => {
          if (onSuccessAction) {
            onSuccessAction(
              "Customer Created Successfully",
              "The new customer has been successfully added to your list.",
            );
          } else {
            onClose();
          }
          reset();
        },
      });
    }
  };

  const isPending = createCustomer.isPending || updateCustomer.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-xl p-8 rounded-xl border-0">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {customer ? "Edit Customer" : "Add New Customer"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmitHandler)}
          className="space-y-6 mt-4"
        >
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 block">
              Full Name
            </label>
            <Input
              {...register("name", { required: "Full name is required" })}
              placeholder="e.g. Jane Doe"
              className="h-10 bg-gray-50/50 border-gray-100 placeholder:text-gray-400"
              disabled={isPending}
            />
            {errors.name && (
              <p className="text-red-500 text-xs">
                {errors.name.message as string}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 block">
              Email Address
            </label>
            <Input
              {...register("email", {
                required: "Email is required",
                pattern: { value: /^\S+@\S+$/i, message: "Invalid email" },
              })}
              placeholder="e.g. jane@example.com"
              className="h-10 bg-gray-50/50 border-gray-100 placeholder:text-gray-400"
              disabled={isPending}
            />
            {errors.email && (
              <p className="text-red-500 text-xs">
                {errors.email.message as string}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 block">
              Country / Location
            </label>
            <Input
              {...register("country")}
              placeholder="e.g. Austin, TX (Optional)"
              className="h-10 bg-gray-50/50 border-gray-100 placeholder:text-gray-400"
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Status
            </label>
            <Select
              onValueChange={(val) => setValue("status", val as any)}
              value={watch("status")}
              disabled={isPending}
            >
              <SelectTrigger className="h-10! w-full bg-gray-50/50 border-gray-100 text-gray-600">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-gray-100">
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="Returning">Returning</SelectItem>
                <SelectItem value="VIP">VIP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 block">
                Total Orders (Optional)
              </label>
              <Input
                type="number"
                {...register("total_orders")}
                placeholder="0"
                className="h-10 bg-gray-50/50 border-gray-100 placeholder:text-gray-400"
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 block">
                Total Spent (Optional)
              </label>
              <Input
                type="number"
                step="0.01"
                {...register("total_spent")}
                placeholder="$0.00"
                className="h-10 bg-gray-50/50 border-gray-100 placeholder:text-gray-400"
                disabled={isPending}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="h-10 px-8 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <Button
              type="submit"
              disabled={isPending}
              className="h-10 px-8 bg-linear-to-r from-primary to-secondary text-foreground"
            >
              {customer ? "Update Customer" : "Create New Customer"}{" "}
              {isPending && <Spinner />}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
