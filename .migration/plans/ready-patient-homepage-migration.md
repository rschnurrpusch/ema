# Homepage Migration Plan: thereadypatient.com

## Overview
Migrate the index (homepage) of https://www.thereadypatient.com/ to AEM Edge Delivery Services. This involves analyzing the source page structure, identifying content blocks, creating import infrastructure, and generating the final content.

## Source
- **URL**: https://www.thereadypatient.com/
- **Target path**: `/content/index.plain.html` (replacing current boilerplate content)

## Current State
- The project has existing blocks: `hero`, `columns`, `cards`, `header`, `footer`, `fragment`
- Global styles exist in `styles/styles.css`, `styles/lazy-styles.css`, `styles/fonts.css`
- No import tooling exists yet (`tools/importer/` directory is empty)
- Current `content/index.plain.html` contains boilerplate sample content

## Migration Approach
Use the site migration skill to orchestrate the full pipeline:

1. **Site/Page Analysis** — Fetch and analyze the homepage to identify sections, blocks, and content structure
2. **Block Mapping** — Map identified content patterns to existing EDS blocks or create new block variants
3. **Design Extraction** — Extract colors, fonts, spacing, and other design tokens from the source site
4. **Import Infrastructure** — Generate parsers and transformers for the content import
5. **Content Import** — Run the import to produce the final `index.plain.html`
6. **Verification** — Preview the migrated page and validate rendering

## Checklist

- [ ] Analyze https://www.thereadypatient.com/ homepage structure (sections, blocks, content patterns)
- [ ] Identify which existing blocks (hero, columns, cards, etc.) can be reused
- [ ] Determine if new block variants are needed
- [ ] Extract design tokens (colors, typography, spacing) from source site
- [ ] Create page template mapping (page-templates.json)
- [ ] Generate block parsers for content import
- [ ] Generate page transformers (cleanup + sections)
- [ ] Execute content import to produce migrated index.plain.html
- [ ] Apply site design (global styles, fonts, colors)
- [ ] Preview and verify the migrated page renders correctly
- [ ] Validate block styling matches the original site

## Risks & Considerations
- The source site may use custom components that don't map to existing blocks — new blocks may need to be created
- Image assets will need to be downloaded and referenced correctly
- Navigation and footer content are typically handled separately from the page body
- Design fidelity depends on how closely CSS can replicate the original without deviating from EDS conventions

## Execution
This plan requires **Execute mode** to proceed with implementation. The `excat:excat-site-migration` skill will orchestrate the migration workflow.
