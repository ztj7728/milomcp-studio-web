#!/bin/sh

# ==============================================================================
# inject-env.sh
#
# Injects runtime environment variables into the Next.js application.
# This script finds all environment variables prefixed with NEXT_PUBLIC_,
# creates a JSON object from them, and injects this object into the
# application's HTML files, making them available on the `window` object.
# ==============================================================================

set -e

echo "🔧 Injecting runtime environment variables..."

# Create a JSON string from all NEXT_PUBLIC_ variables
# 1. `env` lists all environment variables.
# 2. `grep ^NEXT_PUBLIC_` filters for lines starting with NEXT_PUBLIC_.
# 3. `awk -F= ...` formats each line as a JSON key-value pair.
#    - It escapes double quotes in the value.
#    - It wraps both key and value in double quotes.
# 4. `paste -sd,` joins all lines with a comma.
# 5. The result is wrapped in curly braces `{}` to form a valid JSON object.
RUNTIME_CONFIG=$(env | grep ^NEXT_PUBLIC_ | awk -F= '{
  printf "%s:\"%s\",", $1, gensub(/"/, "\\\"", "g", $2)
}' | sed 's/,$//' | awk '{print "{"$0"}"}')

# If no NEXT_PUBLIC_ variables are found, create an empty JSON object.
if [ -z "$RUNTIME_CONFIG" ]; then
  RUNTIME_CONFIG='{}'
fi

echo "✅ Generated config: $RUNTIME_CONFIG"

# The placeholder to be replaced in the HTML files.
# This should match the placeholder in your layout.tsx or _document.tsx.
PLACEHOLDER='"__RUNTIME_CONFIG_PLACEHOLDER__"'

# Find all HTML files in the .next directory and replace the placeholder.
# We use `find` to handle different Next.js output structures.
find /app/.next -name "*.html" -type f -exec sed -i "s|$PLACEHOLDER|$RUNTIME_CONFIG|g" {} +
find /app/.next -name "*.js" -type f -exec sed -i "s|$PLACEHOLDER|$RUNTIME_CONFIG|g" {} +


echo "✅ Environment variables injected successfully!"

# Execute the original command passed to the script (e.g., `node server.js`)
exec "$@"