import { Trait, apply } from "@mlhaufe/brevity/dist/index.mjs";

/**
 * Represents the height of a regular language expression.
 */
export const height = new Trait({
    Alt({ left, right }) {
        return Math.max(this[apply](left), this[apply](right)) + 1;
    },
    Any() { return 1; },
    Cat({ first, second }) {
        return Math.max(this[apply](first), this[apply](second)) + 1;
    },
    Char() { return 1; },
    Empty() { return 1; },
    Nil() { return 1; },
    Not({ lang }) { return this[apply](lang) + 1; },
    Opt({ lang }) { return this[apply](lang) + 1; },
    Plus({ lang }) { return this[apply](lang) + 1; },
    Range() { return 1; },
    Rep({ lang }) { return this[apply](lang) + 1; },
    Star({ lang }) { return this[apply](lang) + 1; },
    Token() { return 1; },
})