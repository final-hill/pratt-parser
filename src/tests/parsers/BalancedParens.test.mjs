import {
    alt, empty, equals, containsEmpty, isAlt, seq, height, matches, deriv
} from "../../regular-language/index.mjs"

describe('Balanced Parens', () => {
    // S = S(S) | ε
    const S = alt(seq(() => S, '(', () => S, ')'), empty)

    test('containsEmpty', () => {
        expect(containsEmpty(S)).toBe(true)
    })

    test('deriv', () => {
        // D[( S] = [D( S] ( S ) | [D( ε]]
        expect(equals(
            deriv(S, '('),
            alt(
                seq(
                    () => deriv(S, '('),
                    '(',
                    () => S,
                    ')'
                ),
                deriv(empty, '(')
            )
        )).toBe(true)
    })

    test('equals', () => {
        expect(equals(S, S)).toBe(true)
    })

    test('height', () => {
        expect(height(S)).toBe(5)
    })

    test('isAlt', () => {
        expect(isAlt(S)).toBe(true)
    })

    test('matches', () => {
        const e = ''
        expect(matches(S, e)).toBe(true)

        const parens = '()'
        expect(matches(S, parens)).toBe(true)

        const parens2 = '(()())'
        expect(matches(S, parens2)).toBe(true)

        const parens3 = '(())'
        expect(matches(S, parens3)).toBe(true)

        const parens4 = '()()()'
        expect(matches(S, parens4)).toBe(true)
    })

    test('unbalanced parens', () => {
        const parens = '('
        expect(matches(S, parens)).toBe(false)

        const parens2 = ')'
        expect(matches(S, parens2)).toBe(false)

        const parens3 = '(()'
        expect(matches(S, parens3)).toBe(false)

        const parens4 = '())'
        expect(matches(S, parens4)).toBe(false)

        const parens5 = '(()))'
        expect(matches(S, parens5)).toBe(false)
    })
})