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

    // Si es el texto por defecto, lo limpiamos antes de añadir
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

  // ESTUDIOS: Nota Necesaria
  calcularNotaNecesaria() {
    this.reproducirSonido();
    const n1 = parseFloat(document.getElementById("nota1").value);
    const p1 = parseFloat(document.getElementById("peso1").value) / 100;
    const p2 = parseFloat(document.getElementById("peso2").value) / 100;
    const nObj = parseFloat(document.getElementById("notaObjetivo").value);
    const display = document.getElementById("resultadoNota");

    if (isNaN(n1) || isNaN(p1) || isNaN(p2) || isNaN(nObj) || p2 <= 0) {
      display.innerText = "⚠️ Revisa los datos";
      return;
    }

    const res = ((nObj - (n1 * p1)) / p2).toFixed(2);
    display.innerText = `🎓 Necesitas: ${res}`;
    this.actualizarHistorial("historial-necesaria", `Examen 2: necesitas un ${res}`);
  },

  limpiarNotaNecesaria() {
    this.reproducirSonido();
    ["nota1", "peso1", "peso2", "notaObjetivo"].forEach(id => document.getElementById(id).value = "");
    document.getElementById("resultadoNota").innerText = "0.00";
  },

  // ESTUDIOS: Media Ponderada
  agregarFilaPonderada() {
    this.reproducirSonido();
    const cont = document.getElementById("contenedor-filas-ponderada");
    const div = document.createElement("div");
    div.className = "fila-dinamica";
    div.innerHTML = `
      <input type="number" class="p-nota" placeholder="Nota (0-10)" step="0.1" min="0" max="10">
      <input type="number" class="p-peso" placeholder="Peso %" min="0" max="100">
    `;
    cont.appendChild(div);
  },

  calcularMediaPonderada() {
    this.reproducirSonido();
    const notas = document.querySelectorAll(".p-nota");
    const pesos = document.querySelectorAll(".p-peso");
    const display = document.getElementById("resultadoPonderada");

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
    document.getElementById("resultadoPonderada").innerText = "0.00";
  },

  // FINANZAS: Descuentos
  calcularDescuento() {
    this.reproducirSonido();
    const cant = parseFloat(document.getElementById("cantidad").value);
    const porc = parseFloat(document.getElementById("porcentaje").value);
    const display = document.getElementById("resultado");

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
    document.getElementById("cantidad").value = "";
    document.getElementById("porcentaje").value = "";
    document.getElementById("resultado").innerText = "0.00 €";
  },

  // FINANZAS: IVA
  calcularIVA() {
    this.reproducirSonido();
    const modo = document.getElementById("modoIva").value;
    const importe = parseFloat(document.getElementById("importeIva").value);
    const tipo = parseFloat(document.getElementById("porcentajeIva").value);
    const display = document.getElementById("resultadoIva");

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
    document.getElementById("importeIva").value = "";
    document.getElementById("resultadoIva").innerText = "0.00 €";
  },

  // FINANZAS: Sueldo Neto Express
  calcularSueldo() {
    this.reproducirSonido();
    const bruto = parseFloat(document.getElementById("brutoAnual").value);
    const pagas = parseInt(document.getElementById("numPagas").value);
    const display = document.getElementById("resultadoSueldo");

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
    document.getElementById("brutoAnual").value = "";
    document.getElementById("resultadoSueldo").innerText = "0.00 €";
  }
};

// Navegación Global
function mostrarPantalla(nombre) { AppCalculadora.navegarA(nombre); }

function cambiarTab(hub, subtab, boton) {
  AppCalculadora.reproducirSonido();
  const parent = document.getElementById(`pantalla-${hub}`);
  parent.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("activa"));
  parent.querySelectorAll(".subtab-contenido").forEach(s => s.classList.remove("activa"));

  boton.classList.add("activa");
  document.getElementById(`subtab-${hub}-${subtab}`).classList.add("activa");
}