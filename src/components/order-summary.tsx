import { StatusBadge } from "@/components/status-badge";
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
  ORDER_STATUS_TONE,
  PAYMENT_LABEL,
  PAYMENT_TONE,
  MFG_LABEL,
  MFG_TONE,
  formatCurrency,
  formatDate,
} from "@/lib/format";
import type { Order } from "@/lib/types";

export function OrderSummary({ order }: { order: Order }) {
  return (
    <Card className="bg-card/40">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-2xl">Order #{order.orderNumber}</CardTitle>
            <CardDescription>
              {order.customerName} &middot; {order.customerEmail}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge tone={PAYMENT_TONE[order.payment]}>
              {PAYMENT_LABEL[order.payment]}
            </StatusBadge>
            <StatusBadge tone={ORDER_STATUS_TONE[order.status]}>
              {ORDER_STATUS_LABEL[order.status]}
            </StatusBadge>
            {order.mfgStatus && (
              <StatusBadge tone={MFG_TONE[order.mfgStatus]}>
                {MFG_LABEL[order.mfgStatus]}
              </StatusBadge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <Field label="Date" value={formatDate(order.date)} />
          <Field label="Sales Rep" value={order.salesRep} />
          <Field label="Manufacturer" value={order.manufacturer} />
          <Field label="CO / RO" value={`${order.co ?? "—"} / ${order.ro ?? "—"}`} />
        </div>
        <Separator />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <Field label="Total" value={formatCurrency(order.total)} />
          <Field label="Deposit Paid" value={formatCurrency(order.depositPaid)} />
          <Field
            label="Balance Due"
            value={formatCurrency(order.total - order.depositPaid)}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
        {label}
      </div>
      <div className="font-medium">{value}</div>
    </div>
  );
}
