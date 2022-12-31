import { alt, empty, seq, deriv, char } from "../../regular-language/index.mjs"

describe('Balanced Parens', () => {

    // S = S(S) ∪ ε
    const S = alt(seq(() => S, '(', () => S, ')'), empty)

    test('Balanced Parens', () => {
        expect(S).toBeDefined()
    })
})