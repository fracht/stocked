import { StockProxy } from '../../src/typings';

class DummyProxy extends StockProxy {
    public setValue = () => {};
    public observe = () => 0;
    public stopObserving = () => {};
}

describe('Proxy activation', () => {
    it('should activate proxy', () => {
        const proxy = new DummyProxy('asdf');
        proxy.activate();
        expect(Object.isFrozen(proxy)).toBeTruthy();
        expect(proxy.isActive()).toBeTruthy();
    });
    it('should not let to edit active proxy', () => {
        const proxy = new DummyProxy('asdf');
        proxy.activate();
        expect(() => ((proxy as any).path = 'asdfsdf')).toThrow();
    });
});
