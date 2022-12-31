import { Trait, apply } from "@mlhaufe/brevity/dist/index.mjs";
import { force } from "./force.mjs";

/**
 * Represents the height of a regular language expression.
 */
export const height = new Trait({
    Alt({ left, right }) {
        const [l, r] = [left, right].map(force)
        return Math.max(this[apply](l), this[apply](r)) + 1;
    },
    Any() { return 1; },
    Cat({ first, second }) {
        const [f, s] = [first, second].map(force)
        return Math.max(this[apply](f), this[apply](s)) + 1;
    },
    Char() { return 1; },
    Empty() { return 1; },
    Nil() { return 1; },
    Not({ lang }) { return this[apply](force(lang)) + 1; },
    Range() { return 1; },
    Rep({ lang }) { return this[apply](force(lang)) + 1; },
    Star({ lang }) { return this[apply](force(lang)) + 1; },
    Token() { return 1; },
})