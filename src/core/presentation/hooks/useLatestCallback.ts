import { useCallback, useLayoutEffect, useRef } from "react";

type AnyCallback = (...args: never[]) => unknown;

export const useLatestCallback = <TCallback extends AnyCallback>(
  callback: TCallback
): TCallback => {
  const callbackRef = useRef(callback);

  useLayoutEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    ((...args: Parameters<TCallback>) =>
      callbackRef.current(...args)) as TCallback,
    []
  );
};
