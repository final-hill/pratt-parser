import { Trait, all } from "@mlhaufe/brevity/dist/index.mjs";

/**
 * Determines if the regular language is the Alt language.
 * @param {RegularLanguage} lang
 * @returns {boolean}
 */
export const isAlt = new Trait({
    [all]() { return false; },
    Alt() { return true; }
})