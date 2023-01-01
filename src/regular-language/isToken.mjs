import { Trait, all } from "@mlhaufe/brevity/dist/index.mjs"

/**
 * Determines if the regular language is the Token language.
 * @param {RegularLanguage} lang
 * @returns {boolean}
 */
export const isToken = new Trait({
    [all]() { return false; },
    Token() { return true; }
})