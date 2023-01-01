import { Trait, apply, memoFix } from "@mlhaufe/brevity/dist/index.mjs";
import { containsEmpty, Parser } from "./index.mjs";

const { Alt, Char, Empty, Nil, Not, Rep, Seq, Star, Token } = Parser;

const _deriv = Trait({
    // Dc(P1 ∪ P2) = Dc(P1) ∪ Dc(P2)
    Alt({ left, right }, c) {
        return Alt(() => this[apply](left, c), () => this[apply](right, c))
    },
    // Dc(.) = ε
    Any() { return Empty },
    // Dc(c) = ε
    // Dc(c') = ∅
    Char({ value }, c) { return value === c ? Empty : Nil },
    // Dc(ε) = ∅
    Empty() { return Nil },
    // Dc(∅) = ∅
    Nil() { return Nil },
    // Dc(¬P) = ¬Dc(P)
    Not(self, c) {
        return Not(() => this[apply](self.lang, c))
    },
    // Dc([a-z]) = Dc(c)
    // Dc([a-b]) = Dc(∅)
    Range({ from, to }, c) {
        return this[apply](
            from <= c && c <= to ? Char(c) : Nil,
            c
        )
    },
    // Dc(P{0}) = ε
    // Dc(P{1}) = Dc(P)
    // Dc(P{n}) = Dc(P)◦P{n-1}
    Rep({ lang, n }, c) {
        if (n < 0) throw new Error('n must be greater than or equal to 0')
        if (!Number.isInteger(n)) throw new Error('n must be an integer')
        if (n === 0) {
            return Empty
        } else {
            if (n === 1)
                return this[apply](lang, c)
            return Seq(() => this[apply](lang, c), Rep(lang, n - 1))
        }
    },
    // Dc(P1◦P2) =  Dc(P1)◦P2           if ε ∉ P1
    //           =  Dc(P1)◦P2 ∪ Dc(P2)  if ε ∈ P1
    Seq(self, c) {
        const fst = self.first,
            d1Seq = Seq(this[apply](fst, c), () => self.second);
        return containsEmpty(fst) ? Alt(d1Seq, () => this[apply](self.second, c)) : d1Seq
    },
    // Dc(P*) = Dc(P)◦P*
    Star({ lang }, c) {
        return Seq(() => this[apply](lang, c), Star(lang))
    },
    // Dc("") = Dc(ε)
    // Dc("c") = Dc(c)
    // Dc("abc") = Dc("a")◦"bc"
    Token({ value }, c) {
        return value.length == 0 ? this[apply](Empty, c) :
            value.length == 1 ? this[apply](Char(value), c) :
                Seq(
                    this[apply](Char(value[0]), c),
                    Token(value.substring(1))
                )
    }
})

/**
 * Computes the derivative of a parser with respect to a character c.
 * The derivative is a new parser where all strings that start with the character
 * are retained. The prefix character is then removed.
 * @see https://en.wikipedia.org/wiki/Brzozowski_derivative
 * @see https://matt.might.net/articles/parsing-with-derivatives/
 * @param {Parser} parser - The parser to derive.
 * @param {string} c - The character to derive with respect to.
 * @returns {Parser} The derivative of the parser with respect to the character.
 */
export const deriv = memoFix(_deriv, Nil);