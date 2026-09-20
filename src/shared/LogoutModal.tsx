"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import LogoutSvg from "@/components/svg/LogoutSvg";

import { useLogout } from "@/hooks/auth.api";
import { Spinner } from "@/components/ui/spinner";

export default function LogoutModal({
  open: externalOpen,
  onOpenChange: setExternalOpen,
  showTrigger = true,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
}) {
  const [internalOpen, setInternalOpen] = useState(false);

  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen =
    setExternalOpen !== undefined ? setExternalOpen : setInternalOpen;

  const { mutate: logout, isPending } = useLogout();

  const handleLogout = async () => {
    logout(
      {},
      {
        onSuccess: () => {
          setOpen(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {showTrigger && (
        <DialogTrigger>
          <div className="text-base font-medium text-red-500 px-5 pt-5 cursor-pointer">
            <div className="flex items-center gap-2">
              <LogoutSvg /> Logout
            </div>
          </div>
        </DialogTrigger>
      )}

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm logout</DialogTitle>
          <DialogDescription>
            You will be signed out of your account. Do you want to continue?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <DialogClose>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleLogout}
            disabled={isPending}
          >
            Logout {isPending && <Spinner />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
