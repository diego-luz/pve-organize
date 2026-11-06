#!/bin/bash
# Monta os arquivos de uma versão em dist/vX.Y.Z (para anexar ao release do Gitea/GitHub).
#   scripts/release.sh 1.0.1    → troca a versão nos 3 arquivos (commit e tag ficam com você)
#   scripts/release.sh          → só monta dist/ com a versão atual (precisa da tag vX.Y.Z no HEAD)
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
# as três versões precisam bater
grep -q "^VERSAO_PACOTE=$v " install.sh || { echo "install.sh não está na versão $v" >&2; exit 1; }
grep -q "const VERSAO = '$v'" pve-organize.js || { echo "pve-organize.js não está na versão $v" >&2; exit 1; }
# só de um commit limpo e marcado com a tag, para o release corresponder exatamente ao código
[ -z "$(git status --porcelain)" ] || { echo "há alterações sem commit" >&2; exit 1; }
[ "$(git describe --exact-match --tags HEAD 2>/dev/null)" = "v$v" ] || { echo "o HEAD não tem a tag v$v" >&2; exit 1; }
bash -n install.sh && sh -n pve-organize && node --check pve-organize.js

out=dist/v$v
rm -rf "$out" && mkdir -p "$out"
for f in install.sh pve-organize pve-organize.js; do git show "HEAD:$f" > "$out/$f"; done
(cd "$out" && sha256sum install.sh pve-organize pve-organize.js > SHA256SUMS)
echo "pronto: $out"
cat "$out/SHA256SUMS"
