#!/bin/bash

# Run all integration tests
echo "Running integration tests..."
npx vitest run tests/integration

# Run all component tests
echo -e "\nRunning component tests..."
npx vitest run client/src/pages/Opportunities.test.tsx
#npx vitest run client/src/components/OpportunityCard.test.tsx

# Print completion message
echo -e "\nTests completed!"