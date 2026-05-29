#!/bin/bash
# Export all content from the DA preview environment
# Usage: ./tools/export-content.sh [branch] [owner] [repo]
#
# Defaults to: main--ema--rschnurrpusch
# Output: content/ directory (mirrors site structure)

BRANCH="${1:-main}"
REPO="${2:-ema}"
OWNER="${3:-rschnurrpusch}"
BASE_URL="https://${BRANCH}--${REPO}--${OWNER}.aem.page"
OUTPUT_DIR="content"

# All known content paths
PAGES=(
  "/index"
  "/nav"
  "/footer"
  "/knee"
  "/hip"
  "/foot-ankle"
  "/shoulder"
  "/elbow"
  "/find-a-doc"
  "/get-updates"
  "/share-your-story"
  "/fragments/more-you-can-do"
  "/knee/roberts-patient-story-knee-replacement"
  "/knee/robots-used-in-surgery"
  "/knee/4-common-joint-replacement-questions-and-answers"
  "/knee/denise-good-partial-knee-replacement"
  "/hip/hip-replacement-patient-story-steve"
  "/hip/what-causes-hip-pain"
  "/hip/hip-replacement-surgery-what-to-expect"
  "/hip/recovering-from-hip-replacement"
  "/hip/hip-exercises-for-pain-relief"
  "/hip/anterior-vs-posterior-hip-replacement"
  "/hip/signs-you-may-need-hip-replacement"
  "/hip/hip-pain-at-night"
  "/hip/life-after-hip-replacement"
  "/hip/hip-arthritis-treatment-options"
  "/hip/preparing-for-hip-surgery"
  "/hip/hip-pain-young-adults"
  "/foot-ankle/bunion-surgery-what-to-know"
  "/foot-ankle/plantar-fasciitis-treatment"
  "/foot-ankle/ankle-replacement-vs-fusion"
  "/foot-ankle/foot-pain-causes"
  "/foot-ankle/recovering-from-foot-surgery"
  "/foot-ankle/ankle-sprain-vs-fracture"
  "/foot-ankle/flat-feet-treatment"
  "/foot-ankle/diabetic-foot-care"
  "/foot-ankle/hammer-toe-correction"
  "/foot-ankle/achilles-tendon-injuries"
  "/foot-ankle/choosing-the-right-shoes"
  "/foot-ankle/morton-neuroma"
  "/shoulder/rotator-cuff-tear-treatment"
  "/shoulder/shoulder-replacement-surgery"
  "/shoulder/frozen-shoulder-causes-treatment"
  "/shoulder/shoulder-pain-when-sleeping"
  "/shoulder/shoulder-arthroscopy"
  "/shoulder/exercises-for-shoulder-pain"
  "/shoulder/shoulder-impingement-syndrome"
  "/shoulder/recovering-from-shoulder-surgery"
  "/shoulder/reverse-shoulder-replacement"
  "/shoulder/shoulder-dislocation"
  "/shoulder/shoulder-pain-diagnosis"
  "/shoulder/shoulder-strengthening-after-injury"
  "/elbow/tennis-elbow-treatment"
  "/elbow/elbow-replacement-surgery"
  "/elbow/golfers-elbow-vs-tennis-elbow"
  "/elbow/elbow-pain-causes"
  "/elbow/cubital-tunnel-syndrome"
  "/elbow/elbow-arthritis"
  "/elbow/recovering-from-elbow-surgery"
  "/elbow/elbow-bursitis"
  "/elbow/exercises-for-elbow-pain"
  "/elbow/elbow-fracture-treatment"
  "/elbow/elbow-joint-preservation"
  "/elbow/preventing-elbow-injuries"
)

echo "Exporting content from: ${BASE_URL}"
echo "Output directory: ${OUTPUT_DIR}"
echo "Pages to export: ${#PAGES[@]}"
echo ""

SUCCESS=0
FAIL=0

for PAGE in "${PAGES[@]}"; do
  URL="${BASE_URL}${PAGE}.plain.html"
  # Create directory structure
  DIR="${OUTPUT_DIR}$(dirname ${PAGE})"
  FILENAME="$(basename ${PAGE}).plain.html"
  mkdir -p "${DIR}"

  # Fetch the page
  HTTP_CODE=$(curl -s -o "${DIR}/${FILENAME}" -w "%{http_code}" "${URL}")

  if [ "${HTTP_CODE}" = "200" ]; then
    echo "  ✓ ${PAGE}"
    SUCCESS=$((SUCCESS + 1))
  else
    echo "  ✗ ${PAGE} (HTTP ${HTTP_CODE})"
    rm -f "${DIR}/${FILENAME}"
    FAIL=$((FAIL + 1))
  fi
done

echo ""
echo "Export complete: ${SUCCESS} succeeded, ${FAIL} failed"
echo "Content saved to: ${OUTPUT_DIR}/"
