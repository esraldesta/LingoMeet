import { Loader2Icon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReactElement, ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  children: string | ReactNode;
  isLoading: boolean;
  className?: string;
  disabled?: boolean;
  [key: string]: any;
}

export function LoaderButton({
  children,
  isLoading,
  className,
  ...props
}: Props) {
  return (
    <Button
      disabled={isLoading}
      type="submit"
      {...props}
      className={cn(
        "flex gap-2 justify-center bg-primary px-9 py-5",
        className
      )}
    >
      {isLoading && <Loader2Icon className="animate-spin w-4 h-4" />}
      {children}
    </Button>
  );
}
