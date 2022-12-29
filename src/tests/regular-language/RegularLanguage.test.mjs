
import {
    RegularLanguage, containsEmpty, deriv, equals, height, isAlt,
    isAny, isCat, isChar, isEmpty, isNil, isNot, isOpt, isPlus, isRange,
    isRep, isStar, isToken, matches, nilOrEmpty, simplify, toString
} from '../../regular-language/index.mjs'

describe('RegularLanguage', () => {
    const { Alt, Any, Cat, Char, Empty, Nil, Not, Opt, Plus, Range, Rep, Star, Token } = RegularLanguage

    test('containsEmpty', () => {
        expect(containsEmpty(Alt(Char('a'), Char('b')))).toBe(false)
        expect(containsEmpty(Alt(Char('a'), Empty))).toBe(true)
        expect(containsEmpty(Alt(Empty, Char('a')))).toBe(true)

        expect(containsEmpty(Any)).toBe(true)

        expect(containsEmpty(Cat(Char('a'), Char('b')))).toBe(false)
        expect(containsEmpty(Cat(Empty, Empty))).toBe(true)
        expect(containsEmpty(Cat(Star(Char('a')), Empty))).toBe(true)
        expect(containsEmpty(Cat(Empty, Any))).toBe(true)

        expect(containsEmpty(Char('a'))).toBe(false)
        expect(containsEmpty(Empty)).toBe(true)
        expect(containsEmpty(Nil)).toBe(false)

        expect(containsEmpty(Not(Char('a')))).toBe(true)
        expect(containsEmpty(Not(Star(Char('a'))))).toBe(false)
        expect(containsEmpty(Not(Any))).toBe(false)
        expect(containsEmpty(Not(Empty))).toBe(false)

        expect(containsEmpty(Opt(Char('a')))).toBe(true)
        expect(containsEmpty(Opt(Empty))).toBe(true)

        expect(containsEmpty(Plus(Char('a')))).toBe(false)
        expect(containsEmpty(Plus(Empty))).toBe(true)

        expect(containsEmpty(Range('a', 'b'))).toBe(false)

        expect(containsEmpty(Rep(Char('a'), 0))).toBe(true)
        expect(containsEmpty(Rep(Char('a'), 1))).toBe(false)

        expect(containsEmpty(Star(Char('a')))).toBe(true)
        expect(containsEmpty(Token('a'))).toBe(false)
    })
    test('deriv of non char throws', () => {
        expect(() => deriv(Char('a'), 1)).toThrow()
        expect(() => deriv(Char('a'), 'a')).not.toThrow()
        expect(() => deriv(Char('a'), 'abc')).toThrow()
        expect(() => deriv(Char('a'), true)).toThrow()
        expect(() => deriv(Char('a'), null)).toThrow()
        expect(() => deriv(Char('a'), undefined)).toThrow()
        expect(() => deriv(Char('a'), {})).toThrow()
        expect(() => deriv(Char('a'), [])).toThrow()
        expect(() => deriv(Char('a'), () => { })).toThrow()
    })
    test('deriv Alt', () => {
        // Dc(L1 ∪ L2) = Dc(L1) ∪ Dc(L2)
        expect(
            equals(
                deriv(Alt(Char('a'), Char('b')), 'a'),
                Alt(deriv(Char('a'), 'a'), deriv(Char('b'), 'a'))
            )
        ).toBe(true)
        expect(
            equals(
                deriv(Alt(Char('a'), Char('b')), 'b'),
                Alt(deriv(Char('a'), 'b'), deriv(Char('b'), 'b'))
            )
        ).toBe(true)
        expect(
            equals(
                deriv(Alt(Char('a'), Char('b')), 'c'),
                Alt(deriv(Char('a'), 'c'), deriv(Char('b'), 'c'))
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
        const ab = Cat(Char('a'), Char('b'))
        expect(
            equals(
                deriv(ab, 'a'),
                Cat(deriv(Char('a'), 'a'), Char('b'))
            )
        ).toBe(true)
        expect(
            equals(
                deriv(ab, 'b'),
                Cat(deriv(Char('a'), 'b'), Char('b'))
            )
        ).toBe(true)
        expect(
            equals(
                deriv(ab, 'c'),
                Cat(deriv(Char('a'), 'c'), Char('b'))
            )
        ).toBe(true)
        // Dc(L1◦L2) =  Dc(L1)◦L2 ∪ Dc(L2)
        const eb = Cat(Empty, Char('b'))
        expect(
            equals(
                deriv(eb, 'a'),
                Alt(
                    Cat(deriv(Empty, 'a'), Char('b')),
                    deriv(Char('b'), 'a')
                )
            )
        ).toBe(true)
    })
    test('deriv Char', () => {
        // Dc(c) = ε
        expect(
            equals(
                deriv(Char('a'), 'a'),
                Empty
            )
        ).toBe(true)
        // Dc(c') = ∅
        expect(
            equals(
                deriv(Char('a'), 'b'),
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
        const L = Char('a')
        // Dc(¬L) = ¬Dc(L)
        expect(
            equals(
                deriv(Not(L), 'a'),
                Not(deriv(L, 'a'))
            )
        ).toBe(true)
        expect(
            equals(
                deriv(Not(L), 'b'),
                Not(deriv(L, 'b'))
            )
        ).toBe(true)
    })
    test('deriv Opt', () => {
        // Dc(L?) = Dc(L ∪ ε)
        const L = Char('a')
        expect(
            equals(
                deriv(Opt(L), 'a'),
                deriv(Alt(L, Empty), 'a')
            )
        ).toBe(true)
    })
    test('deriv Plus', () => {
        const L = Char('a')
        // Dc(L+) = Dc(L)◦L*
        expect(
            equals(
                deriv(Plus(L), 'a'),
                Cat(deriv(L, 'a'), Star(L))
            )
        ).toBe(true)
    })
    test('deriv Range', () => {
        // Dc([c-c]) = Dc(c)
        expect(
            equals(
                deriv(Range('a', 'a'), 'a'),
                deriv(Char('a'), 'a')
            )
        ).toBe(true)

        // Dc([a-z]) = Dc(c)
        expect(
            equals(
                deriv(Range('a', 'z'), 'c'),
                deriv(Char('c'), 'c')
            )
        ).toBe(true)

        // Dc([a-b]) = Dc(∅)
        expect(
            equals(
                deriv(Range('a', 'b'), 'c'),
                Nil
            )
        ).toBe(true)
    })
    test('deriv Rep', () => {
        const L = Char('a')

        // Dc(L{0}) = ε
        expect(
            equals(
                deriv(Rep(L, 0), 'a'),
                Empty
            )
        ).toBe(true)

        // Dc(L{1}) = Dc(L)
        expect(
            equals(
                deriv(Rep(L, 1), 'a'),
                deriv(L, 'a')
            )
        ).toBe(true)

        // Dc(L{n}) = Dc(L)◦L{n-1}
        expect(
            equals(
                deriv(Rep(L, 2), 'a'),
                Cat(deriv(L, 'a'), Rep(L, 1))
            )
        ).toBe(true)
    })
    test('deriv Star', () => {
        const L = Char('a')
        // Dc(L*) = Dc(L)◦L*
        expect(
            equals(
                deriv(Star(L), 'a'),
                Cat(deriv(L, 'a'), Star(L))
            )
        ).toBe(true)
    })
    test('deriv Token', () => {
        // Dc("") = Dc(ε)
        expect(
            equals(
                deriv(Token(''), 'a'),
                deriv(Empty, 'a')
            )
        ).toBe(true)
        // Dc("c") = Dc(c)
        expect(
            equals(
                deriv(Token('a'), 'a'),
                deriv(Char('a'), 'a')
            )
        ).toBe(true)
        // Dc("abc") = Dc("a")◦"bc"
        expect(
            equals(
                deriv(Token('abc'), 'a'),
                Cat(deriv(Token('a'), 'a'), Token('bc'))
            )
        ).toBe(true)
    })
    test('equals', () => {
        // a | b = a | b
        expect(equals(Alt(Char('a'), Char('b')), Alt(Char('a'), Char('b')))).toBe(true)
        // a | b ≠ .
        expect(equals(Alt(Char('a'), Char('b')), Any)).toBe(false)

        // . = .
        expect(equals(Any, Any)).toBe(true)
        // . ≠ a
        expect(equals(Any, Cat(Char('a'), Char('b')))).toBe(false)

        // a◦b = a◦b
        expect(equals(Cat(Char('a'), Char('b')), Cat(Char('a'), Char('b')))).toBe(true)
        // a◦b ≠ a◦.
        expect(equals(Char('a'), Any)).toBe(false)

        // a = a
        expect(equals(Char('a'), Char('a'))).toBe(true)
        // a ≠ ε
        expect(equals(Char('a'), Empty)).toBe(false)

        // ε = ε
        expect(equals(Empty, Empty)).toBe(true)
        // ε ≠ ∅
        expect(equals(Empty, Nil)).toBe(false)

        // ∅ = ∅
        expect(equals(Nil, Nil)).toBe(true)
        // ∅ ≠ a
        expect(equals(Nil, Not(Char('a')))).toBe(false)

        // ¬a = ¬a
        expect(equals(Not(Char('a')), Not(Char('a')))).toBe(true)
        // ¬a ≠ [a-b]
        expect(equals(Not(Char('a')), Range('a', 'b'))).toBe(false)

        // a? = a?
        expect(equals(Opt(Char('a')), Opt(Char('a')))).toBe(true)
        // a? ≠ b?
        expect(equals(Opt(Char('a')), Opt(Char('b')))).toBe(false)

        // a+ = a+
        expect(equals(Plus(Char('a')), Plus(Char('a')))).toBe(true)
        // a+ ≠ a{1}
        expect(equals(Plus(Char('a')), Rep(Char('a'), 1))).toBe(false)

        // [a-b] = [a-b]
        expect(equals(Range('a', 'b'), Range('a', 'b'))).toBe(true)
        // [a-b] ≠ a{0}
        expect(equals(Range('a', 'b'), Rep(Char('a'), 0))).toBe(false)
        // [a-b] ≠ [b-a]
        expect(equals(Range('a', 'b'), Range('b', 'a'))).toBe(false)

        // a{0} = a{0}
        expect(equals(Rep(Char('a'), 0), Rep(Char('a'), 0))).toBe(true)
        // a{0} ≠ a*
        expect(equals(Rep(Char('a'), 0), Star(Char('a')))).toBe(false)

        // a* = a*
        expect(equals(Star(Char('a')), Star(Char('a')))).toBe(true)
        // a* ≠ a
        expect(equals(Star(Char('a')), Char('a'))).toBe(false)

        // abc = abc
        expect(equals(Token('abc'), Token('abc'))).toBe(true)
        // ab ≠ a|b
        expect(equals(Token('ab'), Alt(Char('a'), Char('b')))).toBe(false)
    })
    test('height', () => {
        expect(height(Alt(Char('a'), Char('b')))).toBe(2)
        expect(height(Any)).toBe(1)
        expect(height(Cat(Char('a'), Char('b')))).toBe(2)
        expect(height(Char('a'))).toBe(1)
        expect(height(Empty)).toBe(1)
        expect(height(Nil)).toBe(1)
        expect(height(Not(Char('a')))).toBe(2)
        expect(height(Opt(Char('a')))).toBe(2)
        expect(height(Plus(Char('a')))).toBe(2)
        expect(height(Range('a', 'b'))).toBe(1)
        expect(height(Rep(Char('a'), 0))).toBe(2)
        expect(height(Star(Char('a')))).toBe(2)
        expect(height(Token('a'))).toBe(1)
        expect(height(Alt(
            Char('a'),
            Alt(Char('b'), Char('c'))
        ))).toBe(3)
    })
    test('isAlt', () => {
        expect(isAlt(Alt(Char('a'), Char('b')))).toBe(true)
        expect(isAlt(Any)).toBe(false)
        expect(isAlt(Cat(Char('a'), Char('b')))).toBe(false)
        expect(isAlt(Char('a'))).toBe(false)
        expect(isAlt(Empty)).toBe(false)
        expect(isAlt(Nil)).toBe(false)
        expect(isAlt(Not(Char('a')))).toBe(false)
        expect(isAlt(Opt(Char('a')))).toBe(false)
        expect(isAlt(Plus(Char('a')))).toBe(false)
        expect(isAlt(Range('a', 'b'))).toBe(false)
        expect(isAlt(Rep(Char('a'), 0))).toBe(false)
        expect(isAlt(Star(Char('a')))).toBe(false)
        expect(isAlt(Token('a'))).toBe(false)
    })
    test('isAny', () => {
        expect(isAny(Alt(Char('a'), Char('b')))).toBe(false)
        expect(isAny(Any)).toBe(true)
        expect(isAny(Cat(Char('a'), Char('b')))).toBe(false)
        expect(isAny(Char('a'))).toBe(false)
        expect(isAny(Empty)).toBe(false)
        expect(isAny(Nil)).toBe(false)
        expect(isAny(Not(Char('a')))).toBe(false)
        expect(isAny(Opt(Char('a')))).toBe(false)
        expect(isAny(Plus(Char('a')))).toBe(false)
        expect(isAny(Range('a', 'b'))).toBe(false)
        expect(isAny(Rep(Char('a'), 0))).toBe(false)
        expect(isAny(Star(Char('a')))).toBe(false)
        expect(isAny(Token('a'))).toBe(false)
    })
    test('isCat', () => {
        expect(isCat(Alt(Char('a'), Char('b')))).toBe(false)
        expect(isCat(Any)).toBe(false)
        expect(isCat(Cat(Char('a'), Char('b')))).toBe(true)
        expect(isCat(Char('a'))).toBe(false)
        expect(isCat(Empty)).toBe(false)
        expect(isCat(Nil)).toBe(false)
        expect(isCat(Not(Char('a')))).toBe(false)
        expect(isCat(Opt(Char('a')))).toBe(false)
        expect(isCat(Plus(Char('a')))).toBe(false)
        expect(isCat(Range('a', 'b'))).toBe(false)
        expect(isCat(Rep(Char('a'), 0))).toBe(false)
        expect(isCat(Star(Char('a')))).toBe(false)
        expect(isCat(Token('a'))).toBe(false)
    })
    test('isChar', () => {
        expect(isChar(Alt(Char('a'), Char('b')))).toBe(false)
        expect(isChar(Any)).toBe(false)
        expect(isChar(Cat(Char('a'), Char('b')))).toBe(false)
        expect(isChar(Char('a'))).toBe(true)
        expect(isChar(Empty)).toBe(false)
        expect(isChar(Nil)).toBe(false)
        expect(isChar(Not(Char('a')))).toBe(false)
        expect(isChar(Opt(Char('a')))).toBe(false)
        expect(isChar(Plus(Char('a')))).toBe(false)
        expect(isChar(Range('a', 'b'))).toBe(false)
        expect(isChar(Rep(Char('a'), 0))).toBe(false)
        expect(isChar(Star(Char('a')))).toBe(false)
        expect(isChar(Token('a'))).toBe(false)
    })
    test('isEmpty', () => {
        expect(isEmpty(Alt(Char('a'), Char('b')))).toBe(false)
        expect(isEmpty(Any)).toBe(false)
        expect(isEmpty(Cat(Char('a'), Char('b')))).toBe(false)
        expect(isEmpty(Char('a'))).toBe(false)
        expect(isEmpty(Empty)).toBe(true)
        expect(isEmpty(Nil)).toBe(false)
        expect(isEmpty(Not(Char('a')))).toBe(false)
        expect(isEmpty(Opt(Char('a')))).toBe(false)
        expect(isEmpty(Plus(Char('a')))).toBe(false)
        expect(isEmpty(Range('a', 'b'))).toBe(false)
        expect(isEmpty(Rep(Char('a'), 0))).toBe(false)
        expect(isEmpty(Star(Char('a')))).toBe(false)
        expect(isEmpty(Token('a'))).toBe(false)
    })
    test('isNil', () => {
        expect(isNil(Alt(Char('a'), Char('b')))).toBe(false)
        expect(isNil(Any)).toBe(false)
        expect(isNil(Cat(Char('a'), Char('b')))).toBe(false)
        expect(isNil(Char('a'))).toBe(false)
        expect(isNil(Empty)).toBe(false)
        expect(isNil(Nil)).toBe(true)
        expect(isNil(Not(Char('a')))).toBe(false)
        expect(isNil(Opt(Char('a')))).toBe(false)
        expect(isNil(Plus(Char('a')))).toBe(false)
        expect(isNil(Range('a', 'b'))).toBe(false)
        expect(isNil(Rep(Char('a'), 0))).toBe(false)
        expect(isNil(Star(Char('a')))).toBe(false)
        expect(isNil(Token('a'))).toBe(false)
    })
    test('isNot', () => {
        expect(isNot(Alt(Char('a'), Char('b')))).toBe(false)
        expect(isNot(Any)).toBe(false)
        expect(isNot(Cat(Char('a'), Char('b')))).toBe(false)
        expect(isNot(Char('a'))).toBe(false)
        expect(isNot(Empty)).toBe(false)
        expect(isNot(Nil)).toBe(false)
        expect(isNot(Not(Char('a')))).toBe(true)
        expect(isNot(Opt(Char('a')))).toBe(false)
        expect(isNot(Plus(Char('a')))).toBe(false)
        expect(isNot(Range('a', 'b'))).toBe(false)
        expect(isNot(Rep(Char('a'), 0))).toBe(false)
        expect(isNot(Star(Char('a')))).toBe(false)
        expect(isNot(Token('a'))).toBe(false)
    })
    test('isOpt', () => {
        expect(isOpt(Alt(Char('a'), Char('b')))).toBe(false)
        expect(isOpt(Any)).toBe(false)
        expect(isOpt(Cat(Char('a'), Char('b')))).toBe(false)
        expect(isOpt(Char('a'))).toBe(false)
        expect(isOpt(Empty)).toBe(false)
        expect(isOpt(Nil)).toBe(false)
        expect(isOpt(Not(Char('a')))).toBe(false)
        expect(isOpt(Opt(Char('a')))).toBe(true)
        expect(isOpt(Plus(Char('a')))).toBe(false)
        expect(isOpt(Range('a', 'b'))).toBe(false)
        expect(isOpt(Rep(Char('a'), 0))).toBe(false)
        expect(isOpt(Star(Char('a')))).toBe(false)
        expect(isOpt(Token('a'))).toBe(false)
    })
    test('isPlus', () => {
        expect(isPlus(Alt(Char('a'), Char('b')))).toBe(false)
        expect(isPlus(Any)).toBe(false)
        expect(isPlus(Cat(Char('a'), Char('b')))).toBe(false)
        expect(isPlus(Char('a'))).toBe(false)
        expect(isPlus(Empty)).toBe(false)
        expect(isPlus(Nil)).toBe(false)
        expect(isPlus(Not(Char('a')))).toBe(false)
        expect(isPlus(Opt(Char('a')))).toBe(false)
        expect(isPlus(Plus(Char('a')))).toBe(true)
        expect(isPlus(Range('a', 'b'))).toBe(false)
        expect(isPlus(Rep(Char('a'), 0))).toBe(false)
        expect(isPlus(Star(Char('a')))).toBe(false)
        expect(isPlus(Token('a'))).toBe(false)
    })
    test('isRange', () => {
        expect(isRange(Alt(Char('a'), Char('b')))).toBe(false)
        expect(isRange(Any)).toBe(false)
        expect(isRange(Cat(Char('a'), Char('b')))).toBe(false)
        expect(isRange(Char('a'))).toBe(false)
        expect(isRange(Empty)).toBe(false)
        expect(isRange(Nil)).toBe(false)
        expect(isRange(Not(Char('a')))).toBe(false)
        expect(isRange(Opt(Char('a')))).toBe(false)
        expect(isRange(Plus(Char('a')))).toBe(false)
        expect(isRange(Range('a', 'b'))).toBe(true)
        expect(isRange(Rep(Char('a'), 0))).toBe(false)
        expect(isRange(Star(Char('a')))).toBe(false)
        expect(isRange(Token('a'))).toBe(false)
    })
    test('isRep', () => {
        expect(isRep(Alt(Char('a'), Char('b')))).toBe(false)
        expect(isRep(Any)).toBe(false)
        expect(isRep(Cat(Char('a'), Char('b')))).toBe(false)
        expect(isRep(Char('a'))).toBe(false)
        expect(isRep(Empty)).toBe(false)
        expect(isRep(Nil)).toBe(false)
        expect(isRep(Not(Char('a')))).toBe(false)
        expect(isRep(Opt(Char('a')))).toBe(false)
        expect(isRep(Plus(Char('a')))).toBe(false)
        expect(isRep(Range('a', 'b'))).toBe(false)
        expect(isRep(Rep(Char('a'), 0))).toBe(true)
        expect(isRep(Star(Char('a')))).toBe(false)
        expect(isRep(Token('a'))).toBe(false)
    })
    test('isStar', () => {
        expect(isStar(Alt(Char('a'), Char('b')))).toBe(false)
        expect(isStar(Any)).toBe(false)
        expect(isStar(Cat(Char('a'), Char('b')))).toBe(false)
        expect(isStar(Char('a'))).toBe(false)
        expect(isStar(Empty)).toBe(false)
        expect(isStar(Nil)).toBe(false)
        expect(isStar(Not(Char('a')))).toBe(false)
        expect(isStar(Opt(Char('a')))).toBe(false)
        expect(isStar(Plus(Char('a')))).toBe(false)
        expect(isStar(Range('a', 'b'))).toBe(false)
        expect(isStar(Rep(Char('a'), 0))).toBe(false)
        expect(isStar(Star(Char('a')))).toBe(true)
        expect(isStar(Token('a'))).toBe(false)
    })
    test('isToken', () => {
        expect(isToken(Alt(Char('a'), Char('b')))).toBe(false)
        expect(isToken(Any)).toBe(false)
        expect(isToken(Cat(Char('a'), Char('b')))).toBe(false)
        expect(isToken(Char('a'))).toBe(false)
        expect(isToken(Empty)).toBe(false)
        expect(isToken(Nil)).toBe(false)
        expect(isToken(Not(Char('a')))).toBe(false)
        expect(isToken(Opt(Char('a')))).toBe(false)
        expect(isToken(Plus(Char('a')))).toBe(false)
        expect(isToken(Range('a', 'b'))).toBe(false)
        expect(isToken(Rep(Char('a'), 0))).toBe(false)
        expect(isToken(Star(Char('a')))).toBe(false)
        expect(isToken(Token('a'))).toBe(true)
    })
    test('matches', () => {
        // a|b matches "a"
        expect(matches(Alt(Char('a'), Char('b')), 'a')).toBe(true)
        // a|b matches "b"
        expect(matches(Alt(Char('a'), Char('b')), 'b')).toBe(true)
        // a|b does not match "c"
        expect(matches(Alt(Char('a'), Char('b')), 'c')).toBe(false)
        // . matches "a"
        expect(matches(Any, 'a')).toBe(true)
        // a◦b matches "ab"
        expect(matches(Cat(Char('a'), Char('b')), 'ab')).toBe(true)
        // a◦b does not match "a"
        expect(matches(Cat(Char('a'), Char('b')), 'a')).toBe(false)
        // a matches "a"
        expect(matches(Char('a'), 'a')).toBe(true)
        // a does not match "b"
        expect(matches(Char('a'), 'b')).toBe(false)
        // ε matches ""
        expect(matches(Empty, '')).toBe(true)
        // ε does not match "a"
        expect(matches(Empty, 'a')).toBe(false)
        // ∅ does not match "b"
        expect(matches(Nil, 'b')).toBe(false)
        // ∅ does not match "a"
        expect(matches(Nil, 'a')).toBe(false)
        // ¬a does not match "a"
        expect(matches(Not(Char('a')), 'a')).toBe(false)
        // a+ matches "a"
        expect(matches(Plus(Char('a')), 'a')).toBe(true)
        // a+ matches "aa"
        expect(matches(Plus(Char('a')), 'aa')).toBe(true)
        // a+ does not match ""
        expect(matches(Plus(Char('a')), '')).toBe(false)
        // a? matches ""
        expect(matches(Opt(Char('a')), '')).toBe(true)
        // a? matches "a"
        expect(matches(Opt(Char('a')), 'a')).toBe(true)
        // a? does not match "b"
        expect(matches(Opt(Char('a')), 'b')).toBe(false)
        // ¬a matches "b"
        expect(matches(Not(Char('a')), 'b')).toBe(true)
        // [a-b] matches "a"
        expect(matches(Range('a', 'b'), 'a')).toBe(true)
        // [a-b] matches "b"
        expect(matches(Range('a', 'b'), 'b')).toBe(true)
        // [a-b] does not match "c"
        expect(matches(Range('a', 'b'), 'c')).toBe(false)
        // a{0} matches ""
        expect(matches(Rep(Char('a'), 0), '')).toBe(true)
        // a{0} does not match "a"
        expect(matches(Rep(Char('a'), 0), 'a')).toBe(false)
        // a{1} matches "a"
        expect(matches(Rep(Char('a'), 1), 'a')).toBe(true)
        // a{1} does not match "aa"
        expect(matches(Rep(Char('a'), 1), 'aa')).toBe(false)
        // a{2} matches "aa"
        expect(matches(Rep(Char('a'), 2), 'aa')).toBe(true)
        // a{1} does not match "a"
        expect(matches(Rep(Char('a'), 0), 'a')).toBe(false)
        // a* matches ""
        expect(matches(Star(Char('a')), '')).toBe(true)
        // a* matches "a"
        expect(matches(Star(Char('a')), 'a')).toBe(true)
        // a* matches "aa"
        expect(matches(Star(Char('a')), 'aa')).toBe(true)
        // "abc" matches "abc"
        expect(matches(Token('abc'), 'abc')).toBe(true)
        // "abc" does not match "ab"
        expect(matches(Token('abc'), 'ab')).toBe(false)
    })
    test('nilOrEmpty', () => {
        // δ(L1 ∪ L2) = δ(L1) ∪ δ(L2)
        expect(
            equals(
                nilOrEmpty(Alt(Char('a'), Char('b'))),
                Alt(nilOrEmpty(Char('a')), nilOrEmpty(Char('b')))
            )
        ).toBe(true)

        // δ(.) = ∅
        expect(equals(nilOrEmpty(Any), Nil)).toBe(true)

        // δ(L1◦L2) = δ(L1)◦δ(L2)
        expect(
            equals(
                nilOrEmpty(Cat(Char('a'), Char('b'))),
                Cat(nilOrEmpty(Char('a')), nilOrEmpty(Char('b')))
            )
        ).toBe(true)

        // δ(c) = ∅
        expect(equals(nilOrEmpty(Char('a')), Nil)).toBe(true)

        // δ(ε) = ε
        expect(equals(nilOrEmpty(Empty), Empty)).toBe(true)

        // δ(∅) = ∅
        expect(equals(nilOrEmpty(Nil), Nil)).toBe(true)

        // δ(¬P) = ε if δ(P) = ∅
        expect(equals(nilOrEmpty(Not(Nil)), Empty)).toBe(true)

        // δ(¬P) = ∅ if δ(P) = ε
        expect(equals(nilOrEmpty(Not(Empty)), Nil)).toBe(true)

        // δ(P?) = ε
        expect(equals(nilOrEmpty(Opt(Char('a'))), Empty)).toBe(true)

        // δ([a-z]) = ∅
        expect(equals(nilOrEmpty(Range('a', 'z')), Nil)).toBe(true)

        // δ(L{0}) = ε
        expect(equals(nilOrEmpty(Rep(Char('a'), 0)), Empty)).toBe(true)

        // δ(L{n}) = δ(L)
        expect(equals(
            nilOrEmpty(Rep(Char('a'), 1)),
            nilOrEmpty(Char('a'))
        )).toBe(true)

        // δ(L*) = ε
        expect(equals(nilOrEmpty(Star(Char('a'))), Empty)).toBe(true)

        // δ("abc") = ∅
        expect(equals(nilOrEmpty(Token('abc')), Nil)).toBe(true)
    })
    test('simplify', () => {
        // L ∪ L → L
        expect(equals(
            simplify(Alt(Char('a'), Char('a'))),
            Char('a')
        )).toBe(true)
        // M ∪ L → L ∪ M
        expect(equals(
            simplify(Alt(Not(Char('b')), Char('a'))),
            Alt(Char('a'), Not(Char('b')))
        )).toBe(true)
        // ∅ ∪ L → L
        expect(equals(
            simplify(Alt(Nil, Char('a'))),
            Char('a')
        )).toBe(true)
        // L ∪ ∅ → L
        expect(equals(
            simplify(Alt(Char('a'), Nil)),
            Char('a')
        )).toBe(true)
        // (L ∪ M) ∪ N → L ∪ (M ∪ N)
        expect(equals(
            simplify(Alt(Alt(Char('a'), Char('b')), Char('c'))),
            Alt(Char('a'), Alt(Char('b'), Char('c')))
        )).toBe(true)
        // . → .
        expect(equals(
            simplify(Any),
            Any
        )).toBe(true)
        // PƐ → ƐP → P
        expect(equals(
            simplify(Cat(Char('a'), Empty)),
            Char('a')
        )).toBe(true)
        expect(equals(
            simplify(Cat(Empty, Char('a'))),
            Char('a')
        )).toBe(true)
        // ∅P → P∅ → ∅
        expect(equals(
            simplify(Cat(Nil, Char('a'))),
            Nil
        )).toBe(true)
        expect(equals(
            simplify(Cat(Char('a'), Nil)),
            Nil
        )).toBe(true)
        // c → c
        expect(equals(
            simplify(Char('a')),
            Char('a')
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
            simplify(Not(Not(Char('a')))),
            Char('a')
        )).toBe(true)
        // L? → L?
        expect(equals(
            simplify(Opt(Char('a'))),
            Opt(Char('a'))
        )).toBe(true)
        // ∅? → Ɛ
        expect(equals(
            simplify(Opt(Nil)),
            Empty
        )).toBe(true)
        // L+ → L+
        expect(equals(
            simplify(Plus(Char('a'))),
            Plus(Char('a'))
        )).toBe(true)
        // ∅+ → ∅
        expect(equals(
            simplify(Plus(Nil)),
            Nil
        )).toBe(true)
        // [a-a] → a
        expect(equals(
            simplify(Range('a', 'a')),
            Char('a')
        )).toBe(true)
        // [a-b] → [a-b]
        expect(equals(
            simplify(Range('a', 'b')),
            Range('a', 'b')
        )).toBe(true)
        // L{0} → Ɛ
        expect(equals(
            simplify(Rep(Char('a'), 0)),
            Empty
        )).toBe(true)
        // L{1} → L
        expect(equals(
            simplify(Rep(Char('a'), 1)),
            Char('a')
        )).toBe(true)
        // L{∞} → L*
        expect(equals(
            simplify(Rep(Char('a'), Infinity)),
            Star(Char('a'))
        )).toBe(true)
        // L{n} → L{n}
        expect(equals(
            simplify(Rep(Char('a'), 2)),
            Rep(Char('a'), 2)
        )).toBe(true)
        // ∅* → Ɛ
        expect(equals(
            simplify(Star(Nil)),
            Empty
        )).toBe(true)
        // L** → L*
        expect(equals(
            simplify(Star(Star(Char('a')))),
            Star(Char('a'))
        )).toBe(true)
        // Ɛ* → Ɛ
        expect(equals(
            simplify(Star(Empty)),
            Empty
        )).toBe(true)
        // "Foo" → "Foo"
        expect(equals(
            simplify(Token('Foo')),
            Token('Foo')
        )).toBe(true)
    })
    test('toString', () => {
        expect(toString(Alt(Char('a'), Char('b')))).toBe('a|b')
        expect(toString(Any)).toBe('.')
        expect(toString(Cat(Char('a'), Char('b')))).toBe('ab')
        expect(toString(Char('a'))).toBe('a')
        expect(toString(Empty)).toBe('ε')
        expect(toString(Nil)).toBe('∅')
        expect(toString(Not(Char('a')))).toBe('¬a')
        expect(toString(Plus(Char('a')))).toBe('a+')
        expect(toString(Range('a', 'b'))).toBe('[a-b]')
        expect(toString(Rep(Char('a'), 2))).toBe('a{2}')
        expect(toString(Star(Char('a')))).toBe('a*')
        expect(toString(Token('Foo'))).toBe('"Foo"')
    })
    test('hex matching', () => {
        // match 6 digit hex
        const hex = Alt(
            Range('0', '9'),
            Range('a', 'f')
        ),
            hex6 = Rep(hex, 6)
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
        const digit = Range('0', '9'),
            zip = Cat(
                Rep(digit, 5),
                Cat(
                    Char('-'),
                    Rep(digit, 4)
                )
            )
        expect(matches(zip, '12345-1234')).toBe(true)
        expect(matches(zip, '12345-123')).toBe(false)
        expect(matches(zip, '1234-1234')).toBe(false)
        expect(matches(zip, '12345-12345')).toBe(false)
    })
    test('credit card matching', () => {
        // match 16 digit credit card
        const digit = Range('0', '9'),
            digit4 = Rep(digit, 4),
            component = Cat(digit4, Char('-')),
            card = Cat(
                Rep(component, 3),
                digit4
            )

        expect(matches(card, '1234-1234-1234-1234')).toBe(true)
        expect(matches(card, '1234-1234-1234-123')).toBe(false)
        expect(matches(card, '1234-1234-1234-12345')).toBe(false)
        expect(matches(card, '1234-1234-1234-1234-1234')).toBe(false)
    })
})