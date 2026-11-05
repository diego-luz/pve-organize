# PVE Organize

**Grupos y separadores en el árbol de Proxmox VE.** Organiza tus VMs y contenedores en
secciones de colores — como *Producción › Red*, *Pruebas*, *Plantilla* — directamente en la
Server View, con una pantalla para elegir colores, orden y estilo.

[English](README.md) · [Português (Brasil)](README.pt-BR.md) · **Español**

[![Licencia: MIT](https://img.shields.io/badge/licencia-MIT-green.svg)](LICENSE)
![Probado en Proxmox VE 9.2](https://img.shields.io/badge/probado%20en-Proxmox%20VE%209.2-orange)

![Los seis estilos](docs/estilos.png)

- **Dos niveles**: un *nivel superior* (título grande) y, si quieres, una *subcategoría*
  (subtítulo) por servidor.
- **Usa las etiquetas de Proxmox**, nada nuevo guardado en los servidores. Un servidor con
  `Produccion;Red` aparece en **PRODUCCIÓN › Red**.
- **Clic derecho → Mover a grupo** cambia el grupo en dos clics.
- **Pantalla Grupos del árbol…**: crear grupos, elegir colores (o automáticos), arrastrar para
  ordenar, 6 estilos, contador, sangría y un interruptor de encendido/apagado.
- **Configuración compartida**: se guarda en las Notas del Datacenter y en Tag Style, así todos
  los administradores y navegadores ven el mismo árbol.
- **Sigue el idioma de Proxmox**: español, inglés y portugués (los demás usan inglés).
- **Sobrevive a las actualizaciones de Proxmox** y se quita con un comando.

> Proyecto de la comunidad, sin relación con Proxmox Server Solutions GmbH.

---

## Instalar

Los comandos se ejecutan **en el propio nodo de Proxmox, como `root`**, no en tu computadora.
Abre una terminal en el nodo de una de estas formas:

- **Interfaz web**: selecciona el nodo (p. ej. `pve`) en el árbol → **>_ Shell**.
- **SSH**: `ssh root@<ip-del-nodo>` desde tu computadora.

En esa terminal, ejecuta:

```bash
bash -c "$(curl -fsSL https://raw.githubusercontent.com/diego-luz/pve-organize/main/install.sh)"
```

Luego vuelve a la página de Proxmox en el **navegador** y recárgala (**F5**).

<details>
<summary>Instalar desde un clon (en la misma terminal del nodo)</summary>

```bash
apt install -y git          # si git aún no está instalado
git clone https://github.com/diego-luz/pve-organize.git
cd pve-organize
./install.sh
```
</details>

### Versiones probadas

| Proxmox VE | pve-manager | proxmox-widget-toolkit | Kernel | Resultado |
|---|---|---|---|---|
| **9.2** | 9.2.25 | 5.2.10 | 7.0.14-26-pve | ✅ funciona (probado con el tema oscuro y la interfaz en portugués) |
| 8.x | — | — | — | ⚠️ no probado; el instalador lo permite y avisa |

Las versiones anteriores a la 8 son rechazadas por el instalador. Si lo pruebas en otra versión,
abre un issue contando si funcionó. En un clúster, instálalo en cada nodo cuya interfaz web uses.

## Uso

1. **Pon los servidores en grupos.** Clic derecho en la VM/CT → **Mover a grupo** →
   *Producción* → *Red*. O pon las etiquetas a mano (una de nivel superior y, si quieres, una de
   subcategoría).
2. **Ajusta.** Clic derecho en un servidor, en el nodo o en *Datacenter* → **Grupos del árbol…**

| En la pantalla *Grupos del árbol* | |
|---|---|
| **Añadir** | escribe el nombre; la etiqueta se crea a partir de él (sin tildes ni espacios) |
| **Color** | haz clic en la muestra para abrir el selector, o usa **Colores automáticos** |
| **Orden** | arrastra por ☰; el orden de la lista es el orden del árbol |
| **Servidores** | cuántos usan cada grupo; renombrar la etiqueta actualiza esos servidores |
| **Apariencia** | estilo A–F, contador, sangría, ocultar etiquetas repetidas — el árbol cambia al instante; *Cancel* deshace |
| **ACTIVADOS / DESACTIVADOS** | botón arriba: activa o desactiva al instante, sin perder nada |

Los servidores sin una etiqueta de nivel superior conocida aparecen al final, en **Sin grupo**.

## Comandos

En la terminal del nodo (**>_ Shell** de la interfaz web o SSH), como `root`:

```bash
pve-organize status        # activado / desactivado
pve-organize off           # lo quita de la interfaz (la configuración se conserva)
pve-organize on            # lo carga de nuevo
pve-organize desinstalar   # quita todo lo instalado (también: uninstall)
```

## Cómo funciona

- `/usr/local/share/pve-organize/pve-organize.js` se copia a `/usr/share/pve-manager/js/` y se
  añade una línea `<script>` a `/usr/share/pve-manager/index.html.tpl`. Una copia limpia de esa
  página queda en `/usr/local/share/pve-organize/index.html.tpl.original`.
- Un hook de apt (`/etc/apt/apt.conf.d/99pve-organize`) vuelve a poner la línea tras las
  actualizaciones de Proxmox.
- Grupos, orden y estilo se guardan en un bloque oculto al final de **Datacenter → Notas**
  (`<!-- pve-organize … -->`); los colores en **Datacenter → Opciones → Tag Style**.
  No edites ese bloque a mano; el resto de tus notas no se toca.
- Solo cambia la interfaz web. Mover un servidor solo cambia sus etiquetas.

Permisos: mover un servidor requiere `VM.Config.Options` en él; guardar la pantalla
*Grupos del árbol* requiere `Sys.Modify` en `/`.

## Actualizar y desinstalar

- **Actualizar**: ejecuta de nuevo el comando de instalación.
- **Desinstalar**: `pve-organize desinstalar` y F5. Los grupos siguen en las Notas del Datacenter
  y en Tag Style; bórralos allí si quieres.
- **¿Algo se ve raro?** `pve-organize off` y F5 devuelven el árbol original de Proxmox.

## Traducciones

Los textos están en la tabla `TEXTOS` al inicio de `pve-organize.js` (una línea por texto:
portugués, inglés, español). Se aceptan pull requests con más idiomas.

## Licencia

[MIT](LICENSE)
