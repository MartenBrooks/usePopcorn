import { useState } from 'react';
import { useEffect } from 'react';
// `https://api.frankfurter.app/latest?amount=100&from=EUR&to=USD`
export default function Exchange() {
  const [currency1, setCurrency1] = useState('USD');
  const [currency2, setCurrency2] = useState('USD');
  const [amount, setAmount] = useState(0);
  const [result, setResult] = useState(0);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  useEffect(
    function () {
      async function fetchExchange() {
        try {
          setError('');
          setResult(0);
          setIsLoading(true);
          const res = await fetch(
            `https://api.frankfurter.app/latest?amount=${amount}&from=${currency1}&to=${currency2}`
          );
          if (!res.ok) {
            throw new Error('Bad request');
          }
          const data = await res.json();
          setResult(data.rates[currency2]);
        } catch (err) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      }
      if (amount && currency1 !== currency2) {
        fetchExchange();
      } else {
        setResult(0);
      }
    },
    [amount, currency1, currency2]
  );
  return (
    <div>
      <input
        type='text'
        value={amount || ''}
        onChange={(e) => setAmount(Number(e.target.value))}
      />
      <select value={currency1} onChange={(e) => setCurrency1(e.target.value)}>
        <option value='USD'>USD</option>
        <option value='EUR'>EUR</option>
        <option value='CAD'>CAD</option>
        <option value='INR'>INR</option>
      </select>
      <select value={currency2} onChange={(e) => setCurrency2(e.target.value)}>
        <option value='USD'>USD</option>
        <option value='EUR'>EUR</option>
        <option value='CAD'>CAD</option>
        <option value='INR'>INR</option>
      </select>
      <p>
        {!error &&
          !isLoading &&
          (result || 'Choose currencies and enter the amount')}
        {!result && !error && isLoading && <Loader />}
        {error}
      </p>
    </div>
  );
}
function Loader() {
  return <span>Calculating...</span>;
}
