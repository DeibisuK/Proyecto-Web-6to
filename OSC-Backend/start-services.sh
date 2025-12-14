#!/bin/bash

# Define colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting OSC-Backend Microservices...${NC}"

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo -e "${RED}Error: PM2 is not installed.${NC}"
    echo "Please install it using: npm install -g pm2"
    exit 1
fi

# Start the ecosystem
echo "Launching ecosystem..."
pm2 start ecosystem.config.cjs

# Save the process list to be respawned after reboot
echo "Saving PM2 process list..."
pm2 save

# Display status
pm2 status

echo -e "${GREEN}All services have been attempted to start.${NC}"
echo "Use 'pm2 logs' to monitor logs."
