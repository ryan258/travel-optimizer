function validateInput(body) {
    const { destinations, preferences, budget, days } = body;
    if (!destinations || !Array.isArray(destinations) || destinations.length === 0) {
        return 'Please provide at least one destination.';
    }
    if (!preferences || typeof preferences !== 'string') {
        return 'Please provide your travel preferences.';
    }
    if (!budget || isNaN(Number(budget))) {
        return 'Please provide a valid budget.';
    }
    if (!days || isNaN(Number(days)) || Number(days) < 1) {
        return 'Please provide a valid number of days.';
    }
    return null;
}

module.exports = { validateInput };
