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

  // ESTUDIOS: Añadir fila para exámenes previos (Nota Necesaria Múltiple)
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

  // ESTUDIOS: Calcular Nota Necesaria con múltiples exámenes previos
  calcularNotaNecesariaMultiples() {
    this.reproducirSonido();
    
    const notasInputs = document.querySelectorAll(".ex-nota");
    const pesosInputs = document.querySelectorAll(".ex-peso");
    const pesoPendienteInput = parseFloat(document.getElementById("pesoPendiente").value);
    const notaObjetivo = parseFloat(document.getElementById("notaObjetivoMultiples").value);
    const display = document.getElementById("resultadoNotaMultiples");

    if (!display) return;

    if (isNaN(pesoPendienteInput) || isNaN(notaObjetivo) || pesoPendienteInput <= 0) {
      display.innerText = "⚠️ Revisa el peso pendiente y el objetivo";
      return;
    }

    let sumaPesosPrevios = 0;
    let puntosAcumuladosReales = 0;

    // Calculamos el peso total sumando los previos más el pendiente
    for (let i = 0; i < notasInputs.length; i++) {
      const p = parseFloat(pesosInputs[i].value);
      if (!isNaN(p)) {
        sumaPesosPrevios += p;
      }
    }

    const pesoTotal = sumaPesosPrevios + pesoPendienteInput;
    const pesoPendienteReal = pesoPendienteInput / pesoTotal;

    // Recorremos de nuevo para sumar la contribución real de cada examen previo
    for (let i = 0; i < notasInputs.length; i++) {
      const n = parseFloat(notasInputs[i].value);
      const p = parseFloat(pesosInputs[i].value);

      if (!isNaN(n) && !isNaN(p)) {
        let pesoRealInd = p / pesoTotal;
        puntosAcumuladosReales += n * pesoRealInd;
      }
    }

    const notaNecesaria = (notaObjetivo - puntosAcumuladosReales) / pesoPendienteReal;

    if (notaNecesaria > 10) {
      display.innerHTML = `🎓 Necesitas: <strong>Imposible (¡un ${notaNecesaria.toFixed(2)}!)</strong>`;
      this.actualizarHistorial("historial-necesaria", `Examen final: imposible (${notaNecesaria.toFixed(2)})`);
    } else if (notaNecesaria < 0) {
      display.innerHTML = `🎓 Necesitas: <strong>¡Ya has aprobado!</strong>`;
      this.actualizarHistorial("historial-necesaria", `Examen final: ¡Ya has aprobado!`);
    } else {
      const res = notaNecesaria.toFixed(2);
      display.innerHTML = `🎓 Necesitas: <strong>${res}</strong>`;
      this.actualizarHistorial("historial-necesaria", `Examen final: necesitas un ${res}`);
    }
  },

  limpiarNotaNecesariaMultiples() {
    this.reproducirSonido();
    const cont = document.getElementById("contenedor-examenes-previos");
    if (cont) {
      cont.innerHTML = `
        <div class="fila-dinamica">
          <input type="number" class="ex-nota" placeholder="Nota (0-10)" step="0.1" min="0" max="10">
          <input type="number" class="ex-peso" placeholder="Peso %" min="0" max="100">
        </div>
      `;
    }
    const pPendiente = document.getElementById("pesoPendiente");
    const nObj = document.getElementById("notaObjetivoMultiples");
    const res = document.getElementById("resultadoNotaMultiples");
    
    if (pPendiente) pPendiente.value = "";
    if (nObj) nObj.value = "";
    if (res) res.innerText = "🎓 Necesitas: 0.00";
  },

  // ESTUDIOS: Media Ponderada
  agregarFilaPonderada() {
    this.reproducirSonido();
    const cont = document.getElementById("contenedor-filas-ponderada");
    if (!cont) return;
    const div = document.createElement("div");
    div.className = "fila-dinamica";
    div.innerHTML = `
      <input type="number" class="p-nota" placeholder="Nota (0-10)" step="0.1" min="0" max="10">
      <input type="number" class="p-peso" placeholder="Peso %" min="0" max="100">
    `;
    cont.appendChild(div);
  },

  calcularMediaPonderada() {
    this.reproDC = this.reproducirSonido();
    this.reproducirSonido();
    const notas = document.querySelectorAll(".p-nota");
    const pesos = document.querySelectorAll(".p-peso");
    const display = document.getElementById("resultadoPonderada");
    if (!display) return;

    let sumaProductos = 0;
    let sumaPesos = 0;

    for (let i = 0; i < notas.length; i++) {
      const n = parseFloat(notas[i].value);
      const p = parseFloat(pesos[i].value);

      if (!isNaN(n) && !isNaN(p)) {
        sumaProductos += n * p;
        sumaPesos += p;
      }
    }

    if (sumaPesos === 0) {
      display.innerText = "⚠️ Introduce datos";
      return;
    }

    const media = (sumaProductos / sumaPesos).toFixed(2);
    display.innerText = `📊 Media: ${media}`;
    this.actualizarHistorial("historial-ponderada", `Media actual: ${media}`);
  },

  limpiarMediaPonderada() {
    this.reproducirSonido();
    document.querySelectorAll(".p-nota, .p-peso").forEach(i => i.value = "");
    const disp = document.getElementById("resultadoPonderada");
    if (disp) disp.innerText = "0.00";
  },

  // FINANZAS: Descuentos
  calcularDescuento() {
    this.reproducirSonido();
    const cant = parseFloat(document.getElementById("cantidad").value);
    const porc = parseFloat(document.getElementById("porcentaje").value);
    const display = document.getElementById("resultado");
    if (!display) return;

    if (isNaN(cant) || isNaN(porc)) {
      display.innerText = "⚠️ Datos incompletos";
      return;
    }

    const total = (cant - (cant * (porc / 100))).toFixed(2);
    display.innerText = `🏷️ Total: ${total} €`;
    this.actualizarHistorial("historial-descuentos", `${cant}€ (-${porc}%): ${total}€`);
  },

  limpiarDescuento() {
    this.reproducirSonido();
    const cant = document.getElementById("cantidad");
    const porc = document.getElementById("porcentaje");
    const res = document.getElementById("resultado");
    if (cant) cant.value = "";
    if (porc) porc.value = "";
    if (res) res.innerText = "0.00 €";
  },

  // FINANZAS: IVA
  calcularIVA() {
    this.reproducirSonido();
    const modo = document.getElementById("modoIva").value;
    const importe = parseFloat(document.getElementById("importeIva").value);
    const tipo = parseFloat(document.getElementById("porcentajeIva").value);
    const display = document.getElementById("resultadoIva");
    if (!display) return;

    if (isNaN(importe)) {
      display.innerText = "⚠️ Pon un importe";
      return;
    }

    if (modo === "añadir") {
      const total = (importe + (importe * (tipo / 100))).toFixed(2);
      display.innerText = `💶 Total +IVA: ${total} €`;
      this.actualizarHistorial("historial-iva", `+${tipo}% IVA a ${importe}€: ${total}€`);
    } else {
      const base = (importe / (1 + (tipo / 100))).toFixed(2);
      display.innerText = `📄 Base Sin IVA: ${base} €`;
      this.actualizarHistorial("historial-iva", `-${tipo}% IVA de ${importe}€: ${base}€`);
    }
  },

  limpiarIVA() {
    this.reproducirSonido();
    const imp = document.getElementById("importeIva");
    const res = document.getElementById("resultadoIva");
    if (imp) imp.value = "";
    if (res) res.innerText = "0.00 €";
  },

  // FINANZAS: Sueldo Neto Express
  calcularSueldo() {
    this.reproducirSonido();
    const bruto = parseFloat(document.getElementById("brutoAnual").value);
    const pagas = parseInt(document.getElementById("numPagas").value);
    const display = document.getElementById("resultadoSueldo");
    if (!display) return;

    if (isNaN(bruto) || bruto <= 0) {
      display.innerText = "⚠️ Ingresa bruto anual";
      return;
    }

    let irpf = 0.12;
    if (bruto > 20000) irpf = 0.15;
    if (bruto > 35000) irpf = 0.20;

    const retencionTotal = irpf + 0.0635;
    const netoAnual = bruto * (1 - retencionTotal);
    const netoMensual = (netoAnual / pagas).toFixed(2);

    display.innerText = `💵 ~${netoMensual} € / mes`;
    this.actualizarHistorial("historial-sueldo", `${bruto}€ (${pagas}p): ~${netoMensual}€/mes`);
  },

  limpiarSueldo() {
    this.reproducirSonido();
    const bruto = document.getElementById("brutoAnual");
    const res = document.getElementById("resultadoSueldo");
    if (bruto) bruto.value = "";
    if (res) res.innerText = "0.00 €";
  }
};

// Navegación Global
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

  boton.classList.add("activa");
  document.getElementById(`subtab-${hub}-${subtab}`).classList.add("activa");
}
