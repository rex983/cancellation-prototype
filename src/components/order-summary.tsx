import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ORDER_STATUS_LABEL,
  ORDER_STATUS_VARIANT,
  formatCurrency,
  formatDate,
} from "@/lib/format";
import type { Order } from "@/lib/types";

export function OrderSummary({ order }: { order: Order }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-2xl">{order.orderNumber}</CardTitle>
            <CardDescription>
              {order.customerName} &middot; {order.city}, {order.state}
            </CardDescription>
          </div>
          <Badge variant={ORDER_STATUS_VARIANT[order.status]}>
            {ORDER_STATUS_LABEL[order.status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <Field label="Building" value={`${order.width}×${order.length}×${order.height}`} />
          <Field label="Model" value={order.model} />
          <Field label="Manufacturer" value={order.manufacturer} />
          <Field
            label="Mfr Order #"
            value={order.manufacturerOrderNumber ?? "—"}
          />
          <Field label="Region" value={order.region} />
          <Field label="Sales Rep" value={order.salesRep} />
          <Field label="Email" value={order.customerEmail} />
          <Field label="Phone" value={order.customerPhone} />
        </div>
        <Separator />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <Field label="Total Price" value={formatCurrency(order.totalPrice)} />
          <Field label="Deposit Paid" value={formatCurrency(order.depositPaid)} />
          <Field label="Balance Due" value={formatCurrency(order.balanceDue)} />
          <Field label="Created" value={formatDate(order.createdAt)} />
          {order.stmDate && (
            <Field label="STM Date" value={formatDate(order.stmDate)} />
          )}
          {order.scheduledDelivery && (
            <Field
              label="Scheduled Delivery"
              value={formatDate(order.scheduledDelivery)}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground uppercase tracking-wide">
        {label}
      </div>
      <div className="font-medium">{value}</div>
    </div>
  );
}
