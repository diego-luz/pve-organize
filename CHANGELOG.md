# Changelog

All notable changes to pve-organize. Versions follow [Semantic Versioning](https://semver.org/).

## [1.0.2] — 2026-11-09

### Fixed
- **Clusters with Tag Style → case-sensitive off (the Proxmox default):** Proxmox saves tags in
  lowercase, so guests showed under "No group" and group colors were lost. Tags are now matched
  without regard to case, and group colors are saved in the case Proxmox uses.
- Two groups whose tags differ only in case (`Test` and `TEST`) are refused, since Proxmox may merge
  them.
- Renaming a group's tag: guests that cannot be changed (locked by a backup, snapshot or migration,
  or on a node that is down) are listed in a single message at the end, instead of one error each.

### Tested
- Proxmox VE 8.4 in a 3-node cluster (case-sensitive on): groups and subgroups, Move to group,
  renaming groups, a locked guest. Case-sensitive off: the Proxmox 8.4 web UI with a simulated API.

## [1.0.1] — 2026-11-09

### Fixed
- Renaming a group in **Tree groups…** now renames its tag too (and the guests that use it), as long
  as the tag was still the one derived from the old name. Before, a group renamed from "Template" to
  "Clients" kept showing the `Template` tag on its guests. A tag edited by hand is left alone.

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
