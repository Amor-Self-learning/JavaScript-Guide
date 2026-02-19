/* global marked, hljs */

const sections = [
  {
    id: "ecmascript",
    title: "ECMAScript",
    root: "1-ECMAScript",
    description: "Language fundamentals, syntax, and advanced patterns.",
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
    files: []
  },
  {
    id: "extensions",
    title: "Browser Extensions",
    root: "5-Browser-Extensions",
    description: "Extension APIs and workflows.",
    files: []
  },
  {
    id: "advanced",
    title: "Advanced Topics",
    root: "6-Advanced-Topics-and-Best-Practices",
    description: "Best practices and advanced patterns.",
    files: []
  }
];

const doc = document.getElementById("doc");
const nav = document.getElementById("nav");
const breadcrumbs = document.getElementById("breadcrumbs");
const search = document.getElementById("nav-search");
const menuToggle = document.getElementById("menu-toggle");
const homeBtn = document.getElementById("home-btn");
const themeToggle = document.getElementById("theme-toggle");
const scrollTopBtn = document.getElementById("scroll-top");
const hero = document.getElementById("hero");
const sidebarOverlay = document.getElementById("sidebar-overlay");
const content = document.querySelector(".content");

marked.setOptions({
  gfm: true,
  breaks: false
});

function titleFromFilename(filename) {
  return filename
    .replace(/^[0-9]+-/, "")
    .replace(/-S[0-9]+/g, "")
    .replace(/\\.md$/i, "")
    .replace(/-/g, " ");
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
  const section = resolveSection(sectionId);
  const decoded = file ? decodeURIComponent(file) : null;
  const fallback = section && section.files.length ? section.files[0] : null;
  return { mode: "section", sectionId, file: decoded || fallback };
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

  if (state.mode === "section") {
    const section = resolveSection(state.sectionId);
    if (!section) {
      window.location.hash = "home";
      return;
    }
    const targetFile = state.file || section.files[0];
    path = section.files.length ? `${section.root}/${targetFile}` : "README.md";
    const fileTitle = targetFile ? titleFromFilename(targetFile) : "Overview";
    breadcrumb = `${section.title}${targetFile ? ` / ${fileTitle}` : ""}`;
    title = `${section.title} · JavaScript Guide`;
  }

  breadcrumbs.textContent = breadcrumb;
  document.title = title;

  document.body.classList.add("is-busy");
  doc.classList.add("is-loading", "fade-in");
  try {
    const response = await fetch(resolvePath(path));
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const markdown = await response.text();
    const processed = transformHighlights(markdown);
    const html = marked.parse(processed);
    doc.innerHTML = html;
    transformCallouts(doc);
    highlightCode(doc);
    doc.classList.remove("is-ready");
    requestAnimationFrame(() => {
      doc.classList.add("is-ready");
    });
    doc.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    doc.innerHTML = `
      <h2>Unable to load content</h2>
      <p>Could not fetch <strong>${path}</strong>. ${error?.message || ""}</p>
      <pre><code>python -m http.server</code></pre>
    `;
  } finally {
    document.body.classList.remove("is-busy");
    doc.classList.remove("is-loading");
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
}

function setCodeWrap(enabled) {
  document.body.classList.toggle("wrap-code", enabled);
}

function initCodeWrap() {
  setCodeWrap(true);
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
handleRouteChange();

window.addEventListener("hashchange", handleRouteChange);

search.addEventListener("input", (event) => {
  const value = event.target.value.trim().toLowerCase();
  renderNavigation(parseStateFromHash(), value);
});

menuToggle.addEventListener("click", () => {
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

// Code wrapping is always on to prevent horizontal overflow.

homeBtn.addEventListener("click", () => {
  window.location.hash = "home";
});

if (content) {
  content.addEventListener("click", () => closeSidebarOnMobile());
}

document.body.classList.remove("loading-ui");
