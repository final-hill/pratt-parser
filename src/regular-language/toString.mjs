import { Trait, apply } from "@mlhaufe/brevity/dist/index.mjs";
import { isAtomic } from "./index.mjs";

/**
 * Returns a string representation of the current expression
 */
export const toString = new Trait({
    Alt({ left, right }) {
        const leftString = isAtomic(left) ? `${this[apply](left)}` : `(${this[apply](left)})`,
            rightString = isAtomic(right) ? `${this[apply](right)}` : `(${this[apply](right)})`;
        return `${leftString}|${rightString}`;
    },
    Any() { return '.' },
    Cat({ first, second }) {
        const firstString = isAtomic(first) ? `${this[apply](first)}` : `(${this[apply](first)})`,
            secondString = isAtomic(second) ? `${this[apply](second)}` : `(${this[apply](second)})`;
        return `${firstString}${secondString}`;
    },
    Char({ value }) { return value; },
    Empty() { return 'ε'; },
    Nil() { return '∅'; },
    Not({ lang }) {
        const langString = isAtomic(lang) ? `${this[apply](lang)}` : `(${this[apply](lang)})`;
        return `¬${langString}`;
    },
    Opt({ lang }) {
        const langString = isAtomic(lang) ? `${this[apply](lang)}` : `(${this[apply](lang)})`;
        return `${langString}?`;
    },
    Plus({ lang }) {
        const langString = isAtomic(lang) ? `${this[apply](lang)}` : `(${this[apply](lang)})`;
        return `${langString}+`;
    },
    Range({ from, to }) { return `[${from}-${to}]`; },
    Rep({ lang, n }) {
        const langString = isAtomic(lang) ? `${this[apply](lang)}` : `(${this[apply](lang)})`;
        return `${langString}{${n}}`;
    },
    Star({ lang }) {
        const langString = isAtomic(lang) ? `${this[apply](lang)}` : `(${this[apply](lang)})`;
        return `${langString}*`;
    },
    Token({ value }) { return JSON.stringify(value); }
})