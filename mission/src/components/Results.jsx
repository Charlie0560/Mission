import React, { useRef, useState } from "react";
// import TradingView from "./TradingView";
import '../App.css'

const Result = ({ result,tf }) => {
  const container = useRef();
  const [showCharts, setShowcharts] = useState(false);

  const createScriptsForAllStocks = () => {
    setShowcharts(true)
    result.forEach((stock) => {
      const script = document.createElement("script");
      script.src =
        "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
      script.type = "text/javascript";
      script.async = true;
      console.log(trimStockSymbol(stock))
      script.innerHTML = `
        {
          "autosize": true,
          "symbol": ${trimStockSymbol(stock)},
          "interval": "${tf}",
          "timezone": "Asia/Kolkata",
          "withdateranges": true,
          "theme": "dark",
          "style": "1",
          "locale": "en",
          "allow_symbol_change": true,
          "calendar": false,
          "support_host": "https://www.tradingview.com"
        }`;

      container.current.appendChild(script);
    });
  };

  const trimStockSymbol = (symbol) => {
    let s_name = symbol.split(":")[1] || symbol;
    s_name = '"' + s_name + '"';
    return s_name;
  };

  const trimMoneyControl = (symbol) => {
    let s_name = symbol.split(":")[1] || symbol;
    return s_name;
  };
  return (
    <center>
      <h2>Results</h2>
      {!showCharts && result?.map((stock, index) => (
        <li key={index}>
          <a
            href={` https://www.moneycontrol.com/mc/stock/chart?scId=RVN&exchangeId=${trimMoneyControl(
              stock
            )}&ex=NSE`}
           
            target="_blank"
            rel="noopener noreferrer"
            style={{textDecoration: "none"}}
          >
            {stock.split(":")[1] || stock}
          </a>
        </li>
      ))}
      {
        !showCharts && result && result.length>0 &&(<button onClick={createScriptsForAllStocks} style={{marginTop: "20px"}}>See charts</button>)
      }
      {result && result.length > 0 ? (
        <center>
           <div
              className="tradingview-widget-container chartsContainer"
              ref={container}
            >
              <div
                className="tradingview-widget-container__widget"
                style={{ height: "calc(100% - 32px)", width: "100%" }}
              ></div>
              <div className="tradingview-widget-copyright">
                <a
                  href="https://www.tradingview.com/"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  .
                </a>
              </div>
            </div>
        </center>
      ) : (
        <p>No results found.</p>
      )}
    </center>
  );
};

export default Result;

