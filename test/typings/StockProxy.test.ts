import { createPxth } from 'pxth';

import { DummyProxy } from '../DummyProxy';

describe('Proxy activation', () => {
    it('should activate proxy', () => {
        const proxy = new DummyProxy(createPxth(['asdf']));
        proxy.activate();
        expect(Object.isFrozen(proxy)).toBeTruthy();
        expect(proxy.isActive()).toBeTruthy();
    });
    it('should not let to edit active proxy', () => {
        const proxy = new DummyProxy(createPxth(['asdf']));
        proxy.activate();
        expect(() => ((proxy as any).path = 'asdfsdf')).toThrow();
    });
});
