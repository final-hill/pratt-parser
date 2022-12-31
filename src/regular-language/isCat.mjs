import { Trait, all } from "@mlhaufe/brevity/dist/index.mjs";

/**
 * Determines if the regular language is the Cat language.
 * @param {RegularLanguage} lang
 * @returns {boolean}
 */
export const isCat = Trait({
    [all]() { return false; },
    Cat() { return true; }
})