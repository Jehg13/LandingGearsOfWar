import { threats } from "../data/threats";
import { weapons } from "../data/weapons";

type CatalogKind = "weapons" | "threats";
type CatalogRecord = (typeof weapons)[number] | (typeof threats)[number];

const data: Record<CatalogKind, CatalogRecord[]> = { weapons, threats };

const normalize = (value: string) =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase();

const updateCatalogOrientation = () => {
  const mobileHardware =
    /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
    ((navigator.maxTouchPoints > 0 || window.matchMedia("(pointer: coarse)").matches) &&
      window.screen.width <= 1024);
  const portrait =
    window.innerWidth <= 760 && window.innerHeight > window.innerWidth * 1.08;
  const landscape =
    window.innerWidth > window.innerHeight &&
    window.innerHeight <= 600 &&
    window.innerWidth <= 1024;

  document.querySelectorAll<HTMLElement>(".catalog-section").forEach((section) => {
    const notice = section.querySelector<HTMLElement>("[data-orientation-notice]");
    if (notice) notice.hidden = !(mobileHardware && portrait);
    section.dataset.mobileLandscape = String(mobileHardware && landscape);
  });
};

let orientationFrame = 0;
const scheduleCatalogOrientationUpdate = () => {
  if (orientationFrame) return;
  orientationFrame = window.requestAnimationFrame(() => {
    orientationFrame = 0;
    updateCatalogOrientation();
  });
};

window.addEventListener("resize", scheduleCatalogOrientationUpdate, { passive: true });
window.addEventListener("orientationchange", scheduleCatalogOrientationUpdate, { passive: true });
updateCatalogOrientation();

const initializeCatalog = (root: HTMLElement, kind: CatalogKind) => {
  const records = data[kind];
  const items = new Map(
    records.map((record) => [
      record.id,
      root.querySelector<HTMLButtonElement>(`[data-catalog-item="${record.id}"]`),
    ]),
  );
  const entries = [...root.querySelectorAll<HTMLElement>("[data-catalog-entry]")];
  const filters = [...root.querySelectorAll<HTMLButtonElement>("[data-catalog-filter]")];
  const search = root.querySelector<HTMLInputElement>("[data-catalog-search]");
  const image = root.querySelector<HTMLImageElement>(".catalog-image");
  const visual = root.querySelector<HTMLElement>("[data-catalog-visual]");
  const placeholder = root.querySelector<HTMLElement>("[data-visual-placeholder]");
  const placeholderLabel = root.querySelector<HTMLElement>("[data-placeholder-label]");
  const caption = root.querySelector<HTMLElement>("[data-image-caption]");
  const status = root.querySelector<HTMLElement>("[data-visual-status]");
  const emptyState = root.querySelector<HTMLElement>("[data-empty-state]");
  const fields = new Map(
    [...root.querySelectorAll<HTMLElement>("[data-field]")].map((field) => [
      field.dataset.field ?? "",
      field,
    ]),
  );
  const previous = root.querySelector<HTMLButtonElement>("[data-previous]");
  const next = root.querySelector<HTMLButtonElement>("[data-next]");

  if (
    !image ||
    !visual ||
    !placeholder ||
    !placeholderLabel ||
    !caption ||
    !status ||
    !emptyState ||
    !previous ||
    !next
  ) {
    throw new Error(`La interfaz del catálogo "${kind}" está incompleta.`);
  }

  let selectedId = records[0]?.id ?? "";
  let activeFilter = "all";

  const visibleRecords = () => {
    const query = normalize(search?.value.trim() ?? "");
    return records.filter((record) => {
      const matchesFilter =
        activeFilter === "all" || record.filters.includes(activeFilter);
      const matchesQuery =
        !query ||
        normalize(
          `${record.name} ${record.categoryLabel} ${"aliases" in record ? record.aliases?.join(" ") : ""}`,
        ).includes(query);
      return matchesFilter && matchesQuery;
    });
  };

  const updateSelection = (record: CatalogRecord) => {
    selectedId = record.id;
    items.forEach((button, id) => {
      button?.setAttribute("aria-pressed", String(id === record.id));
    });

    fields.forEach((field, key) => {
      const value = Reflect.get(record, key);
      if (typeof value === "string") {
        field.textContent = value;
      }
    });

    const note = "note" in record ? record.note : undefined;
    if (note) {
      const noteField = fields.get("note");
      if (noteField) {
        noteField.textContent = note;
        noteField.hidden = false;
      }
    } else {
      const note = fields.get("note");
      if (note) note.hidden = true;
    }

    image.hidden = true;
    image.onload = null;
    image.onerror = null;
    image.removeAttribute("src");
    image.alt = record.imageAlt ?? "";
    visual.dataset.hasImage = "false";
    placeholder.hidden = false;
    placeholderLabel.textContent = `ARCHIVO VISUAL PENDIENTE // ${record.name.toLocaleUpperCase()}`;

    if (record.image) {
      image.onload = () => {
        if (selectedId !== record.id) return;
        image.hidden = false;
        visual.dataset.hasImage = "true";
        placeholder.hidden = true;
        caption.textContent =
          "imageCaption" in record && record.imageCaption
            ? record.imageCaption
            : "IMAGEN DE REFERENCIA // GEARS OF WAR";
        status.textContent = "RECURSO CARGADO";
      };
      image.onerror = () => {
        if (selectedId !== record.id) return;
        image.hidden = true;
        visual.dataset.hasImage = "false";
        placeholder.hidden = false;
        caption.textContent = "ARCHIVO VISUAL PENDIENTE // ERROR DE CARGA";
        status.textContent = "IMAGEN NO DISPONIBLE";
        console.error(`No se pudo cargar la imagen del catálogo: ${record.image}`);
      };
      image.src = record.image;
    } else {
      image.onload = null;
      image.onerror = null;
      visual.dataset.hasImage = "false";
      placeholder.hidden = false;
      caption.textContent = "ARCHIVO VISUAL PENDIENTE // SIN IMAGEN ASIGNADA";
      status.textContent = "SIN IMAGEN ASIGNADA";
    }
  };

  const updateVisibleRecords = () => {
    const visible = visibleRecords();
    const visibleIds = new Set(visible.map((record) => record.id));

    entries.forEach((entry) => {
      const id = entry.querySelector<HTMLButtonElement>("[data-catalog-item]")?.dataset.catalogItem;
      entry.hidden = !id || !visibleIds.has(id);
    });

    emptyState.hidden = visible.length > 0;
    previous.disabled = visible.length < 2;
    next.disabled = visible.length < 2;
    if (visible.length > 0 && !visibleIds.has(selectedId)) {
      const first = visible[0];
      updateSelection(first);
    }
  };

  const moveSelection = (step: number, focus = false) => {
    const visible = visibleRecords();
    if (visible.length === 0) return;
    const currentIndex = visible.findIndex((record) => record.id === selectedId);
    const nextIndex = (currentIndex + step + visible.length) % visible.length;
    const record = visible[nextIndex];
    updateSelection(record);
    if (focus) items.get(record.id)?.focus();
  };

  filters.forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.catalogFilter ?? "all";
      filters.forEach((filter) =>
        filter.setAttribute(
          "aria-pressed",
          String(filter === button),
        ),
      );
      updateVisibleRecords();
    });
  });

  entries.forEach((entry) => {
    const button = entry.querySelector<HTMLButtonElement>("[data-catalog-item]");
    if (!button) return;

    button.addEventListener("click", () => {
      const record = records.find((candidate) => candidate.id === button.dataset.catalogItem);
      if (record) updateSelection(record);
    });

    button.addEventListener("keydown", (event) => {
      if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault();
      moveSelection(event.key === "ArrowUp" || event.key === "ArrowLeft" ? -1 : 1, true);
    });
  });

  search?.addEventListener("input", updateVisibleRecords);
  previous.addEventListener("click", () => moveSelection(-1));
  next.addEventListener("click", () => moveSelection(1));

  updateSelection(records[0]);
  updateVisibleRecords();
};

document.querySelectorAll<HTMLElement>("[data-catalog-root]").forEach((root) => {
  const kind = root.dataset.catalogRoot;
  if (kind !== "weapons" && kind !== "threats") {
    console.error(`Tipo de catálogo no reconocido: ${kind ?? "(vacío)"}`);
    return;
  }

  try {
    initializeCatalog(root, kind);
  } catch (error) {
    console.error(`No se pudo iniciar el catálogo "${kind}".`, error);
  }
});
