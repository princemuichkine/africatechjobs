"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProfilePostsProps {
    data?: unknown;
    isOwner?: boolean;
}

export function ProfilePosts({ data, isOwner }: ProfilePostsProps) {
    // Suppress unused variable warnings - these props might be used in future implementations
    void data;
    void isOwner;
    return (
        <Card>
            <CardHeader>
                <CardTitle>Posts</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">No posts yet.</p>
            </CardContent>
        </Card>
    );
}
