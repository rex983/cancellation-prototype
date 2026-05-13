import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  ORDER_STATUS_LABEL,
  ORDER_STATUS_VARIANT,
  formatCurrency,
  formatDate,
} from "@/lib/format";
import type { Order } from "@/lib/types";

type Props = {
  orders: Order[];
  ctaLabel: string;
  ctaHref: (id: string) => string;
  empty: string;
};

export function OrderTable({ orders, ctaLabel, ctaHref, empty }: Props) {
  if (orders.length === 0) {
    return (
      <div className="rounded-md border bg-card p-8 text-center text-sm text-muted-foreground">
        {empty}
      </div>
    );
  }
  return (
    <div className="rounded-md border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order #</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Building</TableHead>
            <TableHead>Mfr</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((o) => (
            <TableRow key={o.id}>
              <TableCell className="font-medium">{o.orderNumber}</TableCell>
              <TableCell>
                <div>{o.customerName}</div>
                <div className="text-xs text-muted-foreground">
                  {o.city}, {o.state}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  {o.width}&times;{o.length}&times;{o.height}
                </div>
                <div className="text-xs text-muted-foreground">{o.model}</div>
              </TableCell>
              <TableCell>{o.manufacturer}</TableCell>
              <TableCell>{formatCurrency(o.totalPrice)}</TableCell>
              <TableCell>
                <Badge variant={ORDER_STATUS_VARIANT[o.status]}>
                  {ORDER_STATUS_LABEL[o.status]}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDate(o.createdAt)}
              </TableCell>
              <TableCell className="text-right">
                <Button asChild size="sm" variant="outline">
                  <Link href={ctaHref(o.id)}>{ctaLabel}</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
