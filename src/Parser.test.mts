/*!
 * @license
 * Copyright (C) 2023 Final Hill LLC
 * SPDX-License-Identifier: AGPL-3.0-only
 * @see <https://spdx.org/licenses/AGPL-3.0-only.html>
 */

import { Parser } from './Parser.mjs';
import { Sym } from './Sym.mjs';

describe('Arithmetic Parser', () => {
    class ArithParser extends Parser {
        constructor() {
            super();

            this.prefix('+', 100);
            this.prefix('-', 100);

            this.group('(', ')');

            this.infix('+', 10);
            this.infix('-', 10);
            this.infix('*', 20);
            this.infix('/', 20);

            this.infixR('^', 30);

            this.postfix('!', 30);

            this.match('(number)', /\d+/, 0);

            this.skip(/\s/);
        }
    }

    test('Arithmetic tokenization', () => {
        const parser = new ArithParser(),
            source = '1+2*3^4-5/6',
            tokens = [...parser.tokenize(source)];

        expect(tokens.toString()).toBe([
            '((number) 1)',
            '(+ +)',
            '((number) 2)',
            '(* *)',
            '((number) 3)',
            '(^ ^)',
            '((number) 4)',
            '(- -)',
            '((number) 5)',
            '(/ /)',
            '((number) 6)'
        ].join(','));

        const sourceWithBadCharacter = '12+2*35-47/5%',
            t = (): Sym[] => [...parser.tokenize(sourceWithBadCharacter)];
        expect(t).toThrow(SyntaxError);
        expect(t).toThrow('Unexpected character (%) at index 12');

        const sourceWithSpaces = '1 + 2 * 3 ^ 4 - 5 / 6',
            tokens2 = [...parser.tokenize(sourceWithSpaces)];

        expect(tokens2.toString()).toBe([
            '((number) 1)',
            '(+ +)',
            '((number) 2)',
            '(* *)',
            '((number) 3)',
            '(^ ^)',
            '((number) 4)',
            '(- -)',
            '((number) 5)',
            '(/ /)',
            '((number) 6)'
        ].join(','));
    });

    test('Arithmetic parsing', () => {
        const parser = new ArithParser(),
            source = '1+2*(3^4)-5/6!',
            parsed = parser.parse(source);

        expect(parsed.toString()).toEqual('(- (+ ((number) 1) (* ((number) 2) (^ ((number) 3) ((number) 4)))) (/ ((number) 5) (! ((number) 6))))');
    });

});

describe('Arithmetic Eval', () => {
    class ArithParser extends Parser {
        constructor() {
            super();

            this.prefix('+', 100);
            this.prefix('-', 100);

            this.group('(', ')');

            this.infix('+', 10);
            this.infix('-', 10);
            this.infix('*', 20);
            this.infix('/', 20);

            this.infixR('^', 30);

            this.postfix('!', 30);

            this.match('(number)', /\d+/, 0);

            this.skip(/\s/);
        }

        // Add(left: number, right: number): number { return left + right; }
        // Neg(value: number): number { return -value; }
        // Pos(value: number): number { return value; }
        // Sub(left: number, right: number): number { return left - right; }
        // Mul(left: number, right: number): number { return left * right; }
        // Div(left: number, right: number): number { return left / right; }
        // Fact(value: number): number { return value; }
        // Pow(left: number, right: number): number { return Math.pow(left, right); }
    }
});