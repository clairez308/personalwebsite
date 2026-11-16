// Shared by the form (client) and the API route (server), so the rules match.

export const stamps = ["tomato", "snowboard", "paint", "ubc"] as const;
export type Stamp = (typeof stamps)[number];

export interface ContactInput {
  name: string;
  email: string;
  message: string;
  stamp: string;
  website?: string; // honeypot: humans leave this empty
}

export type ContactErrors = Partial<Record<"name" | "email" | "message" | "stamp", string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Errors are written in the site's voice.
export function validateContact(input: ContactInput): ContactErrors {
  const errors: ContactErrors = {};
  const name = (input.name ?? "").trim();
  const email = (input.email ?? "").trim();
  const message = (input.message ?? "").trim();

  if (!name) errors.name = "you forgot to sign it!";
  else if (name.length > 80) errors.name = "that's a long name, try the short version";

  if (!email) errors.email = "where should I write back? add your email";
  else if (email.length > 200 || !EMAIL.test(email)) errors.email = "that email looks a bit off";

  if (message.length < 10) errors.message = "say a little more than that!";
  else if (message.length > 2000) errors.message = "that's a long one, try trimming it a bit";

  if (!(stamps as readonly string[]).includes(input.stamp)) errors.stamp = "pick a stamp";

  return errors;
}
