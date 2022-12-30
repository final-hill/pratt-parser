import { RegularLanguage } from './RegularLanguage.mjs'
export { RegularLanguage }
export { containsEmpty } from './containsEmpty.mjs'
export { deriv } from './deriv.mjs'
export { equals } from './equals.mjs'
export { height } from './height.mjs'
export { isAlt } from './isAlt.mjs'
export { isAny } from './isAny.mjs'
export { isAtomic } from './isAtomic.mjs'
export { isCat } from './isCat.mjs'
export { isChar } from './isChar.mjs'
export { isEmpty } from './isEmpty.mjs'
export { isNil } from './isNil.mjs'
export { isNot } from './isNot.mjs'
export { isOpt } from './isOpt.mjs'
export { isPlus } from './isPlus.mjs'
export { isRange } from './isRange.mjs'
export { isRep } from './isRep.mjs'
export { isStar } from './isStar.mjs'
export { isToken } from './isToken.mjs'
export { matches } from './matches.mjs'
export { nilOrEmpty } from './nilOrEmpty.mjs'
export { simplify } from './simplify.mjs'
export { toString } from './toString.mjs'

// convenience helpers
const { Alt, Any, Cat, Char, Empty, Nil, Not, Opt, Plus, Range, Rep, Star, Token } = RegularLanguage

const normalize = (strOrLang) =>
    typeof strOrLang === 'string' ?
        strOrLang.length === 1 ? Char(strOrLang) : Token(strOrLang)
        : strOrLang

export const alt = (left, right) => Alt(normalize(left), normalize(right)),
    any = Any,
    cat = (first, second) => Cat(normalize(first), normalize(second)),
    char = (c) => Char(c),
    choice = (...langs) => langs.reduce((acc, lang) => Alt(acc, normalize(lang))),
    empty = Empty,
    nil = Nil,
    not = (lang) => Not(normalize(lang)),
    opt = (lang) => Opt(normalize(lang)),
    plus = (lang) => Plus(normalize(lang)),
    range = (from, to) => Range(from, to),
    rep = (lang, n) => Rep(normalize(lang), n),
    seq = (...langs) => langs.reduce((acc, lang) => Cat(acc, normalize(lang))),
    star = (lang) => Star(normalize(lang)),
    token = (value) => normalize(value)