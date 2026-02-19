/* global hljs, Mark */

const sections = [
  {
    id: "ecmascript",
    title: "ECMAScript",
    root: "1-ECMAScript",
    description: "Language fundamentals, syntax, and advanced patterns.",
    intro: [
      "Start here for the core language: syntax, types, objects, and modern features.",
      "Each chapter builds toward real-world patterns and performance-minded code."
    ],
    files: [
      "01-Language-Fundamentals.md",
      "02-Control-Flow.md",
      "03-Functions.md",
      "04-Objects.md",
      "05-Prototype.md",
      "06-Classes.md",
      "07-Arrays.md",
      "08-Strings.md",
      "09-RegExp.md",
      "10-Symbols.md",
      "11-Iterators-and-Generators.md",
      "12-Collections.md",
      "13-Async-JavaScript.md",
      "14-Modules.md",
      "15-Proxy-and-Reflection.md",
      "16-Meta-Programming.md",
      "17-Memory-Management.md",
      "18-Internationalization.md",
      "19-Atomics-and-SharedArrayBuffer.md",
      "20-Temporal-API-S3.md",
      "21-Decorators-S3.md",
      "22-Design-Patterns.md",
      "23-Performance-Optimization.md",
      "24-Security-Best-Practices.md",
      "25-Other-Proposals-and-Future-Features.md"
    ]
  },
  {
    id: "browser",
    title: "Browser JS",
    root: "2-BrowserJS",
    description: "DOM, events, and modern browser APIs.",
    intro: [
      "Everything that runs in the browser, from DOM foundations to modern APIs.",
      "Work through chapters in order or jump to a specific API when you need it."
    ],
    files: [
      "01-DOM.md",
      "02-BOM.md",
      "03-Events.md",
      "04-Forms.md",
      "05-Storage-APIs.md",
      "06-Fetch-and-AJAX.md",
      "07-Multimedia-APIs.md",
      "08-Graphics-and-Visualization.md",
      "09-Web-Workers.md",
      "10-Progressive-Web-Apps.md",
      "11-Notifications-and-Messaging.md",
      "12-Device-APIs.md",
      "13-Sensor-APIs.md",
      "14-Connectivity-APIs.md",
      "15-File-APIs.md",
      "16-Clipboard-API.md",
      "17-Payment-APIs.md",
      "18-Credential-Management-API.md",
      "19-Permissions-API.md",
      "20-Web-Share-API.md",
      "21-Contact-Picker-API.md",
      "22-Screen-Wake-Lock-API.md",
      "23-Idle-Detection-API.md",
      "24-Web-Serial-API.md",
      "25-Web-USB-API.md",
      "26-Web-Bluetooth-API.md",
      "27-Web-NFC-API.md",
      "28-Web-MIDI-API.md",
      "29-Gamepad-API.md",
      "30-Screen-Orientation-API.md",
      "31-Fullscreen-API.md",
      "32-Pointer-Lock-API.md",
      "33-Page-Visibility-API.md",
      "34-Intersection-Observer-API.md",
      "35-Mutation-Observer-API.md",
      "36-Resize-Observer-API.md",
      "37-Performance-APIs.md",
      "38-Reporting-API.md",
      "39-Web-Speech-API.md",
      "40-Web-Components.md",
      "41-Encoding-API.md",
      "42-Compression-Streams-API.md",
      "43-Streams-API.md",
      "44-Web-Cryptography-API.md",
      "45-WebGL-API.md",
      "46-WebGPU-API.md",
      "47-WebXR-API.md",
      "48-Picture-in-Picture-API.md",
      "49-Document-Picture-in-Picture-API.md",
      "50-View-Transitions-API.md",
      "51-Popover-API.md",
      "52-Dialog-Element.md",
      "53-Content-Security-Policy-API.md",
      "54-Trusted-Types-API.md",
      "55-Feature-Policy-API.md",
      "56-Launch-Handler-API.md",
      "57-Window-Management-API.md",
      "58-Accessibility.md"
    ]
  },
  {
    id: "node",
    title: "Node.js",
    root: "3-NodeJS",
    description: "Core modules, runtime APIs, and Node tooling.",
    intro: [
      "Server-side JavaScript: core modules, runtime concepts, and tooling.",
      "Designed for quick lookup and deep dives into Node internals."
    ],
    files: [
      "01-Fundamentals.md",
      "02-Module-Systems.md",
      "03-File-System.md",
      "04-Path.md",
      "05-HTTP-and-HTTPS.md",
      "06-Events.md",
      "07-Streams.md",
      "08-Buffer.md",
      "09-URL-and-QueryString.md",
      "10-OS.md",
      "11-Crypto.md",
      "12-Child-Process.md",
      "13-Cluster.md",
      "14-Process.md",
      "15-Timers.md",
      "16-Utilities.md",
      "17-Net-and-DNS.md",
      "18-Readline.md",
      "19-Compression.md",
      "20-Advanced-Core-Modules.md",
      "21-Worker-Threads.md",
      "22-Test-Runner.md",
      "23-NPM-and-Package-Management.md",
      "24-Advanced-Concepts.md",
      "25-Ecosystem.md",
      "REFERENCE.md"
    ]
  },
  {
    id: "build",
    title: "Build Tools",
    root: "4-BuildTools-and-DevEnvironment",
    description: "Tooling and developer environment guides.",
    intro: [
      "Build systems, bundlers, and developer environment setup.",
      "Use this section to keep your toolchain consistent and fast."
    ],
    files: []
  },
  {
    id: "extensions",
    title: "Browser Extensions",
    root: "5-Browser-Extensions",
    description: "Extension APIs and workflows.",
    intro: [
      "Patterns and APIs for building browser extensions.",
      "Keep this section handy for permissions and manifest references."
    ],
    files: []
  },
  {
    id: "advanced",
    title: "Advanced Topics",
    root: "6-Advanced-Topics-and-Best-Practices",
    description: "Best practices and advanced patterns.",
    intro: [
      "Deep dives into architecture, security, and performance.",
      "Use these chapters when you want to refine production-grade code."
    ],
    files: []
  }
];

const doc = document.getElementById("doc");
const nav = document.getElementById("nav");
const breadcrumbs = document.getElementById("breadcrumbs");
const search = document.getElementById("nav-search");
const menuToggle = document.getElementById("menu-toggle");
const homeBtn = document.getElementById("home-btn");
const readingToggle = document.getElementById("reading-toggle");
const themeToggle = document.getElementById("theme-toggle");
const scrollTopBtn = document.getElementById("scroll-top");
const docSearch = document.getElementById("doc-search");
const toc = document.getElementById("toc");
const palette = document.getElementById("palette");
const paletteInput = document.getElementById("palette-input");
const paletteResults = document.getElementById("palette-results");
const topbar = document.querySelector(".topbar");
let currentSearchQuery = "";
const hero = document.getElementById("hero");
const sidebarOverlay = document.getElementById("sidebar-overlay");
const content = document.querySelector(".content");

const markdownWorker = "Worker" in window ? new Worker("/assets/markdown-worker.js") : null;
let workerRequestId = 0;
const workerCallbacks = new Map();
const renderCache = new Map();
const marker = window.Mark ? new Mark(doc) : null;
const markdownCacheKey = (path) => `js-guide-md:${path}`;
const READING_KEY = "js-guide-reading";
const MD_INDEX_KEY = "js-guide-md-index";
const MD_CACHE_LIMIT = 20;

if (markdownWorker) {
  markdownWorker.onmessage = (event) => {
    const { id, html } = event.data || {};
    const callback = workerCallbacks.get(id);
    if (callback) {
      workerCallbacks.delete(id);
      callback(html);
    }
  };
}

function parseMarkdown(markdown) {
  if (!markdownWorker) {
    return Promise.resolve(transformHighlights(markdown)).then((processed) => {
      return window.marked ? window.marked.parse(processed) : processed;
    });
  }
  return new Promise((resolve) => {
    const id = ++workerRequestId;
    workerCallbacks.set(id, resolve);
    markdownWorker.postMessage({ id, markdown });
  });
}

function titleFromFilename(filename) {
  return filename
    .replace(/^[0-9]+-/, "")
    .replace(/-S[0-9]+/g, "")
    .replace(/\\.md$/i, "")
    .replace(/-/g, " ");
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\\s-]/g, "")
    .trim()
    .replace(/\\s+/g, "-");
}

function buildToc() {
  if (!toc) return;
  const headings = Array.from(doc.querySelectorAll("h2, h3"));
  if (headings.length < 3) {
    toc.classList.remove("is-visible");
    toc.innerHTML = "";
    return;
  }
  const used = new Map();
  headings.forEach((heading) => {
    if (!heading.id) {
      let base = slugify(heading.textContent || "section");
      const count = (used.get(base) || 0) + 1;
      used.set(base, count);
      if (count > 1) base = `${base}-${count}`;
      heading.id = base;
    }
  });
  const items = headings
    .map((heading) => {
      const level = heading.tagName.toLowerCase();
      return `<li><a class="toc-link ${level === "h3" ? "toc-h3" : "toc-h2"}" href="javascript:void(0)" data-target="${heading.id}">${heading.textContent}</a></li>`;
    })
    .join("");
  toc.innerHTML = `<div class="toc-title">On this page</div><ul>${items}</ul>`;
  toc.classList.add("is-visible");
}

function wrapTables() {
  doc.querySelectorAll("table").forEach((table) => {
    if (table.parentElement?.classList.contains("table-wrap")) return;
    const wrapper = document.createElement("div");
    wrapper.className = "table-wrap";
    table.parentNode.insertBefore(wrapper, table);
    wrapper.appendChild(table);
  });
}

function enhanceHeadings() {
  const headings = doc.querySelectorAll("h2, h3");
  headings.forEach((heading) => {
    if (heading.querySelector(".heading-anchor")) return;
    const button = document.createElement("button");
    button.className = "heading-anchor";
    button.setAttribute("aria-label", "Copy link to heading");
    button.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M10 14a3 3 0 0 1 0-4l2-2a3 3 0 0 1 4.24 4.24l-1 1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <path d="M14 10a3 3 0 0 1 0 4l-2 2a3 3 0 1 1-4.24-4.24l1-1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `;
    button.addEventListener("click", async () => {
      const url = new URL(window.location.href);
      url.searchParams.set("heading", heading.id);
      const text = url.toString();
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const temp = document.createElement("input");
        temp.value = text;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand("copy");
        temp.remove();
      }
      button.classList.add("copied");
      setTimeout(() => button.classList.remove("copied"), 1200);
    });
    heading.prepend(button);
  });
}

function scrollToHeadingFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const targetId = params.get("heading");
  if (!targetId) return;
  const target = document.getElementById(targetId);
  if (target) {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function updateHeadingParam(targetId) {
  const url = new URL(window.location.href);
  if (targetId) {
    url.searchParams.set("heading", targetId);
  } else {
    url.searchParams.delete("heading");
  }
  history.replaceState(null, "", url.toString());
}

function touchMarkdownCache(path, markdown) {
  if (!path || markdown == null) return;
  let index = [];
  try {
    index = JSON.parse(localStorage.getItem(MD_INDEX_KEY) || "[]");
  } catch {}
  index = index.filter((item) => item !== path);
  index.unshift(path);
  if (index.length > MD_CACHE_LIMIT) {
    const removed = index.splice(MD_CACHE_LIMIT);
    removed.forEach((item) => {
      try {
        localStorage.removeItem(markdownCacheKey(item));
      } catch {}
    });
  }
  try {
    localStorage.setItem(MD_INDEX_KEY, JSON.stringify(index));
  } catch {}
  try {
    localStorage.setItem(markdownCacheKey(path), markdown);
  } catch {}
}

function renderHomeNav(filterText = "") {
  nav.innerHTML = "";
  const label = document.createElement("div");
  label.className = "nav-section";
  label.textContent = "Sections";
  nav.appendChild(label);

  sections.forEach((section) => {
    if (filterText && !section.title.toLowerCase().includes(filterText)) return;
    const link = document.createElement("a");
    link.href = `#${section.id}`;
    link.dataset.sectionId = section.id;
    link.textContent = section.title;
    nav.appendChild(link);
  });
}

function renderSectionNav(section, filterText = "") {
  nav.innerHTML = "";
  if (window.innerWidth <= 960) {
    const mobileHeader = document.createElement("div");
    mobileHeader.className = "nav-mobile-header";
    mobileHeader.textContent = section.title;
    nav.appendChild(mobileHeader);
  }
  const label = document.createElement("div");
  label.className = "nav-section";
  label.textContent = section.title;
  nav.appendChild(label);

  if (!section.files.length) {
    const empty = document.createElement("div");
    empty.className = "nav-section";
    empty.textContent = "No content yet";
    nav.appendChild(empty);
    return;
  }

  section.files.forEach((file) => {
    const title = titleFromFilename(file);
    if (filterText && !title.toLowerCase().includes(filterText)) return;
    const link = document.createElement("a");
    link.href = `#${section.id}/${encodeURIComponent(file)}`;
    link.dataset.fileId = file;
    link.textContent = title;
    nav.appendChild(link);
  });
}

function setActiveNav(state) {
  nav.querySelectorAll("a").forEach((link) => {
    const isActive = state.mode === "home"
      ? link.dataset.sectionId === state.sectionId
      : link.dataset.fileId === state.file;
    link.classList.toggle("active", isActive);
  });
}

function closeSidebarOnMobile() {
  const sidebar = document.querySelector(".sidebar");
  if (window.innerWidth <= 960) {
    sidebar.classList.remove("open");
    if (sidebarOverlay) sidebarOverlay.classList.remove("open");
  }
}

function transformHighlights(markdown) {
  return markdown.replace(/==([^=\n]+)==/g, "<mark>$1</mark>");
}

function transformCallouts(container) {
  const blocks = Array.from(container.querySelectorAll("blockquote"));
  blocks.forEach((blockquote) => {
    const firstParagraph = blockquote.querySelector("p");
    if (!firstParagraph) return;
    const text = firstParagraph.textContent || "";
    const match = text.match(/^\s*\[!([A-Za-z0-9_-]+)\]\s*(.*)$/);
    if (!match) return;

    const type = match[1].toLowerCase();
    const title = match[2] || type;

    firstParagraph.textContent = text.replace(match[0], "").trim();
    if (!firstParagraph.textContent) {
      firstParagraph.remove();
    }

    const wrapper = document.createElement("div");
    wrapper.className = `callout callout-${type}`;

    const header = document.createElement("div");
    header.className = "callout-title";
    header.textContent = title.toUpperCase();

    const body = document.createElement("div");
    body.className = "callout-body";
    while (blockquote.firstChild) {
      body.appendChild(blockquote.firstChild);
    }

    wrapper.appendChild(header);
    wrapper.appendChild(body);
    blockquote.replaceWith(wrapper);
  });
}

function highlightCode(container) {
  if (!window.hljs) return;
  container.querySelectorAll("pre code").forEach((block) => {
    window.hljs.highlightElement(block);
  });
}

function parseStateFromHash() {
  const hash = window.location.hash.replace("#", "").trim();
  if (!hash || hash === "home") {
    return { mode: "home", sectionId: null, file: null };
  }
  const [sectionId, file] = hash.split("/");
  const decoded = file ? decodeURIComponent(file) : null;
  return { mode: "section", sectionId, file: decoded };
}

function resolveSection(sectionId) {
  return sections.find((section) => section.id === sectionId);
}

function resolvePath(path) {
  const base = `${window.location.origin}/`;
  return new URL(path, base).toString();
}

async function loadContent(state) {
  let path = "README.md";
  let breadcrumb = "Home";
  let title = "JavaScript Guide";
  let sectionLanding = null;

  if (state.mode === "section") {
    const section = resolveSection(state.sectionId);
    if (!section) {
      window.location.hash = "home";
      return;
    }
    if (!state.file) {
      sectionLanding = section;
      breadcrumb = section.title;
      title = `${section.title} · JavaScript Guide`;
    } else {
      const targetFile = state.file;
      path = section.files.length ? `${section.root}/${targetFile}` : "README.md";
      const fileTitle = targetFile ? titleFromFilename(targetFile) : "Overview";
      breadcrumb = `${section.title}${targetFile ? ` / ${fileTitle}` : ""}`;
      title = `${section.title} · JavaScript Guide`;
    }
  }

  breadcrumbs.textContent = breadcrumb;
  document.title = title;

  if (window.currentDocController) {
    window.currentDocController.abort();
  }
  const controller = new AbortController();
  window.currentDocController = controller;

  document.body.classList.add("is-busy");
  doc.classList.add("is-loading", "fade-in");
  doc.classList.remove("is-ready");
  window.scrollTo({ top: 0, behavior: "auto" });
  try {
    if (sectionLanding) {
      const list = sectionLanding.files
        .map((file) => {
          const label = titleFromFilename(file);
          return `<li><a href="#${sectionLanding.id}/${encodeURIComponent(file)}">${label}</a></li>`;
        })
        .join("");
      const intro = (sectionLanding.intro || [])
        .map((sentence) => `<p>${sentence}</p>`)
        .join("");
      doc.innerHTML = `
        <h1>${sectionLanding.title}</h1>
        <p>${sectionLanding.description}</p>
        ${intro}
        <h2>Chapters</h2>
        <ul>${list}</ul>
      `;
      buildToc();
      wrapTables();
      enhanceHeadings();
      requestAnimationFrame(() => {
        doc.classList.add("is-ready");
      });
      document.body.classList.remove("is-busy");
      doc.classList.remove("is-loading");
      return;
    }
    if (renderCache.has(path)) {
      const cached = renderCache.get(path);
      doc.innerHTML = cached;
      if (currentSearchQuery) {
        applySearch(currentSearchQuery);
      }
      transformCallouts(doc);
      buildToc();
      wrapTables();
      enhanceHeadings();
      scrollToHeadingFromQuery();
      requestAnimationFrame(() => {
        doc.classList.add("is-ready");
      });
      document.body.classList.remove("is-busy");
      doc.classList.remove("is-loading");
      window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }

    let markdown = localStorage.getItem(markdownCacheKey(path));
    if (!markdown) {
      const response = await fetch(resolvePath(path), { signal: controller.signal });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      markdown = await response.text();
      touchMarkdownCache(path, markdown);
    } else {
      touchMarkdownCache(path, markdown);
    }
    const render = async () => {
      if (controller.signal.aborted) return;
      const html = await parseMarkdown(markdown);
      if (controller.signal.aborted) return;
      doc.innerHTML = html;
      renderCache.set(path, html);
      if (currentSearchQuery) {
        applySearch(currentSearchQuery);
      }
      transformCallouts(doc);
      buildToc();
      wrapTables();
      enhanceHeadings();
      scrollToHeadingFromQuery();
      if (state.mode === "section") {
        const section = resolveSection(state.sectionId);
        if (section && state.file) {
          const idx = section.files.indexOf(state.file);
          if (idx !== -1) {
            const nav = document.createElement("div");
            nav.className = "doc-nav";
            const prevFile = section.files[idx - 1];
            const nextFile = section.files[idx + 1];
            nav.innerHTML = `
              <a class="doc-nav-link ${prevFile ? "" : "disabled"}" href="${prevFile ? `#${section.id}/${encodeURIComponent(prevFile)}` : "#"}">
                <span>Previous</span>
                <strong>${prevFile ? titleFromFilename(prevFile) : "Start"}</strong>
              </a>
              <a class="doc-nav-link ${nextFile ? "" : "disabled"}" href="${nextFile ? `#${section.id}/${encodeURIComponent(nextFile)}` : "#"}">
                <span>Next</span>
                <strong>${nextFile ? titleFromFilename(nextFile) : "End"}</strong>
              </a>
            `;
            doc.appendChild(nav);
          }
        }
      }
      requestAnimationFrame(() => {
        doc.classList.add("is-ready");
      });

      const runHighlight = () => {
        if (controller.signal.aborted) return;
        if (doc.querySelector("pre code")) {
          highlightCode(doc);
        }
      };

      if ("requestIdleCallback" in window) {
        window.requestIdleCallback(runHighlight, { timeout: 600 });
      } else {
        setTimeout(runHighlight, 0);
      }
    };

    setTimeout(() => {
      if ("requestIdleCallback" in window) {
        window.requestIdleCallback(render, { timeout: 600 });
      } else {
        setTimeout(render, 0);
      }
    }, 0);
  } catch (error) {
    if (controller.signal.aborted) return;
    doc.innerHTML = `
      <h2>Unable to load content</h2>
      <p>Could not fetch <strong>${path}</strong>. ${error?.message || ""}</p>
      <pre><code>python -m http.server</code></pre>
    `;
  } finally {
    if (!controller.signal.aborted) {
      document.body.classList.remove("is-busy");
      doc.classList.remove("is-loading");
    }
  }
}

function setTheme(mode) {
  const root = document.documentElement;
  root.dataset.theme = mode;
  localStorage.setItem("js-guide-theme", mode);
  const lightCss = document.getElementById("hljs-light");
  const darkCss = document.getElementById("hljs-dark");
  if (lightCss && darkCss) {
    lightCss.disabled = mode === "dark";
    darkCss.disabled = mode !== "dark";
  }
  if (themeToggle) {
    const icon = themeToggle.querySelector("i");
    if (icon) {
      icon.className = mode === "dark" ? "fa-solid fa-sun" : "fa-solid fa-moon";
    }
    themeToggle.setAttribute("title", mode === "dark" ? "Switch to light" : "Switch to dark");
    themeToggle.setAttribute("aria-label", mode === "dark" ? "Switch to light" : "Switch to dark");
  }
}

function setCodeWrap(enabled) {
  document.body.classList.toggle("wrap-code", enabled);
}

function initCodeWrap() {
  setCodeWrap(true);
}

function setReadingMode(enabled) {
  document.body.classList.toggle("reading-mode", enabled);
  localStorage.setItem(READING_KEY, enabled ? "1" : "0");
  if (readingToggle) {
    const icon = readingToggle.querySelector("i");
    if (icon) {
      icon.className = enabled ? "fa-solid fa-book-open-reader" : "fa-solid fa-book-open";
    }
    readingToggle.setAttribute("title", enabled ? "Exit reading mode" : "Reading mode");
    readingToggle.setAttribute("aria-label", enabled ? "Exit reading mode" : "Reading mode");
    readingToggle.classList.toggle("active", enabled);
  }
}

function initReadingMode() {
  const stored = localStorage.getItem(READING_KEY);
  if (stored) {
    setReadingMode(stored === "1");
  }
}

function initTheme() {
  const stored = localStorage.getItem("js-guide-theme");
  if (stored) {
    setTheme(stored);
    return;
  }
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  setTheme(prefersDark ? "dark" : "light");
}

function buildPaletteItems(filter = "") {
  if (!paletteResults) return;
  paletteResults.innerHTML = "";
  const term = filter.toLowerCase();
  const items = [];
  sections.forEach((section) => {
    items.push({
      label: section.title,
      meta: "Section",
      hash: `#${section.id}`
    });
    section.files.forEach((file) => {
      items.push({
        label: titleFromFilename(file),
        meta: section.title,
        hash: `#${section.id}/${encodeURIComponent(file)}`
      });
    });
  });

  const filtered = items.filter((item) => item.label.toLowerCase().includes(term) || item.meta.toLowerCase().includes(term));
  filtered.slice(0, 60).forEach((item, index) => {
    const row = document.createElement("div");
    row.className = `palette-item${index === 0 ? " active" : ""}`;
    row.dataset.hash = item.hash;
    row.innerHTML = `${item.label}<span>${item.meta}</span>`;
    paletteResults.appendChild(row);
  });
}

function openPalette() {
  if (!palette) return;
  palette.classList.add("open");
  palette.setAttribute("aria-hidden", "false");
  buildPaletteItems("");
  if (paletteInput) {
    paletteInput.value = "";
    paletteInput.focus();
  }
}

function closePalette() {
  if (!palette) return;
  palette.classList.remove("open");
  palette.setAttribute("aria-hidden", "true");
}

function renderNavigation(state, filterText = "") {
  if (state.mode === "home") {
    renderHomeNav(filterText);
  } else {
    const section = resolveSection(state.sectionId);
    if (!section) {
      renderHomeNav(filterText);
      return;
    }
    renderSectionNav(section, filterText);
  }
  setActiveNav(state);
}

function handleRouteChange() {
  const state = parseStateFromHash();
  if (hero) {
    hero.classList.toggle("is-hidden", state.mode !== "home");
  }
  renderNavigation(state, search.value.trim().toLowerCase());
  loadContent(state);
}

initTheme();
initCodeWrap();
initReadingMode();
handleRouteChange();

window.addEventListener("hashchange", handleRouteChange);

search.addEventListener("input", (event) => {
  const value = event.target.value.trim().toLowerCase();
  renderNavigation(parseStateFromHash(), value);
});

menuToggle.addEventListener("click", (event) => {
  event.stopPropagation();
  const sidebar = document.querySelector(".sidebar");
  sidebar.classList.toggle("open");
  if (sidebarOverlay) sidebarOverlay.classList.toggle("open", sidebar.classList.contains("open"));
});

nav.addEventListener("click", (event) => {
  const link = event.target.closest("a");
  if (link) closeSidebarOnMobile();
});

if (sidebarOverlay) {
  sidebarOverlay.addEventListener("click", () => closeSidebarOnMobile());
}

scrollTopBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

document.querySelectorAll("[data-open]").forEach((button) => {
  button.addEventListener("click", () => {
    window.location.hash = button.dataset.open;
  });
});

themeToggle.addEventListener("click", () => {
  const current = document.documentElement.dataset.theme;
  const next = current === "dark" ? "light" : "dark";
  setTheme(next);
});

if (readingToggle) {
  readingToggle.addEventListener("click", () => {
    const enabled = document.body.classList.contains("reading-mode");
    setReadingMode(!enabled);
  });
}

// Code wrapping is always on to prevent horizontal overflow.

homeBtn.addEventListener("click", () => {
  window.location.hash = "home";
});

if (content) {
  content.addEventListener("click", () => closeSidebarOnMobile());
}

document.querySelector(".sidebar")?.addEventListener("click", (event) => {
  event.stopPropagation();
});

document.body.classList.remove("loading-ui");

function clearSearchHighlights() {
  if (marker) {
    marker.unmark();
    return;
  }
  doc.querySelectorAll("mark[data-search]").forEach((el) => {
    const text = document.createTextNode(el.textContent || "");
    el.replaceWith(text);
  });
}

function applySearch(query) {
  clearSearchHighlights();
  if (!query) return;

  if (marker) {
    marker.mark(query, { separateWordSearch: false });
    return;
  }
}

if (docSearch) {
  let searchTimer;
  docSearch.addEventListener("input", () => {
    currentSearchQuery = docSearch.value.trim().toLowerCase();
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      applySearch(currentSearchQuery);
    }, 350);
  });
}

if (toc) {
  toc.addEventListener("click", (event) => {
    const link = event.target.closest(".toc-link");
    if (!link) return;
    event.preventDefault();
    const targetId = link.dataset.target;
    if (!targetId) return;
    const target = document.getElementById(targetId);
    if (target) {
      updateHeadingParam(targetId);
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
}

if (paletteInput) {
  paletteInput.addEventListener("input", () => {
    buildPaletteItems(paletteInput.value.trim());
  });
  paletteInput.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closePalette();
    }
    if (event.key === "Enter") {
      const active = paletteResults?.querySelector(".palette-item.active");
      if (active) {
        window.location.hash = active.dataset.hash;
        closePalette();
      }
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const items = Array.from(paletteResults?.querySelectorAll(".palette-item") || []);
      const current = paletteResults?.querySelector(".palette-item.active");
      let idx = items.indexOf(current);
      if (event.key === "ArrowDown") idx = Math.min(items.length - 1, idx + 1);
      if (event.key === "ArrowUp") idx = Math.max(0, idx - 1);
      items.forEach((item) => item.classList.remove("active"));
      if (items[idx]) {
        items[idx].classList.add("active");
        items[idx].scrollIntoView({ block: "nearest" });
      }
    }
  });
}

if (paletteResults) {
  paletteResults.addEventListener("click", (event) => {
    const item = event.target.closest(".palette-item");
    if (!item) return;
    window.location.hash = item.dataset.hash;
    closePalette();
  });
}

if (palette) {
  palette.addEventListener("click", (event) => {
    if (event.target === palette) closePalette();
  });
}

window.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    if (palette.classList.contains("open")) {
      closePalette();
    } else {
      openPalette();
    }
  }
  if (event.key === "Escape" && palette?.classList.contains("open")) {
    closePalette();
  }
});

if (topbar) {
  let lastY = window.scrollY;
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const currentY = window.scrollY;
      const delta = currentY - lastY;
      if (currentY < 50) {
        topbar.classList.remove("topbar-hidden");
      } else if (delta > 6) {
        topbar.classList.add("topbar-hidden");
      } else if (delta < -6) {
        topbar.classList.remove("topbar-hidden");
      }
      lastY = currentY;
      ticking = false;
    });
  });
}
