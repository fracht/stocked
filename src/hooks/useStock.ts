import { MutableRefObject, useCallback, useRef } from 'react';
import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import set from 'lodash/set';
import invariant from 'tiny-invariant';

import { isInnerPath, normalizePath } from '../utils/pathUtils';
import { useLazyRef } from '../utils/useLazyRef';
import { Observer } from '../typings/Observer';
import { removeObserver, callObservers } from '../utils/observers';

export type Stock<T extends object> = {
  values: Readonly<MutableRefObject<T>>;
  observe: <V>(path: string, observer: Observer<V>) => void;
  stopObserving: <V>(path: string, observer: Observer<V>) => void;
  setValue: (path: string, value: unknown) => void;
  setValues: (values: T) => void;
  isObserved: (path: string) => boolean;
};

export type StockConfig<T extends object> = {
  initialValues: T;
};

export const useStock = <T extends object>({
  initialValues,
}: StockConfig<T>): Stock<T> => {
  const values = useLazyRef<T>(() => cloneDeep(initialValues));
  const observers = useRef<Record<string, Array<Observer<unknown>>>>({});

  const observe = useCallback(<V>(path: string, observer: Observer<V>) => {
    path = normalizePath(path);
    if (!Object.prototype.hasOwnProperty.call(observers.current, path)) {
      observers.current[path] = [];
    }
    observers.current[path].push(observer as Observer<unknown>);
  }, []);

  const stopObserving = useCallback(
    <V>(path: string, observer: Observer<V>) => {
      const currentObservers = observers.current[path];

      invariant(
        currentObservers,
        'Cannot remove observer from value, which is not observing'
      );

      removeObserver(currentObservers, observer);

      if (currentObservers.length === 0) delete observers.current[path];
    },
    []
  );

  const notifyObservers = useCallback((paths: string[], values: T) => {
    paths.forEach(path => {
      const observer = observers.current[path];
      const value = get(values, path);
      callObservers(observer, typeof value === 'object' ? { ...value } : value);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setValue = useCallback(
    (path: string, value: unknown) => {
      set(values.current, path, value);

      const paths = Object.keys(observers.current).filter(
        tempPath =>
          isInnerPath(path, tempPath) ||
          path === tempPath ||
          isInnerPath(tempPath, path)
      );

      notifyObservers(paths, values.current);
    },
    [values, notifyObservers]
  );

  const setValues = useCallback(
    (newValues: T) => {
      values.current = newValues;
      notifyObservers(Object.keys(observers.current), newValues);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [values, notifyObservers]
  );

  const isObserved = useCallback(
    (path: string) =>
      Object.prototype.hasOwnProperty.call(observers.current, path),
    []
  );

  return {
    values,
    observe,
    stopObserving,
    setValue,
    isObserved,
    setValues,
  };
};
