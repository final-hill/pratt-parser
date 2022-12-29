import { all, apply, Trait } from "@mlhaufe/brevity/dist/Trait.mjs";
import {
    containsEmpty, equals, deriv, simplify
} from "./index.mjs";

/**
 * Determines if the language matches the given string
 */
export const matches = new Trait({
    [all](self, text) {
        // simplify self until equals returns false
        let [s, s2] = [self, simplify(self)];
        while (!equals(s, s2))
            [s, s2] = [s2, simplify(s2)];

        if (typeof text !== 'string')
            throw new Error(`Expected string, got ${typeof text}`);

        return text.length == 0 ? containsEmpty(s2) : this[apply](deriv(s2, text[0]), text.substring(1));
    }
});