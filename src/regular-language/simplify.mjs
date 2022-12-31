import { Trait, apply } from "@mlhaufe/brevity/dist/Trait.mjs";
import { RegularLanguage, isAlt, isEmpty, isNil, isNot, isStar, height, equals } from "./index.mjs";
import { force } from "./force.mjs";

const { Alt, Cat, Char, Empty, Nil, Not, Rep, Star } = RegularLanguage;

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
        let [l, r] = [left, right].map(p => this[apply](force(p)));
        if (isAlt(l))
            [l, r] = [l.left, Alt(l.right, r)];
        if (height(l) > height(r))
            [l, r] = [r, l];
        if (equals(l, r))
            return l;
        else if (isNil(l))
            return r;
        else if (isNil(r))
            return l;
        if (l === left && r === right)
            return arguments[0]
        return Alt(l, r);
    },
    // . → .
    Any(self) { return self; },
    // PƐ → ƐP → P
    // ∅P → P∅ → ∅
    // Unused: (PQ)R → P(QR)
    // Unused: P(Q ∪ R) → PQ ∪ PR  (Is this actually simpler? Maybe the other direction?)
    // Unused: (Q ∪ R)P → QP ∪ RP  (Is this actually simpler? Maybe the other direction?)
    Cat({ first, second }) {
        const [fst, snd] = [first, second].map(p => this[apply](force(p)));
        return isNil(fst) ? fst :
            isNil(snd) ? snd :
                isEmpty(fst) ? snd :
                    isEmpty(snd) ? fst :
                        fst === first && snd === second ? arguments[0] :
                            Cat(fst, snd);
    },
    // c → c
    Char(self) { return self; },
    // Ɛ → Ɛ
    Empty(self) { return self; },
    // ∅ → ∅
    Nil(self) { return self; },
    // ¬¬L → L
    Not({ lang }) {
        const simplified = this[apply](force(lang));
        return isNot(simplified) ? simplified.lang :
            simplified === lang ? arguments[0] : Not(simplified);
    },
    // [a-a] → a
    // [a-b] → [a-b]
    Range({ from, to }) {
        return from === to ? Char(from) : arguments[0];
    },
    // L{0} → Ɛ
    // L{1} → L
    // L{∞} → L*
    // L{n} → L{n}
    Rep({ lang, n }) {
        const simplified = this[apply](force(lang));
        return n === 0 ? Empty :
            n === 1 ? simplified :
                n === Infinity ? Star(simplified) :
                    simplified === lang ? arguments[0] :
                        Rep(simplified, n);
    },
    // ∅* → Ɛ
    // L** → L*
    // Ɛ* → Ɛ
    Star({ lang }) {
        const simplified = this[apply](force(lang));
        return isNil(simplified) || isEmpty(simplified) ? Empty :
            isStar(simplified) ? simplified :
                simplified === lang ? arguments[0] :
                    Star(simplified);
    },
    // "Foo" → "Foo"
    Token(self) { return self; }
});