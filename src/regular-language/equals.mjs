import { Trait, apply } from "@mlhaufe/brevity/dist/Trait.mjs"
import { isAlt, isAny, isCat, isChar, isEmpty, isNil, isNot, isRange, isRep, isStar, isToken } from './index.mjs'
import { force } from "./force.mjs"

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
 * "c" = "c"
 */
export const equals = new Trait({
    Alt({ left, right }, other) {
        const [l, r, o] = [left, right, other].map(force)
        return isAlt(o) && this[apply](l, o.left) && this[apply](r, o.right)
    },
    Any({ }, other) { return isAny(force(other)); },
    Cat({ first, second }, other) {
        const [f, s, o] = [first, second, other].map(force)
        return isCat(o) && this[apply](f, o.first) && this[apply](s, o.second)
    },
    Char({ value }, other) {
        const o = force(other)
        return isChar(o) && value === o.value
    },
    Empty({ }, other) { return isEmpty(force(other)); },
    Nil({ }, other) { return isNil(force(other)); },
    Not({ lang }, other) {
        const [l, o] = [lang, other].map(force)
        return isNot(o) && this[apply](l, o.lang)
    },
    Range({ from, to }, other) {
        const o = force(other)
        return isRange(o) && from === o.from && to === o.to
    },
    Rep({ lang, n }, other) {
        const [l, o] = [lang, other].map(force)
        return isRep(o) && n === o.n && this[apply](l, o.lang)
    },
    Star({ lang }, other) {
        const [l, o] = [lang, other].map(force)
        return isStar(o) && this[apply](l, o.lang)
    },
    Token({ value }, other) {
        const o = force(other)
        return isToken(o) && value === o.value
    }
})