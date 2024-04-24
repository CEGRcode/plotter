def sliding_window(x_domain, occupancy, window):
    occupancy_val = sum(occupancy[:window]) / window 
    new_xdomain = [(x_domain[0] + x_domain[window - 1]) / 2]
    new_occupancy = [occupancy_val]
    for i in range(len(occupancy) - window - 1):
        new_xdomain.append((x_domain[i + 1] + x_domain[i + window]) / 2)  # Added parentheses here
        occupancy_val += (occupancy[i + window] - occupancy[i]) / window
        new_occupancy.append(occupancy_val)
    return {"new_xdomain": new_xdomain, "new_occupancy": new_occupancy}