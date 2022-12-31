import { Trait, all } from "@mlhaufe/brevity/dist/index.mjs"

/**
 * Determines if the regular language is the Range language.
 * @param {RegularLanguage} lang
 * @returns {boolean}
 */
export const isRange = Trait({
    [all]() { return false; },
    Range() { return true; }
})