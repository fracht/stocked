import { callObservers, removeObserver } from '../../src/utils/observers';

describe('Testing "callObservers" function', () => {
    it('should call all functions', () => {
        const observer1 = jest.fn();

        callObservers([observer1, observer1, observer1], null);

        expect(observer1).toBeCalledTimes(3);
    });

    it('should receive message', () => {
        const observer1 = jest.fn();
        const observer2 = jest.fn();
        const observer3 = jest.fn();

        const message = 'sample message';

        callObservers([observer1, observer2, observer3], message);

        expect(observer1).toBeCalledWith(message);
        expect(observer2).toBeCalledWith(message);
        expect(observer3).toBeCalledWith(message);
    });
});

describe('Testing "removeObserver" function', () => {
    it('should remove observer', () => {
        const observer = jest.fn();
        const removedObserver = jest.fn();

        const observerArray = [observer, removedObserver];

        removeObserver(observerArray, removedObserver);

        callObservers(observerArray, null);

        expect(removedObserver).not.toBeCalled();
        expect(observer).toBeCalled();
    });
});
