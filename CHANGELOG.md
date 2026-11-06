# Changelog

All notable changes to pve-organize. Versions follow [Semantic Versioning](https://semver.org/).

## [1.0.0] — 2026-11-06

First numbered release. Tested on Proxmox VE 9.2 and 8.4.

### Added
- Group headers and subcategories in the **Server View** tree, from guest tags.
- Right-click **Move to group** menu, and a **Tree groups…** window (names, colors, order,
  styles A–F, counter, indent, ON/OFF) with live preview.
- English, Portuguese and Spanish, following the Proxmox login language.
- `pve-organize on | off | status | version | uninstall`, and an apt hook that re-applies the add-on
  after Proxmox updates.
- Installer downloads a numbered release and verifies `SHA256SUMS` before installing.

### Fixed (since the first unnumbered builds)
- Removing a group keeps the tag on the guests; the tag's original color comes back.
- Adding a group for a tag that already has a color keeps that color.
- Group names are HTML-escaped everywhere (no script injection through names).
- Renaming several groups at once updates each guest with a single change.
- Saving re-reads the Datacenter options, so notes edited meanwhile are not overwritten.
- Saving no longer changes the global Tag Style options (case-sensitive, ordering, shape).
- The one-line installer never picks up files from the current directory.
- `pve-organize on` fails loudly if it cannot hook into the Proxmox page.
