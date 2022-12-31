import { Trait } from "@mlhaufe/brevity/dist/index.mjs";

/**
 * Determine if the expression is an instance of Char | Empty | Nil
 * @param {RegularLanguage} lang
 * @returns {boolean}
 */
export const isAtomic = new Trait({
    Alt() { return false; },
    Any() { return false; },
    Cat() { return false; },
    Char() { return true; },
    Empty() { return true; },
    Nil() { return true; },
    Not() { return false; },
    Range() { return false; },
    Rep() { return false; },
    Star() { return false; },
    Token() { return false; }
})