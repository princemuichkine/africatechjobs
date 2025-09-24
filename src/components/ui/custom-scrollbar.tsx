"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/actions/utils";

interface CustomScrollbarProps {
  children: React.ReactNode;
  className?: string;
}

export function CustomScrollbar({ children, className }: CustomScrollbarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollbarRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragOffsetRef = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    const scrollbar = scrollbarRef.current;
    const thumb = thumbRef.current;

    if (!container || !scrollbar || !thumb) return;

    const updateThumb = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const scrollbarHeight = scrollbar.clientHeight;

      if (scrollHeight <= clientHeight) {
        thumb.style.display = "none";
        return;
      }

      thumb.style.display = "block";

      const thumbHeight = Math.max(
        4,
        (clientHeight / scrollHeight) * scrollbarHeight,
      );
      const thumbTop =
        (scrollTop / (scrollHeight - clientHeight)) *
        (scrollbarHeight - thumbHeight);

      thumb.style.height = `${Math.max(4, thumbHeight)}px`;
      thumb.style.transform = `translateY(${thumbTop}px)`;
    };

    const handleScroll = () => {
      updateThumb();
    };

    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      isDraggingRef.current = true;

      // Calculate offset from thumb top where user clicked
      const rect = thumb.getBoundingClientRect();
      dragOffsetRef.current = e.clientY - rect.top;

      document.body.style.cursor = "grabbing";
      document.body.style.userSelect = "none";
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;

      const rect = scrollbar.getBoundingClientRect();
      const mouseY = e.clientY - rect.top;
      const scrollbarHeight = scrollbar.clientHeight;
      const thumbHeight = thumb.offsetHeight;
      const maxTop = scrollbarHeight - thumbHeight;

      // Calculate new thumb position based on mouse position minus drag offset
      const newTop = Math.max(
        0,
        Math.min(maxTop, mouseY - dragOffsetRef.current),
      );

      thumb.style.transform = `translateY(${newTop}px)`;

      // Update container scroll
      const { scrollHeight, clientHeight } = container;
      const maxScrollTop = scrollHeight - clientHeight;
      const scrollTop = (newTop / maxTop) * maxScrollTop;
      container.scrollTop = scrollTop;
    };

    const handleMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    };

    const handleWheel = () => {
      // Let natural scrolling happen, then update thumb
      setTimeout(updateThumb, 0);
    };

    const handleScrollbarClick = (e: MouseEvent) => {
      // Don't handle clicks on the thumb (dragging is handled separately)
      if (e.target === thumb) return;

      const rect = scrollbar.getBoundingClientRect();
      const clickY = e.clientY - rect.top;
      const scrollbarHeight = scrollbar.clientHeight;

      // Calculate the new scroll position
      const scrollRatio = clickY / scrollbarHeight;
      const { scrollHeight, clientHeight } = container;
      const maxScrollTop = scrollHeight - clientHeight;
      const newScrollTop = Math.max(
        0,
        Math.min(maxScrollTop, scrollRatio * maxScrollTop),
      );

      container.scrollTop = newScrollTop;
    };

    // Initial update
    updateThumb();

    // Event listeners
    container.addEventListener("scroll", handleScroll);
    thumb.addEventListener("mousedown", handleMouseDown);
    scrollbar.addEventListener("mousedown", handleScrollbarClick);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    container.addEventListener("wheel", handleWheel);

    // Resize observer for content changes
    const resizeObserver = new ResizeObserver(updateThumb);
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      thumb.removeEventListener("mousedown", handleMouseDown);
      scrollbar.removeEventListener("mousedown", handleScrollbarClick);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      container.removeEventListener("wheel", handleWheel);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className={cn("relative", className)}>
      <div ref={containerRef} className="overflow-y-auto scrollbar-hide h-full">
        {children}
      </div>

      <div
        ref={scrollbarRef}
        className="absolute right-0 top-0 bottom-0 w-1 bg-transparent cursor-pointer"
      >
        <div
          ref={thumbRef}
          className="absolute right-0 w-full bg-black/20 dark:bg-border rounded-sm cursor-grab active:cursor-grabbing transition-colors hover:bg-black/40 dark:hover:bg-muted-foreground/50"
          style={{
            display: "none",
            minHeight: "4px",
          }}
        />
      </div>
    </div>
  );
}
