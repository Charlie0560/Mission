import React, { useState, useEffect, useRef } from "react";
import { processStocks } from "../services/api";

const Form = ({ setResults,setTf,setScanning }) => {
  const [interval, setInterval] = useState("1d");
  const [price, setPrice] = useState(200);
  const [loading, setLoading] = useState(false); // For spinner/loader
  const [seconds, setSeconds] = useState(0); // For countdown timer
  const secondsRef = useRef(0); // Ref to keep track of the seconds count

  const priceArray = [200,300,500,"All"]
  // Start countdown when loading begins

  useEffect(() => {
    if (loading) {
      const timer = setTimeout(function updateTimer() {
        setSeconds((prev) => {
          const newSeconds = prev + 1;
          secondsRef.current = newSeconds;
          return newSeconds;
        });
        if (loading) {
          setTimeout(updateTimer, 1000);
        }
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      setSeconds(0);
    }
  }, [loading]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setScanning(true);
    setSeconds(0);
    if (interval === "1d") {
        setTf("D");
      } else if (interval === "1wk") {
        setTf("W");
      } else if (interval === "1mo") {
        setTf("M");
      }
      
    try {
      const response = await processStocks({ interval, price });
      console.log(response.data);
      setResults(response.data.result);
      const tfValue = interval === "1d" ? "D" : interval === "1wk" ? "W" : "M";
      const timestamp = new Date().getTime();
      localStorage.setItem(
        "stockResults",
        JSON.stringify({ data: response.data.result,tf: tfValue, timestamp })
      );

      if (response) {
        setSeconds(0);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setSeconds(0);
    } finally {
      setLoading(false);
      setSeconds(0);
      setScanning(false)
    }
  };

  return (
    <center>
      <form onSubmit={handleSubmit} className="form">
        <select value={interval} onChange={(e) => setInterval(e.target.value)}>
          <option value="1d">1 Day</option>
          <option value="1wk">1 Week</option>
          <option value="1mo">1 Month</option>
        </select>

        {/* Dropdown for Price */}
        <select
          value={price}
          onChange={(e) => setPrice(parseInt(e.target.value, 10) || e.target.value)}
        >
          {priceArray.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        <button type="submit">Submit</button>
      </form>

      {/* Display loader and timer while loading */}
      {loading && (
        <div className="loader-container">
          <div className="spinner"></div>
          <p>Processing... {seconds}s</p>
        </div>
      )}
    </center>
  );
};

export default Form;
