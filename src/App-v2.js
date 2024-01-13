import { useEffect, useState } from 'react';
import StarRating from './StarRating.js';
const average = (arr) =>
  Math.round(
    (arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0) +
      Number.EPSILON) *
      100
  ) / 100;
const KEY = '4a6ba38d';
export default function App() {
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  function handleSelectMovie(id) {
    setSelectedId((selectedId) => (id === selectedId ? null : id));
  }
  function handleCloseMovie() {
    setSelectedId(null);
  }
  function handleAddWatchedMovie(newMovie) {
    const isAdded =
      watched.filter((el) => el.imdbID === newMovie.imdbID).length > 0;
    if (!isAdded) {
      setWatched((watched) => [...watched, newMovie]);
    }
  }
  function handleDeleteMovie(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }
  useEffect(
    function () {
      const controller = new AbortController();
      async function fetchMovies() {
        try {
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
      handleCloseMovie();
      fetchMovies();
      return function () {
        controller.abort();
      };
    },
    [query]
  );

  return (
    <>
      <NavBar movies={movies}>
        <Logo />
        <Search
          query={query}
          onSearch={setQuery}
        />
        <NumResults movies={movies} />
      </NavBar>
      <Main>
        <Box>
          {isLoading && !error && <Loader />}
          {!isLoading && !error && (
            <MovieList
              movies={movies}
              handleSelectMovie={handleSelectMovie}
            />
          )}
          {error && <ErrorMessage message={error} />}
        </Box>
        <Box>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              handleSelectMovie={handleSelectMovie}
              onCloseMovie={handleCloseMovie}
              onAddMovie={handleAddWatchedMovie}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMoviesList
                watched={watched}
                onDeleteMovie={handleDeleteMovie}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}
function Loader() {
  return <p className="loader">Loading</p>;
}
function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>🚫</span> {message}
    </p>
  );
}
function NavBar({ children }) {
  return <nav className="nav-bar">{children}</nav>;
}
function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}
function Search({ query, onSearch }) {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => onSearch(e.target.value)}
    />
  );
}
function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}
function Main({ children }) {
  return <main className="main">{children}</main>;
}
function Button({ className, onClick, children }) {
  return (
    <button
      className={className}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
function MovieList({ movies, handleSelectMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie
          movie={movie}
          key={movie.imdbID}
          handleSelectMovie={handleSelectMovie}
        >
          <p>
            <span>🗓</span>
            <span>{movie.Year}</span>
          </p>
        </Movie>
      ))}
    </ul>
  );
}
function Movie({ movie, children, handleSelectMovie }) {
  return (
    <li onClick={() => handleSelectMovie(movie.imdbID)}>
      <img
        src={movie.Poster}
        alt={`${movie.Title} poster`}
      />
      <h3>{movie.Title}</h3>
      <div>{children}</div>
    </li>
  );
}
function WatchedMoviesList({ watched, onDeleteMovie }) {
  return (
    <ul className="list list-watched">
      {watched.map((movie) => (
        <WatchedMovie
          movie={movie}
          key={movie.imdbID}
          onDeleteMovie={() => onDeleteMovie(movie.imdbID)}
        />
      ))}
    </ul>
  );
}
function WatchedMovie({ movie, onDeleteMovie }) {
  return (
    <li>
      <img
        src={movie.Poster}
        alt={`${movie.Title} poster`}
      />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button
          className="btn-delete"
          onClick={onDeleteMovie}
        >
          &times;
        </button>
      </div>
    </li>
  );
}
function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <Button
        className="btn-toggle"
        onClick={() => setIsOpen((open) => !open)}
      >
        {isOpen ? '–' : '+'}
      </Button>
      {isOpen && children}
    </div>
  );
}
function MovieDetails({
  selectedId,
  handleSelectMovie,
  onCloseMovie,
  onAddMovie,
  watched,
}) {
  const [movie, setMovie] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [userRating, setRating] = useState(0);

  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);
  const watchedUserRating = watched.find(
    (movie) => movie.imdbID === selectedId
  )?.userRating;
  const {
    imdbID,
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;
  function convertRuntime(runtime) {
    return Number(runtime.split(' ')[0]);
  }
  function handleAddMovie() {
    const newMovie = {
      imdbID,
      Year: year,
      Title: title,
      Poster: poster,
      userRating,
      imdbRating,
      runtime: convertRuntime(runtime),
    };
    onAddMovie(newMovie);
    onCloseMovie();
  }
  useEffect(() => {
    async function fetchMovie() {
      try {
        setIsLoading(true);
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
        );
        if (!res.ok) {
          throw new Error('Something wrong');
        }
        const data = await res.json();
        if (data.Response === 'False') {
          throw new Error('wrong id');
        }
        setMovie(data);
      } catch (err) {
        handleSelectMovie('');
      } finally {
        setIsLoading(false);
      }
    }
    fetchMovie();
  }, [selectedId, handleSelectMovie]);

  useEffect(
    function () {
      document.title = `Movie | ${title || ''}`;
      return function () {
        document.title = 'usePopcorn';
      };
    },
    [title]
  );
  useEffect(
    function () {
      function callback(e) {
        if (e.code === 'Escape') {
          onCloseMovie();
        }
      }
      document.addEventListener('keydown', callback);
      return function () {
        document.removeEventListener('keydown', callback);
      };
    },
    [onCloseMovie]
  );
  return (
    <div>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="details">
          <button
            className="btn-back"
            onClick={onCloseMovie}
          >
            &larr;
          </button>
          <header>
            <img
              src={poster}
              alt={title}
            />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>⭐️ {imdbRating} IMDb rating</p>
            </div>
          </header>
          <section>
            <div className="rating">
              {isWatched && (
                <p>You've rated this movie ⭐️{watchedUserRating}</p>
              )}
              {!isWatched && (
                <>
                  <StarRating
                    maxRating={10}
                    size={22}
                    onSetRating={setRating}
                    defaultRating={userRating}
                  />
                  <button
                    className="btn-add"
                    onClick={handleAddMovie}
                  >
                    + Add to list
                  </button>
                </>
              )}
            </div>
            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </div>
      )}
    </div>
  );
}
function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = Math.round(average(watched.map((movie) => movie.runtime)));
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}
