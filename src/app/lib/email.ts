const ENCODED = "cmF3bnJpanVAZ21haWwuY29t";

export function getEmail(): string {
  return atob(ENCODED);
}

export function getMailtoHref(): string {
  return `mailto:${getEmail()}`;
}
