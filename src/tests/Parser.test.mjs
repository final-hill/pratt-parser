import {
    alt, any, char, empty, nil, not, opt, plus, range, rep, seq, star, token,
    containsEmpty, deriv, equals, height, isAlt, isAny, isSeq, isChar, isEmpty, isNil,
    isNot, isRange, isRep, isStar, isToken, matches, simplify, toString
} from '../index.mjs'

describe('Parser', () => {
    test('containsEmpty', () => {
        expect(containsEmpty(alt('a', 'b'))).toBe(false)
        expect(containsEmpty(alt('a', empty))).toBe(true)
        expect(containsEmpty(alt(empty, 'a'))).toBe(true)

        expect(containsEmpty(any)).toBe(true)

        expect(containsEmpty(char('a'))).toBe(false)
        expect(containsEmpty(empty)).toBe(true)
        expect(containsEmpty(nil)).toBe(false)

        expect(containsEmpty(not('a'))).toBe(true)
        expect(containsEmpty(not(star('a')))).toBe(false)
        expect(containsEmpty(not(any))).toBe(false)
        expect(containsEmpty(not(empty))).toBe(false)

        expect(containsEmpty(opt('a'))).toBe(true)
        expect(containsEmpty(opt(empty))).toBe(true)

        expect(containsEmpty(plus('a'))).toBe(false)
        expect(containsEmpty(plus(empty))).toBe(true)

        expect(containsEmpty(range('a', 'b'))).toBe(false)

        expect(containsEmpty(rep('a', 0))).toBe(true)
        expect(containsEmpty(rep('a', 1))).toBe(false)

        expect(containsEmpty(seq('a', 'b'))).toBe(false)
        expect(containsEmpty(seq(empty, empty))).toBe(true)
        expect(containsEmpty(seq(star('a'), empty))).toBe(true)
        expect(containsEmpty(seq(empty, any))).toBe(true)

        expect(containsEmpty(star('a'))).toBe(true)

        expect(containsEmpty(token('abc'))).toBe(false)
    })
    test('deriv alt', () => {
        // Dc(P1 ∪ P2) = Dc(P1) ∪ Dc(P2)
        expect(
            equals(
                deriv(alt('a', 'b'), 'a'),
                alt(deriv(char('a'), 'a'), deriv(char('b'), 'a'))
            )
        ).toBe(true)
        expect(
            equals(
                deriv(alt('a', 'b'), 'b'),
                alt(deriv(char('a'), 'b'), deriv(char('b'), 'b'))
            )
        ).toBe(true)
        expect(
            equals(
                deriv(alt('a', 'b'), 'c'),
                alt(deriv(char('a'), 'c'), deriv(char('b'), 'c'))
            )
        ).toBe(true)
    })
    test('deriv any', () => {
        // Dc(.) = ε
        expect(
            equals(deriv(any, 'a'), empty)
        ).toBe(true)
    })
    test('deriv seq', () => {
        // Dc(P1◦P2) =  Dc(P1)◦P2           if ε ∉ P1
        //           =  Dc(P1)◦P2 ∪ Dc(P2)  if ε ∈ P1

        // Dc(P1◦P2) =  Dc(P1)◦P2
        const ab = seq('a', 'b')
        expect(
            equals(deriv(ab, 'a'), seq(deriv(char('a'), 'a'), 'b'))
        ).toBe(true)
        expect(
            equals(deriv(ab, 'b'), seq(deriv(char('a'), 'b'), 'b'))
        ).toBe(true)
        expect(
            equals(deriv(ab, 'c'), seq(deriv(char('a'), 'c'), 'b'))
        ).toBe(true)
        // Dc(P1◦P2) =  Dc(P1)◦P2 ∪ Dc(P2)
        const eb = seq(empty, 'b')
        expect(
            equals(deriv(eb, 'a'),
                alt(seq(deriv(empty, 'a'), 'b'), deriv(char('b'), 'a'))
            )
        ).toBe(true)
    })
    test('deriv char', () => {
        // Dc(c) = ε
        expect(
            equals(deriv(char('a'), 'a'), empty)
        ).toBe(true)
        // Dc(c') = ∅
        expect(
            equals(deriv(char('a'), 'b'), nil)
        ).toBe(true)
    })
    test('deriv empty', () => {
        // Dc(ε) = ∅
        expect(
            equals(deriv(empty, 'a'), nil)
        ).toBe(true)
    })
    test('deriv nil', () => {
        // Dc(∅) = ∅
        expect(
            equals(deriv(nil, 'a'), nil)
        ).toBe(true)
    })
    test('deriv not', () => {
        const P = char('a')
        // Dc(¬P) = ¬Dc(P)
        expect(
            equals(deriv(not(P), 'a'), not(deriv(P, 'a')))
        ).toBe(true)
        expect(
            equals(deriv(not(P), 'b'), not(deriv(P, 'b')))
        ).toBe(true)
    })
    test('deriv opt', () => {
        // Dc(P?) = Dc(P ∪ ε)
        const P = char('a')
        expect(
            equals(deriv(opt(P), 'a'), deriv(alt(P, empty), 'a'))
        ).toBe(true)
    })
    test('deriv plus', () => {
        const P = char('a')
        // Dc(P+) = Dc(P)◦P*
        expect(
            equals(deriv(plus(P), 'a'), seq(deriv(P, 'a'), star(P)))
        ).toBe(true)
    })
    test('deriv range', () => {
        // Dc([c-c]) = Dc(c)
        expect(
            equals(deriv(range('a', 'a'), 'a'), deriv(char('a'), 'a'))
        ).toBe(true)

        // Dc([a-z]) = Dc(c)
        expect(
            equals(deriv(range('a', 'z'), 'c'), deriv(char('c'), 'c'))
        ).toBe(true)

        // Dc([a-b]) = Dc(∅)
        expect(
            equals(deriv(range('a', 'b'), 'c'), nil)
        ).toBe(true)
    })
    test('deriv rep', () => {
        const P = char('a')

        // Dc(P{0}) = ε
        expect(
            equals(deriv(rep(P, 0), 'a'), empty)
        ).toBe(true)

        // Dc(P{1}) = Dc(P)
        expect(
            equals(deriv(rep(P, 1), 'a'), deriv(P, 'a'))
        ).toBe(true)

        // Dc(P{n}) = Dc(P)◦P{n-1}
        expect(
            equals(deriv(rep(P, 2), 'a'), seq(deriv(P, 'a'), rep(P, 1)))
        ).toBe(true)
    })
    test('deriv star', () => {
        const P = char('a')
        // Dc(P*) = Dc(P)◦P*
        expect(
            equals(deriv(star(P), 'a'), seq(deriv(P, 'a'), star(P)))
        ).toBe(true)
    })
    test('deriv token', () => {
        // Dc("") = Dc(ε)
        expect(
            equals(deriv(token(''), 'a'), deriv(empty, 'a'))
        ).toBe(true)
        // Dc("c") = Dc(c)
        expect(
            equals(deriv(token('a'), 'a'), deriv(char('a'), 'a'))
        ).toBe(true)
        // Dc("abc") = Dc("a")◦"bc"
        expect(
            equals(deriv(token('abc'), 'a'), seq(deriv(token('a'), 'a'), 'bc'))
        ).toBe(true)
    })
    test('equals', () => {
        // a | b = a | b
        expect(equals(alt('a', 'b'), alt('a', 'b'))).toBe(true)
        // a | b ≠ .
        expect(equals(alt('a', 'b'), any)).toBe(false)

        // . = .
        expect(equals(any, any)).toBe(true)
        // . ≠ a
        expect(equals(any, seq('a', 'b'))).toBe(false)

        // a◦b = a◦b
        expect(equals(seq('a', 'b'), seq('a', 'b'))).toBe(true)
        // a◦b ≠ a◦.
        expect(equals(char('a'), any)).toBe(false)

        // a = a
        expect(equals(char('a'), char('a'))).toBe(true)
        // a ≠ ε
        expect(equals(char('a'), empty)).toBe(false)

        // ε = ε
        expect(equals(empty, empty)).toBe(true)
        // ε ≠ ∅
        expect(equals(empty, nil)).toBe(false)

        // ∅ = ∅
        expect(equals(nil, nil)).toBe(true)
        // ∅ ≠ a
        expect(equals(nil, not('a'))).toBe(false)

        // ¬a = ¬a
        expect(equals(not('a'), not('a'))).toBe(true)
        // ¬a ≠ [a-b]
        expect(equals(not('a'), range('a', 'b'))).toBe(false)

        // a? = a?
        expect(equals(opt('a'), opt('a'))).toBe(true)
        // a? ≠ b?
        expect(equals(opt('a'), opt('b'))).toBe(false)

        // a+ = a+
        expect(equals(plus('a'), plus('a'))).toBe(true)
        // a+ ≠ a{1}
        expect(equals(plus('a'), rep('a', 1))).toBe(false)

        // [a-b] = [a-b]
        expect(equals(range('a', 'b'), range('a', 'b'))).toBe(true)
        // [a-b] ≠ a{0}
        expect(equals(range('a', 'b'), rep('a', 0))).toBe(false)
        // [a-b] ≠ [b-a]
        expect(equals(range('a', 'b'), range('b', 'a'))).toBe(false)

        // a{0} = a{0}
        expect(equals(rep('a', 0), rep('a', 0))).toBe(true)
        // a{0} ≠ a*
        expect(equals(rep('a', 0), star('a'))).toBe(false)

        // a* = a*
        expect(equals(star('a'), star('a'))).toBe(true)
        // a* ≠ a
        expect(equals(star('a'), char('a'))).toBe(false)

        // abc = abc
        expect(equals(token('abc'), token('abc'))).toBe(true)
        // ab ≠ a|b
        expect(equals(token('ab'), alt('a', 'b'))).toBe(false)
    })
    test('height', () => {
        expect(height(alt('a', 'b'))).toBe(2)
        expect(height(any)).toBe(1)
        expect(height(seq('a', 'b'))).toBe(2)
        expect(height(char('a'))).toBe(1)
        expect(height(empty)).toBe(1)
        expect(height(nil)).toBe(1)
        expect(height(not('a'))).toBe(2)
        expect(height(opt('a'))).toBe(2)
        expect(height(plus('a'))).toBe(3)
        expect(height(range('a', 'b'))).toBe(1)
        expect(height(rep('a', 0))).toBe(2)
        expect(height(star('a'))).toBe(2)
        expect(height(token('a'))).toBe(1)
        expect(height(alt('a', alt('b', 'c')))).toBe(3)
    })
    test('isAlt', () => {
        expect(isAlt(alt('a', 'b'))).toBe(true)
        expect(isAlt(any)).toBe(false)
        expect(isAlt(seq('a', 'b'))).toBe(false)
        expect(isAlt(char('a'))).toBe(false)
        expect(isAlt(empty)).toBe(false)
        expect(isAlt(nil)).toBe(false)
        expect(isAlt(not('a'))).toBe(false)
        expect(isAlt(opt('a'))).toBe(true)
        expect(isAlt(plus('a'))).toBe(false)
        expect(isAlt(range('a', 'b'))).toBe(false)
        expect(isAlt(rep('a', 0))).toBe(false)
        expect(isAlt(star('a'))).toBe(false)
        expect(isAlt(token('a'))).toBe(false)
    })
    test('isAny', () => {
        expect(isAny(alt('a', 'b'))).toBe(false)
        expect(isAny(any)).toBe(true)
        expect(isAny(seq('a', 'b'))).toBe(false)
        expect(isAny(char('a'))).toBe(false)
        expect(isAny(empty)).toBe(false)
        expect(isAny(nil)).toBe(false)
        expect(isAny(not('a'))).toBe(false)
        expect(isAny(opt('a'))).toBe(false)
        expect(isAny(plus('a'))).toBe(false)
        expect(isAny(range('a', 'b'))).toBe(false)
        expect(isAny(rep('a', 0))).toBe(false)
        expect(isAny(star('a'))).toBe(false)
        expect(isAny(token('a'))).toBe(false)
    })
    test('isSeq', () => {
        expect(isSeq(alt('a', 'b'))).toBe(false)
        expect(isSeq(any)).toBe(false)
        expect(isSeq(seq('a', 'b'))).toBe(true)
        expect(isSeq(char('a'))).toBe(false)
        expect(isSeq(empty)).toBe(false)
        expect(isSeq(nil)).toBe(false)
        expect(isSeq(not('a'))).toBe(false)
        expect(isSeq(opt('a'))).toBe(false)
        expect(isSeq(plus('a'))).toBe(true)
        expect(isSeq(range('a', 'b'))).toBe(false)
        expect(isSeq(rep('a', 0))).toBe(false)
        expect(isSeq(star('a'))).toBe(false)
        expect(isSeq(token('a'))).toBe(false)
    })
    test('isChar', () => {
        expect(isChar(alt('a', 'b'))).toBe(false)
        expect(isChar(any)).toBe(false)
        expect(isChar(seq('a', 'b'))).toBe(false)
        expect(isChar(char('a'))).toBe(true)
        expect(isChar(empty)).toBe(false)
        expect(isChar(nil)).toBe(false)
        expect(isChar(not('a'))).toBe(false)
        expect(isChar(opt('a'))).toBe(false)
        expect(isChar(plus('a'))).toBe(false)
        expect(isChar(range('a', 'b'))).toBe(false)
        expect(isChar(rep('a', 0))).toBe(false)
        expect(isChar(star('a'))).toBe(false)
        expect(isChar(token('abc'))).toBe(false)
    })
    test('isEmpty', () => {
        expect(isEmpty(alt('a', 'b'))).toBe(false)
        expect(isEmpty(any)).toBe(false)
        expect(isEmpty(seq('a', 'b'))).toBe(false)
        expect(isEmpty(char('a'))).toBe(false)
        expect(isEmpty(empty)).toBe(true)
        expect(isEmpty(nil)).toBe(false)
        expect(isEmpty(not('a'))).toBe(false)
        expect(isEmpty(opt('a'))).toBe(false)
        expect(isEmpty(plus('a'))).toBe(false)
        expect(isEmpty(range('a', 'b'))).toBe(false)
        expect(isEmpty(rep('a', 0))).toBe(false)
        expect(isEmpty(star('a'))).toBe(false)
        expect(isEmpty(token('a'))).toBe(false)
    })
    test('isNil', () => {
        expect(isNil(alt('a', 'b'))).toBe(false)
        expect(isNil(any)).toBe(false)
        expect(isNil(seq('a', 'b'))).toBe(false)
        expect(isNil(char('a'))).toBe(false)
        expect(isNil(empty)).toBe(false)
        expect(isNil(nil)).toBe(true)
        expect(isNil(not('a'))).toBe(false)
        expect(isNil(opt('a'))).toBe(false)
        expect(isNil(plus('a'))).toBe(false)
        expect(isNil(range('a', 'b'))).toBe(false)
        expect(isNil(rep('a', 0))).toBe(false)
        expect(isNil(star('a'))).toBe(false)
        expect(isNil(token('a'))).toBe(false)
    })
    test('isNot', () => {
        expect(isNot(alt('a', 'b'))).toBe(false)
        expect(isNot(any)).toBe(false)
        expect(isNot(seq('a', 'b'))).toBe(false)
        expect(isNot(char('a'))).toBe(false)
        expect(isNot(empty)).toBe(false)
        expect(isNot(nil)).toBe(false)
        expect(isNot(not('a'))).toBe(true)
        expect(isNot(opt('a'))).toBe(false)
        expect(isNot(plus('a'))).toBe(false)
        expect(isNot(range('a', 'b'))).toBe(false)
        expect(isNot(rep('a', 0))).toBe(false)
        expect(isNot(star('a'))).toBe(false)
        expect(isNot(token('a'))).toBe(false)
    })
    test('isRange', () => {
        expect(isRange(alt('a', 'b'))).toBe(false)
        expect(isRange(any)).toBe(false)
        expect(isRange(seq('a', 'b'))).toBe(false)
        expect(isRange(char('a'))).toBe(false)
        expect(isRange(empty)).toBe(false)
        expect(isRange(nil)).toBe(false)
        expect(isRange(not('a'))).toBe(false)
        expect(isRange(opt('a'))).toBe(false)
        expect(isRange(plus('a'))).toBe(false)
        expect(isRange(range('a', 'b'))).toBe(true)
        expect(isRange(rep('a', 0))).toBe(false)
        expect(isRange(star('a'))).toBe(false)
        expect(isRange(token('a'))).toBe(false)
    })
    test('isRep', () => {
        expect(isRep(alt('a', 'b'))).toBe(false)
        expect(isRep(any)).toBe(false)
        expect(isRep(seq('a', 'b'))).toBe(false)
        expect(isRep(char('a'))).toBe(false)
        expect(isRep(empty)).toBe(false)
        expect(isRep(nil)).toBe(false)
        expect(isRep(not('a'))).toBe(false)
        expect(isRep(opt('a'))).toBe(false)
        expect(isRep(plus('a'))).toBe(false)
        expect(isRep(range('a', 'b'))).toBe(false)
        expect(isRep(rep('a', 0))).toBe(true)
        expect(isRep(star('a'))).toBe(false)
        expect(isRep(token('a'))).toBe(false)
    })
    test('isStar', () => {
        expect(isStar(alt('a', 'b'))).toBe(false)
        expect(isStar(any)).toBe(false)
        expect(isStar(seq('a', 'b'))).toBe(false)
        expect(isStar(char('a'))).toBe(false)
        expect(isStar(empty)).toBe(false)
        expect(isStar(nil)).toBe(false)
        expect(isStar(not('a'))).toBe(false)
        expect(isStar(opt('a'))).toBe(false)
        expect(isStar(plus('a'))).toBe(false)
        expect(isStar(range('a', 'b'))).toBe(false)
        expect(isStar(rep('a', 0))).toBe(false)
        expect(isStar(star('a'))).toBe(true)
        expect(isStar(token('a'))).toBe(false)
    })
    test('isToken', () => {
        expect(isToken(alt('a', 'b'))).toBe(false)
        expect(isToken(any)).toBe(false)
        expect(isToken(seq('a', 'b'))).toBe(false)
        expect(isToken(char('a'))).toBe(false)
        expect(isToken(empty)).toBe(false)
        expect(isToken(nil)).toBe(false)
        expect(isToken(not('a'))).toBe(false)
        expect(isToken(opt('a'))).toBe(false)
        expect(isToken(plus('a'))).toBe(false)
        expect(isToken(range('a', 'b'))).toBe(false)
        expect(isToken(rep('a', 0))).toBe(false)
        expect(isToken(star('a'))).toBe(false)
        expect(isToken(token('abc'))).toBe(true)
    })
    test('matches', () => {
        // a|b matches "a"
        expect(matches(alt('a', 'b'), 'a')).toBe(true)
        // a|b matches "b"
        expect(matches(alt('a', 'b'), 'b')).toBe(true)
        // a|b does not match "c"
        expect(matches(alt('a', 'b'), 'c')).toBe(false)
        // . matches "a"
        expect(matches(any, 'a')).toBe(true)
        // a◦b matches "ab"
        expect(matches(seq('a', 'b'), 'ab')).toBe(true)
        // a◦b does not match "a"
        expect(matches(seq('a', 'b'), 'a')).toBe(false)
        // a matches "a"
        expect(matches(char('a'), 'a')).toBe(true)
        // a does not match "b"
        expect(matches(char('a'), 'b')).toBe(false)
        // ε matches ""
        expect(matches(empty, '')).toBe(true)
        // ε does not match "a"
        expect(matches(empty, 'a')).toBe(false)
        // ∅ does not match "b"
        expect(matches(nil, 'b')).toBe(false)
        // ∅ does not match "a"
        expect(matches(nil, 'a')).toBe(false)
        // ¬a does not match "a"
        expect(matches(not('a'), 'a')).toBe(false)
        // a+ matches "a"
        expect(matches(plus('a'), 'a')).toBe(true)
        // a+ matches "aa"
        expect(matches(plus('a'), 'aa')).toBe(true)
        // a+ does not match ""
        expect(matches(plus('a'), '')).toBe(false)
        // a? matches ""
        expect(matches(opt('a'), '')).toBe(true)
        // a? matches "a"
        expect(matches(opt('a'), 'a')).toBe(true)
        // a? does not match "b"
        expect(matches(opt('a'), 'b')).toBe(false)
        // ¬a matches "b"
        expect(matches(not('a'), 'b')).toBe(true)
        // [a-b] matches "a"
        expect(matches(range('a', 'b'), 'a')).toBe(true)
        // [a-b] matches "b"
        expect(matches(range('a', 'b'), 'b')).toBe(true)
        // [a-b] does not match "c"
        expect(matches(range('a', 'b'), 'c')).toBe(false)
        // a{0} matches ""
        expect(matches(rep('a', 0), '')).toBe(true)
        // a{0} does not match "a"
        expect(matches(rep('a', 0), 'a')).toBe(false)
        // a{1} matches "a"
        expect(matches(rep('a', 1), 'a')).toBe(true)
        // a{1} does not match "aa"
        expect(matches(rep('a', 1), 'aa')).toBe(false)
        // a{2} matches "aa"
        expect(matches(rep('a', 2), 'aa')).toBe(true)
        // a{1} does not match "a"
        expect(matches(rep('a', 0), 'a')).toBe(false)
        // a* matches ""
        expect(matches(star('a'), '')).toBe(true)
        // a* matches "a"
        expect(matches(star('a'), 'a')).toBe(true)
        // a* matches "aa"
        expect(matches(star('a'), 'aa')).toBe(true)
        // "abc" matches "abc"
        expect(matches(token('abc'), 'abc')).toBe(true)
        // "abc" does not match "ab"
        expect(matches(token('abc'), 'ab')).toBe(false)
    })
    test('simplify', () => {
        // P ∪ P → P
        expect(equals(simplify(alt('a', 'a')), char('a'))).toBe(true)
        // M ∪ P → P ∪ M
        expect(equals(simplify(alt(not('b'), 'a')), alt('a', not('b')))).toBe(true)
        // ∅ ∪ P → P
        expect(equals(simplify(alt(nil, 'a')), char('a'))).toBe(true)
        // P ∪ ∅ → P
        expect(equals(simplify(alt('a', nil)), char('a'))).toBe(true)
        // (P ∪ M) ∪ N → P ∪ (M ∪ N)
        expect(equals(
            simplify(alt(alt('a', 'b'), 'c')),
            alt('a', alt('b', 'c'))
        )).toBe(true)
        // . → .
        expect(equals(simplify(any), any)).toBe(true)
        // PƐ → ƐP → P
        expect(equals(simplify(seq('a', empty)), char('a'))).toBe(true)
        expect(equals(simplify(seq(empty, 'a')), char('a'))).toBe(true)
        // ∅P → P∅ → ∅
        expect(equals(simplify(seq(nil, 'a')), nil)).toBe(true)
        expect(equals(simplify(seq('a', nil)), nil)).toBe(true)
        // c → c
        expect(equals(simplify(char('a')), char('a'))).toBe(true)
        // Ɛ → Ɛ
        expect(equals(simplify(empty), empty)).toBe(true)
        // ∅ → ∅
        expect(equals(simplify(nil), nil)).toBe(true)
        // ¬¬P → P
        expect(equals(simplify(not(not('a'))), char('a'))).toBe(true)
        // P? → P?
        expect(equals(simplify(opt('a')), opt('a'))).toBe(true)
        // ∅? → Ɛ
        expect(equals(simplify(opt(nil)), empty)).toBe(true)
        // P+ → P+
        expect(equals(simplify(plus('a')), plus('a'))).toBe(true)
        // ∅+ → ∅
        expect(equals(simplify(plus(nil)), nil)).toBe(true)
        // [a-a] → a
        expect(equals(simplify(range('a', 'a')), char('a'))).toBe(true)
        // [a-b] → [a-b]
        expect(equals(simplify(range('a', 'b')), range('a', 'b'))).toBe(true)
        // P{0} → Ɛ
        expect(equals(simplify(rep('a', 0)), empty)).toBe(true)
        // P{1} → P
        expect(equals(simplify(rep('a', 1)), char('a'))).toBe(true)
        // P{∞} → P*
        expect(equals(simplify(rep('a', Infinity)), star('a'))).toBe(true)
        // P{n} → P{n}
        expect(equals(simplify(rep('a', 2)), rep('a', 2))).toBe(true)
        // ∅* → Ɛ
        expect(equals(simplify(star(nil)), empty)).toBe(true)
        // P** → P*
        expect(equals(simplify(star(star('a'))), star('a'))).toBe(true)
        // Ɛ* → Ɛ
        expect(equals(simplify(star(empty)), empty)).toBe(true)
        // "Foo" → "Foo"
        expect(equals(simplify(token('Foo')), token('Foo'))).toBe(true)
    })
    test('toString', () => {
        expect(toString(alt('a', 'b'))).toBe('Alt(Char(a), Char(b))')
        expect(toString(any)).toBe('Any')
        expect(toString(seq('a', 'b'))).toBe('Seq(Char(a), Char(b))')
        expect(toString(char('a'))).toBe('Char(a)')
        expect(toString(empty)).toBe('Empty')
        expect(toString(nil)).toBe('Nil')
        expect(toString(not('a'))).toBe('Not(Char(a))')
        expect(toString(plus('a'))).toBe('Seq(Char(a), Star(Char(a)))')
        expect(toString(range('a', 'b'))).toBe('Range(a, b)')
        expect(toString(rep('a', 2))).toBe('Rep(Char(a), 2)')
        expect(toString(star('a'))).toBe('Star(Char(a))')
        expect(toString(token('Foo'))).toBe('Token(Foo)')
    })
    test('hex matching', () => {
        // match 6 digit hex
        const hex = alt(
            range('0', '9'),
            range('a', 'f')
        ),
            hex6 = rep(hex, 6)
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
        const digit = range('0', '9'),
            zip = seq(rep(digit, 5), '-', rep(digit, 4))

        expect(matches(zip, '12345-1234')).toBe(true)
        expect(matches(zip, '12345-123')).toBe(false)
        expect(matches(zip, '1234-1234')).toBe(false)
        expect(matches(zip, '12345-12345')).toBe(false)
    })
    test('credit card matching', () => {
        // match 16 digit credit card
        const digit = range('0', '9'),
            digit4 = rep(digit, 4),
            component = seq(digit4, '-'),
            card = seq(rep(component, 3), digit4)

        expect(matches(card, '1234-1234-1234-1234')).toBe(true)
        expect(matches(card, '1234-1234-1234-123')).toBe(false)
        expect(matches(card, '1234-1234-1234-12345')).toBe(false)
        expect(matches(card, '1234-1234-1234-1234-1234')).toBe(false)
    })
})