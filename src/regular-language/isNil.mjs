import { Trait } from "@mlhaufe/brevity/dist/index.mjs"

/**
 * Determine if the current expression is an instance of Nil
 */
export const isNil = new Trait({
    Alt() { return false; },
    Any() { return false; },
    Cat() { return false; },
    Char() { return false; },
    Empty() { return false; },
    Nil() { return true; },
    Not() { return false; },
    Opt() { return false; },
    Plus() { return false; },
    Range() { return false; },
    Rep() { return false; },
    Star() { return false; },
    Token() { return false; }
})