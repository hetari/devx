#!/bin/bash

# https://gist.github.com/Saad5400/032e0ee566812449e08e0aa84cf5fc24

# Script: rename-tailwind-static-to-logical.sh
# Purpose: Renames Tailwind CSS static direction classes (e.g., left-*, right-*, pl-*, pr-*) to logical direction classes (e.g., start-*, end-*, ps-*, pe-*) and
#          replaces matching w-* h-* pairs (e.g., w-4 h-4 or h-4 w-4) with size-* (e.g., size-4) in project files.
# Supports Tailwind CSS v4.0+ logical properties and size utilities for RTL compatibility and concise styling.
#
# Usage:
# 1. Save this script as `rename-tailwind-static-to-logical.sh`.
# 2. Make it executable:
#    chmod +x rename-tailwind-static-to-logical.sh
# 3. Run in dry-run mode to preview changes (no files modified):
#    ./rename-tailwind-static-to-logical.sh [directory] true
#    Example: ./rename-tailwind-static-to-logical.sh src true
# 4. Run to apply changes:
#    ./rename-tailwind-static-to-logical.sh [directory]
#    Example: ./rename-tailwind-static-to-logical.sh src
#
# Notes:
# - Default directory is `src` if not specified.
# - Processes files with extensions: html, js, jsx, ts, tsx, vue, svelte, astro.
# - Excludes node_modules, dist, and build directories.
# - Always back up your project or use version control before running.
# - Test in RTL mode (<html >) to verify logical properties.
# - For dynamic classes (e.g., pl-${size} or w-${size}), update logic manually.
# - On macOS, install GNU sed for better compatibility: brew install gnu-sed
# - Handles w-N h-N or h-N w-N pairs with matching values (e.g., w-4 h-4 → size-4).

# Define the directory to search for files (default: src)
SEARCH_DIR="${1:-src}"

# Dry-run option (set to true for preview, false to apply changes)
DRY_RUN="${2:-false}"

# Define file extensions to process
FILE_EXTENSIONS="html,js,jsx,ts,tsx,vue,svelte,astro"

# Definereplacement mappings for static to logical classes
declare -A DIRECTION_REPLACEMENTS=(
  ["\\bleft-([0-9]+|auto|full)\\b"]="start-\1"
  ["\\bright-([0-9]+|auto|full)\\b"]="end-\1"
  ["\\bpl-([0-9]+|auto)\\b"]="ps-\1"
  ["\\bpr-([0-9]+|auto)\\b"]="pe-\1"
  ["\\bml-([0-9]+|auto)\\b"]="ms-\1"
  ["\\bmr-([0-9]+|auto)\\b"]="me-\1"
  ["\\bborder-l-([0-9]+)\\b"]="border-s-\1"
  ["\\bborder-r-([0-9]+)\\b"]="border-e-\1"
  ["\\btext-left\\b"]="text-start"
  ["\\btext-right\\b"]="text-end"
  ["\\bfloat-left\\b"]="float-start"
  ["\\bfloat-right\\b"]="float-end"
  ["\\bclear-left\\b"]="clear-start"
  ["\\bclear-right\\b"]="clear-end"
)

# Define patterns for w-* and h-* to size-* replacements
# Matches w-N h-N or h-N w-N where N is the same value (e.g., w-4 h-4 or h-4 w-4)
declare -A SIZE_REPLACEMENTS=(
  ["\\bw-([0-9]+|auto|full)\\b.*\\bh-\1\\b"]="size-\1"
  ["\\bh-([0-9]+|auto|full)\\b.*\\bw-\1\\b"]="size-\1"
)

# Check if SEARCH_DIR exists
if [ ! -d "$SEARCH_DIR" ]; then
  echo "Error: Directory $SEARCH_DIR does not exist."
  exit 1
fi

# Detect sed version (GNU or BSD)
SED=$(command -v sed)
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS: Use -E for extended regex
  SED_FLAG="-E"
else
  # Linux: Use -r for extended regex
  SED_FLAG="-r"
fi

# Find files with specified extensions, excluding node_modules, dist, and build
FILES=$(find "$SEARCH_DIR" -type f \( -name "*.html" -o -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" -o -name "*.vue" -o -name "*.svelte" -o -name "*.astro" \) ! -path "*/node_modules/*" ! -path "*/dist/*" ! -path "*/build/*")

# Check if any files were found
if [ -z "$FILES" ]; then
  echo "No files found with extensions: $FILE_EXTENSIONS"
  exit 0
fi

# Process each file
for FILE in $FILES; do
  MODIFIED=false
  # Create a temporary file
  TEMP_FILE=$(mktemp)

  # Copy original file to temp
  cp "$FILE" "$TEMP_FILE"

  # First pass: Apply direction replacements
  for PATTERN in "${!DIRECTION_REPLACEMENTS[@]}"; do
    REPLACEMENT="${DIRECTION_REPLACEMENTS[$PATTERN]}"
    if grep -Eq "$PATTERN" "$FILE"; then
      $SED $SED_FLAG "s/$PATTERN/$REPLACEMENT/g" "$TEMP_FILE" > "${TEMP_FILE}.tmp" 2>/dev/null
      if [ $? -eq 0 ]; then
        mv "${TEMP_FILE}.tmp" "$TEMP_FILE"
        MODIFIED=true
      else
        echo "Error: Failed to apply direction replacement for pattern '$PATTERN' in $FILE"
        rm "${TEMP_FILE}.tmp" 2>/dev/null
        rm "$TEMP_FILE" 2>/dev/null
        continue
      fi
    fi
  done

  # Second pass: Apply size replacements
  for PATTERN in "${!SIZE_REPLACEMENTS[@]}"; do
    REPLACEMENT="${SIZE_REPLACEMENTS[$PATTERN]}"
    if grep -Eq "$PATTERN" "$FILE"; then
      $SED $SED_FLAG "s/$PATTERN/$REPLACEMENT/g" "$TEMP_FILE" > "${TEMP_FILE}.tmp" 2>/dev/null
      if [ $? -eq 0 ]; then
        mv "${TEMP_FILE}.tmp" "$TEMP_FILE"
        MODIFIED=true
      else
        echo "Error: Failed to apply size replacement for pattern '$PATTERN' in $FILE"
        rm "${TEMP_FILE}.tmp" 2>/dev/null
        rm "$TEMP_FILE" 2>/dev/null
        continue
      fi
    fi
  done

  # If dry-run, show diff and skip writing
  if [ "$DRY_RUN" = "true" ]; then
    if [ "$MODIFIED" = "true" ]; then
      echo "Changes for $FILE:"
      diff -u "$FILE" "$TEMP_FILE" || true
    fi
    rm "$TEMP_FILE" 2>/dev/null
  # If not dry-run and modified, overwrite original
  elif [ "$MODIFIED" = "true" ]; then
    mv "$TEMP_FILE" "$FILE"
    echo "Updated: $FILE"
  else
    rm "$TEMP_FILE" 2>/dev/null
  fi
done

echo "Class renaming complete."
