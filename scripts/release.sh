#!/bin/bash
# Monta os arquivos de uma versão em dist/vX.Y.Z (para anexar ao release do Gitea/GitHub).
#   scripts/release.sh 1.0.1    → troca a versão nos 3 arquivos (commit e tag ficam com você)
#   scripts/release.sh          → monta dist/ a partir da tag vX.Y.Z da versão atual (o conteúdo vem da tag)
set -euo pipefail
cd "$(dirname "$0")/.."

atual=$(sed -n 's/^VERSAO=\([0-9.]*\).*/\1/p' pve-organize)
if [ $# -ge 1 ]; then
    nova=${1#v}
    [[ $nova =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] || { echo "versão inválida: $1 (use X.Y.Z)" >&2; exit 1; }
    sed -i "s/^VERSAO=[0-9.]*/VERSAO=$nova/" pve-organize
    sed -i "s/^VERSAO_PACOTE=[0-9.]*/VERSAO_PACOTE=$nova/" install.sh
    sed -i "s/const VERSAO = '[0-9.]*'/const VERSAO = '$nova'/" pve-organize.js
    echo "versão $atual → $nova nos 3 arquivos. Agora: CHANGELOG.md, commit, git tag -a v$nova, e rode de novo sem argumento."
    exit 0
fi

v=$atual
tag=v$v
# o release sai exatamente do que está na tag (não da pasta de trabalho)
git rev-parse -q --verify "refs/tags/$tag" >/dev/null || { echo "a tag $tag não existe (git tag -a $tag)" >&2; exit 1; }
out=dist/$tag
rm -rf "$out" && mkdir -p "$out"
for f in install.sh pve-organize pve-organize.js; do git show "$tag:$f" > "$out/$f"; done
# as três versões precisam bater
grep -q "^VERSAO=$v " "$out/pve-organize" || { echo "pve-organize na tag não está na versão $v" >&2; exit 1; }
grep -q "^VERSAO_PACOTE=$v " "$out/install.sh" || { echo "install.sh na tag não está na versão $v" >&2; exit 1; }
grep -q "const VERSAO = '$v'" "$out/pve-organize.js" || { echo "pve-organize.js na tag não está na versão $v" >&2; exit 1; }
bash -n "$out/install.sh" && sh -n "$out/pve-organize" && node --check "$out/pve-organize.js"
(cd "$out" && sha256sum install.sh pve-organize pve-organize.js > SHA256SUMS)

# notas do release (Markdown): trecho do CHANGELOG + como instalar + checksums.
# Fica FORA de $out para não ser anexado; cole no campo de notas do Gitea/GitHub
# (ou: gh release create v$v dist/v$v/* --notes-file dist/NOTAS-v$v.md)
notas=dist/NOTAS-v$v.md
{
    awk -v v="$v" '$0 ~ "^## \\[" v "\\]" {on=1; next} on && /^## \[/ {exit} on' \
        < <(git show "$tag:CHANGELOG.md") | sed -e 's/^### /## /' -e '1{/^$/d}'
    cat <<NOTAS

## Install

On the Proxmox node, as \`root\` (web UI **>_ Shell** or SSH):

\`\`\`bash
bash -c "\$(curl -fsSL https://github.com/diego-luz/pve-organize/releases/download/v$v/install.sh)"
\`\`\`

Then reload the Proxmox page (**F5**). The installer checks every file against \`SHA256SUMS\`
and installs nothing if a checksum does not match. Already installed? The same command updates it.

Prefer to look before installing? Download the 4 files below into a folder on the node, then:

\`\`\`bash
sha256sum -c SHA256SUMS && bash install.sh
\`\`\`

## Checksums (SHA-256)

\`\`\`
$(cat "$out/SHA256SUMS")
\`\`\`

Full changelog: [CHANGELOG.md](https://github.com/diego-luz/pve-organize/blob/v$v/CHANGELOG.md)
NOTAS
} > "$notas"

echo "pronto: $out (anexar os 4 arquivos) e $notas (texto do release)"
cat "$out/SHA256SUMS"
