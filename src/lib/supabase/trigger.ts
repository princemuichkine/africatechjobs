import { createClient } from "@supabase/supabase-js";

// This client is safe to use in server-side environments like Trigger.dev tasks,
// where there is no request context.
export const createTriggerClient = () => {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    throw new Error(
      "Supabase environment variables are not set. Please check your .env file.",
    );
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        // It's important to set persistSession to false so that Supabase
        // doesn't try to store session information in a non-existent storage.
        persistSession: false,
      },
    },
  );
};
