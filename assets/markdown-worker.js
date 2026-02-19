/* global marked */
importScripts("/assets/vendor/marked/marked.min.js");

marked.setOptions({
  gfm: true,
  breaks: false
});

function transformHighlights(markdown) {
  return markdown.replace(/==([^=\n]+)==/g, "<mark>$1</mark>");
}

self.onmessage = (event) => {
  const { id, markdown } = event.data || {};
  if (!markdown) {
    self.postMessage({ id, html: "" });
    return;
  }
  const processed = transformHighlights(markdown);
  const html = marked.parse(processed);
  self.postMessage({ id, html });
};
