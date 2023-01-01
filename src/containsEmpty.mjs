import { Trait, apply, memoFix } from "@mlhaufe/brevity/dist/index.mjs"

const _containsEmpty = Trait({
    Alt({ left, right }) {
        return this[apply](left) || this[apply](right)
    },
    Any() { return true; },
    Char() { return false; },
    Empty() { return true; },
    Nil() { return false; },
    Not({ lang }) {
        return !this[apply](lang)
    },
    Range() { return false; },
    Rep({ lang, n }) {
        return n === 0 || this[apply](lang)
    },
    Seq({ first, second }) {
        return this[apply](first) && this[apply](second)
    },
    Star() { return true; },
    Token() { return false; }
})

/**
 * Determines if the parser contains the Empty parser.
 * δ(P1 | P2) = δ(P1) | δ(P2)
 * δ(.) = true
 * δ(P1◦P2) = δ(P1) && δ(P2)
 * δ(c) = false
 * δ(ε) = true
 * δ(∅) = false
 * δ(!P) = !δ(P)
 * δ([a-z]) = false
 * δ(P{0}) = true
 * δ(P{n}) = δ(P)
 * δ(P*) = true
 * δ("token") = false
 * @param {Parser} lang
 * @returns {boolean}
 */
export const containsEmpty = memoFix(_containsEmpty, false)