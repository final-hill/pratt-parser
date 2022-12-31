import { Trait, all } from "@mlhaufe/brevity/dist/index.mjs"

/**
 * Determines if the regular language is the Not language.
 * @param {RegularLanguage} lang
 * @returns {boolean}
 */
export const isNot = Trait({
    [all]() { return false; },
    Not() { return true; }
})