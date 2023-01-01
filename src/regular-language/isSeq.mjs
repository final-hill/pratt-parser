import { Trait, all } from "@mlhaufe/brevity/dist/index.mjs";

/**
 * Determines if the regular language is the Seq language.
 * @param {RegularLanguage} lang
 * @returns {boolean}
 */
export const isSeq = Trait({
    [all]() { return false; },
    Seq() { return true; }
})