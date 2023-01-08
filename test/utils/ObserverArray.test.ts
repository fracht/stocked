import { ObserverArray } from '../../src/utils/ObserverArray';

describe('ObserverArray "call" function', () => {
	it('should call all functions', () => {
		const observer1 = jest.fn();

		const arr = new ObserverArray();
		arr.add(observer1);
		arr.add(observer1);
		arr.add(observer1);

		arr.call(null);

		expect(observer1).toBeCalledTimes(3);
	});

	it('should receive message', () => {
		const observer1 = jest.fn();
		const observer2 = jest.fn();
		const observer3 = jest.fn();

		const message = 'sample message';

		const arr = new ObserverArray();

		arr.add(observer1);
		arr.add(observer2);
		arr.add(observer3);

		arr.call(message);

		expect(observer1).toBeCalledWith(message);
		expect(observer2).toBeCalledWith(message);
		expect(observer3).toBeCalledWith(message);
	});
});

describe('ObserverArray "remove" function', () => {
	it('should remove observer', () => {
		const observer = jest.fn();
		const removedObserver = jest.fn();

		const arr = new ObserverArray();

		arr.add(observer);
		const key = arr.add(removedObserver);

		arr.remove(key);

		arr.call(null);

		expect(removedObserver).not.toBeCalled();
		expect(observer).toBeCalled();
	});
});

describe('ObserverArray "isEmpty" function', () => {
	it('should return true/false, depending on array size', () => {
		const observer = jest.fn();

		const arr = new ObserverArray();

		const key = arr.add(observer);

		expect(arr.isEmpty()).toBeFalsy();

		arr.remove(key);

		expect(arr.isEmpty()).toBeTruthy();
	});
});
