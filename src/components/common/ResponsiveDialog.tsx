import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Optional: omit it to control the dialog from outside. */
  trigger?: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
  /** Action buttons. Full width and stacked on mobile. */
  footer?: ReactNode;
}

/** Bottom sheet (Drawer) on phones, centered Dialog on larger screens. */
export function ResponsiveDialog({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  footer,
}: Props) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange} repositionInputs={false}>
        {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
        <DrawerContent className="max-h-[92dvh]">
          <DrawerHeader className="text-left">
            <DrawerTitle>{title}</DrawerTitle>
            {description && <DrawerDescription>{description}</DrawerDescription>}
          </DrawerHeader>
          <div className="overflow-y-auto px-4">{children}</div>
          {footer && <DrawerFooter className="pb-safe">{footer}</DrawerFooter>}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}
