import { useObservers } from '../../src';
import { renderHook, act } from '@testing-library/react-hooks';

const renderUseObserversHook = () => renderHook(() => useObservers());

describe('Observer tests', () => {
    it('should call value observer', () => {
        const { result } = renderUseObserversHook();

        const observer = jest.fn();

        act(() => {
            result.current.observe('b', observer);
            result.current.notifySubTree('b', {
                b: 0,
            });
        });

        expect(observer).toBeCalled();
    });

    it('should call parent observer', () => {
        const { result } = renderUseObserversHook();

        const observer = jest.fn();

        act(() => {
            result.current.observe('parent', observer);
            result.current.notifySubTree('parent.child', {
                parent: {
                    child: 0,
                },
            });
        });

        expect(observer).toBeCalled();
    });

    it('should call child observer', () => {
        const { result } = renderUseObserversHook();

        const observer = jest.fn();

        act(() => {
            result.current.observe('parent.child', observer);
            result.current.notifySubTree('parent', { parent: { child: 'b' } });
        });

        expect(observer).toBeCalled();
    });

    it('should call tree branch of observers', () => {
        const { result } = renderUseObserversHook();

        const observer = jest.fn();

        act(() => {
            result.current.observe('parent', observer);
            result.current.observe('parent.child', observer);
            result.current.observe('parent.child.value', observer);
            result.current.notifySubTree('parent.child.value', {
                parent: {
                    child: {
                        value: 'b',
                    },
                },
            });
        });

        expect(observer).toBeCalledTimes(3);
    });

    it('should call all observers', () => {
        const { result } = renderUseObserversHook();

        const oberver = jest.fn();

        act(() => {
            result.current.observe('parent', oberver);
            result.current.observe('parent.child', oberver);
            result.current.observe('parent.child.value', oberver);
            result.current.notifyAll({ parent: { child: { value: 'b' } } });
        });

        expect(oberver).toBeCalledTimes(3);
    });

    it("shouldn't call observer", () => {
        const { result } = renderUseObserversHook();

        const observer = jest.fn();

        act(() => {
            result.current.observe('parent.notInBranch', observer);
            result.current.notifySubTree('parent.child.value', {
                parent: {
                    child: {
                        value: 'newValue',
                    },
                    notInBranch: {
                        value: 'asdf',
                    },
                },
            });
        });

        expect(observer).not.toBeCalled();
    });

    it('should receive correct value', () => {
        const { result } = renderUseObserversHook();

        const value = 'hello';

        const parentObserver = jest.fn();
        const childObserver = jest.fn();

        act(() => {
            result.current.observe('parent', parentObserver);
            result.current.observe('parent.child', childObserver);
            result.current.notifySubTree('parent.child', {
                parent: {
                    child: value,
                },
            });
        });

        expect(childObserver).toBeCalledWith(value);
        expect(parentObserver).toBeCalledWith({ child: value });
    });
});

describe('Is observed test', () => {
    it('should be observed', () => {
        const { result } = renderUseObserversHook();

        act(() => {
            result.current.observe('value', jest.fn());
        });

        expect(result.current.isObserved('value')).toBeTruthy();
        expect(result.current.isObserved('asdf')).toBeFalsy();
    });
    it('should be observed denormalized path', () => {
        const { result } = renderUseObserversHook();

        act(() => {
            result.current.observe('arr[0]', jest.fn());
        });

        expect(result.current.isObserved('arr[0]')).toBeTruthy();
        expect(result.current.isObserved('arr.0')).toBeTruthy();
        expect(result.current.isObserved('arr[3]')).toBeFalsy();
    });
});

describe('Removing observers test', () => {
    it('should remove observer', () => {
        const { result } = renderUseObserversHook();

        const observer = jest.fn();

        act(() => {
            const key = result.current.observe('value', observer);

            result.current.notifySubTree('value', { value: '2' });

            result.current.stopObserving('value', key);

            result.current.notifySubTree('value', { value: '3' });
        });

        expect(observer).toBeCalledTimes(1);
    });

    it('should remove denormalized path observer', () => {
        const { result } = renderUseObserversHook();

        const observer = jest.fn();

        act(() => {
            const key = result.current.observe('arr[0]', observer);

            result.current.notifySubTree('arr.0', { arr: [0] });
            result.current.notifySubTree('arr[0]', { arr: [1] });

            result.current.stopObserving('arr[0]', key);

            result.current.notifySubTree('arr.0', { arr: [2] });
            result.current.notifySubTree('arr[0]', { arr: [3] });
        });

        expect(observer).toBeCalledTimes(2);
    });
});

describe('Batch observers tests', () => {
    it('should call observer', () => {
        const { result } = renderUseObserversHook();

        const observer = jest.fn();

        act(() => {
            result.current.observeBatchUpdates(observer);

            result.current.notifySubTree('value', {
                value: '2',
            });
        });

        expect(observer).toBeCalled();
    });

    it('should call observer on any update with arguments', () => {
        const { result } = renderUseObserversHook();

        const observer = jest.fn();

        act(() => {
            result.current.observeBatchUpdates(observer);
            result.current.observe('parent.child', jest.fn());
            result.current.observe('parent', jest.fn());
            result.current.observe('value', jest.fn());

            result.current.notifySubTree('parent.child.hello', {
                value: 'asdf',
                parent: {
                    child: {
                        hello: '2',
                    },
                },
            });
        });

        expect(observer).toBeCalled();
        expect(observer).toBeCalledWith({
            paths: ['parent.child', 'parent'],
            values: {
                value: 'asdf',
                parent: {
                    child: {
                        hello: '2',
                    },
                },
            },
        });
    });

    it('should remove observer', () => {
        const { result } = renderUseObserversHook();

        const observer = jest.fn();

        act(() => {
            const key = result.current.observeBatchUpdates(observer);

            result.current.notifySubTree('value', {
                value: '2',
            });

            result.current.stopObservingBatchUpdates(key);

            result.current.notifySubTree('value', {
                value: 'h',
            });
        });

        expect(observer).toBeCalledTimes(1);
    });
});
