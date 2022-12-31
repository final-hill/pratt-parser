import { Trait } from "@mlhaufe/brevity/dist/index.mjs"

/**
 * Determines if the regular language is the Range language.
 */
export const isRange = Trait({
    Alt() { return false; },
    Any() { return false; },
    Cat() { return false; },
    Char() { return false; },
    Empty() { return false; },
    Nil() { return false; },
    Not() { return false; },
    Range() { return true; },
    Rep() { return false; },
    Star() { return false; },
    Token() { return false; }
})