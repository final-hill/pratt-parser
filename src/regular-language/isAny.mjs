import { Trait } from "@mlhaufe/brevity/dist/index.mjs";

/**
 * Determines if the regular language is the Any language.
*/
export const isAny = new Trait({
    Alt() { return false; },
    Any() { return true; },
    Cat() { return false; },
    Char() { return false; },
    Empty() { return false; },
    Nil() { return false; },
    Not() { return false; },
    Opt() { return false; },
    Plus() { return false; },
    Range() { return false; },
    Rep() { return false; },
    Star() { return false; },
    Token() { return false; }
})
