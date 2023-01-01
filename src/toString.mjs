import { Trait, apply, memoFix } from "@mlhaufe/brevity/dist/index.mjs";

const _toString = Trait({
    Alt({ left, right }) {
        return `Alt(${this[apply](left)}, ${this[apply](right)})`;
    },
    Any() { return 'Any' },
    Char({ value }) { return `Char(${value})`; },
    Empty() { return 'Empty'; },
    Nil() { return 'Nil'; },
    Not({ lang }) { return `Not(${this[apply](lang)})`; },
    Range({ from, to }) { return `Range(${from}, ${to})`; },
    Rep({ lang, n }) { return `Rep(${this[apply](lang)}, ${n})`; },
    Seq({ first, second }) {
        return `Seq(${this[apply](first)}, ${this[apply](second)})`;
    },
    Star({ lang }) { return `Star(${this[apply](lang)})`; },
    Token({ value }) { return `Token(${value})`; }
})

/**
 * Returns a string representation of the current expression
 * @param {Parser} lang
 * @returns {string}
 */
export const toString = memoFix(_toString, '$');