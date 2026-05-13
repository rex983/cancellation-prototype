import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ROLE_LABEL, type Role } from "@/lib/roles";

export function AccessDenied({ role }: { role: Role }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Not available for your role</CardTitle>
        <CardDescription>
          You&apos;re currently viewing as <strong>{ROLE_LABEL[role]}</strong>. Use the
          &ldquo;View as&rdquo; menu in the header to switch.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Roles: <strong>Sales Rep</strong> sees the pre-STM queue,{" "}
        <strong>BST</strong> sees the post-STM queue, <strong>Manager</strong> reviews
        requests, <strong>Admin</strong> sees everything.
      </CardContent>
    </Card>
  );
}
