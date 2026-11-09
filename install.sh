#!/bin/bash
# pve-organize: grupos e separadores na árvore do Proxmox VE · groups and separators for the Proxmox VE tree
#
# Instalar a última versão publicada (no shell do Proxmox, como root):
#   bash -c "$(curl -fsSL https://github.com/diego-luz/pve-organize/releases/latest/download/install.sh)"
# Uma versão específica:   REF=v1.0.1 bash -c "$(curl -fsSL …/releases/download/v1.0.1/install.sh)"
# Versão em desenvolvimento (sem checksum): REF=main bash -c "$(curl -fsSL …)"
# Ou, de um clone do repositório:   ./install.sh
# Desinstalar:   pve-organize desinstalar
set -euo pipefail

VERSAO_PACOTE=1.0.1   # trocado pelo scripts/release.sh a cada versão
REPO=${REPO:-diego-luz/pve-organize}
REF=${REF:-v$VERSAO_PACOTE}
case "$REF" in
    v[0-9]*) BASE_PADRAO=https://github.com/$REPO/releases/download/$REF; CONFERIR=1 ;;
    *) BASE_PADRAO=https://raw.githubusercontent.com/$REPO/$REF; CONFERIR=0 ;;   # branch: sem SHA256SUMS
esac
BASE=${BASE:-$BASE_PADRAO}
DIR=/usr/local/share/pve-organize
TPL=/usr/share/pve-manager/index.html.tpl
HOOK=/etc/apt/apt.conf.d/99pve-organize

# mensagens no idioma do sistema (pt, es; o resto em inglês)
case "${LC_ALL:-${LC_MESSAGES:-${LANG:-}}}" in
    pt*) L=pt ;; es*) L=es ;; *) L=en ;;
esac
m() { # m "português" "english" "español"
    case $L in pt) printf '%s' "$1" ;; es) printf '%s' "$3" ;; *) printf '%s' "$2" ;; esac
}
erro() { echo "$(m ERRO ERROR ERROR): $*" >&2; exit 1; }
info() { echo "==> $*"; }

[ "$(id -u)" = 0 ] || erro "$(m 'rode como root no nó do Proxmox.' 'run as root on the Proxmox node.' 'ejecuta como root en el nodo de Proxmox.')"
command -v pveversion >/dev/null || erro "$(m 'isto não parece um Proxmox VE (pveversion não encontrado).' 'this does not look like Proxmox VE (pveversion not found).' 'esto no parece un Proxmox VE (no se encontró pveversion).')"
[ -f "$TPL" ] || erro "$(m 'não achei' 'not found:' 'no encontré') $TPL"
VERSAO=$(pveversion | sed -n 's#^pve-manager/\([0-9]*\)\..*#\1#p')
[ -n "$VERSAO" ] && [ "$VERSAO" -ge 8 ] || erro "$(m 'precisa do Proxmox VE 8 ou mais novo' 'needs Proxmox VE 8 or newer' 'necesita Proxmox VE 8 o más nuevo') ($(pveversion))"
MENOR=$(pveversion | sed -n 's#^pve-manager/[0-9]*\.\([0-9]*\).*#\1#p')
if [ "$VERSAO" -gt 9 ] || { [ "$VERSAO" = 8 ] && [ "${MENOR:-0}" -lt 4 ]; }; then
    info "$(m "aviso: testado no Proxmox VE 8.4 e 9; na versão $VERSAO.$MENOR pode precisar de ajuste." "warning: tested on Proxmox VE 8.4 and 9; version $VERSAO.$MENOR may need tweaks." "aviso: probado en Proxmox VE 8.4 y 9; la versión $VERSAO.$MENOR puede necesitar ajustes.")"
fi

# arquivos: do clone (se o install.sh estiver ao lado deles) ou baixados do GitHub
# (só quando rodado como arquivo: em bash -c "$(curl …)" não há BASH_SOURCE e a pasta atual não conta)
AQUI=/nonexistent
if [ -n "${BASH_SOURCE[0]:-}" ] && [ -f "${BASH_SOURCE[0]}" ]; then
    AQUI=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
fi
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
if [ -f "$AQUI/pve-organize.js" ] && [ -f "$AQUI/pve-organize" ]; then
    info "$(m 'usando os arquivos de' 'using files from' 'usando los archivos de') $AQUI"
    cp "$AQUI/pve-organize.js" "$AQUI/pve-organize" "$TMP/"
else
    command -v curl >/dev/null || erro "$(m 'precisa do curl' 'curl is required' 'se necesita curl') (apt install curl)"
    info "$(m 'baixando de' 'downloading from' 'descargando de') $BASE"
    for f in pve-organize.js pve-organize; do
        curl -fsSL "$BASE/$f" -o "$TMP/$f" || erro "$(m 'não consegui baixar' 'could not download' 'no pude descargar') $f"
    done
    if [ "$CONFERIR" = 1 ]; then
        # confere a "impressão digital" (SHA-256) de cada arquivo com a lista publicada na versão
        curl -fsSL "$BASE/SHA256SUMS" -o "$TMP/SHA256SUMS" || erro "$(m 'não consegui baixar' 'could not download' 'no pude descargar') SHA256SUMS"
        for f in pve-organize.js pve-organize; do
            grep -q "  $f\$" "$TMP/SHA256SUMS" || erro "SHA256SUMS: $(m 'falta' 'missing' 'falta') $f"
        done
        (cd "$TMP" && grep -E '  pve-organize(\.js)?$' SHA256SUMS | sha256sum -c --quiet -) \
            || erro "$(m 'checksum NÃO confere: arquivos corrompidos ou alterados; nada foi instalado' 'checksum MISMATCH: files are corrupted or altered; nothing was installed' 'el checksum NO coincide: archivos dañados o alterados; no se instaló nada')"
        info "$(m 'checksums conferidos (SHA-256)' 'checksums verified (SHA-256)' 'checksums verificados (SHA-256)')"
    else
        info "$(m "aviso: versão de desenvolvimento ($REF), sem conferência de checksum" "warning: development version ($REF), no checksum verification" "aviso: versión de desarrollo ($REF), sin verificación de checksum")"
    fi
fi
head -1 "$TMP/pve-organize" | grep -q '^#!' || erro "pve-organize $(m 'inválido' 'is not valid' 'no válido')"
grep -q "PVE.tree.ResourceTree" "$TMP/pve-organize.js" || erro "pve-organize.js $(m 'inválido' 'is not valid' 'no válido')"

# versão antiga com outro nome (pve-separadores): limpar antes
if [ -e /usr/local/bin/pve-separadores ] || [ -e /usr/local/share/pve-separadores ]; then
    info "$(m 'removendo a versão antiga (pve-separadores)' 'removing the old version (pve-separadores)' 'quitando la versión antigua (pve-separadores)')"
    sed -i '/separadores\.js/d' "$TPL"
    rm -rf /usr/local/share/pve-separadores /usr/local/bin/pve-separadores /usr/share/pve-manager/js/separadores.js \
        /etc/apt/apt.conf.d/99pve-separadores /etc/pve-separadores.on
fi

info "$(m 'instalando em' 'installing to' 'instalando en') $DIR"
mkdir -p "$DIR"
# cópia de segurança da página do Proxmox, sempre sem a nossa linha
[ -f "$DIR/index.html.tpl.original" ] || sed -e '/pve-organize\.js/d' -e '/separadores\.js/d' "$TPL" > "$DIR/index.html.tpl.original"
install -m 644 "$TMP/pve-organize.js" "$DIR/pve-organize.js"
install -m 755 "$TMP/pve-organize" /usr/local/bin/pve-organize

info "$(m 'hook do apt (reaplica depois de atualizar o Proxmox)' 'apt hook (re-applies after Proxmox updates)' 'hook de apt (se reaplica tras actualizar Proxmox)')"
cat > "$HOOK" <<'HOOKEOF'
// pve-organize: reaplica os separadores depois de atualizar o pve-manager (só se estiverem ligados)
DPkg::Post-Invoke { "/usr/local/bin/pve-organize reaplicar >/dev/null 2>&1 || true"; };
HOOKEOF

/usr/local/bin/pve-organize on
echo
m "Pronto! Agora:
  1. Recarregue a página do Proxmox (F5).
  2. Botão direito em um servidor → \"Mover para grupo\" (ou coloque as tags à mão).
  3. Botão direito → \"Grupos da árvore…\" para criar grupos, cores, ordem e estilo.

Comandos: pve-organize on | off | status | version | desinstalar
" "Done! Now:
  1. Reload the Proxmox page (F5).
  2. Right-click a guest → \"Move to group\" (or add the tags by hand).
  3. Right-click → \"Tree groups…\" to create groups, colors, order and style.

Commands: pve-organize on | off | status | version | uninstall
" "¡Listo! Ahora:
  1. Recarga la página de Proxmox (F5).
  2. Clic derecho en un servidor → \"Mover a grupo\" (o pon las etiquetas a mano).
  3. Clic derecho → \"Grupos del árbol…\" para crear grupos, colores, orden y estilo.

Comandos: pve-organize on | off | status | version | desinstalar
"
