import { useState, useEffect } from 'react';
export function useLocalStorageState(initialState, key) {
  const [watched, setWatched] = useState(function () {
    const storedValue = localStorage.getItem('watched') || initialState;
    return JSON.parse(storedValue);
  });
  useEffect(
    function () {
      localStorage.setItem(key, JSON.stringify(watched));
    },
    [watched, key, initialState]
  );
  return [watched, setWatched];
}
