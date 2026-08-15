const AppCalculadora = {
  reproducirSonido() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(600, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.08);
    } catch (e) {}
  },

  navegarA(pantalla) {
    this.reproducirSonido();
    document.querySelectorAll(".pantalla").forEach(p => p.classList.remove("activa"));
    const target = document.getElementById(`pantalla-${pantalla}`);
    if (target) target.classList.add("activa");
  },

  actualizarHistorial(idLista, texto) {
    const lista = document.getElementById(idLista);
    if (!lista) return;

    if (lista.children.length === 1 && lista.children[0].innerText.includes("No hay operaciones")) {
      lista.innerHTML = "";
    }

    const nuevoItem = document.createElement("li");
    nuevoItem.innerText = texto;
    lista.insertBefore(nuevoItem, lista.firstChild);
    
    if (lista.children.length > 3) {
      lista.removeChild(lista.lastChild);
    }
  },

  agregarFilaExamenPrevio() {
    this.reproducirSonido();
    const cont = document.getElementById("contenedor-examenes-previos");
    if (!cont) return;
    const div = document.createElement("div");
    div.className = "fila-dinamica";
    div.innerHTML = `
      <input type="number" class="ex-nota" placeholder="Nota (0-10)" step="0.1" min="0" max="10">
      <input type="number" class="ex-peso" placeholder="Peso %" min="0" max="100">
    `;
    cont.appendChild(div);
  },

  calcularNotaNecesariaMultiples() {
    this.reproducirSonido();
    const notasInputs = document.querySelectorAll(".ex-nota");
    const pesosInputs = document.querySelectorAll(".ex-peso");
    const pPendienteEl = document.getElementById("pesoPendiente");
    const nObjEl = document.getElementById("notaObjetivoMultiples");
    const display = document.getElementById("resultadoNotaMultiples");

    if (!display || !pPendienteEl || !nObjEl) return;
    
    const pesoPendienteInput = parseFloat(pPendienteEl.value);
    const notaObjetivo = parseFloat(nObjEl.value);

    if (isNaN(pesoPendienteInput) || isNaN(notaObjetivo) || pesoPendienteInput <= 0) {
      display.innerText = "⚠️ Revisa los datos";
      return;
    }

    let sumaPesosPrevios = 0;
    let puntosAcumuladosReales = 0;

    for (let i = 0; i < notasInputs.length; i++) {
      const p = parseFloat(pesosInputs[i].value);
      if (!isNaN(p)) sumaPesosPrevios += p;
    }

    const pesoTotal = sumaPesosPrevios + pesoPendienteInput;
    const pesoPendienteReal = pesoPendienteInput / pesoTotal;

    for (let i = 0; i < notasInputs.length; i++) {
      const n = parseFloat(notasInputs[i].value);
      const p = parseFloat(pesosInputs[i].value);
      if (!isNaN(n) && !isNaN(p)) {
        puntosAcumuladosReales += n * (p / pesoTotal);
      }
    }

    const notaNecesaria = (notaObjetivo - puntosAcumuladosReales) / pesoPendienteReal;

    if (notaNecesaria > 10) {
      display.innerHTML = `🎓 Necesitas: <strong>Imposible (${notaNecesaria.toFixed(2)})</strong>`;
      this.actualizarHistorial("historial-necesaria", `Final: imposible (${notaNecesaria.toFixed(2)})`);
    } else if (notaNecesaria < 0) {
      display.innerHTML = `🎓 Necesitas: <strong>¡Ya aprobado!</strong>`;
      this.actualizarHistorial("historial-necesaria", `Final: aprobado`);
    } else {
      const res = notaNecesaria.toFixed(2);
      display.innerHTML = `🎓 Necesitas: <strong>${res}</strong>`;
      this.actualizarHistorial("historial-necesaria", `Final: necesitas ${res}`);
    }
  },

  limpiarNotaNecesariaMultiples() {
    this.reproducirSonido();
    const cont = document.getElementById("contenedor-examenes-previos");
    if (cont) cont.innerHTML = `<div class="fila-dinamica"><input type="number" class="ex-nota" placeholder="Nota (0-10)" step="0.1" min="0" max="10"><input type="number" class="ex-peso" placeholder="Peso %" min="0" max="100"></div>`;
    document.getElementById("pesoPendiente").value = "";
    document.getElementById("notaObjetivoMultiples").value = "";
    document.getElementById("resultadoNotaMultiples").innerText = "🎓 Necesitas: 0.00";
  },

  agregarFilaPonderada() {
    this.reproducirSonido();
    const cont = document.getElementById("contenedor-filas-ponderada");
    if (!cont) return;
    const div = document.createElement("div");
    div.className = "fila-dinamica";
    div.innerHTML = `<input type="number" class="p-nota" placeholder="Nota (0-10)" step="0.1" min="0" max="10"><input type="number" class="p-peso" placeholder="Peso %" min="0" max="100">`;
    cont.appendChild(div);
  },

  calcularMediaPonderada() {
    this.reproducirSonido();
    const notas = document.querySelectorAll(".p-nota");
    const pesos = document.querySelectorAll(".p-peso");
    const display = document.getElementById("resultadoPonderada");
    if (!display) return;

    let sumaProductos = 0, sumaPesos = 0;
    for (let i = 0; i < notas.length; i++) {
      const n = parseFloat(notas[i].value), p = parseFloat(pesos[i].value);
      if (!isNaN(n) && !isNaN(p)) { sumaProductos += n * p; sumaPesos += p; }
    }
    if (sumaPesos === 0) { display.innerText = "⚠️ Introduce datos"; return; }
    const media = (sumaProductos / sumaPesos).toFixed(2);
    display.innerText = `📊 Media: ${media}`;
    this.actualizarHistorial("historial-ponderada", `Media: ${media}`);
  },

  limpiarMediaPonderada() {
    this.reproducirSonido();
    document.querySelectorAll(".p-nota, .p-peso").forEach(i => i.value = "");
    document.getElementById("resultadoPonderada").innerText = "0.00";
  },

  calcularDescuento() {
    this.reproducirSonido();
    const cant = parseFloat(document.getElementById("cantidad").value), porc = parseFloat(document.getElementById("porcentaje").value);
    const display = document.getElementById("resultado");
    if (isNaN(cant) || isNaN(porc)) { display.innerText = "⚠️ Datos incompletos"; return; }
    const total = (cant - (cant * (porc / 100))).toFixed(2);
    display.innerText = `🏷️ Total: ${total} €`;
    this.actualizarHistorial("historial-descuentos", `${cant}€ (-${porc}%): ${total}€`);
  },

  limpiarDescuento() {
    this.reproducirSonido();
    document.getElementById("cantidad").value = "";
    document.getElementById("porcentaje").value = "";
    document.getElementById("resultado").innerText = "0.00 €";
  },

  calcularIVA() {
    this.reproducirSonido();
    const modo = document.getElementById("modoIva").value, importe = parseFloat(document.getElementById("importeIva").value), tipo = parseFloat(document.getElementById("porcentajeIva").value);
    const display = document.getElementById("resultadoIva");
    if (isNaN(importe)) { display.innerText = "⚠️ Pon un importe"; return; }
    const total = modo === "añadir" ? (importe + (importe * (tipo / 100))).toFixed(2) : (importe / (1 + (tipo / 100))).toFixed(2);
    display.innerText = modo === "añadir" ? `💶 Total +IVA: ${total} €` : `📄 Base: ${total} €`;
    this.actualizarHistorial("historial-iva", `${modo} ${tipo}%: ${total}€`);
  },

  limpiarIVA() {
    this.reproducirSonido();
    document.getElementById("importeIva").value = "";
    document.getElementById("resultadoIva").innerText = "0.00 €";
  },

  calcularSueldo() {
    this.reproducirSonido();
    const bruto = parseFloat(document.getElementById("brutoAnual").value), pagas = parseInt(document.getElementById("numPagas").value);
    const display = document.getElementById("resultadoSueldo");
    if (isNaN(bruto) || bruto <= 0) { display.innerText = "⚠️ Ingresa bruto anual"; return; }
    let irpf = bruto > 35000 ? 0.20 : (bruto > 20000 ? 0.15 : 0.12);
    const netoMensual = (bruto * (1 - (irpf + 0.0635)) / pagas).toFixed(2);
    display.innerText = `💵 ~${netoMensual} € / mes`;
    this.actualizarHistorial("historial-sueldo", `~${netoMensual}€/mes`);
  },

  limpiarSueldo() {
    this.reproducirSonido();
    document.getElementById("brutoAnual").value = "";
    document.getElementById("resultadoSueldo").innerText = "0.00 €";
  }
};

function mostrarPantalla(nombre) { AppCalculadora.navegarA(nombre); }

function cambiarTab(hub, subtab, boton) {
  AppCalculadora.reproducirSonido();
  const parent = document.getElementById(`pantalla-${hub}`);
  if (!parent) return;
  parent.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("activa"));
  parent.querySelectorAll(".subtab-contenido").forEach(s => s.classList.remove("activa"));
  boton.classList.add("activa");
  const targetSubtab = document.getElementById(`subtab-${hub}-${subtab}`);
  if (targetSubtab) targetSubtab.classList.add("activa");
}
