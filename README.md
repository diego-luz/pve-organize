# PVE Organize

**Groups and separators for the Proxmox VE resource tree.** Organize your VMs and containers
into colored sections — like *Production › Network*, *Testing*, *Template* — right inside the
Server View, with a settings screen for colors, order and style.

**English** · [Português (Brasil)](README.pt-BR.md) · [Español](README.es.md)

[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
![Proxmox VE 8 / 9](https://img.shields.io/badge/Proxmox%20VE-8%20%7C%209-orange)

![The six styles](docs/estilos.png)

- **Two levels**: a *top level* (big header) and an optional *subcategory* (small header) per guest.
- **Uses Proxmox tags** — nothing new to store on the guests. A guest tagged `Production;Network`
  shows up under **PRODUCTION › Network**.
- **Right-click → Move to group** to change a guest's group in two clicks.
- **Tree groups… screen**: add groups, pick colors (or let it choose them), drag to reorder,
  choose one of 6 styles, counter, indentation, and an on/off switch.
- **Settings are shared**: stored in the Datacenter Notes and Tag Style, so every admin and
  every browser sees the same tree.
- **Follows the Proxmox language**: English, Português and Español (others fall back to English).
- **Survives Proxmox updates** and is removed with a single command.

> Community project, not affiliated with Proxmox Server Solutions GmbH.

---

## Install

On the Proxmox node, as `root`:

```bash
bash -c "$(curl -fsSL https://raw.githubusercontent.com/diego-luz/pve-organize/main/install.sh)"
```

Then reload the Proxmox page (**F5**). From a clone, run `./install.sh` instead.

Requirements: Proxmox VE 8 or newer (tested on 9.2). Run it on every node of a cluster whose
web UI you use.

## Use

1. **Put guests in groups.** Right-click a VM/CT → **Move to group** → *Production* → *Network*.
   Or set the tags by hand (one top-level tag and, optionally, one subcategory tag).
2. **Tune it.** Right-click any guest, the node or *Datacenter* → **Tree groups…**

| In the *Tree groups* screen | |
|---|---|
| **Add** | type a name; the tag is created from it (accents and spaces removed) |
| **Color** | click the swatch to open the color picker, or **Automatic colors** |
| **Order** | drag the ☰ handle; the list order is the tree order |
| **Guests** | how many guests use each group; renaming a tag updates those guests |
| **Look** | style A–F, counter, indent, hide duplicated tags — the tree updates live; *Cancel* reverts |
| **ON / OFF** | top button: turns the separators off or on immediately, keeping all settings |

Guests without a known top-level tag appear at the end, under **No group**.

## Commands

```bash
pve-organize status      # on / off
pve-organize off         # remove from the web UI (settings are kept)
pve-organize on          # load it again
pve-organize uninstall   # remove everything that was installed
```

## How it works

- `/usr/local/share/pve-organize/pve-organize.js` is copied to `/usr/share/pve-manager/js/`
  and one `<script>` line is added to `/usr/share/pve-manager/index.html.tpl`.
  A clean copy of that page is kept in `/usr/local/share/pve-organize/index.html.tpl.original`.
- An apt hook (`/etc/apt/apt.conf.d/99pve-organize`) puts the line back after Proxmox updates.
- Groups, order and style live in a hidden block at the end of **Datacenter → Notes**
  (`<!-- pve-organize … -->`); colors live in **Datacenter → Options → Tag Style**.
  Don't edit that block by hand; the rest of your notes is left alone.
- It only changes the web UI. Moving a guest only edits its tags.

Permissions: moving a guest needs `VM.Config.Options` on it; saving the *Tree groups* screen
needs `Sys.Modify` on `/`.

## Update and uninstall

- **Update**: run the install command again.
- **Uninstall**: `pve-organize uninstall`, then F5. Your groups stay in the Datacenter Notes and
  Tag Style; delete them there if you want.
- **Something looks wrong?** `pve-organize off` and F5 brings back the stock Proxmox tree.

## Translations

UI texts are in the `TEXTOS` table at the top of `pve-organize.js` (one line per text:
Portuguese, English, Spanish). Pull requests with more languages are welcome.

## License

[MIT](LICENSE)
