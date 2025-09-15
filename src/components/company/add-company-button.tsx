"use client";

import { useQueryStates } from "nuqs";
import { parseAsBoolean } from "nuqs";
import { Button } from "../ui/button";

export function AddCompanyButton({ redirect }: { redirect?: boolean }) {
  const [, setAddCompany] = useQueryStates({
    addCompany: parseAsBoolean.withDefault(false),
    redirect: parseAsBoolean.withDefault(redirect ?? false),
  });

  return (
    <Button
      type="button"
      variant="outline"
      className="border-border rounded-sm"
      onClick={() => setAddCompany({ addCompany: true, redirect })}
    >
      Add company
    </Button>
  );
}
