// pve-organize · grupos e separadores na árvore do Proxmox VE (Server View)
// https://github.com/diego-luz/pve-organize · MIT
//
// Liga/desliga o complemento inteiro: pve-organize on|off (no shell do Proxmox).
// Grupos, ordem, cores e estilo: botão direito → "Grupos da árvore…" (fica salvo nas Notas do Datacenter).
// Dois níveis: TOPO (título grande) e SUB (subtítulo). Cada guest leva uma tag de cada, ex.: "Producao;Rede".
(function () {
    const VERSAO = '1.0.0'; // trocado pelo scripts/release.sh a cada versão
    window.PVE_ORGANIZE_VERSION = VERSAO;
    // ---------- idiomas: segue o idioma escolhido no login do Proxmox (pt, es; o resto em inglês) ----------
    const IDIOMA = (() => {
        let c = (Ext.util.Cookies.get('PVELangCookie') || navigator.language || 'en').toLowerCase();
        return c.startsWith('pt') ? 'pt' : c.startsWith('es') ? 'es' : 'en';
    })();
    const TEXTOS = {
        semGrupo: ['Sem grupo', 'No group', 'Sin grupo'],
        semFuncao: ['Sem subcategoria', 'No subcategory', 'Sin subcategoría'],
        moverPara: ['Mover para grupo', 'Move to group', 'Mover a grupo'],
        telaGrupos: ['Grupos da árvore…', 'Tree groups…', 'Grupos del árbol…'],
        tituloTela: ['Grupos da árvore', 'Tree groups', 'Grupos del árbol'],
        topo: ['Topo (títulos grandes)', 'Top level (large headers)', 'Nivel superior (títulos grandes)'],
        sub: ['Subcategorias (dentro de cada topo)', 'Subcategories (inside each top level)', 'Subcategorías (dentro de cada nivel superior)'],
        arraste: ['arraste ☰ para ordenar', 'drag ☰ to reorder', 'arrastra ☰ para ordenar'],
        arrasteDica: ['Arraste para ordenar', 'Drag to reorder', 'Arrastra para ordenar'],
        solte: ['Solte na posição desejada', 'Drop at the desired position', 'Suelta en la posición deseada'],
        adicionar: ['Adicionar', 'Add', 'Añadir'],
        coresAuto: ['Cores automáticas', 'Automatic colors', 'Colores automáticos'],
        coresAutoDica: ['Dá uma cor diferente para cada grupo desta lista', 'Gives each group in this list a different color',
            'Da un color distinto a cada grupo de esta lista'],
        cor: ['Cor', 'Color', 'Color'],
        corDica: ['Clique para escolher a cor', 'Click to pick a color', 'Haz clic para elegir el color'],
        nome: ['Nome exibido', 'Display name', 'Nombre mostrado'],
        tag: ['Tag', 'Tag', 'Etiqueta'],
        tagRegra: ['Sem acento e sem espaço', 'No accents and no spaces', 'Sin tildes y sin espacios'],
        automatica: ['(automática)', '(automatic)', '(automática)'],
        servidores: ['Servidores', 'Guests', 'Servidores'],
        remover: ['Remover', 'Remove', 'Quitar'],
        removerGrupo: ['Remover grupo', 'Remove group', 'Quitar grupo'],
        removerConfirma: ['{0} servidor(es) usam este grupo. Só o separador sai da árvore: a tag continua nos servidores (eles passam a aparecer em "Sem grupo"). Remover?',
            '{0} guest(s) use this group. Only the separator leaves the tree: the tag stays on the guests (they will show under "No group"). Remove?',
            '{0} servidor(es) usan este grupo. Solo el separador sale del árbol: la etiqueta sigue en los servidores (aparecerán en "Sin grupo"). ¿Quitar?'],
        esconder: ['Esconder etiquetas repetidas', 'Hide duplicated tags', 'Ocultar etiquetas repetidas'],
        estilo: ['Estilo', 'Style', 'Estilo'],
        contador: ['Contador', 'Counter', 'Contador'],
        recuo: ['Recuar itens das subcategorias', 'Indent subcategory items', 'Sangrar elementos de subcategorías'],
        visual: ['Visual (a árvore muda na hora; Cancel desfaz)', 'Look (the tree changes live; Cancel reverts)',
            'Apariencia (el árbol cambia al instante; Cancel deshace)'],
        ligados: ['LIGADOS', 'ON', 'ACTIVADOS'],
        desligados: ['DESLIGADOS', 'OFF', 'DESACTIVADOS'],
        cliqueDesligar: ['Clique para desligar (vale na hora)', 'Click to turn off (applies immediately)',
            'Haz clic para desactivar (se aplica al instante)'],
        cliqueLigar: ['Clique para ligar (vale na hora)', 'Click to turn on (applies immediately)',
            'Haz clic para activar (se aplica al instante)'],
        separadoresNaArvore: ['Separadores na árvore:', 'Tree separators:', 'Separadores en el árbol:'],
        desligarNaoApaga: ['desligar não apaga grupos, cores nem estilo', 'turning off keeps groups, colors and style',
            'desactivar no borra grupos, colores ni estilo'],
        rodape: ['Clique no nome ou na tag para editar · a cor abre o seletor', 'Click a name or tag to edit · click a color to pick one',
            'Haz clic en el nombre o la etiqueta para editar · el color abre el selector'],
        salvando: ['Salvando…', 'Saving…', 'Guardando…'],
        erroSemNome: ['Há uma linha sem nome.', 'There is a row without a name.', 'Hay una fila sin nombre.'],
        erroTag: ['Tag inválida em "{0}" (sem acento e sem espaço).', 'Invalid tag in "{0}" (no accents and no spaces).',
            'Etiqueta no válida en "{0}" (sin tildes y sin espacios).'],
        erroRepetida: ['A tag "{0}" está repetida.', 'The tag "{0}" is used twice.', 'La etiqueta "{0}" está repetida.'],
        erroTopo: ['Crie pelo menos um grupo de topo.', 'Create at least one top-level group.', 'Crea al menos un grupo de nivel superior.'],
        estiloA: ['A · Faixa', 'A · Band', 'A · Franja'],
        estiloB: ['B · Etiquetas', 'B · Pills', 'B · Etiquetas'],
        estiloC: ['C · Trilho lateral', 'C · Side rail', 'C · Riel lateral'],
        estiloD: ['D · Cartões', 'D · Cards', 'D · Tarjetas'],
        estiloE: ['E · Minimalista', 'E · Minimal', 'E · Minimalista'],
        estiloF: ['F · Cabeçalho cheio', 'F · Solid header', 'F · Encabezado sólido'],
    };
    const T = (chave, ...args) => {
        let lista = TEXTOS[chave] || [chave];
        let txt = lista[{ pt: 0, en: 1, es: 2 }[IDIOMA]] || lista[1] || lista[0];
        return txt.replace(/\{(\d+)\}/g, (m, i) => args[i]);
    };
    // grupos de exemplo (só antes da primeira configuração salva)
    const PADROES = {
        pt: { topo: [['Producao', 'Produção'], ['Teste', 'Teste'], ['Desativado', 'Desativado'], ['Modelo', 'Modelo']],
            sub: [['Rede', 'Rede'], ['Gestao', 'Gestão'], ['Servicos', 'Serviços']] },
        en: { topo: [['Production', 'Production'], ['Testing', 'Testing'], ['Disabled', 'Disabled'], ['Template', 'Template']],
            sub: [['Network', 'Network'], ['Management', 'Management'], ['Services', 'Services']] },
        es: { topo: [['Produccion', 'Producción'], ['Pruebas', 'Pruebas'], ['Desactivado', 'Desactivado'], ['Plantilla', 'Plantilla']],
            sub: [['Red', 'Red'], ['Gestion', 'Gestión'], ['Servicios', 'Servicios']] },
    };
    const CORES_PADRAO = { topo: ['2e7d32', 'f9a825', '757575', '455a64'], sub: ['1565c0', '6a1b9a', '00897b'] };

    // usado só enquanto a configuração do Datacenter não carrega (ou se ainda não existir)
    const PADRAO = {
        topo: PADROES[IDIOMA].topo.map(([t, n], i) => [t, n, CORES_PADRAO.topo[i]]),
        sub: PADROES[IDIOMA].sub.map(([t, n], i) => [t, n, CORES_PADRAO.sub[i]]),
        esconder_tags: true,
        estilo: 'A',
        contador: false,
        recuo: false,
    };
    // paleta para "cor automática": contrasta bem no tema claro e no escuro
    const PALETA = ['2e7d32', '1565c0', '6a1b9a', 'f9a825', '00897b', 'c62828', 'ef6c00', 'ad1457',
        '283593', '558b2f', '5d4037', '455a64', '00838f', '757575'];
    // aceita também o nome antigo do projeto (pve-separadores)
    const BLOCO = /\n?<!-- pve-(?:organize|separadores)[^\n]*\n([\s\S]*?)\n-->\n?/;

    let AMBIENTES, FUNCOES, ESCONDER_TAGS_DOS_TITULOS, AMB, FUN, aplicarVisual;
    let CFG_ATUAL = PADRAO;

    const mapa = (lista) => {
        let ordem = Object.create(null),
            nome = Object.create(null);
        lista.forEach(([tag, n], i) => {
            ordem[tag] = i;
            nome[tag] = n;
        });
        return { ordem, nome };
    };
    const usarConfig = (cfg) => {
        CFG_ATUAL = cfg;
        AMBIENTES = cfg.topo || [];
        FUNCOES = cfg.sub || [];
        ESCONDER_TAGS_DOS_TITULOS = cfg.esconder_tags !== false;
        AMB = mapa(AMBIENTES);
        FUN = mapa(FUNCOES);
        if (typeof aplicarVisual === 'function') {
            aplicarVisual(cfg);
        }
    };
    usarConfig(PADRAO);

    const isGuest = (d) => d && (d.type === 'qemu' || d.type === 'lxc');
    const tagsDe = (d) => (d.tags || '').split(/[,; ]/).filter((t) => !!t);
    const ambienteDe = (d) => tagsDe(d).find((t) => t in AMB.ordem) || '';
    const funcaoDe = (d) => tagsDe(d).find((t) => t in FUN.ordem) || '';
    const ordemAmb = (a) => (a in AMB.ordem ? AMB.ordem[a] : 99);
    const ordemFun = (f) => (f in FUN.ordem ? FUN.ordem[f] : 99);
    const corDe = (tag, padrao) => {
        let rgb = tag && PVE.UIOptions.tagOverrides[tag];
        return rgb ? Proxmox.Utils.rgbToCss(rgb) : padrao;
    };
    const textoSobre = (css) => {
        let m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(css) || [];
        let hex = /^#?([0-9a-f]{6})$/i.exec(css);
        let [r, g, b] = hex
            ? [0, 2, 4].map((i) => parseInt(hex[1].slice(i, i + 2), 16))
            : [m[1], m[2], m[3]].map(Number);
        return 0.299 * r + 0.587 * g + 0.114 * b > 160 ? '#000' : '#fff';
    };
    const ESTILOS = [
        ['A', T('estiloA')],
        ['B', T('estiloB')],
        ['C', T('estiloC')],
        ['D', T('estiloD')],
        ['E', T('estiloE')],
        ['F', T('estiloF')],
    ];
    // aplica estilo/contador/recuo nas árvores (também usado na pré-visualização da tela)
    const visualEm = (tree, cfg) => {
            ESTILOS.forEach(([l]) => tree.removeCls(`sep-estilo-${l}`));
            tree.addCls(`sep-estilo-${cfg.estilo || 'A'}`);
            if (cfg.contador) {
                tree.removeCls('sep-sem-contador');
            } else {
                tree.addCls('sep-sem-contador');
            }
            if (cfg.recuo) {
                tree.addCls('sep-recuo');
            } else {
                tree.removeCls('sep-recuo');
            }
            if (tree.rendered && !tree.destroyed) {
                tree.getView().refresh();
            }
    };
    aplicarVisual = (cfg) => Ext.ComponentQuery.query('pveResourceTree').forEach((tree) => visualEm(tree, cfg));
    const paiEhNo = (n1, n2) => ((n1.parentNode || n2.parentNode || {}).data || {}).type === 'node';

    const P = PVE.tree.ResourceTree.prototype;

    const sortOriginal = P.nodeSortFn;
    P.nodeSortFn = function (node1, node2) {
        let n1 = node1.data,
            n2 = node2.data;
        if (CFG_ATUAL.ativo !== false && isGuest(n1) && isGuest(n2) && !n1.groupbyid && !n2.groupbyid && paiEhNo(node1, node2)) {
            let diff = ordemAmb(ambienteDe(n1)) - ordemAmb(ambienteDe(n2));
            if (diff === 0) {
                diff = ordemFun(funcaoDe(n1)) - ordemFun(funcaoDe(n2));
            }
            if (diff !== 0) {
                return diff;
            }
        }
        return sortOriginal.apply(this, arguments);
    };

    const col = P.columns[0];
    const renderOriginal = col.renderer;
    col.renderer = function (val, meta, rec) {
        let d = rec.data;
        let naServerView = CFG_ATUAL.ativo !== false && isGuest(d) && rec.parentNode && rec.parentNode.data.type === 'node';
        if (!naServerView) {
            return renderOriginal.apply(this, arguments);
        }

        let amb = ambienteDe(d),
            fun = funcaoDe(d);
        let html;
        if (ESCONDER_TAGS_DOS_TITULOS) {
            let original = d.tags;
            d.tags = tagsDe(d).filter((t) => t !== amb && t !== fun).join(';');
            try {
                html = renderOriginal.apply(this, arguments);
            } finally {
                d.tags = original;
            }
        } else {
            html = renderOriginal.apply(this, arguments);
        }

        let ant = rec.previousSibling,
            prox = rec.nextSibling;
        let antGuest = ant && isGuest(ant.data);
        let novoAmb = !antGuest || ambienteDe(ant.data) !== amb;
        let novaFun = fun && (novoAmb || funcaoDe(ant.data) !== fun);
        let ultimoDoGrupo = !prox || !isGuest(prox.data) || ambienteDe(prox.data) !== amb;

        let corG = corDe(amb, '#9e9e9e'),
            corS = fun ? corDe(fun, '#9e9e9e') : corG;
        meta.tdStyle = (meta.tdStyle || '') + `;--g:${corG};--gt:${textoSobre(corG)};--s:${corS}`;

        let irmaos = rec.parentNode.childNodes.filter((n) => isGuest(n.data));
        let titulos = '';
        let cls = ' sep-em-grupo';
        if (novoAmb) {
            let nome = amb ? AMB.nome[amb] : T('semGrupo');
            let n = irmaos.filter((x) => ambienteDe(x.data) === amb).length;
            titulos += `<span class="sep-amb"><span class="sep-txt">${Ext.String.htmlEncode(nome)}</span>`
                + `<span class="sep-cont">${n}</span></span>`;
            cls += ' sep-tem-amb';
        }
        if (novaFun) {
            let n = irmaos.filter((x) => ambienteDe(x.data) === amb && funcaoDe(x.data) === fun).length;
            titulos += `<span class="sep-fun"><span class="sep-txt">${Ext.String.htmlEncode(FUN.nome[fun])}</span>`
                + `<span class="sep-cont">${n}</span></span>`;
            cls += ' sep-tem-fun';
        }
        if (fun) {
            cls += ' sep-em-sub';
        }
        if (ultimoDoGrupo) {
            cls += ' sep-ult-grupo';
        }
        meta.tdCls = (meta.tdCls || '') + cls;
        return titulos + html;
    };

    // a árvore só redesenha a linha que mudou: redesenhar tudo para os títulos ficarem certos
    Ext.define(null, {
        override: 'PVE.tree.ResourceTree',
        initComponent: function () {
            this.callParent(arguments);
            let me = this;
            let tarefa = new Ext.util.DelayedTask(() => {
                if (me.rendered && !me.destroyed) {
                    me.getView().refresh();
                }
            });
            me.getStore().on({
                nodeinsert: () => tarefa.delay(150),
                noderemove: () => tarefa.delay(150),
                nodeappend: () => tarefa.delay(150),
            });

            // clique na área do título não seleciona o servidor
            let noTitulo = (item, e) => {
                let td = item && item.querySelector('td.sep-tem-amb, td.sep-tem-fun');
                if (!td) {
                    return false;
                }
                let inner = td.querySelector('.x-grid-cell-inner');
                let altura = parseFloat(getComputedStyle(inner).paddingTop) || 0;
                return e.getY() - Ext.fly(item).getY() < altura - 2;
            };
            let bloquear = (view, rec, item, idx, e) => !noTitulo(item, e);
            me.on({
                beforeitemmousedown: bloquear,
                beforeitemclick: bloquear,
                beforeitemdblclick: bloquear,
                beforeitemcontextmenu: bloquear,
            });

            // cor de fundo da árvore (tema claro/escuro) para a faixa do título não ficar destacada
            visualEm(me, CFG_ATUAL);
            me.on('afterrender', () => {
                let el = me.getView().el.dom;
                let cor = 'transparent';
                while (el && el !== document.documentElement) {
                    cor = getComputedStyle(el).backgroundColor;
                    if (cor && cor !== 'transparent' && !/rgba\(.*,\s*0\)$/.test(cor)) {
                        break;
                    }
                    el = el.parentElement;
                }
                document.documentElement.style.setProperty('--sep-fundo', cor);
            });
        },
    });

    // ---------- menu do botão direito: "Mover para grupo" ----------
    const reordenarArvores = () => {
        Ext.ComponentQuery.query('pveResourceTree').forEach((tree) => {
            if (!tree.rendered || tree.destroyed) {
                return;
            }
            tree.getRootNode().cascade((n) => {
                if (n.data.type !== 'node' || !n.childNodes || n.childNodes.length < 2) {
                    return;
                }
                let fora = n.childNodes.some((c, i) => i > 0 && tree.nodeSortFn(n.childNodes[i - 1], c) > 0);
                if (fora) {
                    n.sort((a, b) => tree.nodeSortFn(a, b), false);
                }
            });
            tree.getView().refresh();
        });
    };
    // configuração salva nas Notas do Datacenter (bloco <!-- pve-organize … -->)
    const lerConfig = (descricao) => {
        let m = BLOCO.exec(descricao || '');
        if (!m) {
            return null;
        }
        try {
            let cfg = JSON.parse(m[1]);
            return cfg && Array.isArray(cfg.topo) ? cfg : null;
        } catch (e) {
            return null;
        }
    };
    let configCarregada = false;
    const carregarConfig = (depois) => {
        Proxmox.Utils.API2Request({
            url: '/cluster/options',
            method: 'GET',
            success: (response) => {
                let dados = response.result.data || {};
                let cfg = lerConfig(dados.description);
                if (cfg) {
                    usarConfig(cfg);
                }
                configCarregada = true;
                reordenarArvores();
                if (depois) {
                    depois(dados);
                }
            },
            failure: (response) => {
                configCarregada = true;
                if (depois) {
                    Ext.Msg.alert(gettext('Error'), response.htmlStatus);
                }
            },
        });
    };

    // a árvore do Proxmox não reposiciona quando só as tags mudam: conferir a cada atualização
    PVE.data.ResourceStore.on('load', () => {
        if (!configCarregada) {
            carregarConfig();
        }
        Ext.defer(reordenarArvores, 50);
    });

    const moverPara = (d, amb, fun) => {
        let outras = tagsDe(d).filter((t) => !(t in AMB.ordem) && !(t in FUN.ordem));
        let novas = [amb, fun].filter((t) => !!t).concat(outras);
        let params = novas.length ? { tags: novas.join(';') } : { delete: 'tags' };
        Proxmox.Utils.API2Request({
            url: `/nodes/${d.node}/${d.type}/${d.vmid}/config`,
            method: 'PUT',
            params: params,
            success: () => PVE.data.ResourceStore.load(),
            failure: (response) => Ext.Msg.alert(gettext('Error'), response.htmlStatus),
        });
    };

    const itemMenu = (texto, atual, handler, cor) => ({
        text: cor
            ? `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${cor};margin-right:6px"></span>${Ext.String.htmlEncode(texto)}`
            : Ext.String.htmlEncode(texto),
        iconCls: atual ? 'fa fa-fw fa-check' : 'fa fa-fw',
        handler: handler,
    });

    const menuGrupos = (d) => {
        let ambAtual = ambienteDe(d),
            funAtual = funcaoDe(d);
        let ambientes = AMBIENTES.map(([amb, nomeAmb]) => ({
            text: `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${corDe(amb, '#9e9e9e')};margin-right:6px"></span>${Ext.String.htmlEncode(nomeAmb)}`,
            iconCls: amb === ambAtual ? 'fa fa-fw fa-check' : 'fa fa-fw',
            menu: {
                items: FUNCOES.map(([fun, nomeFun]) =>
                    itemMenu(nomeFun, amb === ambAtual && fun === funAtual, () => moverPara(d, amb, fun), corDe(fun, '#9e9e9e')),
                ).concat([
                    '-',
                    itemMenu(T('semFuncao'), amb === ambAtual && !funAtual, () => moverPara(d, amb, '')),
                ]),
            },
        }));
        return {
            text: T('moverPara'),
            iconCls: 'fa fa-fw fa-folder-open-o',
            menu: {
                items: ambientes.concat([
                    '-',
                    itemMenu(T('semGrupo'), !ambAtual && !funAtual, () => moverPara(d, '', '')),
                ]),
            },
        };
    };

    // notas do Datacenter com o nosso bloco trocado (o resto das notas fica igual)
    const notasCom = (descricao, cfg) => {
        let notas = (descricao || '').replace(new RegExp(BLOCO.source, 'g'), '\n');
        let json = JSON.stringify(cfg).replace(/</g, '\\u003c').replace(/>/g, '\\u003e');
        let bloco = '<!-- pve-organize (saved by the Tree groups screen; do not edit this part)\n'
            + json + '\n-->';
        return (notas.trimEnd() ? notas.trimEnd() + '\n\n' : '') + bloco;
    };

    // liga/desliga pela interface (fica salvo; o complemento continua carregado para religar)
    const ligarDesligar = (ligar, depois) => {
        carregarConfig((dados) => {
            let cfg = Object.assign({}, CFG_ATUAL, { ativo: ligar });
            Proxmox.Utils.API2Request({
                url: '/cluster/options',
                method: 'PUT',
                params: { description: notasCom(dados.description, cfg) },
                failure: (response) => Ext.Msg.alert(gettext('Error'), response.htmlStatus),
                success: () => {
                    usarConfig(cfg);
                    reordenarArvores();
                    if (depois) {
                        depois();
                    }
                },
            });
        });
    };
    // ---------- tela "Grupos da árvore" ----------
    const TAG_OK = /^[A-Za-z0-9_][A-Za-z0-9_+.-]*$/;
    const corAutomatica = (usadas) => {
        let livre = PALETA.find((c) => !usadas.includes(c));
        if (livre) {
            return livre;
        }
        // paleta esgotada: tom aleatório com saturação/luminosidade boas
        let h = Math.floor(Math.random() * 360) / 360,
            s = 0.6,
            l = 0.42;
        let f = (n) => {
            let k = (n + h * 12) % 12;
            let a = s * Math.min(l, 1 - l);
            let c = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
            return Math.round(c * 255).toString(16).padStart(2, '0');
        };
        return f(0) + f(8) + f(4);
    };
    const contarServidores = (tag) =>
        PVE.data.ResourceStore.getData().items.filter((r) => isGuest(r.data) && tagsDe(r.data).includes(tag)).length;

    // "color-map" do Tag Style nativo → { tag: 'fundo' ou 'fundo:texto' }
    const mapaDeCores = (estiloTags) => {
        let mapa = Object.create(null);
        ((estiloTags || {})['color-map'] || '').split(';').filter((x) => x.includes(':')).forEach((x) => {
            let [t, ...resto] = x.split(':');
            mapa[t] = resto.join(':');
        });
        return mapa;
    };

    // seletor de cor nativo do navegador, aberto no ponto do clique
    const escolherCor = (rec, e) => {
        document.querySelectorAll('input.sep-seletor').forEach((velho) => velho.remove());
        let inp = document.createElement('input');
        inp.type = 'color';
        inp.className = 'sep-seletor';
        inp.value = rec.get('cor');
        let [x, y] = e.getXY();
        Object.assign(inp.style, {
            position: 'fixed', left: `${x}px`, top: `${y}px`, width: '1px', height: '1px',
            opacity: '0', border: '0', padding: '0',
        });
        document.body.appendChild(inp);
        let sair = () => Ext.defer(() => inp.remove(), 300);
        rec.corManual = true;
        inp.addEventListener('input', () => rec.set('cor', inp.value));
        inp.addEventListener('change', () => {
            rec.set('cor', inp.value);
            sair();
        });
        Ext.defer(() => {
            if (typeof inp.showPicker === 'function') {
                try {
                    inp.showPicker();
                    return;
                } catch (err) { /* cai no click() */ }
            }
            inp.click();
        }, 10);
    };

    const gradeNivel = (titulo, ajuda, linhas, coresTags) => {
        let store = Ext.create('Ext.data.Store', {
            fields: ['tag', 'nome', 'cor', 'orig'],
            data: linhas.map(([tag, nome, cor]) => ({ tag, nome, cor: '#' + (cor || '9e9e9e'), orig: tag })),
            listeners: {
                // grupo novo com uma tag que já tem cor (Datacenter → Options → Tag Style): usa essa cor
                update: (st, rec, op, campos) => {
                    if (rec.get('orig') || rec.corManual || !campos || !campos.some((c) => c === 'tag' || c === 'nome')) {
                        return;
                    }
                    let tag = (rec.get('tag') || '').trim() || tagDoNome((rec.get('nome') || '').trim());
                    let fundo = ((coresTags || {})[tag] || '').split(':')[0];
                    if (/^[0-9a-fA-F]{6}$/.test(fundo)) {
                        rec.set('cor', '#' + fundo.toLowerCase());
                    }
                },
            },
        });
        let grade;
        let todasCores = () => {
            let cores = [];
            Ext.ComponentQuery.query('grid[sepNivel]').forEach((g) =>
                g.getStore().each((r) => cores.push(r.get('cor').replace('#', '').toLowerCase())));
            return cores;
        };
        grade = Ext.create('Ext.grid.Panel', {
            sepNivel: true,
            title: titulo,
            flex: 1,
            margin: 4,
            store: store,
            border: true,
            plugins: [{ ptype: 'cellediting', clicksToEdit: 1 }],
            listeners: {
                cellclick: (view, td, ci, rec, tr, ri, e) => {
                    let coluna = view.getHeaderCt().getHeaderAtIndex(ci);
                    if (coluna && coluna.dataIndex === 'cor') {
                        escolherCor(rec, e);
                    }
                },
            },
            viewConfig: {
                markDirty: false,
                plugins: [{ ptype: 'gridviewdragdrop', dragText: T('solte') }],
            },
            tbar: [
                {
                    text: T('adicionar'),
                    iconCls: 'fa fa-plus',
                    handler: () => {
                        let [rec] = store.add({ tag: '', nome: '', cor: '#' + corAutomatica(todasCores()), orig: '' });
                        grade.findPlugin('cellediting').startEdit(rec, 1);
                    },
                },
                {
                    text: T('coresAuto'),
                    iconCls: 'fa fa-magic',
                    tooltip: T('coresAutoDica'),
                    handler: () => {
                        let outras = [];
                        Ext.ComponentQuery.query('grid[sepNivel]').forEach((g) => {
                            if (g !== grade) {
                                g.getStore().each((r) => outras.push(r.get('cor').replace('#', '').toLowerCase()));
                            }
                        });
                        let usadas = outras.slice();
                        store.each((r) => {
                            let c = corAutomatica(usadas);
                            usadas.push(c);
                            r.set('cor', '#' + c);
                        });
                        grade.getView().refresh();
                    },
                },
                '->',
                { xtype: 'tbtext', html: `<span style="opacity:.7">${ajuda}</span>` },
            ],
            columns: [
                {
                    width: 36,
                    align: 'center',
                    sortable: false,
                    menuDisabled: true,
                    renderer: () => `<i class="fa fa-bars" style="opacity:.5;cursor:move" data-qtip="${T('arrasteDica')}"></i>`,
                },
                {
                    text: T('cor'),
                    width: 60,
                    sortable: false,
                    menuDisabled: true,
                    dataIndex: 'cor',
                    align: 'center',
                    renderer: (v) =>
                        `<div class="sep-amostra" data-qtip="${T('corDica')}" style="background:${Ext.String.htmlEncode(v)}"></div>`,
                },
                {
                    text: T('nome'),
                    dataIndex: 'nome',
                    renderer: (v) => Ext.String.htmlEncode(v || ''),
                    flex: 1,
                    sortable: false,
                    editor: { xtype: 'textfield', allowBlank: false },
                },
                {
                    text: T('tag'),
                    dataIndex: 'tag',
                    width: 120,
                    sortable: false,
                    editor: { xtype: 'textfield', allowBlank: false, regex: TAG_OK, regexText: T('tagRegra') },
                    renderer: (v) => (v ? Ext.String.htmlEncode(v) : `<i style="opacity:.6">${T('automatica')}</i>`),
                },
                {
                    text: T('servidores'),
                    width: 85,
                    sortable: false,
                    align: 'center',
                    renderer: (v, m, rec) => contarServidores(rec.get('orig') || rec.get('tag')) || '–',
                },
                {
                    xtype: 'actioncolumn',
                    width: 30,
                    items: [{
                        iconCls: 'fa fa-trash-o',
                        tooltip: T('remover'),
                        handler: (view, ri, ci, item, e, rec) => {
                            let n = contarServidores(rec.get('orig') || rec.get('tag'));
                            let remover = () => store.remove(rec);
                            if (n > 0) {
                                Ext.Msg.confirm(T('removerGrupo'), T('removerConfirma', n),
                                    (btn) => btn === 'yes' && remover());
                            } else {
                                remover();
                            }
                        },
                    }],
                },
            ],
        });
        return grade;
    };

    // tag automática a partir do nome: "Produção" → "Producao"
    const tagDoNome = (nome) => nome.normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[^A-Za-z0-9_+.-]+/g, '').replace(/^[^A-Za-z0-9_]+/, '');

    // a janela não é modal: a árvore fica visível (sem escurecer) para a pré-visualização ao vivo
    let janelaAberta = null;
    const abrirTelaGrupos = () => {
        if (janelaAberta && !janelaAberta.destroyed) {
            janelaAberta.toFront();
            return;
        }
        carregarConfig((dados) => {
            let coresTags = mapaDeCores(dados['tag-style']);
            let gTopo = gradeNivel(T('topo'), T('arraste'), CFG_ATUAL.topo || [], coresTags);
            let gSub = gradeNivel(T('sub'), T('arraste'), CFG_ATUAL.sub || [], coresTags);
            let rascunho = Ext.apply({}, CFG_ATUAL);
            let previa = () => aplicarVisual(rascunho);
            let esconder = Ext.create('Ext.form.field.Checkbox', {
                boxLabel: T('esconder'),
                value: CFG_ATUAL.esconder_tags !== false,
            });
            let estilo = Ext.create('Ext.form.field.ComboBox', {
                fieldLabel: T('estilo'),
                labelWidth: 45,
                width: 230,
                editable: false,
                queryMode: 'local',
                store: ESTILOS,
                value: CFG_ATUAL.estilo || 'A',
                listeners: { change: (c, v) => { rascunho.estilo = v; previa(); } },
            });
            let contador = Ext.create('Ext.form.field.Checkbox', {
                boxLabel: T('contador'),
                value: !!CFG_ATUAL.contador,
                listeners: { change: (c, v) => { rascunho.contador = v; previa(); } },
            });
            let recuo = Ext.create('Ext.form.field.Checkbox', {
                boxLabel: T('recuo'),
                value: !!CFG_ATUAL.recuo,
                listeners: { change: (c, v) => { rascunho.recuo = v; previa(); } },
            });
            let visual = Ext.create('Ext.form.FieldSet', {
                title: T('visual'),
                margin: '4 8 6 8',
                layout: { type: 'hbox', align: 'middle' },
                defaults: { margin: '0 18 4 0' },
                items: [estilo, contador, recuo, esconder],
            });
            const pintarBotao = (btn, ligado) => {
                btn.setText(ligado
                    ? `<b style="color:#4caf50">${T('ligados')}</b>`
                    : `<b style="opacity:.75">${T('desligados')}</b>`);
                btn.setIconCls(ligado ? 'fa fa-toggle-on fa-lg sep-on' : 'fa fa-toggle-off fa-lg');
                btn.setTooltip(ligado ? T('cliqueDesligar') : T('cliqueLigar'));
            };
            let botaoAtivo = Ext.create('Ext.button.Button', {
                enableToggle: true,
                pressed: CFG_ATUAL.ativo !== false,
                listeners: {
                    afterrender: (btn) => pintarBotao(btn, btn.pressed),
                    toggle: (btn, ligado) => {
                        pintarBotao(btn, ligado);
                        btn.disable();
                        ligarDesligar(ligado, () => {
                            btn.enable();
                            previa(); // mantém a pré-visualização do que está sendo editado
                        });
                    },
                },
            });
            let barraTopo = {
                xtype: 'toolbar',
                dock: 'top',
                items: [
                    { xtype: 'tbtext', html: `<b>${T('separadoresNaArvore')}</b>` },
                    botaoAtivo,
                    '->',
                    { xtype: 'tbtext', html: `<span style="opacity:.7">${T('desligarNaoApaga')}</span>` },
                ],
            };
            let salvo = false;
            let janela = Ext.create('Ext.window.Window', {
                title: T('tituloTela'),
                iconCls: 'fa fa-folder-open-o',
                modal: false,
                width: 800,
                height: 640,
                layout: { type: 'vbox', align: 'stretch' },
                dockedItems: [barraTopo],
                items: [gTopo, gSub, visual],
                listeners: { close: () => { if (!salvo) { aplicarVisual(CFG_ATUAL); } } },
                buttons: [
                    { xtype: 'tbtext', html: `<span style="opacity:.7">${T('rodape')}</span>` },
                    '->',
                    { text: gettext('Cancel'), handler: () => janela.close() },
                    {
                        text: gettext('Save'),
                        iconCls: 'fa fa-check',
                        handler: () => salvar(),
                    },
                ],
            });

            const salvar = () => {
                let erros = [];
                let vistas = {};
                let renomes = [];
                let ler = (grade) => {
                    let out = [];
                    grade.getStore().each((r) => {
                        let nome = (r.get('nome') || '').trim();
                        let tag = (r.get('tag') || '').trim() || tagDoNome(nome);
                        let cor = (r.get('cor') || '#9e9e9e').replace('#', '').toLowerCase();
                        if (!nome) {
                            erros.push(T('erroSemNome'));
                            return;
                        }
                        if (!TAG_OK.test(tag)) {
                            erros.push(T('erroTag', Ext.String.htmlEncode(nome)));
                            return;
                        }
                        if (vistas[tag]) {
                            erros.push(T('erroRepetida', tag));
                        }
                        vistas[tag] = true;
                        let orig = r.get('orig');
                        if (orig && orig !== tag) {
                            renomes.push([orig, tag]);
                        }
                        out.push([tag, nome, cor]);
                    });
                    return out;
                };
                let cfg = {
                    topo: ler(gTopo),
                    sub: ler(gSub),
                    esconder_tags: esconder.getValue(),
                    ativo: botaoAtivo.pressed,
                    estilo: estilo.getValue() || 'A',
                    contador: contador.getValue(),
                    recuo: recuo.getValue(),
                };
                if (!cfg.topo.length) {
                    erros.push(T('erroTopo'));
                }
                if (erros.length) {
                    Ext.Msg.alert(T('tituloTela'), [...new Set(erros)].join('<br>'));
                    return;
                }

                janela.mask(T('salvando'));
                // relê as opções agora: a janela não é modal e alguém pode ter mudado as notas nesse meio tempo
                Proxmox.Utils.API2Request({
                    url: '/cluster/options',
                    method: 'GET',
                    failure: (response) => {
                        janela.unmask();
                        Ext.Msg.alert(gettext('Error'), response.htmlStatus);
                    },
                    success: (response) => gravar(response.result.data || {}, cfg, renomes),
                });
            };

            const gravar = (dados, cfg, renomes) => {
                // cores: no "Tag Style" nativo, mantendo as cores de outras tags
                let estiloTags = Ext.apply({}, dados['tag-style'] || {});
                let mapaCores = mapaDeCores(estiloTags);

                // cor que cada tag tinha antes de virar grupo ('' = sem cor própria), para devolver ao remover.
                // Sem configuração salva, os grupos de exemplo ainda não mudaram a cor de nenhuma tag.
                let salvaAntes = lerConfig(dados.description) || {};
                let tagsAntes = (salvaAntes.topo || []).concat(salvaAntes.sub || []).map(([t]) => t);
                let tagsAgora = cfg.topo.concat(cfg.sub).map(([t]) => t);
                let origAntes = salvaAntes.cores_orig || {};
                let renomeadas = renomes.map(([antiga]) => antiga);
                let coresOrig = Object.create(null);
                tagsAgora.forEach((t) => {
                    if (tagsAntes.includes(t)) {
                        if (Object.hasOwn(origAntes, t)) {
                            coresOrig[t] = origAntes[t];
                        }
                    } else {
                        coresOrig[t] = mapaCores[t] || '';
                    }
                });
                tagsAntes.filter((t) => !tagsAgora.includes(t)).forEach((t) => {
                    if (renomeadas.includes(t)) {
                        delete mapaCores[t]; // a tag some dos servidores
                    } else if (Object.hasOwn(origAntes, t)) {
                        if (origAntes[t]) {
                            mapaCores[t] = origAntes[t];
                        } else {
                            delete mapaCores[t]; // volta à cor automática do Proxmox
                        }
                    }
                });
                cfg.cores_orig = coresOrig;

                // notas do Datacenter: troca só o nosso bloco, o resto das notas fica
                let notas = notasCom(dados.description, cfg);

                cfg.topo.concat(cfg.sub).forEach(([tag, , cor]) => {
                    let r = parseInt(cor.slice(0, 2), 16),
                        g = parseInt(cor.slice(2, 4), 16),
                        b = parseInt(cor.slice(4, 6), 16);
                    let texto = 0.299 * r + 0.587 * g + 0.114 * b > 160 ? '000000' : 'ffffff';
                    mapaCores[tag] = `${cor}:${texto}`;
                });
                estiloTags['color-map'] = Object.entries(mapaCores).map(([t, c]) => `${t}:${c}`).join(';');
                let estiloTxt = Object.entries(estiloTags)
                    .filter(([, v]) => v !== undefined && v !== null && v !== '')
                    .map(([k, v]) => `${k}=${v}`).join(',');

                Proxmox.Utils.API2Request({
                    url: '/cluster/options',
                    method: 'PUT',
                    params: { description: notas, 'tag-style': estiloTxt },
                    failure: (response) => {
                        janela.unmask();
                        Ext.Msg.alert(gettext('Error'), response.htmlStatus);
                    },
                    success: () => {
                        salvo = true;
                        usarConfig(cfg);
                        // tags renomeadas: atualizar os servidores que usavam a antiga
                        let troca = Object.fromEntries(renomes);
                        PVE.data.ResourceStore.getData().items.forEach((r) => {
                            let d = r.data;
                            if (!isGuest(d) || !tagsDe(d).some((t) => Object.hasOwn(troca, t))) {
                                return;
                            }
                            let tags = tagsDe(d).map((t) => (Object.hasOwn(troca, t) ? troca[t] : t));
                            Proxmox.Utils.API2Request({
                                url: `/nodes/${d.node}/${d.type}/${d.vmid}/config`,
                                method: 'PUT',
                                params: { tags: [...new Set(tags)].join(';') },
                                failure: (response) => Ext.Msg.alert(gettext('Error'),
                                    `${d.vmid} (${Ext.String.htmlEncode(d.name || '')}): ${response.htmlStatus}`),
                            });
                        });
                        PVE.UIOptions.update();
                        Ext.defer(() => PVE.data.ResourceStore.load(), 800);
                        reordenarArvores();
                        janela.close();
                    },
                });
            };

            janelaAberta = janela;
            janela.show();
        });
    };

    const itemTelaGrupos = { text: T('telaGrupos'), iconCls: 'fa fa-fw fa-sliders', handler: () => abrirTelaGrupos() };

    const criarMenuOriginal = PVE.Utils.createCmdMenu;
    PVE.Utils.createCmdMenu = function (v, record) {
        let menu = criarMenuOriginal.apply(this, arguments);
        if (menu && record) {
            let d = record.data;
            if (isGuest(d)) {
                let mover = menuGrupos(d);
                mover.menu.items.push('-', itemTelaGrupos);
                menu.add(['-', mover]);
            } else if (d.type === 'node' || record.isRoot()) {
                menu.add(['-', itemTelaGrupos]);
            }
        }
        return menu;
    };

    let css = document.createElement('style');
    css.textContent = `
/* ---------- base ---------- */
.sep-estilo-A { --h1: 30px; --h2: 22px; }
.sep-estilo-B { --h1: 30px; --h2: 22px; }
.sep-estilo-C { --h1: 30px; --h2: 20px; }
.sep-estilo-D { --h1: 34px; --h2: 20px; }
.sep-estilo-E { --h1: 28px; --h2: 18px; }
.sep-estilo-F { --h1: 30px; --h2: 22px; }
td.sep-tem-amb .x-grid-cell-inner,
td.sep-tem-fun .x-grid-cell-inner,
td.sep-em-sub .x-grid-cell-inner { position: relative; }
td.sep-tem-amb .x-grid-cell-inner { padding-top: var(--h1, 30px); }
td.sep-tem-fun .x-grid-cell-inner { padding-top: var(--h2, 22px); }
td.sep-tem-amb.sep-tem-fun .x-grid-cell-inner { padding-top: calc(var(--h1, 30px) + var(--h2, 22px)); }

/* a faixa do título fica com a cor de fundo da árvore, mesmo com a linha selecionada ou sob o mouse */
td.sep-tem-amb, td.sep-tem-fun {
    background-image: linear-gradient(var(--sep-fundo, transparent), var(--sep-fundo, transparent)) !important;
    background-repeat: no-repeat !important;
    background-position: top left !important;
}
td.sep-tem-amb { background-size: 100% var(--h1, 30px) !important; }
td.sep-tem-fun { background-size: 100% var(--h2, 22px) !important; }
td.sep-tem-amb.sep-tem-fun { background-size: 100% calc(var(--h1, 30px) + var(--h2, 22px)) !important; }

.sep-amb, .sep-fun {
    position: absolute; display: flex; align-items: center; white-space: nowrap;
    box-sizing: border-box; cursor: default; overflow: hidden;
}
td.sep-tem-fun:not(.sep-tem-amb) .sep-fun { top: 3px; }
td.sep-tem-amb.sep-tem-fun .sep-fun { top: calc(var(--h1, 30px) + 3px); }
.sep-cont { margin-left: auto; padding-left: 8px; font-size: 10px; font-weight: 600; opacity: .7; letter-spacing: 0; }
.sep-sem-contador .sep-cont { display: none; }
.sep-on { color: #4caf50 !important; }
.sep-recuo td.sep-em-sub .x-tree-icon { margin-left: 12px; }
.sep-amostra {
    width: 34px; height: 16px; margin: 0 auto; border-radius: 4px; cursor: pointer;
    border: 1px solid rgba(128, 128, 128, .6); box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .15);
}

/* ---------- A · faixa ---------- */
.sep-estilo-A .sep-amb {
    top: 6px; left: 4px; right: 4px; height: 20px; padding: 0 6px 0 8px;
    font-size: 11px; font-weight: 700; letter-spacing: .09em; text-transform: uppercase; color: var(--g);
    background: linear-gradient(90deg, color-mix(in srgb, var(--g) 22%, transparent), transparent 85%);
    border-left: 4px solid var(--g); border-radius: 3px;
}
.sep-estilo-A .sep-fun {
    left: 26px; right: 8px; height: 16px; gap: 6px;
    font-size: 10.5px; font-weight: 600; letter-spacing: .05em; text-transform: uppercase; color: var(--s);
}
.sep-estilo-A .sep-fun::before { content: ''; order: -1; width: 7px; height: 7px; border-radius: 50%; background: var(--s); flex: none; }
.sep-estilo-A .sep-fun::after { content: ''; order: 1; flex: 1; height: 1px; background: color-mix(in srgb, var(--s) 45%, transparent); }
.sep-estilo-A .sep-fun .sep-cont { order: 2; margin-left: 0; padding-left: 0; }

/* ---------- B · etiquetas ---------- */
.sep-estilo-B .sep-amb { top: 7px; left: 6px; right: 8px; height: 18px; gap: 8px; }
.sep-estilo-B .sep-amb .sep-txt {
    background: var(--g); color: var(--gt); font-size: 10.5px; font-weight: 700; letter-spacing: .08em;
    text-transform: uppercase; padding: 1px 9px; border-radius: 999px; line-height: 14px;
}
.sep-estilo-B .sep-amb::after { content: ''; order: 1; flex: 1; height: 1px; background: rgba(128, 128, 128, .35); }
.sep-estilo-B .sep-amb .sep-cont { order: 2; margin-left: 0; padding-left: 0; }
.sep-estilo-B .sep-fun { left: 28px; right: 8px; height: 16px; gap: 6px; color: var(--s); font-size: 10.5px; font-weight: 600; }
.sep-estilo-B .sep-fun .sep-txt {
    border: 1px solid color-mix(in srgb, var(--s) 70%, transparent); padding: 0 7px; border-radius: 999px; line-height: 13px;
}
.sep-estilo-B .sep-fun .sep-cont { margin-left: 0; padding-left: 0; }

/* ---------- C · trilho lateral ---------- */
.sep-estilo-C td.sep-em-grupo { box-shadow: inset 3px 0 0 var(--g); }
.sep-estilo-C .sep-amb {
    top: 8px; left: 12px; right: 8px; height: 18px;
    font-size: 11.5px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--g);
}
.sep-estilo-C .sep-fun { left: 24px; right: 8px; height: 16px; font-size: 10.5px; font-weight: 600; letter-spacing: .04em; color: var(--s); }
.sep-estilo-C td.sep-em-sub .x-grid-cell-inner::before {
    content: ''; position: absolute; left: 14px; top: 0; bottom: 0; width: 2px; border-radius: 2px; background: var(--s);
}
.sep-estilo-C td.sep-tem-amb:not(.sep-tem-fun) .x-grid-cell-inner::before { top: var(--h1); }
.sep-estilo-C td.sep-tem-fun:not(.sep-tem-amb) .x-grid-cell-inner::before { top: calc(var(--h2) - 2px); }
.sep-estilo-C td.sep-tem-amb.sep-tem-fun .x-grid-cell-inner::before { top: calc(var(--h1) + var(--h2) - 2px); }

/* ---------- D · cartões ---------- */
.sep-estilo-D td.sep-em-grupo { background-color: color-mix(in srgb, var(--g) 10%, var(--sep-fundo, transparent)); }
.sep-estilo-D .x-grid-item-selected td.sep-em-grupo,
.sep-estilo-D .x-grid-item-over td.sep-em-grupo { background-color: transparent; }
.sep-estilo-D td.sep-ult-grupo { border-radius: 0 0 8px 8px; }
.sep-estilo-D td.sep-tem-fun:not(.sep-tem-amb) {
    background-image: linear-gradient(color-mix(in srgb, var(--g) 10%, var(--sep-fundo, transparent)),
        color-mix(in srgb, var(--g) 10%, var(--sep-fundo, transparent))) !important;
}
.sep-estilo-D td.sep-tem-amb.sep-tem-fun {
    background-image: linear-gradient(var(--sep-fundo, transparent), var(--sep-fundo, transparent)),
        linear-gradient(color-mix(in srgb, var(--g) 10%, var(--sep-fundo, transparent)),
        color-mix(in srgb, var(--g) 10%, var(--sep-fundo, transparent))) !important;
    background-size: 100% var(--h1), 100% calc(var(--h1) + var(--h2)) !important;
}
.sep-estilo-D .sep-amb {
    top: 6px; left: 0; right: 0; height: 28px; padding: 0 10px; gap: 7px;
    font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--g);
    background: color-mix(in srgb, var(--g) 18%, var(--sep-fundo, transparent));
    border: 1px solid color-mix(in srgb, var(--g) 40%, transparent); border-radius: 8px 8px 0 0;
}
.sep-estilo-D .sep-amb::before { content: '\\f07c'; font-family: FontAwesome; font-weight: normal; letter-spacing: 0; }
.sep-estilo-D .sep-fun { left: 14px; right: 8px; height: 16px; gap: 6px; font-size: 10.5px; font-weight: 600; color: var(--s); }
.sep-estilo-D .sep-fun::before { content: ''; order: -1; width: 3px; height: 11px; border-radius: 2px; background: var(--s); }
.sep-estilo-D .sep-fun .sep-cont { margin-left: 0; padding-left: 2px; }

/* ---------- E · minimalista ---------- */
.sep-estilo-E .sep-amb {
    top: 10px; left: 12px; right: 10px; height: 14px; gap: 7px;
    font-size: 10.5px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase;
    color: color-mix(in srgb, currentColor 62%, transparent);
}
.sep-estilo-E .sep-amb::before { content: ''; order: -1; width: 8px; height: 8px; border-radius: 2px; background: var(--g); flex: none; }
.sep-estilo-E .sep-fun {
    left: 30px; right: 10px; height: 14px; gap: 5px; font-size: 10.5px;
    color: color-mix(in srgb, currentColor 62%, transparent);
}
.sep-estilo-E .sep-fun::before { content: ''; order: -1; width: 6px; height: 6px; border-radius: 50%; background: var(--s); flex: none; }
.sep-estilo-E .sep-fun .sep-cont { margin-left: 0; padding-left: 2px; }

/* ---------- F · cabeçalho cheio ---------- */
.sep-estilo-F .sep-amb {
    top: 6px; left: 0; right: 0; height: 22px; padding: 0 10px; gap: 8px;
    background: var(--g); color: var(--gt);
    font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
}
.sep-estilo-F .sep-amb .sep-cont { opacity: .85; }
.sep-estilo-F .sep-fun {
    left: 20px; height: 17px; padding: 0 8px;
    font-size: 10.5px; font-weight: 700; letter-spacing: .05em; text-transform: uppercase; color: var(--s);
    border-bottom: 2px solid color-mix(in srgb, var(--s) 60%, transparent);
}
.sep-estilo-F .sep-fun .sep-cont { margin-left: 0; }
`;
    document.head.appendChild(css);
})();
