import yfinance as yf
import json
from utils.helpers import edit_string
from datetime import datetime, timedelta

def process_stocks(price, interval , cdate):
    # Load stocks from a JSON file
    file = "PassedStocks.json"
    if price != "All" :
        price = float(price)
    if price == 200 : 
        print("200")
        file = "Stocks200.json"
    elif price == 300 : 
        print("300")
        file = "Stocks300.json"
    elif price == 500 :
        print("500")
        file = "Stocks500.json"

    with open(file) as f:
        stocks = json.load(f)
    result = []
    failed = []

    period = "1d"
    if interval == "1wk":
        period="5d"
    elif interval=="1mo":
        period="1mo"
    

    for stock in stocks:
        try:    
            if cdate:
                dt_object = datetime.fromisoformat(cdate.replace("Z", "+00:00"))
                date_only = dt_object.date() + timedelta(days=1)
                next_date = date_only + timedelta(days=1)
                data = yf.download(stock, start=date_only, end=next_date)
            else:
                data = yf.download(stock,period=period, interval=interval)            
            curr_data = data.iloc[0:1]
            curr_high = curr_data.High.iloc[0].item()
            curr_close = curr_data.Close.iloc[0].item()
            curr_open = curr_data.Open.iloc[0].item()
            curr_low = curr_data.Low.iloc[0].item()
            if (curr_close > curr_open):
                cl = curr_high - curr_low
                lowerwick = curr_open - curr_low
                upper_wick = curr_high - curr_close
                middle = (curr_high + curr_low) / 2
                upper_middle = (curr_high + middle) / 2
                lower_middle = (middle + curr_low) / 2
                cl_10 = 10 * cl / 100
                candle_condition = (
                    (curr_close > curr_open) &
                    (curr_close > middle) &
                    (curr_close < upper_middle) &
                    (lowerwick < cl_10) &
                    (curr_open < lower_middle) &
                    (curr_open != curr_low)
                )
                if candle_condition:
                    if cdate:
                        result.append(edit_string(stock))
                    elif get_20ema(stock)>get_50ema(stock):
                        result.append(edit_string(stock))
            else:
                continue
        except Exception:
            failed.append(stock)
    return result, failed


def get_20ema(symbol, period=20):
    print("hello 20")
    data = yf.download(symbol, period="1mo", interval="1d")
    ema = data['Close'].ewm(span=period, adjust=False).mean()
    return ema.tail(1).iloc[0].item()

def get_50ema(symbol, period=50):
    print("hello 50")
    data = yf.download(symbol, period="3mo", interval="1d")
    ema = data['Close'].ewm(span=period, adjust=False).mean()
    return ema.tail(1).iloc[0].item()