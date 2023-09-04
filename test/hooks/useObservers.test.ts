import { act, renderHook } from '@testing-library/react';
import { createPxth, getPxthSegments } from 'pxth';

import { useObservers } from '../../src';

const renderUseObserversHook = () => renderHook(() => useObservers());

describe('Observer tests', () => {
	it('should call value observer', () => {
		const { result } = renderUseObserversHook();

		const observer = jest.fn();

		act(() => {
			result.current.watch(createPxth(['b']), observer);
			result.current.notifySubTree(createPxth(['b']), {
				b: 0,
			});
		});

		expect(observer).toBeCalled();
	});

	it('Should call all values observer', async () => {
		const { result } = renderUseObserversHook();

		const observer = jest.fn();
		let cleanup: () => void = () => {};

		act(() => {
			cleanup = result.current.watchAll(observer);
			result.current.notifySubTree(createPxth(['b']), { b: 0 });
		});

		expect(observer).toBeCalled();
		expect(result.current.isObserved(createPxth([]))).toBe(true);
		cleanup();
		expect(result.current.isObserved(createPxth([]))).toBe(false);
	});

	it('should call parent observer', () => {
		const { result } = renderUseObserversHook();

		const observer = jest.fn();

		act(() => {
			result.current.watch(createPxth(['parent']), observer);
			result.current.notifySubTree(createPxth(['parent', 'child']), {
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
			result.current.watch(createPxth(['parent', 'child']), observer);
			result.current.notifySubTree(createPxth(['parent']), { parent: { child: 'b' } });
		});

		expect(observer).toBeCalled();
	});

	it('should call tree branch of observers', () => {
		const { result } = renderUseObserversHook();

		const observer = jest.fn();

		act(() => {
			result.current.watch(createPxth(['parent']), observer);
			result.current.watch(createPxth(['parent', 'child']), observer);
			result.current.watch(createPxth(['parent', 'child', 'value']), observer);
			result.current.notifySubTree(createPxth(['parent', 'child', 'value']), {
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
			result.current.watch(createPxth(['parent']), oberver);
			result.current.watch(createPxth(['parent', 'child']), oberver);
			result.current.watch(createPxth(['parent', 'child', 'value']), oberver);
			result.current.notifyAll({ parent: { child: { value: 'b' } } });
		});

		expect(oberver).toBeCalledTimes(3);
	});

	it("shouldn't call observer", () => {
		const { result } = renderUseObserversHook();

		const observer = jest.fn();

		act(() => {
			result.current.watch(createPxth(['parent', 'notInBranch']), observer);
			result.current.notifySubTree(createPxth(['parent', 'child', 'value']), {
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
			result.current.watch(createPxth(['parent']), parentObserver);
			result.current.watch(createPxth(['parent', 'child']), childObserver);
			result.current.notifySubTree(createPxth(['parent', 'child']), {
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
			result.current.watch(createPxth(['value']), jest.fn());
		});

		expect(result.current.isObserved(createPxth(['value']))).toBeTruthy();
		expect(result.current.isObserved(createPxth(['asdf']))).toBeFalsy();
	});
	it('should be observed denormalized path', () => {
		const { result } = renderUseObserversHook();

		act(() => {
			result.current.watch(createPxth(['arr', '0']), jest.fn());
		});

		expect(result.current.isObserved(createPxth(['arr', '0']))).toBeTruthy();
		expect(result.current.isObserved(createPxth(['arr', '3']))).toBeFalsy();
	});
});

describe('Removing observers test', () => {
	it('should remove observer', () => {
		const { result } = renderUseObserversHook();

		const observer = jest.fn();

		act(() => {
			const cleanup = result.current.watch(createPxth(['value']), observer);

			result.current.notifySubTree(createPxth(['value']), { value: '2' });

			cleanup();

			result.current.notifySubTree(createPxth(['value']), { value: '3' });
		});

		expect(observer).toBeCalledTimes(1);
	});

	it('should remove denormalized path observer', () => {
		const { result } = renderUseObserversHook();

		const observer = jest.fn();

		act(() => {
			const cleanup = result.current.watch(createPxth(['arr', '0']), observer);

			result.current.notifySubTree(createPxth(['arr', '0']), { arr: [0] });
			result.current.notifySubTree(createPxth(['arr', '0']), { arr: [1] });

			cleanup();

			result.current.notifySubTree(createPxth(['arr', '0']), { arr: [2] });
			result.current.notifySubTree(createPxth(['arr', '0']), { arr: [3] });
		});

		expect(observer).toBeCalledTimes(2);
	});
});

describe('Batch observers tests', () => {
	it('should call observer', () => {
		const { result } = renderUseObserversHook();

		const observer = jest.fn();

		act(() => {
			result.current.watchBatchUpdates(observer);

			result.current.notifySubTree(createPxth(['value']), {
				value: '2',
			});
		});

		expect(observer).toBeCalled();
	});

	it('should call observer on any update with arguments', () => {
		const { result } = renderUseObserversHook();

		const observer = jest.fn();

		act(() => {
			result.current.watchBatchUpdates(observer);
			result.current.watch(createPxth(['parent', 'child']), jest.fn());
			result.current.watch(createPxth(['parent']), jest.fn());
			result.current.watch(createPxth(['value']), jest.fn());

			result.current.notifySubTree(createPxth(['parent', 'child', 'hello']), {
				value: 'asdf',
				parent: {
					child: {
						hello: '2',
					},
				},
			});
		});

		expect(observer).toBeCalled();
		expect(getPxthSegments(observer.mock.calls[0][0].origin)).toStrictEqual(['parent', 'child', 'hello']);
		expect(observer.mock.calls[0][0].paths.map(getPxthSegments)).toStrictEqual([['parent', 'child'], ['parent']]);
		expect(observer).toBeCalledWith({
			origin: expect.anything(),
			paths: expect.anything(),
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
			const cleanup = result.current.watchBatchUpdates(observer);

			result.current.notifySubTree(createPxth(['value']), {
				value: '2',
			});

			cleanup();

			result.current.notifySubTree(createPxth(['value']), {
				value: 'h',
			});
		});

		expect(observer).toBeCalledTimes(1);
	});
});
