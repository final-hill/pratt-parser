import { ANY, EMPTY } from "../regular-language/index.mjs";

export class RegularLanguage {
    /**
     * The language of a single character. A wildcard.
     * '.'
     *
     * @see Any
     * @returns {Any} The Any language
     */
    any() { return ANY; }

    /**
     * Represents the Empty language which matches the empty string
     * ε = {""}
     * @returns {Empty} The Empty language
     */
    empty() { return EMPTY; }

    /**
     * Represents the Nil language. Matches a language with no members.
     * ∅ = {}
     * @returns {Nil} The Nil language
     */
    nil() { return NIL; }

    /**
     * Represents the union of two languages.
     * L1 ∪ L2
     *
     * @see Alt
     * @param {RegularLanguage | string} lang The Alt language or a string
     * @returns {Alt} The Alt language
     */
    or(lang) {
        return lang instanceof RegularLanguage ? new Alt(this, lang) :
            lang.length == 0 ? this.empty() :
                lang.length == 1 ? this.char(lang) :
                    this.token(lang);
    }

    /**
     * Returns a new language which is the combination of multiple languages
     * L1 | L2 | ... | Ln
     *
     * @param {(RegularLanguage | string)[]} langs The alternative languages
     * @returns {Alt | Empty} The Alt or Empty language
     */
    alt(...langs) {
        return langs.length == 0 ? this.empty() :
            langs.map(l =>
                l instanceof RegularLanguage ? l :
                    l.length == 0 ? this.empty() :
                        l.length == 1 ? this.char(l) :
                            this.token(l)
            ).reduce((sum, next) => new Alt(sum, next));
    }

    /**
     * The concatenation of multiple languages
     * L1◦L2◦...◦Ln
     * @param {(RegularLanguage | string)[]} languages The languages to concatenate
     * @see Cat
     * @returns {RegularLanguage} The concatenation of the provided languages
     */
    cat(...languages) {
        return languages.length == 0 ? this.empty() :
            languages.map(l =>
                l instanceof RegularLanguage ? l :
                    l.length == 0 ? this.empty() :
                        l.length == 1 ? this.char(l) :
                            this.token(l)
            ).reduce((sum, next) => new Cat(sum, next));
    }

    /**
     * Represents the language of a single character
     * c = {...,'a','b',...}
     *
     * @see Char
     * @param {string} value - A character
     * @throws Throws an error if the provided string is not length == 1
     * @returns {Char} - The Char language
     */
    char(value) {
        if (typeof value !== 'string')
            throw new Error(`Expected string, got ${typeof value}`);
        if (value.length != 1)
            throw new Error(`Expected string of length 1, got ${value.length}`);

        return new Char(value);
    }

    /**
     * The complement language.
     * Matches anything that is not the current language
     *
     * @returns {Not} The Not language
     */
    not() { return new Not(this); }

    /**
     * The Opt language.
     * L?
     * Equivalent to L | ε
     * @returns {Alt} The Alt language
     */
    opt() { return this.or(this.empty()); }

    /**
     * The Plus language. Matches the current pattern one or more times
     * L+
     * Equivalent to L◦L*
     * @returns {Cat} The Cat language
     */
    plus() { return this.then(this.star()); }

    /**
     * [a-b]
     * @param {string} from The starting character
     * @param {string} to The ending character
     * @throws {Error} Throws if 'from' is not less than or equal to 'to'
     * @throws {Error} Throws if 'from' or 'to' are not length == 1
     * @returns {Range} The Range language
     */
    range(from, to) {
        if (from > to)
            throw new Error(`Expected 'from' to be less than or equal to 'to', got ${from} > ${to}`);
        if (typeof from !== 'string')
            throw new Error(`Expected string, got ${typeof from}`);
        if (typeof to !== 'string')
            throw new Error(`Expected string, got ${typeof to}`);
        if (from.length != 1)
            throw new Error(`Expected string of length 1, got ${from.length}`);
        if (to.length != 1)
            throw new Error(`Expected string of length 1, got ${to.length}`);

        return new Range(from, to);
    }

    /**
     * The Rep language. Matches the current pattern n times
     * @param {number} [n] The number of repetitions
     * @throws {Error} Throws if n < 0 or n is not an integer
     * @returns {Rep} The Rep language
     */
    rep(n) {
        if (n < 0)
            throw new Error(`Expected n >= 0, got ${n}`);
        if (n % 1 !== 0)
            throw new Error(`Expected n to be an integer, got ${n}`);

        return new Rep(this, n);
    }

    /**
     * Represents the Kleene star of the current language
     * L*
     * @see Star
     * @returns {Star} The Star language
     */
    star() { return new Star(this); }

    /**
     * Returns the concatenation of the current language with
     * one or more additional languages
     * L1◦L2◦...◦Ln
     *
     * @see Cat
     * @param {...(RegularLanguage | string)[]} langs The sequence of languages
     * @returns {Cat} The Cat language
    */
    then(...langs) {
        if (langs.length == 0) {
            return new Cat(this, this.nil());
        } else {
            const q = langs.map(l =>
                l instanceof RegularLanguage ? l :
                    l.length == 0 ? this.empty() :
                        l.length == 1 ? this.char(l) :
                            this.token(l)
            );

            return new Cat(this, q.reduce((sum, next) => new Cat(sum, next)));
        }
    }

    /**
     * "Foo"
     * @param {string} value The string representing the token
     * @returns {Token} The Token language
     */
    token(value) { return new Token(value); }
}