# Changelog

All notable changes to pve-organize. Versions follow [Semantic Versioning](https://semver.org/).

## [1.0.3] — 2026-11-09

### Added
- **Watcher** (`pve-organize-vigia.path`, systemd): when a Proxmox update replaces the web UI page,
  the add-on is put back within seconds. Before, the apt hook only did it when the whole `apt` run
  ended, so the groups disappeared for the length of the update (minutes, with a new kernel).
  The apt hook stays as a second check. `pve-organize status` shows the watcher.
- README: what to expect after a Proxmox update (no need to reinstall; Ctrl+F5).

### Changed
- `pve-organize reaplicar` only rewrites the page when the add-on line is missing or outdated, and
  logs to the journal (`journalctl -t pve-organize`), including the error when a new Proxmox page
  cannot be patched. Before, the apt hook discarded every message.
- `pve-organize uninstall` also removes the watcher.

### Tested
- Watcher, on a local copy of the Proxmox 8.4 page: replacing the page the way `dpkg` does puts the
  line back in about 0.1 s, the add-on's own write does not loop, and a page without the
  `pvemanagerlib.js` line logs an error.

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
