import { Trait, apply } from "@mlhaufe/brevity/dist/Trait.mjs"
import {
    isAlt, isAny, isCat, isChar, isEmpty, isNil, isNot, isRange,
    isRep, isOpt, isPlus, isStar, isToken
} from './index.mjs'

/**
 * Determines if two regular languages are equal
 * L1 ∪ L2 = L2 ∪ L1   if L1 = L1 and L2 = L2
 * . = .
 * L1◦L2 = L1◦L2  if L1 = L1 and L2 = L2
 * c = c
 * ε = ε
 * ∅ = ∅
 * ¬L = ¬L  if L = L
 * [a,b] = [a,b]
 * L{n} = L{n}
 * L* = L*  if L = L
 * L? = L?  if L = L
 * "c" = "c"
 * L+ = L+  if L = L
 */
export const equals = new Trait({
    Alt({ left, right }, other) {
        return isAlt(other) && this[apply](left, other.left) && this[apply](right, other.right)
    },
    Any({ }, other) { return isAny(other); },
    Cat({ first, second }, other) {
        return isCat(other) && this[apply](first, other.first) && this[apply](second, other.second)
    },
    Char({ value }, other) { return isChar(other) && value === other.value },
    Empty({ }, other) { return isEmpty(other); },
    Nil({ }, other) { return isNil(other); },
    Not({ lang }, other) { return isNot(other) && this[apply](lang, other.lang) },
    Opt({ lang }, other) { return isOpt(other) && this[apply](lang, other.lang) },
    Plus({ lang }, other) { return isPlus(other) && this[apply](lang, other.lang) },
    Range({ from, to }, other) { return isRange(other) && from === other.from && to === other.to },
    Rep({ lang, n }, other) { return isRep(other) && n === other.n && this[apply](lang, other.lang) },
    Star({ lang }, other) { return isStar(other) && this[apply](lang, other.lang) },
    Token({ value }, other) { return isToken(other) && value === other.value }
})