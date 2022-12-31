import MultiKeyMap from "@final-hill/multi-key-map"
import { Trait, apply } from "@mlhaufe/brevity/dist/Trait.mjs"

const visited = Symbol('visited');
/**
 * Extends a trait to support the computation of a least fixed point with a bottom element and memoization
 * @param {any|() => any} bottom The bottom element of the least fixed point
 * @param {Trait} trait The trait to extend
 * @returns {Trait} The extended trait
 */
export const memoFix = (bottom, trait) => Trait(trait, {
    [visited]: new MultiKeyMap(),
    [apply](...args) {
        const v = this[visited];
        if (!v.has(...args)) {
            if (typeof bottom === 'function')
                v.set(...args, bottom(...args));
            else
                v.set(...args, bottom);
            v.set(...args, trait[apply].apply(this, args));
        }
        return v.get(...args);
    }
})