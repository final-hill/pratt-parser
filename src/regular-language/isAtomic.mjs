import { Trait, all } from "@mlhaufe/brevity/dist/index.mjs";

/**
 * Determine if the expression is an instance of Char | Empty | Nil
 * @param {RegularLanguage} lang
 * @returns {boolean}
 */
export const isAtomic = new Trait({
    [all]() { return false; },
    Char() { return true; },
    Empty() { return true; },
    Nil() { return true; }
})