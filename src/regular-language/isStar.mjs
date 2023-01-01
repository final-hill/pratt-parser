import { Trait, all } from "@mlhaufe/brevity/dist/index.mjs"

/**
 * Determines if the regular language is the Star language.
 * @param {RegularLanguage} lang
 * @returns {boolean}
 */
export const isStar = new Trait({
    [all]() { return false; },
    Star() { return true; }
})