import React, { useState, useEffect, useRef } from "react";
import { processStocks } from "../services/api";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import dayjs from "dayjs";
import { Button } from "@mui/material";

const Form = ({ setResults, setTf, setScanning }) => {
  const [interval, setInterval] = useState("1d");
  const [price, setPrice] = useState(200);
  const [loading, setLoading] = useState(false); // For spinner/loader
  const [seconds, setSeconds] = useState(0); // For countdown timer
  const [cdate,setCDate] = useState(null)
  const secondsRef = useRef(0); // Ref to keep track of the seconds count

  const priceArray = [200, 300, 500, "All"];
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
      const response = await processStocks({ interval, price , cdate });
      console.log(response.data);
      setResults(response.data.result);
      const tfValue = interval === "1d" ? "D" : interval === "1wk" ? "W" : "M";
      const timestamp = new Date().getTime();
      localStorage.setItem(
        "stockResults",
        JSON.stringify({ data: response.data.result, tf: tfValue, timestamp })
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
      setScanning(false);
    }
  };

  return (
    <center style={{ marginTop: "20px" }}>
      <Box sx={{ maxWidth: 300 , display: 'flex', flexDirection: 'column', rowGap:'20px'}}>
        <FormControl fullWidth>
          <InputLabel id="demo-simple-select-label">interval</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={interval}
            label="interval"
            onChange={(e) => setInterval(e.target.value)}
            disabled={cdate ? true : false}
          >
            <MenuItem value={"1d"}>1 Day</MenuItem>
            <MenuItem value={"1wk"}>1 Week</MenuItem>
            <MenuItem value={"1mo"}>1 Month</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel id="demo-simple-select-label">Price</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={price}
            label="Price "
            onChange={(e) =>
              setPrice(parseInt(e.target.value, 10) || e.target.value)
            }
          >
            {priceArray.map((p) => (
            <MenuItem key={p} value={p}>{p}</MenuItem>
          ))}
          </Select>
        </FormControl>
        <LocalizationProvider dateAdapter={AdapterDayjs} >
          <DatePicker maxDate={dayjs()} onChange={(val)=>{console.log(val); setCDate(val)}}/>
        </LocalizationProvider>
      <Button variant="contained" onClick={handleSubmit}>Submit</Button>
      </Box>

      
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
