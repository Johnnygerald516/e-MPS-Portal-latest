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
      variant: "thin-error",
    });
  };

  const showSuccess = (options: ToastOptions) => {
    toast({
      title: options.title || "Success",
      description: options.description,
      variant: "outline-green",
    });
  };

  const showInfo = (options: ToastOptions) => {
    toast({
      title: options.title || "Information",
      description: options.description,
      variant: "outline-blue",
    });
  };

  return {
    showError,
    showSuccess,
    showInfo,
  };
}
