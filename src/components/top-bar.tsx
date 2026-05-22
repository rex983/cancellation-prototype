import { ThemeToggle } from "@/components/theme-toggle";
import { RoleSwitcher } from "@/components/role-switcher";
import { ROLE_LABEL, type Role } from "@/lib/roles";

export function TopBar({ role }: { role: Role }) {
  return (
    <header className="h-14 border-b bg-background/80 backdrop-blur sticky top-0 z-30 flex items-center justify-end gap-4 px-6">
      <div className="flex items-center gap-2">
        <RoleSwitcher current={role} />
        <ThemeToggle />
        <div className="hidden sm:flex items-center gap-2 pl-3 ml-1 border-l">
          <div className="h-8 w-8 rounded-full bg-muted grid place-items-center text-xs font-semibold">
            R
          </div>
          <div className="text-xs leading-tight">
            <div className="font-medium">Rex Wu</div>
            <div className="text-muted-foreground">{ROLE_LABEL[role]}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
