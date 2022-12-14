import { Trait, apply, memoFix } from "@mlhaufe/brevity/dist/index.mjs"
import { isAlt, isAny, isSeq, isChar, isEmpty, isNil, isNot, isRange, isRep, isStar, isToken } from './index.mjs'

const _equals = Trait({
    Alt({ left, right }, other) {
        return isAlt(other) && this[apply](left, other.left) && this[apply](right, other.right)
    },
    Any(_, other) { return isAny(other); },
    Char({ value }, other) {
        return isChar(other) && value === other.value
    },
    Empty(_, other) { return isEmpty(other); },
    Nil(_, other) { return isNil(other); },
    Not({ lang }, other) {
        return isNot(other) && this[apply](lang, other.lang)
    },
    Range({ from, to }, other) {
        return isRange(other) && from === other.from && to === other.to
    },
    Rep({ lang, n }, other) {
        return isRep(other) && n === other.n && this[apply](lang, other.lang)
    },
    Seq({ first, second }, other) {
        return isSeq(other) && this[apply](first, other.first) && this[apply](second, other.second)
    },
    Star({ lang }, other) {
        return isStar(other) && this[apply](lang, other.lang)
    },
    Token({ value }, other) {
        return isToken(other) && value === other.value
    }
})

/**
 * Determines if two parsers are equal
 * P1 ∪ P2 = P2 ∪ P1   if P1 = P1 and P2 = P2
 * . = .
 * P1◦P2 = P1◦P2  if P1 = P1 and P2 = P2
 * c = c
 * ε = ε
 * ∅ = ∅
 * ¬P = ¬P  if P = P
 * [a,b] = [a,b]
 * P{n} = P{n}
 * P* = P*  if P = P
 * "c" = "c"
 */
export const equals = memoFix(_equals, true)