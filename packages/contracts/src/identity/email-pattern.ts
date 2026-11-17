/**
 * The form of an e-mail address (concept §8): one `@` with at least one character before it and a
 * dot with characters on both sides in the part after it, without white space. The one definition
 * for the registration schema and for the configuration of `identity`.
 */
export const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export const maxEmailLength = 254;
