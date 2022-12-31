import { Trait, apply } from "@mlhaufe/brevity/dist/index.mjs";
import { isAtomic } from "./index.mjs";
import { force } from "./force.mjs";

/**
 * Returns a string representation of the current expression
 */
export const toString = new Trait({
    Alt({ left, right }) {
        const [l, r] = [force(left), force(right)],
            leftString = isAtomic(l) ? `${this[apply](l)}` : `(${this[apply](l)})`,
            rightString = isAtomic(r) ? `${this[apply](r)}` : `(${this[apply](r)})`;
        return `${leftString}|${rightString}`;
    },
    Any() { return '.' },
    Cat({ first, second }) {
        const [f, s] = [force(first), force(second)],
            firstString = isAtomic(f) ? `${this[apply](f)}` : `(${this[apply](f)})`,
            secondString = isAtomic(s) ? `${this[apply](s)}` : `(${this[apply](s)})`;
        return `${firstString}${secondString}`;
    },
    Char({ value }) { return value; },
    Empty() { return 'ε'; },
    Nil() { return '∅'; },
    Not({ lang }) {
        const l = force(lang),
            langString = isAtomic(l) ? `${this[apply](l)}` : `(${this[apply](l)})`;
        return `¬${langString}`;
    },
    Range({ from, to }) { return `[${from}-${to}]`; },
    Rep({ lang, n }) {
        const l = force(lang),
            langString = isAtomic(l) ? `${this[apply](l)}` : `(${this[apply](l)})`;
        return `${langString}{${n}}`;
    },
    Star({ lang }) {
        const l = force(lang),
            langString = isAtomic(l) ? `${this[apply](l)}` : `(${this[apply](l)})`;
        return `${langString}*`;
    },
    Token({ value }) { return JSON.stringify(value); }
})