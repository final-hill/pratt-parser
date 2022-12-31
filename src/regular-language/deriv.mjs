import { Trait, apply } from "@mlhaufe/brevity/dist/Trait.mjs";
import MultiKeyMap from '@final-hill/multi-key-map';
import { containsEmpty, RegularLanguage } from "./index.mjs";
import { force } from "./force.mjs";

const { Alt, Cat, Char, Empty, Nil, Not, Rep, Star, Token } = RegularLanguage;

/**
 * Computes the derivative of a regular language with respect to a character c.
 * The derivative is a new language where all strings that start with the character
 * are retained. The prefix character is then removed.
 * @see https://en.wikipedia.org/wiki/Brzozowski_derivative
 */
const deriv = Trait({
    // Dc(L1 ∪ L2) = Dc(L1) ∪ Dc(L2)
    Alt({ left, right }, c) {
        return Alt(() => this[apply](left, c), () => this[apply](right, c))
    },
    // Dc(.) = ε
    Any() { return Empty },
    // Dc(L1◦L2) =  Dc(L1)◦L2           if ε ∉ L1
    //           =  Dc(L1)◦L2 ∪ Dc(L2)  if ε ∈ L1
    Cat({ first, second }, c) {
        const f = force(first),
            d1Cat = Cat(this[apply](f, c), second);
        return containsEmpty(f) ? Alt(d1Cat, () => this[apply](force(second), c)) : d1Cat
    },
    // Dc(c) = ε
    // Dc(c') = ∅
    Char({ value }, c) { return value === c ? Empty : Nil },
    // Dc(ε) = ∅
    Empty() { return Nil },
    // Dc(∅) = ∅
    Nil() { return Nil },
    // Dc(¬L) = ¬Dc(L)
    Not({ lang }, c) {
        return Not(() => this[apply](force(lang), c))
    },
    // Dc([a-z]) = Dc(c)
    // Dc([a-b]) = Dc(∅)
    Range({ from, to }, c) {
        return this[apply](
            from <= c && c <= to ? Char(c) : Nil,
            c
        )
    },
    // Dc(L{0}) = ε
    // Dc(L{1}) = Dc(L)
    // Dc(L{n}) = Dc(L)◦L{n-1}
    Rep({ lang, n }, c) {
        if (n < 0) throw new Error('n must be greater than or equal to 0')
        if (!Number.isInteger(n)) throw new Error('n must be an integer')
        if (n === 0) {
            return Empty
        } else {
            if (n === 1)
                return this[apply](force(lang), c)
            return Cat(() => this[apply](force(lang), c), Rep(lang, n - 1))
        }
    },
    // Dc(L*) = Dc(L)◦L*
    Star({ lang }, c) {
        return Cat(() => this[apply](force(lang), c), Star(lang))
    },
    // Dc("") = Dc(ε)
    // Dc("c") = Dc(c)
    // Dc("abc") = Dc("a")◦"bc"
    Token({ value }, c) {
        return value.length == 0 ? this[apply](Empty, c) :
            value.length == 1 ? this[apply](Char(value), c) :
                Cat(
                    this[apply](Char(value[0]), c),
                    Token(value.substring(1))
                )
    }
})

// memoize deriv calls to avoid recomputing the same derivations
const memo = new MultiKeyMap();
const derivMemo = Trait(deriv, {
    [apply](lang, c) {
        if (!memo.has(lang, c))
            memo.set(lang, c, deriv[apply].call(this, lang, c));
        return memo.get(lang, c);
    }
})

export { derivMemo as deriv };