import { useState } from "react";
import { NavLink } from "react-router-dom";
import { routes } from "@/lib/route-definitions";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Video } from "lucide-react";

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-border bg-card transition-all duration-200",
        collapsed ? "w-16" : "w-60",
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <Video className="h-6 w-6 shrink-0 text-blue-500" />
        {!collapsed && <span className="text-lg font-bold">AutoContent</span>}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {routes.map((route) => (
          <NavLink
            key={route.path}
            to={route.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-accent font-medium text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )
            }
          >
            <route.icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{route.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle + version */}
      <div className="border-t border-border p-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span className="ml-2 text-xs">Collapse</span>
            </>
          )}
        </button>
        {!collapsed && (
          <p className="mt-1 text-center text-xs text-muted-foreground">
            v0.1.0
          </p>
        )}
      </div>
    </aside>
  );
}
