import { Trait } from "@mlhaufe/brevity/dist/index.mjs"

/**
 * Determines if the regular language is the Char language.
 * @param {RegularLanguage} lang
 * @returns {boolean}
 */
export const isChar = new Trait({
    Alt() { return false; },
    Any() { return false; },
    Cat() { return false; },
    Char() { return true; },
    Empty() { return false; },
    Nil() { return false; },
    Not() { return false; },
    Range() { return false; },
    Rep() { return false; },
    Star() { return false; },
    Token() { return false; }
})