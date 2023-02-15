/*!
 * @license
 * Copyright (C) 2023 Final Hill LLC
 * SPDX-License-Identifier: AGPL-3.0-only
 * @see <https://spdx.org/licenses/AGPL-3.0-only.html>
 */

/**
 * A symbol is a lexical unit of a source file.
 */
export class Sym {
    /**
     * The index of the symbol in the source file.
     */
    index = -1;
    /**
     * The value of the symbol.
     */
    value = '';

    children: Sym[] = [];

    /**
     * Constructs a symbol.
     * @param id - the name of the symbol
     * @param lbp - the left binding power of the symbol
     */
    constructor(
        readonly id: string,
        public lbp: number,
    ) { }

    clone(): Sym {
        return Object.assign(new Sym(this.id, this.lbp), {
            index: this.index,
            value: this.value,
            children: this.children
        },
            this.nud !== Sym.prototype.nud ? { nud: this.nud } : {},
            this.led !== Sym.prototype.led ? { led: this.led } : {}
        );
    }

    /**
     * The nud method is called when the symbol is the first token in an expression.
     */
    nud(): Sym {
        throw new SyntaxError(`Syntax Error: (${this.id})`);
    }

    /**
     * The led method is called when the symbol is the second token in an expression.
     * @param left - The left-hand side of the expression.
     */
    led(left: Sym): Sym {
        throw new SyntaxError(`Unknown operator: (${this.id})`);
    }

    /**
     * Converts the symbol to a string.
     * @returns - The symbol's string representation.
     */
    toString(): string {
        const { length } = this.children,
            id = this.id,
            value = length == 0 ? ` ${this.value}` : '',
            children = length == 0 ? '' : ` ${this.children.join(' ')}`;

        return `(${id}${value}${children})`;
    }
}
