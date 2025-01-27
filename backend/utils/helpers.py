def edit_string(input_string):
    input_string = input_string.replace('"', '')

    parts = input_string.split('.')
    if len(parts) == 2:
        return f"NSE:{parts[0]}"
    return "Invalid input format"
