import Link from "next/link";
import { canReview, canSeeBst, canSeeSales, type Role } from "@/lib/roles";

export function NavLinks({ role }: { role: Role }) {
  const links: { href: string; label: string }[] = [{ href: "/", label: "Home" }];
  if (canSeeSales(role)) links.push({ href: "/sales", label: "Sales (Pre-STM)" });
  if (canSeeBst(role)) links.push({ href: "/bst", label: "BST (Post-STM)" });
  if (canReview(role)) links.push({ href: "/cancellations", label: "Cancellations" });

  return (
    <>
      {links.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="px-3 py-2 text-sm rounded-md hover:bg-accent transition"
        >
          {item.label}
        </Link>
      ))}
    </>
  );
}
