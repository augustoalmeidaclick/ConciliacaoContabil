const form = document.getElementById("uploadForm");
const input = document.getElementById("file");
const fileName = document.getElementById("fileName");
const dropzone = document.querySelector(".dropzone");
const btnSubmit = document.getElementById("btnSubmit");

const MAX_BYTES = 50 * 1024 * 1024; // 50MB
const XLSX_MIME =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

// ---------- Utilidades ----------
const formatBytes = (b) => {
  if (b === 0) return "0 B";
  const k = 1024,
    sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(b) / Math.log(k));
  return `${(b / Math.pow(k, i)).toFixed(i ? 1 : 0)} ${sizes[i]}`;
};

function setError(msg) {
  dropzone.classList.add("is-invalid");
  fileName.textContent = msg;
  fileName.setAttribute("role", "alert");
  fileName.setAttribute("aria-live", "assertive");
  input.setCustomValidity(msg); // integra com validação nativa
}

function clearError() {
  dropzone.classList.remove("is-invalid");
  fileName.removeAttribute("role");
  fileName.setAttribute("aria-live", "polite");
  input.setCustomValidity("");
}

function updateFileUI(f) {
  if (f) {
    fileName.textContent = `${f.name} • ${formatBytes(f.size)}`;
  } else {
    fileName.textContent = "Nenhum arquivo selecionado";
  }
}

// Valida o arquivo atual do input, retorna true/false
function validateCurrentFile(showErrors = true) {
  const f = input.files?.[0];

  if (!f) {
    if (showErrors) setError("Selecione um arquivo .xlsx antes de enviar.");
    return false;
  }

  const isXlsx = f.type === XLSX_MIME || f.name.toLowerCase().endsWith(".xlsx");
  if (!isXlsx) {
    if (showErrors) setError("Formato inválido. Envie um arquivo .xlsx.");
    return false;
  }

  if (f.size > MAX_BYTES) {
    if (showErrors)
      setError(
        `Arquivo muito grande (${formatBytes(
          f.size
        )}). Máximo permitido: ${formatBytes(MAX_BYTES)}.`
      );
    return false;
  }

  // OK
  clearError();
  return true;
}

// ---------- Eventos ----------

// Reset
form.addEventListener("reset", () => {
  setTimeout(() => {
    input.value = "";
    clearError();
    updateFileUI(null);
  }, 0);
});

// Mudança no input (valida imediatamente)
input.addEventListener("change", () => {
  const f = input.files?.[0] || null;
  updateFileUI(f);
  // valida e mostra erro se houver
  if (!validateCurrentFile(true)) {
    // se inválido, limpa o input para evitar envio acidental
    input.value = "";
  }
});

// Estilo de arrastar/soltar (apenas visual; o input cobre a área)
let dragCounter = 0;

["dragenter", "dragover"].forEach((evt) =>
  dropzone.addEventListener(evt, (e) => {
    e.preventDefault();
    dragCounter++;
    dropzone.classList.add("is-dragover");
  })
);

["dragleave", "drop"].forEach((evt) =>
  dropzone.addEventListener(evt, (e) => {
    e.preventDefault();
    dragCounter = Math.max(0, dragCounter - 1);
    if (dragCounter === 0) dropzone.classList.remove("is-dragover");
  })
);

// Submit com proteção
form.addEventListener("submit", (e) => {
  // checa novamente no envio
  if (!validateCurrentFile(true)) {
    e.preventDefault();
    input.focus();
    return;
  }

  // trava o botão enquanto envia
  btnSubmit.disabled = true;
  const original = btnSubmit.textContent;
  btnSubmit.textContent = "Enviando…";

  // fallback de restauração se algo impedir navegação
  setTimeout(() => {
    if (document.visibilityState === "visible") {
      btnSubmit.disabled = false;
      btnSubmit.textContent = original;
    }
  }, 10000);
});

// --------- Garantias adicionais ---------
// Reforça o "um arquivo por vez" no input (caso alguém altere o HTML sem querer)
if (input.hasAttribute("multiple")) input.removeAttribute("multiple");

// Garante a lista de MIME/extensão aceita (caso o HTML mude)
input.setAttribute(
  "accept",
  ".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
);
