import { Trait, apply } from "@mlhaufe/brevity/dist/Trait.mjs";
import {
    RegularLanguage, isAlt, isEmpty, isNil, isNot, isStar, height, equals
} from "./index.mjs";

const {
    Alt, Any, Cat, Char, Empty, Nil, Not, Opt, Plus, Range, Rep, Star, Token
} = RegularLanguage;

/**
 * Converts the current language to simplest form possible
 * Where 'simplify' is defined as minimizing the height of the expression tree.
 * Additionally, this method will refactor the expression so that other
 * methods will be more likely to short-circuit.
 */
export const simplify = Trait({
    // L ∪ L → L
    // M ∪ L → L ∪ M
    // ∅ ∪ L → L
    // L ∪ ∅ → L
    // (L ∪ M) ∪ N → L ∪ (M ∪ N)
    Alt({ left, right }) {
        let [l, r] = [left, right].map(p => this[apply](p));
        if (isAlt(l))
            [l, r] = [l.left, Alt({ left: l.right, right: r })];
        if (height(l) > height(r))
            [l, r] = [r, l];
        if (equals(l, r))
            return l;
        else if (isNil(l))
            return r;
        else if (isNil(r))
            return l;
        return Alt({ left: l, right: r });
    },
    // . → .
    Any() { return Any },
    // PƐ → ƐP → P
    // ∅P → P∅ → ∅
    // Unused: (PQ)R → P(QR)
    // Unused: P(Q ∪ R) → PQ ∪ PR  (Is this actually simpler? Maybe the other direction?)
    // Unused: (Q ∪ R)P → QP ∪ RP  (Is this actually simpler? Maybe the other direction?)
    Cat({ first, second }) {
        const [fst, snd] = [first, second].map(p => this[apply](p));
        return isNil(fst) ? fst :
            isNil(snd) ? snd :
                isEmpty(fst) ? snd :
                    isEmpty(snd) ? fst :
                        Cat({ first: fst, second: snd });
    },
    // c → c
    Char({ value }) { return Char({ value }); },
    // Ɛ → Ɛ
    Empty() { return Empty; },
    // ∅ → ∅
    Nil() { return Nil; },
    // ¬¬L → L
    Not({ lang }) {
        const simplified = this[apply](lang);
        return isNot(simplified) ? simplified.lang : Not({ lang: simplified });
    },
    // L? → L?
    // ∅? → Ɛ
    Opt({ lang }) {
        const simplified = this[apply](lang);
        return isNil(simplified) ? Empty : Opt({ lang: simplified });
    },
    // L+ → L+
    // ∅+ → ∅
    Plus({ lang }) {
        const simplified = this[apply](lang);
        return isNil(simplified) ? Nil : Plus({ lang: simplified });
    },
    // [a-a] → a
    // [a-b] → [a-b]
    Range({ from, to }) {
        return from === to ? Char({ value: from }) : Range({ from, to });
    },
    // L{0} → Ɛ
    // L{1} → L
    // L{∞} → L*
    // L{n} → L{n}
    Rep({ lang, n }) {
        const simplified = this[apply](lang);
        return n === 0 ? Empty :
            n === 1 ? simplified :
                n === Infinity ? Star({ lang: simplified }) :
                    Rep({ lang: simplified, n });
    },
    // ∅* → Ɛ
    // L** → L*
    // Ɛ* → Ɛ
    Star({ lang }) {
        const simplified = this[apply](lang);
        return isNil(simplified) || isEmpty(simplified) ? Empty :
            isStar(simplified) ? simplified :
                Star({ lang: simplified });
    },
    // "Foo" → "Foo"
    Token({ value }) { return Token({ value }); }
});