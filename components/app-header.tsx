import Link from "next/link";
import { SignOutButton } from "@/components/sign-out-button";
import { t } from "@/lib/i18n";
import type { CurrentUser } from "@/lib/session";

export function AppHeader({ user }: { user: CurrentUser }) {
  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="rounded-sm text-base font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {t.app.name}
          </Link>
          {user.role === "admin" ? (
            <nav aria-label={t.app.navLabel}>
              <Link
                href="/admin"
                className="rounded-sm text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                {t.admin.title}
              </Link>
            </nav>
          ) : null}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{user.email}</span>
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
