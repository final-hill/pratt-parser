import { Trait, all } from "@mlhaufe/brevity/dist/index.mjs"

/**
 * Determines if the regular language is the Char language.
 * @param {RegularLanguage} lang
 * @returns {boolean}
 */
export const isChar = new Trait({
    [all]() { return false; },
    Char() { return true; }
})