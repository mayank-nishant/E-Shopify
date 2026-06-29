import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCustomerOrdersStore } from "@/features/customer/orders/store";
import type {
  CustomerOrder,
  CustomerOrderStatus,
  CustomerPaymentStatus,
} from "@/features/customer/orders/types";
import { formatPrice } from "@/lib/utils";
import { Loader2, PackageSearch, RefreshCw, ShoppingBasket } from "lucide-react";

const dialogClass =
  "max-h-[92vh] overflow-y-auto border-border bg-background sm:max-w-4xl";

const successBadgeClass =
  "border-primary/30 bg-primary/10 text-primary hover:bg-primary/10 font-medium capitalize";

const dangerBadgeClass =
  "border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/10 font-medium capitalize";

const neutralBadgeClass =
  "border-border bg-secondary/60 text-foreground hover:bg-secondary/60 font-medium capitalize";

const placedBadgeClass =
  "border-orange-300/50 bg-orange-50 text-orange-600 hover:bg-orange-50 font-medium capitalize dark:border-orange-400/30 dark:bg-orange-400/10 dark:text-orange-400";

const shippedBadgeClass =
  "border-blue-300/50 bg-blue-50 text-blue-600 hover:bg-blue-50 font-medium capitalize dark:border-blue-400/30 dark:bg-blue-400/10 dark:text-blue-400";

function CustomerPaymentStatusBadge(props: { status: CustomerPaymentStatus }) {
  const { status } = props;
  const className =
    status === "paid"
      ? successBadgeClass
      : status === "failed"
        ? dangerBadgeClass
        : neutralBadgeClass;

  return (
    <Badge variant="outline" className={className}>
      {status}
    </Badge>
  );
}

function CustomerOrderStatusBadge(props: { status: CustomerOrderStatus }) {
  const { status } = props;
  const className =
    status === "delivered"
      ? successBadgeClass
      : status === "returned"
        ? dangerBadgeClass
        : status === "shipped"
          ? shippedBadgeClass
          : placedBadgeClass;

  return (
    <Badge variant="outline" className={className}>
      {status}
    </Badge>
  );
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function canReturnOrder(order: CustomerOrder) {
  if (order.orderStatus !== "delivered" || !order.deliveredAt) return false;
  const msElapsed = Date.now() - new Date(order.deliveredAt).getTime();
  return msElapsed <= 7 * 24 * 60 * 60 * 1000;
}

function formatOrderId(id: string) {
  return id.length > 12 ? `#${id.slice(-8).toUpperCase()}` : `#${id.toUpperCase()}`;
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
      <Loader2 className="h-6 w-6 animate-spin" />
      <p className="text-sm">Loading your orders…</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <PackageSearch className="h-10 w-10 text-muted-foreground/50" />
      <p className="text-sm font-medium text-foreground">No orders yet</p>
      <p className="text-xs text-muted-foreground">
        Your completed orders will appear here.
      </p>
    </div>
  );
}

function CustomerOrdersDialog() {
  const { isOpen, closeOrders, loading, items, returnOrder, loadOrders } =
    useCustomerOrdersStore((state) => state);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeOrders()}>
      <DialogContent className={dialogClass}>
        <DialogHeader className="border-b border-border pb-4 pr-10">
          <div className="flex items-center justify-between gap-3">
            <DialogTitle className="flex items-center gap-2 text-base font-semibold">
              <ShoppingBasket className="h-4 w-4 text-primary" />
              My Orders
            </DialogTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-none text-xs"
              disabled={loading}
              onClick={() => void loadOrders()}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Track and manage your recent orders
          </p>
        </DialogHeader>

        <div className="space-y-3">
          {loading ? (
            <LoadingState />
          ) : !items.length ? (
            <EmptyState />
          ) : (
            <div className="overflow-x-auto rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 text-xs uppercase tracking-wide">
                    <TableHead className="font-semibold text-foreground">Order</TableHead>
                    <TableHead className="font-semibold text-foreground">Items</TableHead>
                    <TableHead className="font-semibold text-foreground">Amount</TableHead>
                    <TableHead className="font-semibold text-foreground">Payment</TableHead>
                    <TableHead className="font-semibold text-foreground">Status</TableHead>
                    <TableHead className="font-semibold text-foreground">Date</TableHead>
                    <TableHead className="text-right font-semibold text-foreground">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((order) => (
                    <TableRow
                      key={order._id}
                      className="group transition-colors hover:bg-muted/30"
                    >
                      <TableCell className="font-mono text-xs font-medium text-foreground">
                        {formatOrderId(order._id)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {order.totalItems}{" "}
                        {order.totalItems === 1 ? "item" : "items"}
                      </TableCell>
                      <TableCell className="text-sm font-medium text-foreground">
                        {formatPrice(order.totalAmount)}
                      </TableCell>
                      <TableCell>
                        <CustomerPaymentStatusBadge status={order.paymentStatus} />
                      </TableCell>
                      <TableCell>
                        <CustomerOrderStatusBadge status={order.orderStatus} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(order.paidAt || order.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        {canReturnOrder(order) ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-none border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => returnOrder(order._id)}
                          >
                            Request Return
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {order.orderStatus === "returned" ? "Returned" : "—"}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {!loading && items.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Returns are accepted within 7 days of delivery.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CustomerOrdersDialog;