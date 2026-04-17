import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card group-[.toaster]:text-card-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success:
            "group-[.toaster]:!border-green-200 group-[.toaster]:![--toast-icon-color:theme(colors.green.600)]",
          error:
            "group-[.toaster]:!border-red-200 group-[.toaster]:![--toast-icon-color:theme(colors.red.600)]",
          warning:
            "group-[.toaster]:!border-orange-200 group-[.toaster]:![--toast-icon-color:theme(colors.orange.500)]",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
