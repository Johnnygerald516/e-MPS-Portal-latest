import { toast } from "@/components/ui/use-toast";

interface ToastOptions {
  title?: string;
  description: string;
}

export function useCustomToast() {
  const showError = (options: ToastOptions) => {
    toast({
      title: options.title || "Error",
      description: options.description,
      variant: "error",
    });
  };

  const showSuccess = (options: ToastOptions) => {
    toast({
      title: options.title || "Success",
      description: options.description,
      variant: "success",
    });
  };

  const showInfo = (options: ToastOptions) => {
    toast({
      title: options.title || "Info",
      description: options.description,
      variant: "info",
    });
  };
  
  const showWarning = (options: ToastOptions) => {
    toast({
      title: options.title || "Warning",
      description: options.description,
      variant: "warning",
    });
  };

  return {
    showError,
    showSuccess,
    showInfo,
    showWarning,
  };
}
