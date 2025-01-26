def edit_string(input_string):
    input_string = input_string.replace('"', '')

    parts = input_string.split('.')
    if len(parts) == 2:
        return f"NSE:{parts[0]}"
    return "Invalid input format"



def get_20ema(symbol, period=20):
    data = yf.download(symbol, period="1mo", interval="1d")
    ema = data['Close'].ewm(span=period, adjust=False).mean()
    return ema.tail(1).iloc[0].item()

def get_50ema(symbol, period=50):
    data = yf.download(symbol, period="3mo", interval="1d")
    ema = data['Close'].ewm(span=period, adjust=False).mean()
    return ema.tail(1).iloc[0].item()