import { alt, range, seq, plus, parse } from "../../index.mjs"

describe('Arithmetic', () => {
    // EXPR = EXPR+TERM | TERM
    const EXPR = alt(seq(() => EXPR, '+', () => TERM), () => TERM),
        // TERM = TERM*FACTOR | FACTOR
        TERM = alt(seq(() => TERM, '*', () => FACTOR), () => FACTOR),
        // FACTOR = (EXPR) | NUMBER
        FACTOR = alt(seq('(', () => EXPR, ')'), () => NUMBER),
        // NUMBER = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
        NUMBER = plus(range('0', '9'))

    test('parse', () => {
        const e = '1',
            p0 = parse(EXPR, e)
        expect([...p0].toString()).toEqual('1,')

        const en = '12',
            pn = parse(NUMBER, en)

        expect([...pn][0]).toEqual('1')
        expect([...pn][1]).toEqual('2')

        const e1 = '1+2',
            p1 = parse(EXPR, e1)
        expect(p1).toEqual(['+', '1', '2'])

        const e2 = '1+2*3'
        expect(parse(EXPR, e2)).toEqual(['+', '1', ['*', '2', '3']])

        const e3 = '(1+2)*3'
        expect(parse(EXPR, e3)).toEqual(['*', ['+', '1', '2'], '3'])

        const e4 = '(1+2)*(3+4)'
        expect(parse(EXPR, e4)).toEqual(['*', ['+', '1', '2'], ['+', '3', '4']])

        const e5 = '1+2*(3+4)'
        expect(parse(EXPR, e5)).toEqual(['+', '1', ['*', '2', ['+', '3', '4']]])
    })

    // test('matches', () => {
    //     const e1 = '1+2'
    //     expect(matches(EXPR, e1)).toBe(true)

    //     const e2 = '1+2*3'
    //     expect(matches(EXPR, e2)).toBe(true)

    //     const e3 = '(1+2)*3'
    //     expect(matches(EXPR, e3)).toBe(true)

    //     const e4 = '(1+2)*(3+4)'
    //     expect(matches(EXPR, e4)).toBe(true)

    //     const e5 = '1+2*(3+4)'
    //     expect(matches(EXPR, e5)).toBe(true)
    // })

    // test('does not match', () => {
    //     const e1 = '1+'
    //     expect(matches(EXPR, e1)).toBe(false)

    //     const e2 = '+2'
    //     expect(matches(EXPR, e2)).toBe(false)

    //     const e3 = '1+2*'
    //     expect(matches(EXPR, e3)).toBe(false)

    //     const e4 = '*3'
    //     expect(matches(EXPR, e4)).toBe(false)

    //     const e5 = '1+2*3+'
    //     expect(matches(EXPR, e5)).toBe(false)

    //     const e6 = '(1+2)*3+'
    //     expect(matches(EXPR, e6)).toBe(false)

    //     const e7 = '(1+2)*(3+4)+'
    //     expect(matches(EXPR, e7)).toBe(false)

    //     const e8 = '1+2*(3+4)+'
    //     expect(matches(EXPR, e8)).toBe(false)
    // })
})