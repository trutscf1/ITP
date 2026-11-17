/**
 * The form of an e-mail address (concept §8): a local part of the signs of an RFC 5322 dot-atom
 * (letters, digits, and !#$%&'*+/=?^_`{|}~.-), one `@`, and a domain of letters, digits, and
 * hyphens with at least one dot between its labels. Commas, semicolons, angle brackets, quotes,
 * and white space never pass, so an address cannot read as a list of recipients. The one
 * definition for the registration schema and for the configuration of `identity`.
 */
export const emailPattern =
  /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~.-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$/;

export const maxEmailLength = 254;
