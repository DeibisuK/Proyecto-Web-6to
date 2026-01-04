import { Toaster, toast } from 'sonner';
import React, { useEffect } from 'react';

type ToastType = 'success' | 'error' | 'default' | 'loading' | 'dismiss' | 'custom';

interface SuccessToasterProps {
  message?: string;
  type?: ToastType;
  toastKey?: string | number;
}

const SuccessToaster: React.FC<SuccessToasterProps> = ({ message, type = 'default', toastKey }) => {
  const toastIds = React.useRef<Map<string | number, string | number>>(new Map());

  useEffect(() => {
    // Manejar dismiss incluso sin mensaje
    if (type === 'dismiss') {
      if (toastKey && toastIds.current.has(toastKey)) {
        const id = toastIds.current.get(toastKey);
        toast.dismiss(id);
        toastIds.current.delete(toastKey);
      } else {
        toast.dismiss();
      }
      return;
    }

    // Para otros tipos, necesitamos un mensaje
    if (!message) return;

    switch (type) {
      case 'success':
        toast.success(message);
        break;
      case 'error':
        toast.error(message);
        break;
      case 'loading':
        const loadingToastId = toast.loading(message);
        if (toastKey) {
          toastIds.current.set(toastKey, loadingToastId);
        }
        break;
      default:
        toast(message);
    }
  }, [message, type, toastKey]);

  // Listen for custom events from Angular components
  useEffect(() => {
    const handleToastEvent = (event: CustomEvent) => {
      const { message, type, toastKey } = event.detail;

      switch (type) {
        case 'success':
          toast.success(message);
          break;
        case 'error':
          toast.error(message);
          break;
        case 'loading':
          const toastId = toast.loading(message);
          if (toastKey) {
            toastIds.current.set(toastKey, toastId);
          }
          break;
        case 'dismiss':
          if (toastKey && toastIds.current.has(toastKey)) {
            const id = toastIds.current.get(toastKey);
            toast.dismiss(id);
            toastIds.current.delete(toastKey);
          } else {
            toast.dismiss();
          }
          break;
        default:
          toast(message);
      }
    };

    window.addEventListener('showToast', handleToastEvent as EventListener);

    return () => {
      window.removeEventListener('showToast', handleToastEvent as EventListener);
    };
  }, []);

  // Only render the Toaster (no demo button)
  return <Toaster expand={true} richColors />;
};

export default SuccessToaster;
