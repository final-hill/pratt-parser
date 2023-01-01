import { Trait, apply, all, memoFix } from "@mlhaufe/brevity/dist/index.mjs";

const _height = Trait({
    [all]() { return 1; },
    Alt({ left, right }) {
        return Math.max(this[apply](left), this[apply](right)) + 1;
    },
    Not({ lang }) { return this[apply](lang) + 1; },
    Rep({ lang }) { return this[apply](lang) + 1; },
    Seq({ first, second }) {
        return Math.max(this[apply](first), this[apply](second)) + 1;
    },
    Star({ lang }) { return this[apply](lang) + 1; }
})

/**
 * Represents the height of a parser.
 * @param {Parser} lang
 * @returns {number}
 */
export const height = memoFix(_height, 0);