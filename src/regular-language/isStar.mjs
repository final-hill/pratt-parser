import { Trait } from "@mlhaufe/brevity/dist/Trait.mjs"

/**
 * Determines if the regular language is the Star language.
 */
export const isStar = new Trait({
    Alt() { return false; },
    Any() { return false; },
    Cat() { return false; },
    Char() { return false; },
    Empty() { return false; },
    Nil() { return false; },
    Not() { return false; },
    Opt() { return false; },
    Plus() { return false; },
    Range() { return false; },
    Rep() { return false; },
    Star() { return true; },
    Token() { return false; }
})