import { customAlphabet } from "nanoid";

// A-Z and 0-9, length 6
// Optional exclusion of ambiguous chars (I, 1, O, 0)
// For now, using full alphanumeric uppercase set as per AC requirements "A-Z, 0-9"
// AC says: "6-char uppercase alphanumeric string (A-Z, 0-9)"
const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const generateCode = customAlphabet(ALPHABET, 6);

export function generateGameCode(): string {
  return generateCode();
}
