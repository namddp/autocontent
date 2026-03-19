import type { ReactNode } from "react";

interface PageContainerProps {
  title: string;
  description?: string;
  children?: ReactNode;
}

export function PageContainer({ title, description, children }: PageContainerProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}
