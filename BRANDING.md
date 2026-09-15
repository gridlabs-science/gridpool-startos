# GridPool triangle icon

Keep this guide named BRANDING.md: StartOS icon discovery treats ICON.md as a
second candidate beside icon.svg regardless of its extension.

The production master is `icon.svg`, shared byte-for-byte with the Umbrel
package's `gridlabs-gridpool/icon.svg`. No fonts, scripts, or external assets.

Warm-white triangle: #F3F1E9. Cyan work curve: #61C9D5. Graphite tile: #111211.
The curved stroke starts at x=27 and ends at x=84; the triangle axis is x=46.
That gives the intended 19:38 (one-third / two-thirds) horizontal division.
The curve flattens into a constant-width horizontal stroke. The complete mark
is optically centered, with generous tile padding and clear intersection gaps.

SVG is authoritative. PNG exports are renderings for announcements and previews,
not a substitute master. The icon does not encode a runtime state or safety
indicator. Changing the mark must not alter package IDs, node identities, or
mining configuration.
