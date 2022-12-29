import { Trait, apply } from "@mlhaufe/brevity/dist/Trait.mjs";
import { containsEmpty, RegularLanguage } from "./index.mjs";

const assertChar = (c) => {
    if (c.length !== 1)
        throw new Error(`Expected string of length 1, got ${c.length}`);
}

const { Alt, Cat, Char, Empty, Nil, Not, Rep, Star, Token } = RegularLanguage;

/**
 * Computes the derivative of a regular language with respect to a character c.
 * The derivative is a new language where all strings that start with the character
 * are retained. The prefix character is then removed.
 * @see https://en.wikipedia.org/wiki/Brzozowski_derivative
 */
export const deriv = Trait({
    // Dc(L1 ∪ L2) = Dc(L1) ∪ Dc(L2)
    Alt({ left, right }, c) {
        assertChar(c);
        return Alt({ left: this[apply](left, c), right: this[apply](right, c) })
    },
    // Dc(.) = ε
    Any({ }, c) {
        assertChar(c);
        return Empty
    },
    // Dc(L1◦L2) =  Dc(L1)◦L2           if ε ∉ L1
    //           =  Dc(L1)◦L2 ∪ Dc(L2)  if ε ∈ L1
    Cat({ first, second }, c) {
        assertChar(c);
        const d1Cat = Cat({ first: this[apply](first, c), second });
        return containsEmpty(first) ?
            Alt({ left: d1Cat, right: this[apply](second, c) }) :
            d1Cat
    },
    // Dc(c) = ε
    // Dc(c') = ∅
    Char({ value }, c) {
        assertChar(c);
        return value === c ? Empty : Nil
    },
    // Dc(ε) = ∅
    Empty({ }, c) {
        assertChar(c);
        return Nil
    },
    // Dc(∅) = ∅
    Nil({ }, c) {
        assertChar(c);
        return Nil
    },
    // Dc(¬L) = ¬Dc(L)
    Not({ lang }, c) {
        assertChar(c);
        return Not({ lang: this[apply](lang, c) })
    },
    // Dc(L?) = Dc(L ∪ ε)
    Opt({ lang }, c) {
        assertChar(c);
        return this[apply](Alt({ left: lang, right: Empty }), c)
    },
    // Dc(L+) = Dc(L)◦L*
    Plus({ lang }, c) {
        assertChar(c);
        return Cat({ first: this[apply](lang, c), second: Star({ lang }) })
    },
    // Dc([a-z]) = Dc(c)
    // Dc([a-b]) = Dc(∅)
    Range({ from, to }, c) {
        assertChar(c);
        return this[apply](
            from <= c && c <= to ? Char({ value: c }) : Nil,
            c
        )
    },
    // Dc(L{0}) = ε
    // Dc(L{1}) = Dc(L)
    // Dc(L{n}) = Dc(L)◦L{n-1}
    Rep({ lang, n }, c) {
        assertChar(c);
        if (n < 0) throw new Error('n must be greater than or equal to 0')
        if (!Number.isInteger(n)) throw new Error('n must be an integer')
        return n === 0 ? Empty :
            n === 1 ? this[apply](lang, c) :
                Cat({ first: this[apply](lang, c), second: Rep({ lang, n: n - 1 }) })
    },
    // Dc(L*) = Dc(L)◦L*
    Star({ lang }, c) {
        assertChar(c);
        return Cat({ first: this[apply](lang, c), second: Star({ lang }) })
    },
    // Dc("") = Dc(ε)
    // Dc("c") = Dc(c)
    // Dc("abc") = Dc("a")◦"bc"
    Token({ value }, c) {
        assertChar(c);
        return value.length == 0 ? this[apply](Empty, c) :
            value.length == 1 ? this[apply](Char({ value }), c) :
                Cat({
                    first: this[apply](Char({ value: value[0] }), c),
                    second: Token({ value: value.substring(1) })
                })
    }
})