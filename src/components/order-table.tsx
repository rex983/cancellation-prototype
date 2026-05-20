import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import {
  ORDER_STATUS_SHORT,
  ORDER_STATUS_TONE,
  PAYMENT_LABEL,
  PAYMENT_TONE,
  MFG_LABEL,
  MFG_TONE,
  formatCurrency,
  formatShortDate,
} from "@/lib/format";
import type { Order } from "@/lib/types";

type Props = {
  orders: Order[];
  hrefFor: (id: string) => string;
  empty: string;
};

const HEAD =
  "text-[10px] uppercase tracking-wider text-muted-foreground font-semibold";

export function OrderTable({ orders, hrefFor, empty }: Props) {
  if (orders.length === 0) {
    return (
      <div className="rounded-md border bg-card p-8 text-center text-sm text-muted-foreground">
        {empty}
      </div>
    );
  }
  return (
    <div className="rounded-lg border bg-card/40 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-border/60">
            <TableHead className={HEAD}>Order #</TableHead>
            <TableHead className={HEAD}>Date</TableHead>
            <TableHead className={HEAD}>Customer</TableHead>
            <TableHead className={HEAD}>Sales Rep</TableHead>
            <TableHead className={HEAD}>Manufacturer</TableHead>
            <TableHead className={`${HEAD} text-right`}>Total</TableHead>
            <TableHead className={HEAD}>Payment</TableHead>
            <TableHead className={`${HEAD} text-center`}>CO</TableHead>
            <TableHead className={`${HEAD} text-center`}>RO</TableHead>
            <TableHead className={HEAD}>Status</TableHead>
            <TableHead className={HEAD}>Mfg</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((o) => {
            const href = hrefFor(o.id);
            return (
              <TableRow
                key={o.id}
                className="border-border/40 hover:bg-accent/30"
              >
                <TableCell className="font-semibold">
                  <Link href={href} className="block">
                    {o.orderNumber}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground tabular-nums">
                  <Link href={href} className="block">
                    {formatShortDate(o.date)}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link href={href} className="block">
                    <div className="font-medium">{o.customerName}</div>
                    <div className="text-xs text-muted-foreground">
                      {o.customerEmail}
                    </div>
                  </Link>
                </TableCell>
                <TableCell>
                  <Link href={href} className="block">
                    {o.salesRep}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link href={href} className="block">
                    {o.manufacturer}
                  </Link>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  <Link href={href} className="block">
                    {formatCurrency(o.total)}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link href={href} className="block">
                    <StatusBadge tone={PAYMENT_TONE[o.payment]}>
                      {PAYMENT_LABEL[o.payment]}
                    </StatusBadge>
                  </Link>
                </TableCell>
                <TableCell className="text-center text-muted-foreground">
                  <Link href={href} className="block">
                    {o.co ?? "—"}
                  </Link>
                </TableCell>
                <TableCell className="text-center text-muted-foreground">
                  <Link href={href} className="block">
                    {o.ro ?? "—"}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link href={href} className="block">
                    <StatusBadge tone={ORDER_STATUS_TONE[o.status]}>
                      {ORDER_STATUS_SHORT[o.status]}
                    </StatusBadge>
                  </Link>
                </TableCell>
                <TableCell>
                  <Link href={href} className="block">
                    {o.mfgStatus ? (
                      <StatusBadge tone={MFG_TONE[o.mfgStatus]}>
                        {MFG_LABEL[o.mfgStatus]}
                      </StatusBadge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </Link>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
