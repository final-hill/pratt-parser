import { Trait } from "@mlhaufe/brevity/dist/index.mjs"

/**
 * Determines if the regular language is the Empty language.
 */
export const isEmpty = new Trait({
    Alt() { return false; },
    Any() { return false; },
    Cat() { return false; },
    Char() { return false; },
    Empty() { return true; },
    Nil() { return false; },
    Not() { return false; },
    Opt() { return false; },
    Plus() { return false; },
    Range() { return false; },
    Rep() { return false; },
    Star() { return false; },
    Token() { return false; }
})