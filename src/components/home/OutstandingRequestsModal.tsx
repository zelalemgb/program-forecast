import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, AlertTriangle } from 'lucide-react';
import { useOutstandingRequests, OutstandingRequest } from '@/hooks/useOutstandingRequests';

interface OutstandingRequestsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApproveRequest: (requestId: string) => void;
}

const OutstandingRequestsModal: React.FC<OutstandingRequestsModalProps> = ({
  open,
  onOpenChange,
  onApproveRequest
}) => {
  const { requests, loading } = useOutstandingRequests();

  const getUrgencyColor = (urgency: OutstandingRequest['urgency_level']) => {
    switch (urgency) {
      case 'emergency':
        return 'destructive';
      case 'urgent':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getUrgencyIcon = (urgency: OutstandingRequest['urgency_level']) => {
    return urgency === 'emergency' || urgency === 'urgent' ? 
      <AlertTriangle className="w-3 h-3" /> : 
      <Clock className="w-3 h-3" />;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Outstanding Department Requests ({requests.length})
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading outstanding requests...
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No outstanding requests at this time.
            </div>
          ) : (
            requests.map((request) => (
              <div
                key={request.id}
                className="border rounded-lg p-4 space-y-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{request.product_name}</h4>
                      <Badge 
                        variant={getUrgencyColor(request.urgency_level)}
                        className="flex items-center gap-1"
                      >
                        {getUrgencyIcon(request.urgency_level)}
                        {request.urgency_level.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {request.department_name}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {request.requested_quantity} {request.unit}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {request.requested_date}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Navigate to full approval workflow
                      onOpenChange(false);
                      window.location.href = '/dagu';
                    }}
                  >
                    View Details
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      onApproveRequest(request.id);
                      onOpenChange(false);
                    }}
                  >
                    Quick Approve
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {requests.length > 0 && (
          <div className="flex justify-end pt-4 border-t">
            <Button
              onClick={() => {
                onOpenChange(false);
                window.location.href = '/dagu';
              }}
              className="flex items-center gap-2"
            >
              View All in Inventory
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OutstandingRequestsModal;