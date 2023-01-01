import { RegularLanguage } from './RegularLanguage.mjs'
export { RegularLanguage }
export { containsEmpty } from './containsEmpty.mjs'
export { deriv } from './deriv.mjs'
export { equals } from './equals.mjs'
export { height } from './height.mjs'
export { isAlt } from './isAlt.mjs'
export { isAny } from './isAny.mjs'
export { isChar } from './isChar.mjs'
export { isEmpty } from './isEmpty.mjs'
export { isNil } from './isNil.mjs'
export { isNot } from './isNot.mjs'
export { isRange } from './isRange.mjs'
export { isRep } from './isRep.mjs'
export { isSeq } from './isSeq.mjs'
export { isStar } from './isStar.mjs'
export { isToken } from './isToken.mjs'
export { matches } from './matches.mjs'
export { simplify } from './simplify.mjs'
export { toString } from './toString.mjs'

const { Alt, Any, Char, Empty, Nil, Not, Range, Rep, Seq, Star, Token } = RegularLanguage

// convert string to Token or Char if needed
const normalize = (strOrLang) =>
    typeof strOrLang === 'string' ?
        strOrLang.length === 1 ? Char(strOrLang) : Token(strOrLang)
        : strOrLang

/**
* L1|L2|L3...Ln - Represents the alternation of regular languages.
* @param {string|RegularLanguage} langs
* @returns {RegularLanguage}
*/
export const alt = (...langs) =>
    langs.reduce((acc, lang) => Alt(normalize(acc), normalize(lang))),
    /**
     * . - Represents any character.
     * @type {RegularLanguage}
     * @constant
     */
    any = Any,
    char = (c) => Char(c),
    /**
     * Represents the empty language. matches the empty string.
     * @type {RegularLanguage}
     * @constant
     */
    empty = Empty,
    /**
     * Represents the nil language. matches nothing.
     *
     * @type {RegularLanguage}
     * @constant
     */
    nil = Nil,
    /**
     * ¬L - Represents the negation of a regular language.
     * @param {string|RegularLanguage} lang
     * @returns {RegularLanguage}
     */
    not = (lang) => Not(normalize(lang)),
    /**
     * L? - Represents the optional repetition of a regular language.
     * @param {string|RegularLanguage} lang
     * @returns {RegularLanguage}
     */
    opt = (lang) => alt(normalize(lang), empty),
    /**
     * L+ - Represents the one or more repetition of a regular language.
     * @param {string|RegularLanguage} lang
     * @returns {RegularLanguage}
     */
    plus = (lang) => Seq(normalize(lang), star(normalize(lang))),
    /**
     * [a-z] - Represents the range of characters from a to z.
     * @param {string} from
     * @param {string} to
     * @returns {RegularLanguage}
     */
    range = (from, to) => Range(from, to),
    /**
     * L{n} - Represents the n repetition of a regular language.
     * @param {string|RegularLanguage} lang
     * @param {number} n
     * @returns {RegularLanguage}
     * @throws {Error} If n is not a positive integer.
     */
    rep = (lang, n) => Rep(normalize(lang), n),
    /**
     * L1L2L3...Ln - Represents the concatenation of a sequence of regular languages.
     * @param {string|RegularLanguage} langs
     * @returns {RegularLanguage}
     */
    seq = (...langs) => langs.reduce((acc, lang) => Seq(normalize(acc), normalize(lang))),
    /**
     * L* - Represents the zero or more repetition of a regular language.
     * @param {string|RegularLanguage} lang
     * @returns {RegularLanguage}
     */
    star = (lang) => Star(normalize(lang)),
    /**
     * "token" - Represents a token.
     * @param {string} value
     * @returns {RegularLanguage}
     */
    token = (value) => normalize(value)