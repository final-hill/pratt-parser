import { Trait, all } from "@mlhaufe/brevity/dist/index.mjs"

/**
 * Determines if the regular language is the Empty language.
 * @param {RegularLanguage} lang
 * @returns {boolean}
 */
export const isEmpty = new Trait({
    [all]() { return false; },
    Empty() { return true; }
})