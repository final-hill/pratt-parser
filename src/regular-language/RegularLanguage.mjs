import { Data } from "@mlhaufe/brevity/dist/index.mjs";

/**
 * Represents Regular Language constructs.
 */
export const RegularLanguage = new Data({
    // L1 ∪ L2 - Represents the union of two regular languages.
    Alt: ['left', 'right'],
    // '.' - Represents any single character. A wildcard.
    Any: [],
    // L1◦L2 - Represents the concatenation of two regular languages.
    Cat: ['first', 'second'],
    // c - Represents a single character.
    Char: ['value'],
    // ε - Represents the empty string.
    Empty: [],
    // ∅ - Represents the empty language.
    Nil: [],
    // ¬L - Represents the complement of a regular language.
    Not: ['lang'],
    // L? - Represents the optional repetition of a regular language.
    Opt: ['lang'],
    // L+ - Represents the Kleene plus of a regular language.
    Plus: ['lang'],
    // [a-b] - Represents a range of characters.
    Range: ['from', 'to'],
    // L{n} - Represents the repetition of a regular language n times.
    Rep: ['lang', 'n'],
    // L* - Represents the Kleene star of a regular language.
    Star: ['lang'],
    // "Foo" - Represents a token.
    Token: ['value']
})