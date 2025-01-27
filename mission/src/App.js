import React, { useState, useEffect } from "react";
import Form from "./components/Form";
import Result from "./components/Results";

const App = () => {
  const [results, setResults] = useState([]);
  const [timeFrame,setTf] = useState('D')
  const [scanning,setScanning] = useState(false)

  // Load results from local storage on component mount
  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("stockResults"));
    if (storedData) {
      const { data, timestamp,tf} = storedData;
      const now = new Date().getTime();
      if (now - timestamp < 3600000) {
        setResults(data);
        setTf(tf)
      } else {
        localStorage.removeItem("stockResults");
      }
    }
  }, []);

  return (
    <div className="project">
      <Form setResults={setResults} setTf={setTf} setScanning={setScanning}/>
      <Result result={results} tf={timeFrame} scanning={scanning}/>
    </div>
  );
};

export default App;
