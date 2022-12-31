import { Trait } from "@mlhaufe/brevity/dist/index.mjs"

/**
 * Determines if the regular language is the Not language.
 * @param {RegularLanguage} lang
 * @returns {boolean}
 */
export const isNot = Trait({
    Alt() { return false; },
    Any() { return false; },
    Cat() { return false; },
    Char() { return false; },
    Empty() { return false; },
    Nil() { return false; },
    Not() { return true; },
    Range() { return false; },
    Rep() { return false; },
    Star() { return false; },
    Token() { return false; }
})