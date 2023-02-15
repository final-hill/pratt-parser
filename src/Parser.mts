/*!
 * @license
 * Copyright (C) 2023 Final Hill LLC
 * SPDX-License-Identifier: AGPL-3.0-only
 * @see <https://spdx.org/licenses/AGPL-3.0-only.html>
 */

import { Sym } from './Sym.mjs';

// escapes a string for use in a regular expression
const escapeRegex = (str: string): string => str.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');

/**
 * A Top-Down Operator Precedence parser.
 */
export class Parser {
    #symbolTable = new Map<string, [RegExp, Sym]>();
    #skipPatterns: RegExp[] = [];
    #symGen?: Generator<Sym, Sym>;
    #curSym?: Sym;

    /**
     * Advance the parser to the next symbol
     * @param id - The symbol's identifier
     */
    advance(id?: string): void {
        if (id !== undefined && this.#curSym?.id !== id) {
            throw new Error(`Expected ${id} but found ${this.#curSym?.id}`);
        }
        this.#curSym = this.#symGen?.next().value;
    }

    /**
     * Parses an expression with the given binding power
     * @param rbp - The right binding power
     * @returns - The parsed symbol
     */
    expression(rbp: number): Sym {
        if (this.#symGen === undefined || this.#curSym === undefined) {
            throw new Error('The `parse` method must be called first');
        }

        let sym = this.#curSym;
        this.#curSym = this.#symGen.next().value;
        let left = sym.nud();

        while (rbp < this.#curSym.lbp) {
            sym = this.#curSym;
            this.#curSym = this.#symGen.next().value;
            left = sym.led(left);
        }

        return left;
    }

    /**
     * Defines a grouping expression
     * @param open - The opening symbol
     * @param close - The closing symbol
     */
    group(open: string, close: string): void {
        const expression: this['expression'] = bp => this.expression(bp),
            advance: this['advance'] = id => this.advance(id);
        // eslint-disable-next-line require-jsdoc
        function nud(this: Sym): Sym {
            const e = expression(0);
            advance(close);

            return e;
        }

        this.symbol(open, 0);
        const s = this.#symbolTable.get(open)![1];
        s.nud = nud;
        this.symbol(close, 0);
    }

    /**
     * Defines an infix operator
     * @param id - The symbol's identifier
     * @param lbp - The symbol's left binding power
     */
    infix(id: string, lbp: number): void {
        const expression: this['expression'] = bp => this.expression(bp);
        // eslint-disable-next-line require-jsdoc
        function led(this: Sym, left: Sym): Sym {
            this.children = [left, expression(lbp)];

            return this;
        }

        this.symbol(id, lbp);
        const s = this.#symbolTable.get(id)![1];
        s.led = led;
    }

    /**
     * Defines an infix operator with right associativity
     * @param id - The symbol's identifier
     * @param lbp - The symbol's left binding power
     */
    infixR(id: string, lbp: number): void {
        const expression: this['expression'] = bp => this.expression(bp);
        // eslint-disable-next-line require-jsdoc
        function led(this: Sym, left: Sym): Sym {
            this.children = [left, expression(lbp - 1)];

            return this;
        }

        this.symbol(id, lbp);
        const s = this.#symbolTable.get(id)![1];
        s.led = led;
    }

    infixTernary(): void {
        // TODO: implement
    }

    /**
     * Defines an arbitrary symbol based on a regular expression
     * @param id - The symbol's identifier
     * @param matcher - The symbol's matcher
     * @param bp - The symbol's binding power
     */
    match(id: string, matcher: RegExp, bp: number): void {
        // eslint-disable-next-line require-jsdoc
        function nud(this: Sym): Sym { return this; }
        this.symbol(id, bp);
        const entry = this.#symbolTable.get(id)!;
        entry[1].nud = nud;
        this.#symbolTable.set(id, [matcher, entry[1]]);
    }

    /**
     * Converts a source text into an abstract syntax tree.
     * @param source - The source text to parse.
     * @returns - The parsed result
     */
    parse(source: string): Sym {
        this.#symGen = this.tokenize(source);
        this.#curSym = this.#symGen.next().value;

        if (this.#curSym === undefined) {
            throw new Error('Unexpected end of input');
        }

        return this.expression(0);
    }

    /**
     * Define a postfix operator
     * @param id - The symbol's identifier
     * @param lbp - The symbol's left binding power
     */
    postfix(id: string, lbp: number): void {
        // eslint-disable-next-line require-jsdoc
        function led(this: Sym, left: Sym): Sym {
            this.children = [left];

            return this;
        }

        this.symbol(id, lbp);

        const s = this.#symbolTable.get(id)![1];
        s.led = led;
    }

    /**
     * Define a prefix operator
     * @param id - The symbol's identifier
     * @param lbp - The symbol's left binding power
     */
    prefix(id: string, lbp: number): void {
        const expression: this['expression'] = bp => this.expression(bp);
        // eslint-disable-next-line require-jsdoc
        function nud(this: Sym): Sym {
            this.children = [expression(lbp)];

            return this;
        }

        this.symbol(id, 0);
        const s = this.#symbolTable.get(id)![1];
        s.nud = nud;
    }

    prefixTernary(): void {
        // TODO: implement
    }

    /**
     * Define a pattern that is skipped during tokenization
     * @param pattern - The pattern to skip
     */
    skip(pattern: RegExp): void {
        this.#skipPatterns.push(pattern);
    }

    /**
     * Define a symbol in the symbol table
     * @param id - The symbol's identifier
     * @param lbp - The symbol's left binding power
    */
    symbol(id: string, lbp: number): void {
        if (this.#symbolTable.has(id)) {
            const s = this.#symbolTable.get(id);
            s![1].lbp = Math.max(s![1].lbp, lbp);
        } else {
            this.#symbolTable.set(id, [new RegExp(escapeRegex(id)), new Sym(id, lbp)]);
        }
    }

    /**
     * Converts a source text into a stream of tokens.
     * @param source - The source text to tokenize.
     * @yields - A generator for Symbols
     * @returns - A generator for Symbols
     * @throws - A SyntaxError if the source text contains an unexpected character.
     */
    *tokenize(source: string): Generator<Sym, Sym> {
        const entries = [...this.#symbolTable.entries()],
            // combine the regular expressions into a single expression
            skipPattern = this.#skipPatterns.map(p => p.source).join('|'),
            matchPattern = entries.map(([, [matcher,]]) => `(${matcher.source})`).join('|'),
            matcher = new RegExp(`(?:${skipPattern})*(?:${matchPattern})`, 'g');

        while (matcher.lastIndex < source.length) {
            const lastIndex = matcher.lastIndex, // save the lastIndex as it will be overwritten by the exec call on failure
                match = matcher.exec(source);
            if (match) {
                const [, ...matches] = match,
                    // find the index of the match with the longest length
                    index = matches.reduce((iMax, x, i, arr) => (x ?? '').length > (arr[iMax] ?? '').length ? i : iMax, 0),
                    // get the corresponding symbol for the longest match from entries
                    [, [, sym]] = entries[index];

                yield Object.assign(sym.clone(), { index: match.index, value: matches[index] });
            } else {
                throw new SyntaxError(`Unexpected character (${source[lastIndex]}) at index ${lastIndex}`);
            }
        }

        return Object.assign(new Sym('(EOF)', 0), { index: source.length });
    }
}