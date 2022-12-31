import { Trait } from "@mlhaufe/brevity/dist/Trait.mjs"

/**
 * Determines if the regular language is the Rep language.
 */
export const isRep = new Trait({
    Alt() { return false; },
    Any() { return false; },
    Cat() { return false; },
    Char() { return false; },
    Empty() { return false; },
    Nil() { return false; },
    Not() { return false; },
    Range() { return false; },
    Rep() { return true; },
    Star() { return false; },
    Token() { return false; }
})