# Copy of sliding_window from plotter
def sliding_window(xdomain, occupancy, window):
    occupancy_val = sum(occupancy[:window]) / window 
    print("length: " + str(xdomain))

    new_xdomain = [(xdomain[0] + xdomain[window - 1]) / 2]
    new_occupancy = [occupancy_val]
    for i in range(len(occupancy) - window - 1):
        new_xdomain.append((xdomain[i + 1] + xdomain[i + window]) / 2)  # Added parentheses here
        occupancy_val += (occupancy[i + window] - occupancy[i]) / window
        new_occupancy.append(occupancy_val)
    return {"new_xdomain": new_xdomain, "new_occupancy": new_occupancy}