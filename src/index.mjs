import { Parser } from './Parser.mjs'
export { Parser }
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

const { Alt, Any, Char, Empty, Nil, Not, Range, Rep, Seq, Star, Token } = Parser

// convert string to Token or Char if needed
const normalize = (strOrLang) =>
    typeof strOrLang === 'string' ?
        strOrLang.length === 1 ? Char(strOrLang) : Token(strOrLang)
        : strOrLang

/**
* P1|P2|P3...Pn - Represents the alternation of parsers.
* @param {string|Parser} langs
* @returns {Parser}
*/
export const alt = (...langs) =>
    langs.reduce((acc, lang) => Alt(normalize(acc), normalize(lang))),
    /**
     * . - Represents any character.
     * @type {Parser}
     * @constant
     */
    any = Any,
    char = (c) => Char(c),
    /**
     * Represents the empty parser. matches the empty string.
     * @type {Parser}
     * @constant
     */
    empty = Empty,
    /**
     * Represents the nil parser. matches nothing.
     *
     * @type {Parser}
     * @constant
     */
    nil = Nil,
    /**
     * ¬P - Represents the negation of a parser.
     * @param {string|Parser} lang
     * @returns {Parser}
     */
    not = (lang) => Not(normalize(lang)),
    /**
     * P? - Represents the optional repetition of a parser.
     * @param {string|Parser} lang
     * @returns {Parser}
     */
    opt = (lang) => alt(normalize(lang), empty),
    /**
     * P+ - Represents the one or more repetition of a parser.
     * @param {string|Parser} lang
     * @returns {Parser}
     */
    plus = (lang) => Seq(normalize(lang), star(normalize(lang))),
    /**
     * [a-z] - Represents the range of characters from a to z.
     * @param {string} from
     * @param {string} to
     * @returns {Parser}
     */
    range = (from, to) => Range(from, to),
    /**
     * P{n} - Represents the n repetitions of a parser.
     * @param {string|Parser} lang
     * @param {number} n
     * @returns {Parser}
     * @throws {Error} If n is not a positive integer.
     */
    rep = (lang, n) => Rep(normalize(lang), n),
    /**
     * P1P2P3...Pn - Represents the concatenation of a sequence of parsers.
     * @param {string|Parser} langs
     * @returns {Parser}
     */
    seq = (...langs) => langs.reduce((acc, lang) => Seq(normalize(acc), normalize(lang))),
    /**
     * P* - Represents the zero or more repetitions of a parser.
     * @param {string|Parser} lang
     * @returns {Parser}
     */
    star = (lang) => Star(normalize(lang)),
    /**
     * "token" - Represents a token.
     * @param {string} value
     * @returns {Parser}
     */
    token = (value) => normalize(value)