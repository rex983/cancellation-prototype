"use client";

import { useTransition } from "react";
import { Check, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { setRole } from "@/app/actions";
import {
  ROLES,
  ROLE_LABEL,
  ROLE_DESCRIPTION,
  type Role,
} from "@/lib/roles";

export function RoleSwitcher({ current }: { current: Role }) {
  const [isPending, startTransition] = useTransition();

  function handleSelect(role: Role) {
    if (role === current) return;
    startTransition(async () => {
      await setRole(role);
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isPending} className="gap-2">
          <UserCog className="h-4 w-4" />
          <span className="hidden sm:inline text-muted-foreground">View as:</span>
          <span className="font-medium">{ROLE_LABEL[current]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>View as</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {ROLES.map((role) => (
          <DropdownMenuItem
            key={role}
            onSelect={() => handleSelect(role)}
            className="flex items-start gap-2 py-2"
          >
            <Check
              className={`h-4 w-4 mt-0.5 ${role === current ? "opacity-100" : "opacity-0"}`}
            />
            <div className="flex flex-col">
              <span className="font-medium">{ROLE_LABEL[role]}</span>
              <span className="text-xs text-muted-foreground">
                {ROLE_DESCRIPTION[role]}
              </span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
