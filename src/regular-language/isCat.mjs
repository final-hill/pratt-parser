import { Trait } from "@mlhaufe/brevity/dist/index.mjs";

/**
 * Determines if the regular language is the Cat language.
 * @param {RegularLanguage} lang
 * @returns {boolean}
 */
export const isCat = Trait({
    Alt() { return false; },
    Any() { return false; },
    Cat() { return true; },
    Char() { return false; },
    Empty() { return false; },
    Nil() { return false; },
    Not() { return false; },
    Range() { return false; },
    Rep() { return false; },
    Star() { return false; },
    Token() { return false; }
})