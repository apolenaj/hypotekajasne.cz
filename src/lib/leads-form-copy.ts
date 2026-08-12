/**
 * Shared lead-form friction copy — must match required fields.
 * lead_gen / mortgage_calculator currently require name + email + phone.
 */
export const LEAD_FORM_FRICTION_SHORT =
  "Nezávazně · stačí jméno, e-mail a telefon" as const;

export const LEAD_FORM_FRICTION_ABOVE =
  "Stačí jméno, e-mail a telefon — podrobnosti dořešíme společně." as const;

/** Forbidden phrases while email AND phone are both required. */
export const LEAD_FORM_FORBIDDEN_OR_CONTACT_PHRASES = [
  "telefon nebo e-mail",
  "e-mail nebo telefon",
  "jméno a kontakt stačí",
  "stačí jméno a kontakt",
  "jméno a telefon nebo",
] as const;
