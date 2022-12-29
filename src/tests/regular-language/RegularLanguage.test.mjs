
import {
    RegularLanguage, containsEmpty, deriv, equals, height, isAlt,
    isAny, isCat, isChar, isEmpty, isNil, isNot, isOpt, isPlus, isRange,
    isRep, isStar, isToken, matches, nilOrEmpty, simplify, toString
} from '../../regular-language/index.mjs'

describe('RegularLanguage', () => {
    const { Alt, Any, Cat, Char, Empty, Nil, Not, Opt, Plus, Range, Rep, Star, Token } = RegularLanguage

    test('containsEmpty', () => {
        expect(containsEmpty(Alt({ left: Char({ value: 'a' }), right: Char({ value: 'b' }) }))).toBe(false)
        expect(containsEmpty(Alt({ left: Char({ value: 'a' }), right: Empty }))).toBe(true)
        expect(containsEmpty(Alt({ left: Empty, right: Char({ value: 'a' }) }))).toBe(true)

        expect(containsEmpty(Any)).toBe(true)

        expect(containsEmpty(Cat({ first: Char({ value: 'a' }), second: Char({ value: 'b' }) }))).toBe(false)
        expect(containsEmpty(Cat({ first: Empty, second: Empty }))).toBe(true)
        expect(containsEmpty(Cat({ first: Star({ lang: Char({ value: 'a' }) }), second: Empty }))).toBe(true)
        expect(containsEmpty(Cat({ first: Empty, second: Any }))).toBe(true)

        expect(containsEmpty(Char({ value: 'a' }))).toBe(false)
        expect(containsEmpty(Empty)).toBe(true)
        expect(containsEmpty(Nil)).toBe(false)

        expect(containsEmpty(Not({ lang: Char({ value: 'a' }) }))).toBe(true)
        expect(containsEmpty(Not({ lang: Star({ lang: Char({ value: 'a' }) }) }))).toBe(false)
        expect(containsEmpty(Not({ lang: Any }))).toBe(false)
        expect(containsEmpty(Not({ lang: Empty }))).toBe(false)

        expect(containsEmpty(Opt({ lang: Char({ value: 'a' }) }))).toBe(true)
        expect(containsEmpty(Opt({ lang: Empty }))).toBe(true)

        expect(containsEmpty(Plus({ lang: Char({ value: 'a' }) }))).toBe(false)
        expect(containsEmpty(Plus({ lang: Empty }))).toBe(true)

        expect(containsEmpty(Range({ from: 'a', to: 'b' }))).toBe(false)

        expect(containsEmpty(Rep({ lang: Char({ value: 'a' }), n: 0 }))).toBe(true)
        expect(containsEmpty(Rep({ lang: Char({ value: 'a' }), n: 1 }))).toBe(false)

        expect(containsEmpty(Star({ lang: Char({ value: 'a' }) }))).toBe(true)
        expect(containsEmpty(Token({ value: 'a' }))).toBe(false)
    })
    test('deriv of non char throws', () => {
        expect(() => deriv(Char({ value: 'a' }), 1)).toThrow()
        expect(() => deriv(Char({ value: 'a' }), 'a')).not.toThrow()
        expect(() => deriv(Char({ value: 'a' }), 'abc')).toThrow()
        expect(() => deriv(Char({ value: 'a' }), true)).toThrow()
        expect(() => deriv(Char({ value: 'a' }), null)).toThrow()
        expect(() => deriv(Char({ value: 'a' }), undefined)).toThrow()
        expect(() => deriv(Char({ value: 'a' }), {})).toThrow()
        expect(() => deriv(Char({ value: 'a' }), [])).toThrow()
        expect(() => deriv(Char({ value: 'a' }), () => { })).toThrow()
    })
    test('deriv Alt', () => {
        // Dc(L1 ∪ L2) = Dc(L1) ∪ Dc(L2)
        expect(
            equals(
                deriv(Alt({ left: Char({ value: 'a' }), right: Char({ value: 'b' }) }), 'a'),
                Alt({ left: deriv(Char({ value: 'a' }), 'a'), right: deriv(Char({ value: 'b' }), 'a') })
            )
        ).toBe(true)
        expect(
            equals(
                deriv(Alt({ left: Char({ value: 'a' }), right: Char({ value: 'b' }) }), 'b'),
                Alt({ left: deriv(Char({ value: 'a' }), 'b'), right: deriv(Char({ value: 'b' }), 'b') })
            )
        ).toBe(true)
        expect(
            equals(
                deriv(Alt({ left: Char({ value: 'a' }), right: Char({ value: 'b' }) }), 'c'),
                Alt({ left: deriv(Char({ value: 'a' }), 'c'), right: deriv(Char({ value: 'b' }), 'c') })
            )
        ).toBe(true)
    })
    test('deriv Any', () => {
        // Dc(.) = ε
        expect(
            equals(
                deriv(Any, 'a'),
                Empty
            )
        ).toBe(true)
    })
    test('deriv Cat', () => {
        // Dc(L1◦L2) =  Dc(L1)◦L2           if ε ∉ L1
        //           =  Dc(L1)◦L2 ∪ Dc(L2)  if ε ∈ L1

        // Dc(L1◦L2) =  Dc(L1)◦L2
        const ab = Cat({ first: Char({ value: 'a' }), second: Char({ value: 'b' }) })
        expect(
            equals(
                deriv(ab, 'a'),
                Cat({ first: deriv(Char({ value: 'a' }), 'a'), second: Char({ value: 'b' }) })
            )
        ).toBe(true)
        expect(
            equals(
                deriv(ab, 'b'),
                Cat({ first: deriv(Char({ value: 'a' }), 'b'), second: Char({ value: 'b' }) })
            )
        ).toBe(true)
        expect(
            equals(
                deriv(ab, 'c'),
                Cat({ first: deriv(Char({ value: 'a' }), 'c'), second: Char({ value: 'b' }) })
            )
        ).toBe(true)
        // Dc(L1◦L2) =  Dc(L1)◦L2 ∪ Dc(L2)
        const eb = Cat({ first: Empty, second: Char({ value: 'b' }) })
        expect(
            equals(
                deriv(eb, 'a'),
                Alt({
                    left: Cat({ first: deriv(Empty, 'a'), second: Char({ value: 'b' }) }),
                    right: deriv(Char({ value: 'b' }), 'a')
                })
            )
        ).toBe(true)
    })
    test('deriv Char', () => {
        // Dc(c) = ε
        expect(
            equals(
                deriv(Char({ value: 'a' }), 'a'),
                Empty
            )
        ).toBe(true)
        // Dc(c') = ∅
        expect(
            equals(
                deriv(Char({ value: 'a' }), 'b'),
                Nil
            )
        ).toBe(true)
    })
    test('deriv Empty', () => {
        // Dc(ε) = ∅
        expect(
            equals(
                deriv(Empty, 'a'),
                Nil
            )
        ).toBe(true)
    })
    test('deriv Nil', () => {
        // Dc(∅) = ∅
        expect(
            equals(
                deriv(Nil, 'a'),
                Nil
            )
        ).toBe(true)
    })
    test('deriv Not', () => {
        const L = Char({ value: 'a' })
        // Dc(¬L) = ¬Dc(L)
        expect(
            equals(
                deriv(Not({ lang: L }), 'a'),
                Not({ lang: deriv(L, 'a') })
            )
        ).toBe(true)
        expect(
            equals(
                deriv(Not({ lang: L }), 'b'),
                Not({ lang: deriv(L, 'b') })
            )
        ).toBe(true)
    })
    test('deriv Opt', () => {
        // Dc(L?) = Dc(L ∪ ε)
        const L = Char({ value: 'a' })
        expect(
            equals(
                deriv(Opt({ lang: L }), 'a'),
                deriv(Alt({ left: L, right: Empty }), 'a')
            )
        ).toBe(true)
    })
    test('deriv Plus', () => {
        const L = Char({ value: 'a' })
        // Dc(L+) = Dc(L)◦L*
        expect(
            equals(
                deriv(Plus({ lang: L }), 'a'),
                Cat({ first: deriv(L, 'a'), second: Star({ lang: L }) })
            )
        ).toBe(true)
    })
    test('deriv Range', () => {
        // Dc([c-c]) = Dc(c)
        expect(
            equals(
                deriv(Range({ from: 'a', to: 'a' }), 'a'),
                deriv(Char({ value: 'a' }), 'a')
            )
        ).toBe(true)

        // Dc([a-z]) = Dc(c)
        expect(
            equals(
                deriv(Range({ from: 'a', to: 'z' }), 'c'),
                deriv(Char({ value: 'c' }), 'c')
            )
        ).toBe(true)

        // Dc([a-b]) = Dc(∅)
        expect(
            equals(
                deriv(Range({ from: 'a', to: 'b' }), 'c'),
                Nil
            )
        ).toBe(true)
    })
    test('deriv Rep', () => {
        const L = Char({ value: 'a' })

        // Dc(L{0}) = ε
        expect(
            equals(
                deriv(Rep({ lang: L, n: 0 }), 'a'),
                Empty
            )
        ).toBe(true)

        // Dc(L{1}) = Dc(L)
        expect(
            equals(
                deriv(Rep({ lang: L, n: 1 }), 'a'),
                deriv(L, 'a')
            )
        ).toBe(true)

        // Dc(L{n}) = Dc(L)◦L{n-1}
        expect(
            equals(
                deriv(Rep({ lang: L, n: 2 }), 'a'),
                Cat({ first: deriv(L, 'a'), second: Rep({ lang: L, n: 1 }) })
            )
        ).toBe(true)
    })
    test('deriv Star', () => {
        const L = Char({ value: 'a' })
        // Dc(L*) = Dc(L)◦L*
        expect(
            equals(
                deriv(Star({ lang: L }), 'a'),
                Cat({ first: deriv(L, 'a'), second: Star({ lang: L }) })
            )
        ).toBe(true)
    })
    test('deriv Token', () => {
        // Dc("") = Dc(ε)
        expect(
            equals(
                deriv(Token({ value: '' }), 'a'),
                deriv(Empty, 'a')
            )
        ).toBe(true)
        // Dc("c") = Dc(c)
        expect(
            equals(
                deriv(Token({ value: 'a' }), 'a'),
                deriv(Char({ value: 'a' }), 'a')
            )
        ).toBe(true)
        // Dc("abc") = Dc("a")◦"bc"
        expect(
            equals(
                deriv(Token({ value: 'abc' }), 'a'),
                Cat({ first: deriv(Token({ value: 'a' }), 'a'), second: Token({ value: 'bc' }) })
            )
        ).toBe(true)
    })
    test('equals', () => {
        // a | b = a | b
        expect(equals(Alt({ left: Char({ value: 'a' }), right: Char({ value: 'b' }) }), Alt({ left: Char({ value: 'a' }), right: Char({ value: 'b' }) }))).toBe(true)
        // a | b ≠ .
        expect(equals(Alt({ left: Char({ value: 'a' }), right: Char({ value: 'b' }) }), Any)).toBe(false)

        // . = .
        expect(equals(Any, Any)).toBe(true)
        // . ≠ a
        expect(equals(Any, Cat({ first: Char({ value: 'a' }), second: Char({ value: 'b' }) }))).toBe(false)

        // a◦b = a◦b
        expect(equals(Cat({ first: Char({ value: 'a' }), second: Char({ value: 'b' }) }), Cat({ first: Char({ value: 'a' }), second: Char({ value: 'b' }) }))).toBe(true)
        // a◦b ≠ a◦.
        expect(equals(Char({ value: 'a' }), Any)).toBe(false)

        // a = a
        expect(equals(Char({ value: 'a' }), Char({ value: 'a' }))).toBe(true)
        // a ≠ ε
        expect(equals(Char({ value: 'a' }), Empty)).toBe(false)

        // ε = ε
        expect(equals(Empty, Empty)).toBe(true)
        // ε ≠ ∅
        expect(equals(Empty, Nil)).toBe(false)

        // ∅ = ∅
        expect(equals(Nil, Nil)).toBe(true)
        // ∅ ≠ a
        expect(equals(Nil, Not({ lang: Char({ value: 'a' }) }))).toBe(false)

        // ¬a = ¬a
        expect(equals(Not({ lang: Char({ value: 'a' }) }), Not({ lang: Char({ value: 'a' }) }))).toBe(true)
        // ¬a ≠ [a-b]
        expect(equals(Not({ lang: Char({ value: 'a' }) }), Range({ from: 'a', to: 'b' }))).toBe(false)

        // a? = a?
        expect(equals(Opt({ lang: Char({ value: 'a' }) }), Opt({ lang: Char({ value: 'a' }) }))).toBe(true)
        // a? ≠ b?
        expect(equals(Opt({ lang: Char({ value: 'a' }) }), Opt({ lang: Char({ value: 'b' }) }))).toBe(false)

        // a+ = a+
        expect(equals(Plus({ lang: Char({ value: 'a' }) }), Plus({ lang: Char({ value: 'a' }) }))).toBe(true)
        // a+ ≠ a{1}
        expect(equals(Plus({ lang: Char({ value: 'a' }) }), Rep({ lang: Char({ value: 'a' }), n: 1 }))).toBe(false)

        // [a-b] = [a-b]
        expect(equals(Range({ from: 'a', to: 'b' }), Range({ from: 'a', to: 'b' }))).toBe(true)
        // [a-b] ≠ a{0}
        expect(equals(Range({ from: 'a', to: 'b' }), Rep({ lang: Char({ value: 'a' }), n: 0 }))).toBe(false)
        // [a-b] ≠ [b-a]
        expect(equals(Range({ from: 'a', to: 'b' }), Range({ from: 'b', to: 'a' }))).toBe(false)

        // a{0} = a{0}
        expect(equals(Rep({ lang: Char({ value: 'a' }), n: 0 }), Rep({ lang: Char({ value: 'a' }), n: 0 }))).toBe(true)
        // a{0} ≠ a*
        expect(equals(Rep({ lang: Char({ value: 'a' }), n: 0 }), Star({ lang: Char({ value: 'a' }) }))).toBe(false)

        // a* = a*
        expect(equals(Star({ lang: Char({ value: 'a' }) }), Star({ lang: Char({ value: 'a' }) }))).toBe(true)
        // a* ≠ a
        expect(equals(Star({ lang: Char({ value: 'a' }) }), Char({ value: 'a' }))).toBe(false)

        // abc = abc
        expect(equals(Token({ value: 'abc' }), Token({ value: 'abc' }))).toBe(true)
        // ab ≠ a|b
        expect(equals(Token({ value: 'ab' }), Alt({ left: Char({ value: 'a' }), right: Char({ value: 'b' }) }))).toBe(false)
    })
    test('height', () => {
        expect(height(Alt({ left: Char({ value: 'a' }), right: Char({ value: 'b' }) }))).toBe(2)
        expect(height(Any)).toBe(1)
        expect(height(Cat({ first: Char({ value: 'a' }), second: Char({ value: 'b' }) }))).toBe(2)
        expect(height(Char({ value: 'a' }))).toBe(1)
        expect(height(Empty)).toBe(1)
        expect(height(Nil)).toBe(1)
        expect(height(Not({ lang: Char({ value: 'a' }) }))).toBe(2)
        expect(height(Opt({ lang: Char({ value: 'a' }) }))).toBe(2)
        expect(height(Plus({ lang: Char({ value: 'a' }) }))).toBe(2)
        expect(height(Range({ from: 'a', to: 'b' }))).toBe(1)
        expect(height(Rep({ lang: Char({ value: 'a' }), n: 0 }))).toBe(2)
        expect(height(Star({ lang: Char({ value: 'a' }) }))).toBe(2)
        expect(height(Token({ value: 'a' }))).toBe(1)
        expect(height(Alt({
            left: Char({ value: 'a' }),
            right: Alt({ left: Char({ value: 'b' }), right: Char({ value: 'c' }) })
        }))).toBe(3)
    })
    test('isAlt', () => {
        expect(isAlt(Alt({ left: Char({ value: 'a' }), right: Char({ value: 'b' }) }))).toBe(true)
        expect(isAlt(Any)).toBe(false)
        expect(isAlt(Cat({ first: Char({ value: 'a' }), second: Char({ value: 'b' }) }))).toBe(false)
        expect(isAlt(Char({ value: 'a' }))).toBe(false)
        expect(isAlt(Empty)).toBe(false)
        expect(isAlt(Nil)).toBe(false)
        expect(isAlt(Not({ lang: Char({ value: 'a' }) }))).toBe(false)
        expect(isAlt(Opt({ lang: Char({ value: 'a' }) }))).toBe(false)
        expect(isAlt(Plus({ lang: Char({ value: 'a' }) }))).toBe(false)
        expect(isAlt(Range({ from: 'a', to: 'b' }))).toBe(false)
        expect(isAlt(Rep({ lang: Char({ value: 'a' }), n: 0 }))).toBe(false)
        expect(isAlt(Star({ lang: Char({ value: 'a' }) }))).toBe(false)
        expect(isAlt(Token({ value: 'a' }))).toBe(false)
    })
    test('isAny', () => {
        expect(isAny(Alt({ left: Char({ value: 'a' }), right: Char({ value: 'b' }) }))).toBe(false)
        expect(isAny(Any)).toBe(true)
        expect(isAny(Cat({ first: Char({ value: 'a' }), second: Char({ value: 'b' }) }))).toBe(false)
        expect(isAny(Char({ value: 'a' }))).toBe(false)
        expect(isAny(Empty)).toBe(false)
        expect(isAny(Nil)).toBe(false)
        expect(isAny(Not({ lang: Char({ value: 'a' }) }))).toBe(false)
        expect(isAny(Opt({ lang: Char({ value: 'a' }) }))).toBe(false)
        expect(isAny(Plus({ lang: Char({ value: 'a' }) }))).toBe(false)
        expect(isAny(Range({ from: 'a', to: 'b' }))).toBe(false)
        expect(isAny(Rep({ lang: Char({ value: 'a' }), n: 0 }))).toBe(false)
        expect(isAny(Star({ lang: Char({ value: 'a' }) }))).toBe(false)
        expect(isAny(Token({ value: 'a' }))).toBe(false)
    })
    test('isCat', () => {
        expect(isCat(Alt({ left: Char({ value: 'a' }), right: Char({ value: 'b' }) }))).toBe(false)
        expect(isCat(Any)).toBe(false)
        expect(isCat(Cat({ first: Char({ value: 'a' }), second: Char({ value: 'b' }) }))).toBe(true)
        expect(isCat(Char({ value: 'a' }))).toBe(false)
        expect(isCat(Empty)).toBe(false)
        expect(isCat(Nil)).toBe(false)
        expect(isCat(Not({ lang: Char({ value: 'a' }) }))).toBe(false)
        expect(isCat(Opt({ lang: Char({ value: 'a' }) }))).toBe(false)
        expect(isCat(Plus({ lang: Char({ value: 'a' }) }))).toBe(false)
        expect(isCat(Range({ from: 'a', to: 'b' }))).toBe(false)
        expect(isCat(Rep({ lang: Char({ value: 'a' }), n: 0 }))).toBe(false)
        expect(isCat(Star({ lang: Char({ value: 'a' }) }))).toBe(false)
        expect(isCat(Token({ value: 'a' }))).toBe(false)
    })
    test('isChar', () => {
        expect(isChar(Alt({ left: Char({ value: 'a' }), right: Char({ value: 'b' }) }))).toBe(false)
        expect(isChar(Any)).toBe(false)
        expect(isChar(Cat({ first: Char({ value: 'a' }), second: Char({ value: 'b' }) }))).toBe(false)
        expect(isChar(Char({ value: 'a' }))).toBe(true)
        expect(isChar(Empty)).toBe(false)
        expect(isChar(Nil)).toBe(false)
        expect(isChar(Not({ lang: Char({ value: 'a' }) }))).toBe(false)
        expect(isChar(Opt({ lang: Char({ value: 'a' }) }))).toBe(false)
        expect(isChar(Plus({ lang: Char({ value: 'a' }) }))).toBe(false)
        expect(isChar(Range({ from: 'a', to: 'b' }))).toBe(false)
        expect(isChar(Rep({ lang: Char({ value: 'a' }), n: 0 }))).toBe(false)
        expect(isChar(Star({ lang: Char({ value: 'a' }) }))).toBe(false)
        expect(isChar(Token({ value: 'a' }))).toBe(false)
    })
    test('isEmpty', () => {
        expect(isEmpty(Alt({ left: Char({ value: 'a' }), right: Char({ value: 'b' }) }))).toBe(false)
        expect(isEmpty(Any)).toBe(false)
        expect(isEmpty(Cat({ first: Char({ value: 'a' }), second: Char({ value: 'b' }) }))).toBe(false)
        expect(isEmpty(Char({ value: 'a' }))).toBe(false)
        expect(isEmpty(Empty)).toBe(true)
        expect(isEmpty(Nil)).toBe(false)
        expect(isEmpty(Not({ lang: Char({ value: 'a' }) }))).toBe(false)
        expect(isEmpty(Opt({ lang: Char({ value: 'a' }) }))).toBe(false)
        expect(isEmpty(Plus({ lang: Char({ value: 'a' }) }))).toBe(false)
        expect(isEmpty(Range({ from: 'a', to: 'b' }))).toBe(false)
        expect(isEmpty(Rep({ lang: Char({ value: 'a' }), n: 0 }))).toBe(false)
        expect(isEmpty(Star({ lang: Char({ value: 'a' }) }))).toBe(false)
        expect(isEmpty(Token({ value: 'a' }))).toBe(false)
    })
    test('isNil', () => {
        expect(isNil(Alt({ left: Char({ value: 'a' }), right: Char({ value: 'b' }) }))).toBe(false)
        expect(isNil(Any)).toBe(false)
        expect(isNil(Cat({ first: Char({ value: 'a' }), second: Char({ value: 'b' }) }))).toBe(false)
        expect(isNil(Char({ value: 'a' }))).toBe(false)
        expect(isNil(Empty)).toBe(false)
        expect(isNil(Nil)).toBe(true)
        expect(isNil(Not({ lang: Char({ value: 'a' }) }))).toBe(false)
        expect(isNil(Opt({ lang: Char({ value: 'a' }) }))).toBe(false)
        expect(isNil(Plus({ lang: Char({ value: 'a' }) }))).toBe(false)
        expect(isNil(Range({ from: 'a', to: 'b' }))).toBe(false)
        expect(isNil(Rep({ lang: Char({ value: 'a' }), n: 0 }))).toBe(false)
        expect(isNil(Star({ lang: Char({ value: 'a' }) }))).toBe(false)
        expect(isNil(Token({ value: 'a' }))).toBe(false)
    })
    test('isNot', () => {
        expect(isNot(Alt({ left: Char({ value: 'a' }), right: Char({ value: 'b' }) }))).toBe(false)
        expect(isNot(Any)).toBe(false)
        expect(isNot(Cat({ first: Char({ value: 'a' }), second: Char({ value: 'b' }) }))).toBe(false)
        expect(isNot(Char({ value: 'a' }))).toBe(false)
        expect(isNot(Empty)).toBe(false)
        expect(isNot(Nil)).toBe(false)
        expect(isNot(Not({ lang: Char({ value: 'a' }) }))).toBe(true)
        expect(isNot(Opt({ lang: Char({ value: 'a' }) }))).toBe(false)
        expect(isNot(Plus({ lang: Char({ value: 'a' }) }))).toBe(false)
        expect(isNot(Range({ from: 'a', to: 'b' }))).toBe(false)
        expect(isNot(Rep({ lang: Char({ value: 'a' }), n: 0 }))).toBe(false)
        expect(isNot(Star({ lang: Char({ value: 'a' }) }))).toBe(false)
        expect(isNot(Token({ value: 'a' }))).toBe(false)
    })
    test('isOpt', () => {
        expect(isOpt(Alt({ left: Char({ value: 'a' }), right: Char({ value: 'b' }) }))).toBe(false)
        expect(isOpt(Any)).toBe(false)
        expect(isOpt(Cat({ first: Char({ value: 'a' }), second: Char({ value: 'b' }) }))).toBe(false)
        expect(isOpt(Char({ value: 'a' }))).toBe(false)
        expect(isOpt(Empty)).toBe(false)
        expect(isOpt(Nil)).toBe(false)
        expect(isOpt(Not({ lang: Char({ value: 'a' }) }))).toBe(false)
        expect(isOpt(Opt({ lang: Char({ value: 'a' }) }))).toBe(true)
        expect(isOpt(Plus({ lang: Char({ value: 'a' }) }))).toBe(false)
        expect(isOpt(Range({ from: 'a', to: 'b' }))).toBe(false)
        expect(isOpt(Rep({ lang: Char({ value: 'a' }), n: 0 }))).toBe(false)
        expect(isOpt(Star({ lang: Char({ value: 'a' }) }))).toBe(false)
        expect(isOpt(Token({ value: 'a' }))).toBe(false)
    })
    test('isPlus', () => {
        expect(isPlus(Alt({ left: Char({ value: 'a' }), right: Char({ value: 'b' }) }))).toBe(false)
        expect(isPlus(Any)).toBe(false)
        expect(isPlus(Cat({ first: Char({ value: 'a' }), second: Char({ value: 'b' }) }))).toBe(false)
        expect(isPlus(Char({ value: 'a' }))).toBe(false)
        expect(isPlus(Empty)).toBe(false)
        expect(isPlus(Nil)).toBe(false)
        expect(isPlus(Not({ lang: Char({ value: 'a' }) }))).toBe(false)
        expect(isPlus(Opt({ lang: Char({ value: 'a' }) }))).toBe(false)
        expect(isPlus(Plus({ lang: Char({ value: 'a' }) }))).toBe(true)
        expect(isPlus(Range({ from: 'a', to: 'b' }))).toBe(false)
        expect(isPlus(Rep({ lang: Char({ value: 'a' }), n: 0 }))).toBe(false)
        expect(isPlus(Star({ lang: Char({ value: 'a' }) }))).toBe(false)
        expect(isPlus(Token({ value: 'a' }))).toBe(false)
    })
    test('isRange', () => {
        expect(isRange(Alt({ left: Char({ value: 'a' }), right: Char({ value: 'b' }) }))).toBe(false)
        expect(isRange(Any)).toBe(false)
        expect(isRange(Cat({ first: Char({ value: 'a' }), second: Char({ value: 'b' }) }))).toBe(false)
        expect(isRange(Char({ value: 'a' }))).toBe(false)
        expect(isRange(Empty)).toBe(false)
        expect(isRange(Nil)).toBe(false)
        expect(isRange(Not({ lang: Char({ value: 'a' }) }))).toBe(false)
        expect(isRange(Opt({ lang: Char({ value: 'a' }) }))).toBe(false)
        expect(isRange(Plus({ lang: Char({ value: 'a' }) }))).toBe(false)
        expect(isRange(Range({ from: 'a', to: 'b' }))).toBe(true)
        expect(isRange(Rep({ lang: Char({ value: 'a' }), n: 0 }))).toBe(false)
        expect(isRange(Star({ lang: Char({ value: 'a' }) }))).toBe(false)
        expect(isRange(Token({ value: 'a' }))).toBe(false)
    })
    test('isRep', () => {
        expect(isRep(Alt({ left: Char({ value: 'a' }), right: Char({ value: 'b' }) }))).toBe(false)
        expect(isRep(Any)).toBe(false)
        expect(isRep(Cat({ first: Char({ value: 'a' }), second: Char({ value: 'b' }) }))).toBe(false)
        expect(isRep(Char({ value: 'a' }))).toBe(false)
        expect(isRep(Empty)).toBe(false)
        expect(isRep(Nil)).toBe(false)
        expect(isRep(Not({ lang: Char({ value: 'a' }) }))).toBe(false)
        expect(isRep(Opt({ lang: Char({ value: 'a' }) }))).toBe(false)
        expect(isRep(Plus({ lang: Char({ value: 'a' }) }))).toBe(false)
        expect(isRep(Range({ from: 'a', to: 'b' }))).toBe(false)
        expect(isRep(Rep({ lang: Char({ value: 'a' }), n: 0 }))).toBe(true)
        expect(isRep(Star({ lang: Char({ value: 'a' }) }))).toBe(false)
        expect(isRep(Token({ value: 'a' }))).toBe(false)
    })
    test('isStar', () => {
        expect(isStar(Alt({ left: Char({ value: 'a' }), right: Char({ value: 'b' }) }))).toBe(false)
        expect(isStar(Any)).toBe(false)
        expect(isStar(Cat({ first: Char({ value: 'a' }), second: Char({ value: 'b' }) }))).toBe(false)
        expect(isStar(Char({ value: 'a' }))).toBe(false)
        expect(isStar(Empty)).toBe(false)
        expect(isStar(Nil)).toBe(false)
        expect(isStar(Not({ lang: Char({ value: 'a' }) }))).toBe(false)
        expect(isStar(Opt({ lang: Char({ value: 'a' }) }))).toBe(false)
        expect(isStar(Plus({ lang: Char({ value: 'a' }) }))).toBe(false)
        expect(isStar(Range({ from: 'a', to: 'b' }))).toBe(false)
        expect(isStar(Rep({ lang: Char({ value: 'a' }), n: 0 }))).toBe(false)
        expect(isStar(Star({ lang: Char({ value: 'a' }) }))).toBe(true)
        expect(isStar(Token({ value: 'a' }))).toBe(false)
    })
    test('isToken', () => {
        expect(isToken(Alt({ left: Char({ value: 'a' }), right: Char({ value: 'b' }) }))).toBe(false)
        expect(isToken(Any)).toBe(false)
        expect(isToken(Cat({ first: Char({ value: 'a' }), second: Char({ value: 'b' }) }))).toBe(false)
        expect(isToken(Char({ value: 'a' }))).toBe(false)
        expect(isToken(Empty)).toBe(false)
        expect(isToken(Nil)).toBe(false)
        expect(isToken(Not({ lang: Char({ value: 'a' }) }))).toBe(false)
        expect(isToken(Opt({ lang: Char({ value: 'a' }) }))).toBe(false)
        expect(isToken(Plus({ lang: Char({ value: 'a' }) }))).toBe(false)
        expect(isToken(Range({ from: 'a', to: 'b' }))).toBe(false)
        expect(isToken(Rep({ lang: Char({ value: 'a' }), n: 0 }))).toBe(false)
        expect(isToken(Star({ lang: Char({ value: 'a' }) }))).toBe(false)
        expect(isToken(Token({ value: 'a' }))).toBe(true)
    })
    test('matches', () => {
        // a|b matches "a"
        expect(matches(Alt({ left: Char({ value: 'a' }), right: Char({ value: 'b' }) }), 'a')).toBe(true)
        // a|b matches "b"
        expect(matches(Alt({ left: Char({ value: 'a' }), right: Char({ value: 'b' }) }), 'b')).toBe(true)
        // a|b does not match "c"
        expect(matches(Alt({ left: Char({ value: 'a' }), right: Char({ value: 'b' }) }), 'c')).toBe(false)
        // . matches "a"
        expect(matches(Any, 'a')).toBe(true)
        // a◦b matches "ab"
        expect(matches(Cat({ first: Char({ value: 'a' }), second: Char({ value: 'b' }) }), 'ab')).toBe(true)
        // a◦b does not match "a"
        expect(matches(Cat({ first: Char({ value: 'a' }), second: Char({ value: 'b' }) }), 'a')).toBe(false)
        // a matches "a"
        expect(matches(Char({ value: 'a' }), 'a')).toBe(true)
        // a does not match "b"
        expect(matches(Char({ value: 'a' }), 'b')).toBe(false)
        // ε matches ""
        expect(matches(Empty, '')).toBe(true)
        // ε does not match "a"
        expect(matches(Empty, 'a')).toBe(false)
        // ∅ does not match "b"
        expect(matches(Nil, 'b')).toBe(false)
        // ∅ does not match "a"
        expect(matches(Nil, 'a')).toBe(false)
        // ¬a does not match "a"
        expect(matches(Not({ lang: Char({ value: 'a' }) }), 'a')).toBe(false)
        // a+ matches "a"
        expect(matches(Plus({ lang: Char({ value: 'a' }) }), 'a')).toBe(true)
        // a+ matches "aa"
        expect(matches(Plus({ lang: Char({ value: 'a' }) }), 'aa')).toBe(true)
        // a+ does not match ""
        expect(matches(Plus({ lang: Char({ value: 'a' }) }), '')).toBe(false)
        // a? matches ""
        expect(matches(Opt({ lang: Char({ value: 'a' }) }), '')).toBe(true)
        // a? matches "a"
        expect(matches(Opt({ lang: Char({ value: 'a' }) }), 'a')).toBe(true)
        // a? does not match "b"
        expect(matches(Opt({ lang: Char({ value: 'a' }) }), 'b')).toBe(false)
        // ¬a matches "b"
        expect(matches(Not({ lang: Char({ value: 'a' }) }), 'b')).toBe(true)
        // [a-b] matches "a"
        expect(matches(Range({ from: 'a', to: 'b' }), 'a')).toBe(true)
        // [a-b] matches "b"
        expect(matches(Range({ from: 'a', to: 'b' }), 'b')).toBe(true)
        // [a-b] does not match "c"
        expect(matches(Range({ from: 'a', to: 'b' }), 'c')).toBe(false)
        // a{0} matches ""
        expect(matches(Rep({ lang: Char({ value: 'a' }), n: 0 }), '')).toBe(true)
        // a{0} does not match "a"
        expect(matches(Rep({ lang: Char({ value: 'a' }), n: 0 }), 'a')).toBe(false)
        // a{1} matches "a"
        expect(matches(Rep({ lang: Char({ value: 'a' }), n: 1 }), 'a')).toBe(true)
        // a{1} does not match "aa"
        expect(matches(Rep({ lang: Char({ value: 'a' }), n: 1 }), 'aa')).toBe(false)
        // a{2} matches "aa"
        expect(matches(Rep({ lang: Char({ value: 'a' }), n: 2 }), 'aa')).toBe(true)
        // a{1} does not match "a"
        expect(matches(Rep({ lang: Char({ value: 'a' }), n: 0 }), 'a')).toBe(false)
        // a* matches ""
        expect(matches(Star({ lang: Char({ value: 'a' }) }), '')).toBe(true)
        // a* matches "a"
        expect(matches(Star({ lang: Char({ value: 'a' }) }), 'a')).toBe(true)
        // a* matches "aa"
        expect(matches(Star({ lang: Char({ value: 'a' }) }), 'aa')).toBe(true)
        // "abc" matches "abc"
        expect(matches(Token({ value: 'abc' }), 'abc')).toBe(true)
        // "abc" does not match "ab"
        expect(matches(Token({ value: 'abc' }), 'ab')).toBe(false)
    })
    test('nilOrEmpty', () => {
        // δ(L1 ∪ L2) = δ(L1) ∪ δ(L2)
        expect(
            equals(
                nilOrEmpty(Alt({ left: Char({ value: 'a' }), right: Char({ value: 'b' }) })),
                Alt({ left: nilOrEmpty(Char({ value: 'a' })), right: nilOrEmpty(Char({ value: 'b' })) })
            )
        ).toBe(true)

        // δ(.) = ∅
        expect(equals(nilOrEmpty(Any), Nil)).toBe(true)

        // δ(L1◦L2) = δ(L1)◦δ(L2)
        expect(
            equals(
                nilOrEmpty(Cat({ first: Char({ value: 'a' }), second: Char({ value: 'b' }) })),
                Cat({ first: nilOrEmpty(Char({ value: 'a' })), second: nilOrEmpty(Char({ value: 'b' })) })
            )
        ).toBe(true)

        // δ(c) = ∅
        expect(equals(nilOrEmpty(Char({ value: 'a' })), Nil)).toBe(true)

        // δ(ε) = ε
        expect(equals(nilOrEmpty(Empty), Empty)).toBe(true)

        // δ(∅) = ∅
        expect(equals(nilOrEmpty(Nil), Nil)).toBe(true)

        // δ(¬P) = ε if δ(P) = ∅
        expect(equals(nilOrEmpty(Not({ lang: Nil })), Empty)).toBe(true)

        // δ(¬P) = ∅ if δ(P) = ε
        expect(equals(nilOrEmpty(Not({ lang: Empty })), Nil)).toBe(true)

        // δ(P?) = ε
        expect(equals(nilOrEmpty(Opt({ lang: Char({ value: 'a' }) })), Empty)).toBe(true)

        // δ([a-z]) = ∅
        expect(equals(nilOrEmpty(Range({ from: 'a', to: 'z' })), Nil)).toBe(true)

        // δ(L{0}) = ε
        expect(equals(nilOrEmpty(Rep({ lang: Char({ value: 'a' }), n: 0 })), Empty)).toBe(true)

        // δ(L{n}) = δ(L)
        expect(equals(
            nilOrEmpty(Rep({ lang: Char({ value: 'a' }), n: 1 })),
            nilOrEmpty(Char({ value: 'a' }))
        )).toBe(true)

        // δ(L*) = ε
        expect(equals(nilOrEmpty(Star({ lang: Char({ value: 'a' }) })), Empty)).toBe(true)

        // δ("abc") = ∅
        expect(equals(nilOrEmpty(Token({ value: 'abc' })), Nil)).toBe(true)
    })
    test('simplify', () => {
        // L ∪ L → L
        expect(equals(
            simplify(Alt({ left: Char({ value: 'a' }), right: Char({ value: 'a' }) })),
            Char({ value: 'a' })
        )).toBe(true)
        // M ∪ L → L ∪ M
        expect(equals(
            simplify(Alt({ left: Not({ lang: Char({ value: 'b' }) }), right: Char({ value: 'a' }) })),
            Alt({ left: Char({ value: 'a' }), right: Not({ lang: Char({ value: 'b' }) }) })
        )).toBe(true)
        // ∅ ∪ L → L
        expect(equals(
            simplify(Alt({ left: Nil, right: Char({ value: 'a' }) })),
            Char({ value: 'a' })
        )).toBe(true)
        // L ∪ ∅ → L
        expect(equals(
            simplify(Alt({ left: Char({ value: 'a' }), right: Nil })),
            Char({ value: 'a' })
        )).toBe(true)
        // (L ∪ M) ∪ N → L ∪ (M ∪ N)
        expect(equals(
            simplify(Alt({ left: Alt({ left: Char({ value: 'a' }), right: Char({ value: 'b' }) }), right: Char({ value: 'c' }) })),
            Alt({ left: Char({ value: 'a' }), right: Alt({ left: Char({ value: 'b' }), right: Char({ value: 'c' }) }) })
        )).toBe(true)
        // . → .
        expect(equals(
            simplify(Any),
            Any
        )).toBe(true)
        // PƐ → ƐP → P
        expect(equals(
            simplify(Cat({ first: Char({ value: 'a' }), second: Empty })),
            Char({ value: 'a' })
        )).toBe(true)
        expect(equals(
            simplify(Cat({ first: Empty, second: Char({ value: 'a' }) })),
            Char({ value: 'a' })
        )).toBe(true)
        // ∅P → P∅ → ∅
        expect(equals(
            simplify(Cat({ first: Nil, second: Char({ value: 'a' }) })),
            Nil
        )).toBe(true)
        expect(equals(
            simplify(Cat({ first: Char({ value: 'a' }), second: Nil })),
            Nil
        )).toBe(true)
        // c → c
        expect(equals(
            simplify(Char({ value: 'a' })),
            Char({ value: 'a' })
        )).toBe(true)
        // Ɛ → Ɛ
        expect(equals(
            simplify(Empty),
            Empty
        )).toBe(true)
        // ∅ → ∅
        expect(equals(
            simplify(Nil),
            Nil
        )).toBe(true)
        // ¬¬L → L
        expect(equals(
            simplify(Not({ lang: Not({ lang: Char({ value: 'a' }) }) })),
            Char({ value: 'a' })
        )).toBe(true)
        // L? → L?
        expect(equals(
            simplify(Opt({ lang: Char({ value: 'a' }) })),
            Opt({ lang: Char({ value: 'a' }) })
        )).toBe(true)
        // ∅? → Ɛ
        expect(equals(
            simplify(Opt({ lang: Nil })),
            Empty
        )).toBe(true)
        // L+ → L+
        expect(equals(
            simplify(Plus({ lang: Char({ value: 'a' }) })),
            Plus({ lang: Char({ value: 'a' }) })
        )).toBe(true)
        // ∅+ → ∅
        expect(equals(
            simplify(Plus({ lang: Nil })),
            Nil
        )).toBe(true)
        // [a-a] → a
        expect(equals(
            simplify(Range({ from: 'a', to: 'a' })),
            Char({ value: 'a' })
        )).toBe(true)
        // [a-b] → [a-b]
        expect(equals(
            simplify(Range({ from: 'a', to: 'b' })),
            Range({ from: 'a', to: 'b' })
        )).toBe(true)
        // L{0} → Ɛ
        expect(equals(
            simplify(Rep({ lang: Char({ value: 'a' }), n: 0 })),
            Empty
        )).toBe(true)
        // L{1} → L
        expect(equals(
            simplify(Rep({ lang: Char({ value: 'a' }), n: 1 })),
            Char({ value: 'a' })
        )).toBe(true)
        // L{∞} → L*
        expect(equals(
            simplify(Rep({ lang: Char({ value: 'a' }), n: Infinity })),
            Star({ lang: Char({ value: 'a' }) })
        )).toBe(true)
        // L{n} → L{n}
        expect(equals(
            simplify(Rep({ lang: Char({ value: 'a' }), n: 2 })),
            Rep({ lang: Char({ value: 'a' }), n: 2 })
        )).toBe(true)
        // ∅* → Ɛ
        expect(equals(
            simplify(Star({ lang: Nil })),
            Empty
        )).toBe(true)
        // L** → L*
        expect(equals(
            simplify(Star({ lang: Star({ lang: Char({ value: 'a' }) }) })),
            Star({ lang: Char({ value: 'a' }) })
        )).toBe(true)
        // Ɛ* → Ɛ
        expect(equals(
            simplify(Star({ lang: Empty })),
            Empty
        )).toBe(true)
        // "Foo" → "Foo"
        expect(equals(
            simplify(Token({ value: 'Foo' })),
            Token({ value: 'Foo' })
        )).toBe(true)
    })
    test('toString', () => {
        expect(toString(Alt({ left: Char({ value: 'a' }), right: Char({ value: 'b' }) }))).toBe('a|b')
        expect(toString(Any)).toBe('.')
        expect(toString(Cat({ first: Char({ value: 'a' }), second: Char({ value: 'b' }) }))).toBe('ab')
        expect(toString(Char({ value: 'a' }))).toBe('a')
        expect(toString(Empty)).toBe('ε')
        expect(toString(Nil)).toBe('∅')
        expect(toString(Not({ lang: Char({ value: 'a' }) }))).toBe('¬a')
        expect(toString(Plus({ lang: Char({ value: 'a' }) }))).toBe('a+')
        expect(toString(Range({ from: 'a', to: 'b' }))).toBe('[a-b]')
        expect(toString(Rep({ lang: Char({ value: 'a' }), n: 2 }))).toBe('a{2}')
        expect(toString(Star({ lang: Char({ value: 'a' }) }))).toBe('a*')
        expect(toString(Token({ value: 'Foo' }))).toBe('"Foo"')
    })
    test('hex matching', () => {
        // match 6 digit hex
        const hex = Alt({
            left: Range({ from: '0', to: '9' }),
            right: Range({ from: 'a', to: 'f' })
        }),
            hex6 = Rep({ lang: hex, n: 6 })
        expect(matches(hex6, '123456')).toBe(true)
        expect(matches(hex6, 'abcdef')).toBe(true)
        expect(matches(hex6, '123abc')).toBe(true)
        expect(matches(hex6, 'abc123')).toBe(true)
        expect(matches(hex6, 'cafebabe')).toBe(false)
        expect(matches(hex6, 'deadbeef')).toBe(false)
        expect(matches(hex6, '12345')).toBe(false)
        expect(matches(hex6, '1234567')).toBe(false)
        expect(matches(hex6, '12345g')).toBe(false)
    })
    test('zip matching', () => {
        // match 5 digit zip
        const digit = Range({ from: '0', to: '9' }),
            zip = Cat({
                first: Rep({ lang: digit, n: 5 }),
                second: Cat({
                    first: Char({ value: '-' }),
                    second: Rep({ lang: digit, n: 4 })
                })
            })
        expect(matches(zip, '12345-1234')).toBe(true)
        expect(matches(zip, '12345-123')).toBe(false)
        expect(matches(zip, '1234-1234')).toBe(false)
        expect(matches(zip, '12345-12345')).toBe(false)
    })
    test('credit card matching', () => {
        // match 16 digit credit card
        const digit = Range({ from: '0', to: '9' }),
            digit4 = Rep({ lang: digit, n: 4 }),
            component = Cat({
                first: digit4,
                second: Char({ value: '-' }),
            }),
            card = Cat({
                first: Rep({ lang: component, n: 3, }),
                second: digit4
            })

        expect(matches(card, '1234-1234-1234-1234')).toBe(true)
        expect(matches(card, '1234-1234-1234-123')).toBe(false)
        expect(matches(card, '1234-1234-1234-12345')).toBe(false)
        expect(matches(card, '1234-1234-1234-1234-1234')).toBe(false)
    })
})