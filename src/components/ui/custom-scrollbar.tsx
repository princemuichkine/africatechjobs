"use client";

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/actions/utils';

interface CustomScrollbarProps {
    children: React.ReactNode;
    className?: string;
}

export function CustomScrollbar({ children, className }: CustomScrollbarProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollbarRef = useRef<HTMLDivElement>(null);
    const thumbRef = useRef<HTMLDivElement>(null);
    const isDraggingRef = useRef(false);
    const lastYRef = useRef(0);

    useEffect(() => {
        const container = containerRef.current;
        const scrollbar = scrollbarRef.current;
        const thumb = thumbRef.current;

        if (!container || !scrollbar || !thumb) return;

        const updateThumb = () => {
            const { scrollTop, scrollHeight, clientHeight } = container;
            const scrollbarHeight = scrollbar.clientHeight;

            if (scrollHeight <= clientHeight) {
                thumb.style.display = 'none';
                return;
            }

            thumb.style.display = 'block';

            const thumbHeight = Math.max(4, (clientHeight / scrollHeight) * scrollbarHeight);
            const thumbTop = (scrollTop / (scrollHeight - clientHeight)) * (scrollbarHeight - thumbHeight);

            thumb.style.height = `${Math.max(4, thumbHeight)}px`;
            thumb.style.transform = `translateY(${thumbTop}px)`;
        };

        const handleScroll = () => {
            updateThumb();
        };

        const handleMouseDown = (e: MouseEvent) => {
            e.preventDefault();
            isDraggingRef.current = true;
            lastYRef.current = e.clientY;
            document.body.style.cursor = 'grabbing';
            document.body.style.userSelect = 'none';
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (!isDraggingRef.current) return;

            const deltaY = e.clientY - lastYRef.current;
            const scrollbarHeight = scrollbar.clientHeight;
            const thumbHeight = thumb.offsetHeight;
            const maxTop = scrollbarHeight - thumbHeight;

            const currentTop = parseFloat(thumb.style.transform?.replace('translateY(', '').replace('px)', '') || '0');
            const newTop = Math.max(0, Math.min(maxTop, currentTop + deltaY));

            thumb.style.transform = `translateY(${newTop}px)`;

            // Update container scroll
            const scrollRatio = newTop / maxTop;
            const { scrollHeight, clientHeight } = container;
            const scrollTop = scrollRatio * (scrollHeight - clientHeight);
            container.scrollTop = scrollTop;

            lastYRef.current = e.clientY;
        };

        const handleMouseUp = () => {
            if (isDraggingRef.current) {
                isDraggingRef.current = false;
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
            }
        };

        const handleWheel = () => {
            // Let natural scrolling happen, then update thumb
            setTimeout(updateThumb, 0);
        };

        // Initial update
        updateThumb();

        // Event listeners
        container.addEventListener('scroll', handleScroll);
        thumb.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        container.addEventListener('wheel', handleWheel);

        // Resize observer for content changes
        const resizeObserver = new ResizeObserver(updateThumb);
        resizeObserver.observe(container);

        return () => {
            container.removeEventListener('scroll', handleScroll);
            thumb.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            container.removeEventListener('wheel', handleWheel);
            resizeObserver.disconnect();
        };
    }, []);

    return (
        <div className={cn("relative", className)}>
            <div
                ref={containerRef}
                className="overflow-y-auto scrollbar-hide h-full"
            >
                {children}
            </div>

            <div
                ref={scrollbarRef}
                className="absolute right-0 top-0 bottom-0 w-1 bg-transparent pointer-events-none"
            >
                <div
                    ref={thumbRef}
                    className="absolute right-0 w-full bg-black/20 dark:bg-border rounded-sm cursor-grab active:cursor-grabbing transition-colors hover:bg-black/40 dark:hover:bg-muted-foreground/50"
                    style={{
                        display: 'none',
                        minHeight: '4px'
                    }}
                />
            </div>
        </div>
    );
}
