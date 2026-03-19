import { useLocation } from "react-router-dom";
import { routes } from "@/lib/route-definitions";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function Header() {
  const location = useLocation();
  const [dark, setDark] = useState(true);

  // Find current route label for breadcrumb
  const currentRoute = routes.find((r) => r.path === location.pathname);
  const pageTitle = currentRoute?.label ?? "AutoContent Pro";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <header className="flex h-12 items-center justify-between border-b border-border px-6">
      <span className="text-sm font-medium text-muted-foreground">
        {pageTitle}
      </span>
      <button
        onClick={() => setDark(!dark)}
        className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        aria-label="Toggle theme"
      >
        {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
    </header>
  );
}
