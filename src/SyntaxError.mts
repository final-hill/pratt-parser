/*!
 * @license
 * Copyright (C) 2023 Final Hill LLC
 * SPDX-License-Identifier: AGPL-3.0-only
 * @see <https://spdx.org/licenses/AGPL-3.0-only.html>
 */

export class SyntaxError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'SyntaxError';
    }
}