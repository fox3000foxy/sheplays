#!/bin/bash

# Setup cron jobs for ShePlays

# Cron job 1: Update talent availability status every 5 minutes
CRON_STATUS="*/5 * * * * curl -s http://localhost:3000/api/cron/update-availability-status > /dev/null 2>&1"

# Cron job 2: Reset all availabilities every Sunday at 23:59
CRON_RESET="59 23 * * 0 curl -s http://localhost:3000/api/cron/weekly-reset > /dev/null 2>&1"

# Get current crontab
CURRENT_CRONTAB=$(crontab -l 2>/dev/null)

# Flag to track if we need to update crontab
NEEDS_UPDATE=false

# Check and add availability status cron job
if echo "$CURRENT_CRONTAB" | grep -q "update-availability-status"; then
    echo "Availability status cron job already exists"
else
    CURRENT_CRONTAB="$CURRENT_CRONTAB
$CRON_STATUS"
    NEEDS_UPDATE=true
    echo "Added availability status cron job (every 5 minutes)"
fi

# Check and add weekly reset cron job
if echo "$CURRENT_CRONTAB" | grep -q "weekly-reset"; then
    echo "Weekly reset cron job already exists"
else
    CURRENT_CRONTAB="$CURRENT_CRONTAB
$CRON_RESET"
    NEEDS_UPDATE=true
    echo "Added weekly reset cron job (Sunday at 23:59)"
fi

# Update crontab if needed
if [ "$NEEDS_UPDATE" = true ]; then
    echo "$CURRENT_CRONTAB" | crontab -
    echo "Cron jobs configured successfully"
else
    echo "All cron jobs already configured"
fi

# Display current crontab
echo ""
echo "Current crontab:"
crontab -l
