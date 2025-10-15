import { Toaster, toast } from 'sonner';
import React, { useEffect } from 'react';

type ToastType = 'success' | 'error' | 'default' | 'loading' | 'custom';

interface SuccessToasterProps {
  message?: string;
  type?: ToastType;
  // optional key to force effect when same message repeats
  key?: string | number;
}

const SuccessToaster: React.FC<SuccessToasterProps> = ({ message, type = 'default' }) => {
  useEffect(() => {
    if (!message) return;

    switch (type) {
      case 'success':
        toast.success(message);
        break;
      case 'error':
        toast.error(message);
        break;
      case 'loading':
        toast.loading(message);
        break;
      default:
        toast(message);
    }
  }, [message, type]);

  // Only render the Toaster (no demo button)
  return <Toaster expand={true} richColors />;
};

export default SuccessToaster;
