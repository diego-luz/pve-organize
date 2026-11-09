<div align="center">

<img src="docs/logo.svg" alt="pve-organize" width="420">

**Groups and separators for the Proxmox VE resource tree.**

[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
![Tested on Proxmox VE 8.4 · 9.2](https://img.shields.io/badge/tested%20on-Proxmox%20VE%208.4%20%C2%B7%209.2-orange)

**English** · [Português (Brasil)](README.pt-BR.md) · [Español](README.es.md)

</div>

> Organize your VMs and containers into colored sections — like *Production › Network*,
> *Testing*, *Template* — right inside the Server View, with a settings screen for colors,
> order and style.

![pve-organize in action: moving a guest, changing the style live, turning it off and on](docs/demo.gif)

<sub>All screenshots and animations use a fictitious lab (node `pve01`), not a real server.</sub>

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

## Screenshots

**Before and after** — the stock tree with tags, and the same guests with pve-organize:

<img src="docs/antes-depois.png" alt="Before and after" width="560">

**The six styles** (pick one in *Tree groups…*):

<img src="docs/estilos.png" alt="The six styles" width="760">

**Right-click → Move to group:**

<img src="docs/menu.png" alt="Move to group menu" width="480">

**Tree groups… screen** — colors, order, style and the ON/OFF switch:

<img src="docs/tela-grupos.png" alt="Tree groups screen" width="720">

**Dark and light themes:**

<img src="docs/temas.png" alt="Dark and light themes" width="560">

**Follows the Proxmox language** (Português and Español shown here):

<img src="docs/idiomas.png" alt="Portuguese and Spanish" width="860">

---

## Why not Tag View or pools?

Proxmox VE already has a **Tag View** (since 8.3) and a **Pool View**, and there are community mods
that add folders. They solve related problems; pve-organize is aimed at a different one:
keeping the **Server View** you already use, just organized.

| | pve-organize | Tag View | Pool View | Mods that replace `pvemanagerlib.js` |
|---|:-:|:-:|:-:|:-:|
| Stays in the Server View (grouped by node) | ✅ | ❌ | ❌ | varies |
| Each guest appears in exactly one place | ✅ | ❌ (once per tag) | ✅ | varies |
| Two levels (group › subgroup) | ✅ | ❌ | ❌ | ✅ |
| Header colors, custom order, styles | ✅ | ❌ | ❌ | ❌ |
| Settings screen in the web UI | ✅ | — | — | ❌ |
| Config shared by the whole cluster | ✅ | ✅ | ✅ | ✅ (tags) |
| Leaves Proxmox files untouched | ✅ (injects one script) | ✅ | ✅ | ❌ |
| Survives `apt upgrade` | ✅ (apt hook) | ✅ | ✅ | usually ❌ |
| Official / supported by Proxmox | ❌ | ✅ | ✅ | ❌ |

If you need permissions per group, use **pools** — pve-organize is only visual and can be used
together with them.

## Install

The commands run **on the Proxmox node itself, as `root`** — not on your own computer.
Open a shell on the node in one of these ways:

- **Web UI**: select the node (e.g. `pve`) in the tree → **>_ Shell**.
- **SSH**: `ssh root@<node-ip>` from your computer.

In that shell, run:

```bash
bash -c "$(curl -fsSL https://github.com/diego-luz/pve-organize/releases/latest/download/install.sh)"
```

This installs the latest [release](https://github.com/diego-luz/pve-organize/releases). Before
installing, the script checks every downloaded file against the release's `SHA256SUMS` and
stops if anything doesn't match.

<details>
<summary>A specific version, or the development version</summary>

```bash
# a specific version (e.g. to go back to an older one)
bash -c "$(curl -fsSL https://github.com/diego-luz/pve-organize/releases/download/v1.0.2/install.sh)"
# development version from the main branch (no checksum verification)
REF=main bash -c "$(curl -fsSL https://raw.githubusercontent.com/diego-luz/pve-organize/main/install.sh)"
```
</details>

Then go back to the Proxmox page in your **browser** and reload it (**F5**).

<img src="docs/terminal-instalar.png" alt="Installing" width="720">

<details>
<summary>Download the files first, check them, then install (same shell on the node)</summary>

```bash
mkdir -p ~/pve-organize && cd ~/pve-organize
for f in install.sh pve-organize pve-organize.js SHA256SUMS; do
    curl -fsSLO https://github.com/diego-luz/pve-organize/releases/latest/download/$f
done
sha256sum -c SHA256SUMS     # every line must say OK
less install.sh             # optional: read what it does (q to quit)
bash install.sh             # installs the files from this folder
```
</details>

<details>
<summary>Install from a clone (same shell on the node)</summary>

```bash
apt install -y git          # if git is not installed yet
git clone https://github.com/diego-luz/pve-organize.git
cd pve-organize
git checkout "$(git describe --tags --abbrev=0)"   # latest release (skip it for the main branch)
./install.sh
```
</details>

### Tested versions

| Proxmox VE | pve-manager | proxmox-widget-toolkit | Kernel | Result |
|---|---|---|---|---|
| **9.2** | 9.2.25 | 5.2.10 | 7.0.14-26-pve | ✅ works (dark and light themes; English, Portuguese and Spanish UI) |
| **8.4** | 8.4.21 | — | 6.8.12-43-pve | ✅ works (3-node cluster: groups, Move to group, renaming groups, a locked guest) |
| 8.0–8.3 | — | — | — | ⚠️ not tested; the installer allows it and warns |

Older than 8 is refused by the installer. If you try it on another version, please open an
issue saying whether it worked. In a cluster, install it on every node whose web UI you use.

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

In the node's shell (web UI **>_ Shell** or SSH), as `root`:

```bash
pve-organize status      # version, ON/OFF, web UI script, apt hook, Proxmox version
pve-organize version     # installed version
pve-organize off         # remove from the web UI (settings are kept)
pve-organize on          # load it again
pve-organize uninstall   # remove everything that was installed
```

<img src="docs/terminal.gif" alt="status, off and on" width="640">

## How it works

- `/usr/local/share/pve-organize/pve-organize.js` is copied to `/usr/share/pve-manager/js/`
  and one `<script>` line is added to `/usr/share/pve-manager/index.html.tpl`.
  A clean copy of that page is kept in `/usr/local/share/pve-organize/index.html.tpl.original`.
- An apt hook (`/etc/apt/apt.conf.d/99pve-organize`) puts the line back after Proxmox updates.
- Groups, order and style live in a hidden block at the end of **Datacenter → Notes**
  (`<!-- pve-organize … -->`); colors live in **Datacenter → Options → Tag Style**.
  Don't edit that block by hand; the rest of your notes is left alone.
- It only changes the web UI. Moving a guest only edits its tags.
- Works with **Tag Style → case-sensitive** on or off. With it off (the Proxmox default), Proxmox
  saves tags in lowercase (`Production` becomes `production`); groups and colors still match.
  Two groups whose tags differ only in case (`Test` and `TEST`) are not allowed.
- Renaming a group's tag updates every guest that uses it. A guest that is locked (backup,
  snapshot, migration) or on a node that is down keeps the old tag and shows under **No group**;
  the screen lists those guests at the end. Move them with **Move to group** when they are free.

Permissions: moving a guest needs `VM.Config.Options` on it; saving the *Tree groups* screen
needs `Sys.Modify` on `/`.

## Update and uninstall

- **Update**: run the install command again (it always gets the latest release).
  What changed in each version: [CHANGELOG.md](CHANGELOG.md).
- **Uninstall**: `pve-organize uninstall`, then F5. Your groups stay in the Datacenter Notes and
  Tag Style; delete them there if you want.
- **Something looks wrong?** `pve-organize off` and F5 brings back the stock Proxmox tree.

## Translations

UI texts are in the `TEXTOS` table at the top of `pve-organize.js` (one line per text:
Portuguese, English, Spanish). Pull requests with more languages are welcome.

## License

[MIT](LICENSE)
