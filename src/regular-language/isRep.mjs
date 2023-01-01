import { Trait, all } from "@mlhaufe/brevity/dist/index.mjs"

/**
 * Determines if the regular language is the Rep language.
 * @param {RegularLanguage} lang
 * @returns {boolean}
 */
export const isRep = new Trait({
    [all]() { return false; },
    Rep() { return true; }
})