import { useState, useEffect } from 'react';
const KEY = '4a6ba38d';
export function useMovies(query, callback) {
  const [isLoading, setIsLoading] = useState(false);
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState('');
  useEffect(
    function () {
      const controller = new AbortController();

      async function fetchMovies() {
        try {
          callback?.();
          setError('');
          setIsLoading(true);
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
            { signal: controller.signal }
          );
          if (!res.ok) {
            throw new Error('Something went wrong with fetching movies');
          }
          const data = await res.json();
          if (data.Response === 'False') {
            throw new Error('Movie not found');
          }
          setMovies(data.Search);
          setError('');
        } catch (err) {
          if (err.name !== 'AbortError') {
            setError(err.message);
          }
        } finally {
          setIsLoading(false);
        }
      }
      if (query.length < 3) {
        setError('Type at least 3 letters in search bar');
        setMovies([]);
        setIsLoading(false);
        return;
      }
      fetchMovies();
      return function () {
        controller.abort();
      };
    },
    [query, callback]
  );
  return { movies, isLoading, error };
}
