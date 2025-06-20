import yfinance as yf
import json
from utils.helpers import edit_string
from datetime import datetime, timedelta


def calculate_ema(data, period):
    return data['Close'].ewm(span=period, adjust=False).mean()


def get_stock_data(stock, interval, period, cdate):
    try:
        stock = stock.replace("$", "")  # Clean up ticker symbol
        print("Stock: " , stock)
        ticker = yf.Ticker(stock)

        if cdate:
            # Convert input date to datetime
            dt_object = datetime.fromisoformat(cdate.replace("Z", "+00:00")) if "T" in cdate else datetime.strptime(cdate, "%Y-%m-%d")
            date_only = dt_object.date()
            start_date = date_only - timedelta(days=150)
            end_date = date_only + timedelta(days=1)
            data = ticker.history(start=start_date, end=end_date, interval=interval)
        else:
            data = ticker.history(period=period, interval=interval)

        data.dropna(inplace=True)
        if data.empty or len(data) < 1:
            raise ValueError(f"{stock}: No data found, possibly delisted or invalid symbol.")
        return data
    except Exception as e:
        print(f"Error fetching data for {stock}: {e}")
        return None


def process_stocks(price, interval, cdate):
    file = "PassedStocks.json"
    if price != "All":
        price = float(price)
        if price == 200:
            file = "Stocks200.json"
        elif price == 300:
            file = "Stocks300.json"
        elif price == 500:
            file = "Stocks500.json"

    with open(file) as f:
        stocks = json.load(f)

    result = []
    failed = []

    # Default period and interval
    period = "6mo"
    interval = interval or "1d"

    if interval == "1wk":
        period = "5d"
    elif interval == "1mo":
        period = "1mo"

    for stock in stocks:
        data = get_stock_data(stock, interval, period, cdate)
        if data is None:
            failed.append(stock)
            continue

        try:
            # Calculate EMAs
            data['EMA20'] = calculate_ema(data, 20)
            data['EMA50'] = calculate_ema(data, 50)

            # Fetch row: either for specific date or latest
            if cdate:
                dt_object = datetime.fromisoformat(cdate.replace("Z", "+00:00")) if "T" in cdate else datetime.strptime(cdate, "%Y-%m-%d")
                date_only = dt_object.date()
                latest = data.loc[data.index.date == date_only]
                latest = latest.iloc[-1] if not latest.empty else None
            else:
                latest = data.iloc[-1]

            if latest is None:
                failed.append(stock)
                continue

            # Extract OHLC and EMAs
            O = latest['Open']
            H = latest['High']
            L = latest['Low']
            C = latest['Close']
            ema_20 = data["EMA20"].iloc[-1]
            ema_50 = data["EMA50"].iloc[-1]
            CL = H - L
            M = (H + L) / 2
            LM = (M + L) / 2

            # Candle condition
            if C > O:
                conditions_met = (
                    L <= O and
                    C < H and
                    C > M and
                    O < LM and
                    C > 1.02 * O and
                    O < ema_20 < C and
                    ema_20 > ema_50
                )
                if conditions_met:
                    result.append(edit_string(stock))

        except Exception as e:
            print(f"Processing error for {stock}: {e}")
            failed.append(stock)

    return result, failed
