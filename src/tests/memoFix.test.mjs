import { memoFix } from '../memoFix.mjs'
import { Trait, apply } from '@mlhaufe/brevity/dist/Trait.mjs'

describe('least fixed point', () => {
    test('returning bottom on infinite recursion', () => {
        const omega = new Trait({
            [apply](x) { return this[apply](x); }
        })

        expect(() => omega('x')).toThrowError(new Error('Maximum call stack size exceeded'));

        const omegaFix = memoFix('bottom', omega);

        expect(omegaFix('x')).toBe('bottom');
    })
})