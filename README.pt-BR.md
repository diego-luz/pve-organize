# PVE Organize

**Grupos e separadores na árvore do Proxmox VE.** Organize VMs e containers em seções
coloridas — como *Produção › Rede*, *Teste*, *Modelo* — direto na Server View, com uma tela
para escolher cores, ordem e estilo.

[English](README.md) · **Português (Brasil)** · [Español](README.es.md)

[![Licença: MIT](https://img.shields.io/badge/licen%C3%A7a-MIT-green.svg)](LICENSE)
![Proxmox VE 8 / 9](https://img.shields.io/badge/Proxmox%20VE-8%20%7C%209-orange)

![Os seis estilos](docs/estilos.png)

- **Dois níveis**: um *topo* (título grande) e, se quiser, uma *subcategoria* (subtítulo) por servidor.
- **Usa as tags do Proxmox**, nada novo guardado nos servidores. Um servidor com as tags
  `Producao;Rede` aparece em **PRODUÇÃO › Rede**.
- **Botão direito → Mover para grupo** troca o grupo em dois cliques.
- **Tela Grupos da árvore…**: criar grupos, escolher cores (ou deixar automático), arrastar para
  ordenar, 6 estilos, contador, recuo e um botão de liga/desliga.
- **Configuração compartilhada**: fica nas Notas do Datacenter e no Tag Style, então todos os
  administradores e navegadores veem a mesma árvore.
- **Segue o idioma do Proxmox**: português, inglês e espanhol (os outros caem no inglês).
- **Continua depois das atualizações do Proxmox** e sai com um comando.

> Projeto da comunidade, sem ligação com a Proxmox Server Solutions GmbH.

---

## Instalar

No nó do Proxmox, como `root`:

```bash
bash -c "$(curl -fsSL https://raw.githubusercontent.com/diego-luz/pve-organize/main/install.sh)"
```

Depois recarregue a página do Proxmox (**F5**). De um clone, rode `./install.sh`.

Requisitos: Proxmox VE 8 ou mais novo (testado no 9.2). Em cluster, instale em cada nó cuja
interface web você usa.

## Usar

1. **Coloque os servidores em grupos.** Botão direito na VM/CT → **Mover para grupo** →
   *Produção* → *Rede*. Ou coloque as tags à mão (uma de topo e, se quiser, uma de subcategoria).
2. **Ajuste.** Botão direito num servidor, no nó ou no *Datacenter* → **Grupos da árvore…**

| Na tela *Grupos da árvore* | |
|---|---|
| **Adicionar** | digite o nome; a tag é criada a partir dele (sem acento e sem espaço) |
| **Cor** | clique no quadradinho para abrir o seletor, ou use **Cores automáticas** |
| **Ordem** | arraste pelo ☰; a ordem da lista é a ordem na árvore |
| **Servidores** | quantos usam cada grupo; renomear a tag atualiza esses servidores |
| **Visual** | estilo A–F, contador, recuo, esconder tags repetidas — a árvore muda na hora; *Cancel* desfaz |
| **LIGADOS / DESLIGADOS** | botão no topo: liga ou desliga na hora, sem perder nada |

Servidores sem uma tag de topo conhecida aparecem no fim, em **Sem grupo**.

## Comandos

```bash
pve-organize status        # ligado / desligado
pve-organize off           # tira da interface (a configuração fica salva)
pve-organize on            # carrega de novo
pve-organize desinstalar   # remove tudo o que foi instalado
```

## Como funciona

- `/usr/local/share/pve-organize/pve-organize.js` é copiado para `/usr/share/pve-manager/js/`
  e uma linha `<script>` entra em `/usr/share/pve-manager/index.html.tpl`. Uma cópia limpa dessa
  página fica em `/usr/local/share/pve-organize/index.html.tpl.original`.
- Um hook do apt (`/etc/apt/apt.conf.d/99pve-organize`) recoloca a linha depois das
  atualizações do Proxmox.
- Grupos, ordem e estilo ficam num bloco escondido no fim de **Datacenter → Notas**
  (`<!-- pve-organize … -->`); as cores ficam em **Datacenter → Opções → Tag Style**.
  Não edite esse bloco à mão; o resto das suas notas não é tocado.
- Só muda a interface web. Mover um servidor só altera as tags dele.

Permissões: mover um servidor pede `VM.Config.Options` nele; salvar a tela *Grupos da árvore*
pede `Sys.Modify` em `/`.

## Atualizar e desinstalar

- **Atualizar**: rode o comando de instalação de novo.
- **Desinstalar**: `pve-organize desinstalar` e F5. Os grupos continuam nas Notas do Datacenter
  e no Tag Style; apague por lá se quiser.
- **Algo estranho?** `pve-organize off` e F5 trazem de volta a árvore original do Proxmox.

## Traduções

Os textos ficam na tabela `TEXTOS` no começo de `pve-organize.js` (uma linha por texto:
português, inglês, espanhol). Pull requests com outros idiomas são bem-vindos.

## Licença

[MIT](LICENSE)
