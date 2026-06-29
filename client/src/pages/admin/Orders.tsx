import { Commonloader } from "@/components/common/Loader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminOrdersStore } from "@/features/admin/orders/store";
import type {
  AdminOrder,
  AdminOrderStatus,
  AdminPaymentStatus,
} from "@/features/admin/orders/types";
import { formatPrice } from "@/lib/utils";
import { PackageSearch, ShoppingCart } from "lucide-react";
import { useEffect } from "react";

const pageWrapClass = "min-h-screen bg-background";
const contentWrapClass = "mx-auto max-w-7xl px-4 py-8";
const cardClass = "border-border bg-card";
const selectTriggerClass = "h-8 w-[160px] rounded-none text-xs capitalize";

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

const orderStatusOptions: AdminOrderStatus[] = ["placed", "shipped", "delivered"];

const statusOrder: Record<AdminOrderStatus, number> = {
  placed: 0,
  shipped: 1,
  delivered: 2,
  returned: 3,
};

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatOrderId(id: string) {
  return id.length > 12 ? `#${id.slice(-8).toUpperCase()}` : `#${id.toUpperCase()}`;
}

function AdminPaymentStatusBadge(props: { status: AdminPaymentStatus }) {
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

function AdminOrderStatusBadge(props: { status: AdminOrderStatus }) {
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

function canUpdateStatus(order: AdminOrder) {
  if (order.paymentStatus !== "paid") return false;
  if (order.orderStatus === "delivered") return false;
  if (order.orderStatus === "returned") return false;
  return true;
}

function isStatusDisabled(option: AdminOrderStatus, current: AdminOrderStatus) {
  return statusOrder[option] <= statusOrder[current];
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <PackageSearch className="h-10 w-10 text-muted-foreground/50" />
      <p className="text-sm font-medium text-foreground">No orders yet</p>
      <p className="text-xs text-muted-foreground">
        Orders from customers will appear here.
      </p>
    </div>
  );
}

function AdminOrders() {
  const { loading, orders, updatingOrderId, fetchOrders, changeStatus } =
    useAdminOrdersStore((state) => state);

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  if (loading) return <Commonloader />;

  return (
    <div className={pageWrapClass}>
      <div className={contentWrapClass}>
        <Card className={cardClass}>
          <CardHeader className="border-b border-border pb-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              <CardTitle className="text-xl font-semibold">Orders</CardTitle>
            </div>
            <p className="text-xs text-muted-foreground">
              Manage and update customer order statuses
            </p>
          </CardHeader>

          <CardContent className="pt-4">
            {!orders.length ? (
              <EmptyState />
            ) : (
              <div className="overflow-x-auto rounded-md border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 text-xs uppercase tracking-wide">
                      <TableHead className="font-semibold text-foreground">Order</TableHead>
                      <TableHead className="font-semibold text-foreground">Customer</TableHead>
                      <TableHead className="font-semibold text-foreground">Items</TableHead>
                      <TableHead className="font-semibold text-foreground">Amount</TableHead>
                      <TableHead className="font-semibold text-foreground">Payment</TableHead>
                      <TableHead className="font-semibold text-foreground">Status</TableHead>
                      <TableHead className="font-semibold text-foreground">Date</TableHead>
                      <TableHead className="text-right font-semibold text-foreground">
                        Update Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {orders.map((order) => {
                      const canUpdate = canUpdateStatus(order);
                      return (
                        <TableRow
                          key={order._id}
                          className="transition-colors hover:bg-muted/30"
                        >
                          <TableCell className="font-mono text-xs font-medium text-foreground">
                            {formatOrderId(order._id)}
                          </TableCell>
                          <TableCell className="text-sm text-foreground">
                            {order.customerName}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {order.totalItems}{" "}
                            {order.totalItems === 1 ? "item" : "items"}
                          </TableCell>
                          <TableCell className="text-sm font-medium text-foreground">
                            {formatPrice(order.totalAmount)}
                          </TableCell>
                          <TableCell>
                            <AdminPaymentStatusBadge status={order.paymentStatus} />
                          </TableCell>
                          <TableCell>
                            <AdminOrderStatusBadge status={order.orderStatus} />
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(order.paidAt || order.createdAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            {canUpdate ? (
                              <Select
                                value=""
                                onValueChange={(value) =>
                                  void changeStatus(order._id, value as AdminOrderStatus)
                                }
                                disabled={updatingOrderId === order._id}
                              >
                                <SelectTrigger className={selectTriggerClass}>
                                  <SelectValue placeholder={order.orderStatus} />
                                </SelectTrigger>
                                <SelectContent>
                                  {orderStatusOptions.map((status) => (
                                    <SelectItem
                                      key={status}
                                      value={status}
                                      className="capitalize"
                                      disabled={isStatusDisabled(status, order.orderStatus)}
                                    >
                                      {status}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                {order.paymentStatus !== "paid"
                                  ? "Awaiting payment"
                                  : order.orderStatus === "returned"
                                    ? "Returned"
                                    : "Completed"}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AdminOrders;