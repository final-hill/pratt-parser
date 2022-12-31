import { Trait, all } from "@mlhaufe/brevity/dist/index.mjs";

/**
 * Determines if the regular language is the Any language.
 * @param {RegularLanguage} lang
 * @returns {boolean}
 */
export const isAny = new Trait({
    [all]() { return false; },
    Any() { return true; }
})
