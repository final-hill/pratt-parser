import { Trait, apply, all } from "@mlhaufe/brevity/dist/index.mjs";
import { force } from "../force.mjs";
import { memoFix } from "../memoFix.mjs";

const _height = new Trait({
    [all]() { return 1; },
    Alt({ left, right }) {
        const [l, r] = [left, right].map(force)
        return Math.max(this[apply](l), this[apply](r)) + 1;
    },
    Cat({ first, second }) {
        const [f, s] = [first, second].map(force)
        return Math.max(this[apply](f), this[apply](s)) + 1;
    },
    Not({ lang }) { return this[apply](force(lang)) + 1; },
    Rep({ lang }) { return this[apply](force(lang)) + 1; },
    Star({ lang }) { return this[apply](force(lang)) + 1; }
})

/**
 * Represents the height of a regular language.
 * @param {RegularLanguage} lang
 * @returns {number}
 */
export const height = memoFix(0, _height);