"use client";
import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface TopBannerProps {
  breadcrumbs?: Array<{
    label: string;
    href?: string;
    isCurrentPage?: boolean;
  }>;
}

export function TopBanner({ breadcrumbs }: TopBannerProps) {
  const playClickSound = React.useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        const audio = new Audio("/sounds/light.mp3");
        audio.volume = 0.4;
        audio.play().catch(() => {});
      } catch {}
    }
  }, []);

  // Default breadcrumbs if none provided
  const defaultBreadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Overview", isCurrentPage: true },
  ];

  const items = breadcrumbs || defaultBreadcrumbs;

  // Find the current page for mobile display
  const currentPage =
    items.find((item) => item.isCurrentPage) || items[items.length - 1];

  return (
    <Breadcrumb>
      <BreadcrumbList className="flex items-center gap-0.5 mt-4 select-none">
        {/* Desktop: Show full breadcrumb trail */}
        <div className="hidden md:flex items-center gap-0.5">
          {items.map((item, index) => (
            <div key={index} className="flex items-center">
              {index > 0 && (
                <BreadcrumbSeparator className="mx-2 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:relative [&>svg]:top-[1px] [&>svg]:-left-[4px]" />
              )}
              <BreadcrumbItem>
                {item.isCurrentPage ? (
                  <BreadcrumbPage className="text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent dark:hover:bg-sidebar-accent px-2 py-1.5 rounded-sm transition-colors duration-200">
                    {item.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    href={item.href || "#"}
                    onClick={playClickSound}
                    className="text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent dark:hover:bg-sidebar-accent px-2 py-1.5 rounded-sm transition-colors duration-200"
                  >
                    {item.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </div>
          ))}
        </div>

        {/* Mobile: Show only current page */}
        <div className="md:hidden">
          <BreadcrumbItem>
            <BreadcrumbPage className="text-sidebar-foreground px-2 py-1.5 rounded-sm">
              {currentPage.label}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </div>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
