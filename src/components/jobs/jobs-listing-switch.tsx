"use client";

import { toggleJobListingAction } from "@/lib/actions/toggle-job-listing";
import { Switch } from "@/components/ui/switch";
import { useTransition } from "react";
import { toast } from "sonner";

export function JobListingSwitch({
    id,
    active,
}: {
    id: number;
    active: boolean;
}) {
    const [isPending, startTransition] = useTransition();

    const handleToggle = () => {
        startTransition(async () => {
            try {
                await toggleJobListingAction({ id, active: !active });
                toast.success(
                    `Job listing ${!active ? "activated" : "deactivated"} successfully`
                );
            } catch (error) {
                toast.error("Failed to update job listing status");
                console.error("Error toggling job listing:", error);
            }
        });
    };

    return (
        <div className="flex items-center gap-2">
            <label htmlFor={`job-switch-${id}`} className="text-sm text-muted-foreground">
                {active ? "Active" : "Inactive"}
            </label>
            <Switch
                id={`job-switch-${id}`}
                checked={active}
                onCheckedChange={handleToggle}
                disabled={isPending}
                aria-label={`Toggle job listing ${active ? "inactive" : "active"}`}
            />
        </div>
    );
}
