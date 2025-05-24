import React, { useState, useEffect, useRef } from "react";
import { getTaskStatus, processStocks } from "../services/api";
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
  const [cdate, setCDate] = useState(null);
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
    setSeconds(0);
  
    // Prepare the time frame (optional)
    let tfValue;
    if (interval === "1d") tfValue = "D";
    else if (interval === "1wk") tfValue = "W";
    else if (interval === "1mo") tfValue = "M";
  
    try {
      // Step 1: Submit the job and get task_id
      const response = await processStocks({ interval, price });
      window.alert("hi")
      const taskId = response.data.task_id;
      console.log("Task submitted, task_id:", taskId);
  
      // Step 2: Start polling for status
      pollTaskStatus(taskId, tfValue);
    } catch (error) {
      console.error("Error submitting task:", error);
      setLoading(false);
    }
  };
  const pollTaskStatus = async (taskId, tfValue) => {
    try {
      const statusResponse = await getTaskStatus(taskId);
      const data = await statusResponse.data;
      if (data.status === "pending") {
        // Still processing, poll again after delay
        setTimeout(() => pollTaskStatus(taskId, tfValue), 3000);
      } else if (data.status === "completed") {
        // Task done, update results
        setResults(data.data.result);
        const timestamp = new Date().getTime();
  
        localStorage.setItem(
          "stockResults",
          JSON.stringify({ data: data.data.result, tf: tfValue, timestamp })
        );
  
        setLoading(false);
      } else if (data.status === "failed") {
        console.error("Task failed:", data.error);
        setLoading(false);
      } else {
        // Other states
        console.log("Task status:", data.status);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error polling task status:", error);
      setLoading(false);
    }
  };

  return (
    <center style={{ marginTop: "20px" }}>
      <Box
        sx={{
          maxWidth: 360,
          backgroundColor: "#2e2e3e",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <FormControl
          fullWidth
          sx={{ "& .MuiInputLabel-root": { color: "white" } }}
        >
          <InputLabel id="interval-label">Interval</InputLabel>
          <Select
            labelId="interval-label"
            id="interval-select"
            value={interval}
            label="Interval"
            onChange={(e) => setInterval(e.target.value)}
            disabled={!!cdate}
            sx={{
              color: "white",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "white",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#ccc",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "white",
              },
              "& svg": {
                color: "white", // Dropdown arrow
              },
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  backgroundColor: "#2e2e3e",
                  color: "white",
                },
              },
            }}
          >
            <MenuItem value={"1d"}>1 Day</MenuItem>
            <MenuItem value={"1wk"}>1 Week</MenuItem>
            <MenuItem value={"1mo"}>1 Month</MenuItem>
          </Select>
        </FormControl>

        <FormControl
          fullWidth
          sx={{ "& .MuiInputLabel-root": { color: "white" } }}
        >
          <InputLabel id="price-label">Price</InputLabel>
          <Select
            labelId="price-label"
            id="price-select"
            value={price}
            label="Price"
            onChange={(e) =>
              setPrice(parseInt(e.target.value, 10) || e.target.value)
            }
            sx={{
              color: "white",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "white",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#ccc",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "white",
              },
              "& svg": {
                color: "white",
              },
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  backgroundColor: "#2e2e3e",
                  color: "white",
                },
              },
            }}
          >
            {priceArray.map((p) => (
              <MenuItem key={p} value={p}>
                {p}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            maxDate={dayjs()}
            onChange={(val) => {
              console.log(val);
              setCDate(val);
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "white",
                "& fieldset": {
                  borderColor: "white",
                },
                "&:hover fieldset": {
                  borderColor: "#cccccc",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "white",
                },
                "& input": {
                  color: "white",
                },
                "& svg": {
                  color: "white", // calendar icon
                },
              },
            }}
            slotProps={{
              textField: {
                fullWidth: true,
                InputLabelProps: {
                  style: { color: "white" },
                },
              },
              popper: {
                sx: {
                  ".MuiPaper-root": {
                    backgroundColor: "#2e2e3e",
                    color: "white",
                  },
                  ".MuiPickersDay-root": {
                    color: "white",
                  },
                  ".MuiPickersDay-today": {
                    borderColor: "white",
                  },
                  ".MuiPickersDay-dayOutsideMonth": {
                    color: "#aaa",
                  },
                },
              },
            }}
          />
        </LocalizationProvider>
        <Button variant="contained" onClick={handleSubmit}>
          Submit
        </Button>
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
