import { Trait, apply } from "@mlhaufe/brevity/dist/Trait.mjs";
import { RegularLanguage, isNil } from "./index.mjs";

const { Alt, Cat, Empty, Nil } = RegularLanguage;

/**
 * Returns Nil or Empty depending on whether Empty
 * exists in the current expression.
 *
 * δ(L) = ∅ if ε notIn L
 * δ(L) = ε if ε in L
 */
export const nilOrEmpty = new Trait({
    // δ(L1 ∪ L2) = δ(L1) ∪ δ(L2)
    Alt({ left, right }) {
        return Alt({ left: this[apply](left), right: this[apply](right) });
    },
    // δ(.) = ∅
    Any() { return Nil; },
    // δ(L1◦L2) = δ(L1)◦δ(L2)
    Cat({ first, second }) {
        return Cat({ first: this[apply](first), second: this[apply](second) });
    },
    // δ(c) = ∅
    Char() { return Nil; },
    // δ(ε) = ε
    Empty() { return Empty; },
    // δ(∅) = ∅
    Nil() { return Nil; },
    // δ(¬P) = ε if δ(P) = ∅
    // δ(¬P) = ∅ if δ(P) = ε
    Not({ lang }) { return isNil(this[apply](lang)) ? Empty : Nil; },
    // δ(L?) = ε
    Opt() { return Empty; },
    // δ(L+) = δ(L)
    Plus({ lang }) { return this[apply](lang); },
    // δ([a-z]) = ∅
    Range() { return Nil; },
    // δ(L{0}) = ε
    // δ(L{n}) = δ(L)
    Rep({ lang, n }) { return n == 0 ? Empty : this[apply](lang); },
    // δ(L*) = ε
    Star() { return Empty; },
    // δ("abc") = ∅
    Token() { return Nil; }
})