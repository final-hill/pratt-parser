import { Trait } from "@mlhaufe/brevity/dist/index.mjs"

/**
 * Determines if the regular language is the Plus language.
 */
export const isPlus = new Trait({
    Alt() { return false; },
    Any() { return false; },
    Cat() { return false; },
    Char() { return false; },
    Empty() { return false; },
    Nil() { return false; },
    Not() { return false; },
    Opt() { return false; },
    Plus() { return true; },
    Range() { return false; },
    Rep() { return false; },
    Star() { return false; },
    Token() { return false; }
})