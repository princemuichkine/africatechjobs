"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Company {
    id: string;
    name: string;
    location?: string;
    logo?: string;
}

interface CompanySelectProps {
    value?: string;
    onChange: (value: string) => void;
}

export function CompanySelect({ value, onChange }: CompanySelectProps) {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const supabase = createClient();
                const { data, error } = await supabase
                    .from("companies")
                    .select("id, name, location, logo")
                    .order("name");

                if (error) {
                    console.error("Error fetching companies:", error);
                    return;
                }

                setCompanies(data || []);
            } catch (error) {
                console.error("Error fetching companies:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCompanies();
    }, []);

    if (loading) {
        return (
            <div className="space-y-2">
                <Label>Company</Label>
                <div className="h-10 w-full rounded-md border bg-muted animate-pulse" />
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <Label>Company</Label>
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger>
                    <SelectValue placeholder="Select a company..." />
                </SelectTrigger>
                <SelectContent>
                    {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                            <div className="flex items-center gap-2">
                                <div>
                                    <div className="font-medium">{company.name}</div>
                                    {company.location && (
                                        <div className="text-xs text-muted-foreground">
                                            {company.location}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
