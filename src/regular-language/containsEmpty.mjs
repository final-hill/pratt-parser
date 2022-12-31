import { Trait, apply } from "@mlhaufe/brevity/dist/Trait.mjs"
import { force } from '../force.mjs'
import { memoFix } from "../memoFix.mjs"

const _containsEmpty = new Trait({
    Alt({ left, right }) {
        return this[apply](force(left)) || this[apply](force(right))
    },
    Any() { return true; },
    Cat({ first, second }) {
        return this[apply](force(first)) && this[apply](force(second))
    },
    Char() { return false; },
    Empty() { return true; },
    Nil() { return false; },
    Not({ lang }) {
        return !this[apply](force(lang))
    },
    Range() { return false; },
    Rep({ lang, n }) {
        return n === 0 || this[apply](force(lang))
    },
    Star() { return true; },
    Token() { return false; }
})

/**
 * Determines if the regular language contains the Empty language.
 * δ(L1 | L2) = δ(L1) | δ(L2)
 * δ(.) = true
 * δ(L1◦L2) = δ(L1) && δ(L2)
 * δ(c) = false
 * δ(ε) = true
 * δ(∅) = false
 * δ(!L) = !δ(L)
 * δ([a-z]) = false
 * δ(L{0}) = true
 * δ(L{n}) = δ(L)
 * δ(L*) = true
 * δ("token") = false
 * @param {RegularLanguage} lang
 * @returns {boolean}
 */
export const containsEmpty = memoFix(false, _containsEmpty)