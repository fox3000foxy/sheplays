#!/bin/bash

# Setup cron job to update talent availability status every 5 minutes

CRON_JOB="*/5 * * * * curl -s http://localhost:3000/api/cron/update-availability-status > /dev/null 2>&1"

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -q "update-availability-status"; then
    echo "Cron job already exists"
else
    # Add cron job
    (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
    echo "Cron job added successfully"
    echo "Talent availability status will be updated every 5 minutes"
fi

# Display current crontab
echo ""
echo "Current crontab:"
crontab -l
