import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { RefinedForecastWizard } from "./RefinedForecastWizard";

interface ForecastingWizardModalProps {
  isOpen?: boolean;
  open?: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  onComplete: (data: any) => void;
}

const ForecastingWizardModal: React.FC<ForecastingWizardModalProps> = ({
  isOpen,
  open,
  onClose,
  onOpenChange,
  onComplete,
}) => {
  const isModalOpen = isOpen ?? open ?? false;
  const handleClose = onClose ?? (() => onOpenChange?.(false));

  return (
    <Dialog open={isModalOpen} onOpenChange={onOpenChange ?? onClose}>
      <DialogContent className="max-w-none w-screen h-screen p-0 border-0">
        <RefinedForecastWizard onClose={handleClose} onComplete={onComplete} />
      </DialogContent>
    </Dialog>
  );
};

export default ForecastingWizardModal;