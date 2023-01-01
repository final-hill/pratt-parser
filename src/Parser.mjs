import { Data } from "@mlhaufe/brevity/dist/index.mjs";

/**
 * Represents Parser constructs.
 */
export const Parser = new Data({
    // P1 ∪ P2 - Represents the union of two parsers.
    Alt: ['left', 'right'],
    // '.' - Represents any single character. A wildcard.
    Any: [],
    // c - Represents a single character.
    Char: ['value'],
    // ε - Represents the empty string.
    Empty: [],
    // ∅ - Represents the empty parser.
    Nil: [],
    // ¬P - Represents the complement of a parser.
    Not: ['lang'],
    // [a-b] - Represents a range of characters.
    Range: ['from', 'to'],
    // P{n} - Represents the repetition of a parser n times.
    Rep: ['lang', 'n'],
    // P1◦P2 - Represents the concatenation of two parsers.
    Seq: ['first', 'second'],
    // P* - Represents the Kleene star of a parser.
    Star: ['lang'],
    // "Foo" - Represents a token.
    Token: ['value']
})