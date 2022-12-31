import { Trait, all } from "@mlhaufe/brevity/dist/index.mjs"

/**
 * Determine if the current expression is an instance of Nil
 * @param {RegularLanguage} lang
 * @returns {boolean}
 */
export const isNil = new Trait({
    [all]() { return false; },
    Nil() { return true; }
})