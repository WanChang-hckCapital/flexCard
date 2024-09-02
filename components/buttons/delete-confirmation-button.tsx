'use client'

import React from 'react'
import { TrashIcon } from 'lucide-react';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '../ui/dialog';
import { deleteProduct, deletePromotion } from '@/lib/actions/admin.actions';
import { toast } from 'sonner';

interface Props {
  promoId?: string;
  productId?: string;
  authActiveProfileId: string;
}

function DeleteConfirmationButton({ promoId, productId, authActiveProfileId }: Props) {

  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const openDeleteDialog = (Id: React.SetStateAction<string | null>) => {
    setSelectedId(Id);
  };

  const handleDelete = async () => {
    if (promoId) {
      const result = await deletePromotion({ promoId, authActiveProfileId });

      if (result.success) {
        toast.success("Promotion deleted successfully.");
        window.location.reload();
      } else {
        toast.error("Failed to delete promotion." + result.message);
      }
    }else if (productId) {
      const result = await deleteProduct({productId, authActiveProfileId});

      if (result.success) {
        toast.success("Product deleted successfully.");
        window.location.reload();
      }else{
        toast.error("Failed to delete product." + result.message);
      }
    }
  };

  return (
    <>
      {(promoId) && (
        <button onClick={() => openDeleteDialog(promoId)} className="text-red-500 hover:text-red-700">
          <TrashIcon className="w-5 h-5 cursor-pointer" />
        </button>
      )}
      {(productId) && (
        <button onClick={() => openDeleteDialog(productId)} className="text-red-500 hover:text-red-700">
          <TrashIcon className="w-5 h-5 cursor-pointer" />
        </button>
      )}
      <Dialog open={selectedId !== null} onOpenChange={() => setSelectedId(null)}>
        <DialogContent>
          {(promoId) && (
            <>
              <DialogTitle>Delete Promotion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this promotion? This action cannot be revert anymore.
              </DialogDescription>
            </>
          )}
          {(productId) && (
            <>
              <DialogTitle>Delete Product</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this product? This action cannot be revert anymore.
              </DialogDescription>
            </>
          )}
          <div className="flex justify-end gap-2 mt-4">
            <DialogClose asChild>
              <button className="px-4 py-2 rounded text-white bg-gray-500">Cancel</button>
            </DialogClose>
            <button onClick={handleDelete} className="px-4 py-2 rounded text-white bg-red-500">Delete</button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default DeleteConfirmationButton