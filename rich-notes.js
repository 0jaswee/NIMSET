export const NOTE_COLORS = [
  'default',
  '#b71c1c',
  '#1565c0',
  '#176b3a',
  '#7b1fa2',
  '#8a4b00'
];

const SIZES = [12, 16, 20, 24, 32];

const defaults = () => ({
  color: 'default',
  bold: false,
  italic: false,
  underline: false
});

const states = new WeakMap();

export function escapeNote(value) {
  return String(value ?? '').replace(
    /[&<>"']/g,
    character => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[character]
  );
}

export function validateRich(runs) {
  if (!Array.isArray(runs) || runs.length > 5000) {
    throw new Error('Invalid rich notes.');
  }

  let length = 0;

  for (const run of runs) {
    if (
      !run ||
      typeof run.text !== 'string' ||
      !NOTE_COLORS.includes(run.color) ||
      !['bold', 'italic', 'underline'].every(
        key => typeof run[key] === 'boolean'
      )
    ) {
      throw new Error('Invalid rich-note style.');
    }

    if (
      run.size !== undefined &&
      !SIZES.includes(run.size)
    ) {
      throw new Error('Invalid note font size.');
    }

    length += run.text.length;
  }

  if (length > 50000) {
    throw new Error(
      'Notes must stay within 50,000 characters.'
    );
  }

  return runs;
}

export function plainRuns(text) {
  return [{
    text: text || '',
    ...defaults()
  }];
}

export function richText(runs) {
  return validateRich(runs)
    .map(run => run.text)
    .join('');
}

function css(run) {
  return [
    `color:${run.color === 'default'
      ? 'var(--ink)'
      : run.color}`,
    `font-size:${run.size || 16}px`,
    `font-weight:${run.bold ? 700 : 400}`,
    `font-style:${run.italic ? 'italic' : 'normal'}`,
    `text-decoration:${run.underline
      ? 'underline'
      : 'none'}`
  ].join(';') + ';';
}

export function richHTML(runs) {
  return validateRich(runs)
    .map(run =>
      `<span style="${css(run)}">${
        escapeNote(run.text).replace(/\n/g, '<br>')
      }</span>`
    )
    .join('');
}

function normalizeColor(value) {
  if (!value) return null;
  if (value === 'var(--ink)') return 'default';

  value = value.toLowerCase();

  if (NOTE_COLORS.includes(value)) {
    return value;
  }

  const match = value.match(
    /^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/
  );

  if (!match) return null;

  const hex = '#' + match
    .slice(1)
    .map(number =>
      Number(number).toString(16).padStart(2, '0')
    )
    .join('');

  return NOTE_COLORS.includes(hex) ? hex : null;
}

export function readRichEditor(editor) {
  const runs = [];

  function add(text, style) {
    if (!text) return;

    const previous = runs.at(-1);

    const sameStyle = previous && [
      'color',
      'bold',
      'italic',
      'underline',
      'size'
    ].every(key => previous[key] === style[key]);

    if (sameStyle) {
      previous.text += text;
    } else {
      runs.push({text, ...style});
    }
  }

  function walk(element, style) {
    if (element.nodeType === 3) {
      add(
        element.textContent.replace(/\u200b/g, ''),
        style
      );
      return;
    }

    if (element.nodeType !== 1) return;

    const tag = element.tagName.toLowerCase();

    if ([
      'script', 'style', 'iframe', 'object',
      'img', 'svg', 'math'
    ].includes(tag)) {
      return;
    }

    if (tag === 'br') {
      add('\n', style);
      return;
    }

    const next = {...style};
    const elementStyle = element.style || {};

    const size = parseInt(elementStyle.fontSize, 10);

    if (SIZES.includes(size)) {
      next.size = size;
    }

    const color = normalizeColor(
      elementStyle.color ||
      element.getAttribute?.('color')
    );

    if (color) next.color = color;

    if (['b', 'strong'].includes(tag)) {
      next.bold = true;
    }

    if (elementStyle.fontWeight) {
      next.bold =
        elementStyle.fontWeight === 'bold' ||
        Number(elementStyle.fontWeight) >= 600;
    }

    if (['i', 'em'].includes(tag)) {
      next.italic = true;
    }

    if (elementStyle.fontStyle) {
      next.italic = elementStyle.fontStyle === 'italic';
    }

    if (tag === 'u') {
      next.underline = true;
    }

    const decoration =
      elementStyle.textDecorationLine ||
      elementStyle.textDecoration;

    if (decoration) {
      next.underline = decoration.includes('underline');
    }

    for (const child of element.childNodes) {
      walk(child, next);
    }

    if (
      ['div', 'p', 'li'].includes(tag) &&
      element.nextSibling
    ) {
      add('\n', next);
    }
  }

  for (const element of editor.childNodes) {
    walk(element, defaults());
  }

  return validateRich(runs);
}

function stateFor(editor) {
  if (!states.has(editor)) {
    states.set(editor, {
      range: null,
      marker: null,
      style: null
    });
  }

  return states.get(editor);
}

function inside(editor, range) {
  return !!range &&
    editor.contains(range.commonAncestorContainer);
}

function currentRange(editor) {
  const selection = window.getSelection();
  const state = stateFor(editor);

  if (
    selection?.rangeCount &&
    inside(editor, selection.getRangeAt(0))
  ) {
    return selection.getRangeAt(0);
  }

  if (inside(editor, state.range)) {
    return state.range;
  }

  const range = document.createRange();
  range.selectNodeContents(editor);
  range.collapse(false);
  return range;
}

function offsets(editor, range) {
  const prefix = document.createRange();
  prefix.selectNodeContents(editor);

  prefix.setEnd(
    range.startContainer,
    range.startOffset
  );

  const start = richText(
    readRichEditor(prefix.cloneContents())
  ).length;

  prefix.setEnd(
    range.endContainer,
    range.endOffset
  );

  const end = richText(
    readRichEditor(prefix.cloneContents())
  ).length;

  return [start, end];
}

function slice(runs, start, end) {
  const result = [];
  let position = 0;

  for (const run of runs) {
    const next = position + run.text.length;
    const from = Math.max(start, position);
    const to = Math.min(end, next);

    if (to > from) {
      result.push({
        ...run,
        text: run.text.slice(
          from - position,
          to - position
        )
      });
    }

    position = next;
  }

  return result;
}

function caretStyle(editor, range, runs, start) {
  const state = stateFor(editor);

  if (
    state.marker?.isConnected &&
    state.marker.contains(range.startContainer) &&
    state.style
  ) {
    return {...state.style};
  }

  let element = range.startContainer.nodeType === 3
    ? range.startContainer.parentElement
    : range.startContainer;

  if (
    element === editor &&
    editor.childNodes.length
  ) {
    const child = editor.childNodes[
      Math.min(
        range.startOffset,
        editor.childNodes.length - 1
      )
    ];

    element = child.nodeType === 3
      ? child.parentElement
      : child;
  }

  if (
    element?.nodeType === 1 &&
    typeof getComputedStyle === 'function'
  ) {
    const computed = getComputedStyle(element);
    const size = parseInt(computed.fontSize, 10);

    const style = {
      ...defaults(),
      color: normalizeColor(computed.color) || 'default',
      bold: Number(computed.fontWeight) >= 600,
      italic: computed.fontStyle === 'italic',
      size: SIZES.includes(size) ? size : 16
    };

    for (
      let parent = element;
      parent && parent !== editor;
      parent = parent.parentElement
    ) {
      if (
        getComputedStyle(parent)
          .textDecorationLine.includes('underline')
      ) {
        style.underline = true;
      }
    }

    return style;
  }

  let position = 0;

  for (const run of runs) {
    position += run.text.length;

    if (start <= position) {
      const {text, ...style} = run;
      return style;
    }
  }

  return defaults();
}

function selectionStyle(editor, range) {
  const runs = readRichEditor(editor);
  const [start, end] = offsets(editor, range);

  if (range.collapsed) {
    return caretStyle(editor, range, runs, start);
  }

  const selected = slice(runs, start, end);

  if (!selected.length) return defaults();

  const style = {...defaults()};

  for (const key of ['bold', 'italic', 'underline']) {
    style[key] = selected.every(run => run[key]);
  }

  style.color = selected.every(
    run => run.color === selected[0].color
  ) ? selected[0].color : 'default';

  style.size = selected.every(
    run => (run.size || 16) === (selected[0].size || 16)
  ) ? (selected[0].size || 16) : 16;

  return style;
}

function showButtons(editor, style) {
  const toolbar = editor.parentElement
    ?.querySelector('.rich-note-tools');

  if (!toolbar) return;

  for (const button of toolbar.querySelectorAll(
    '[data-format]'
  )) {
    const kind = button.dataset.format;
    const value = button.dataset.color;

    let active = false;

    if (kind === 'color') {
      active = style.color === value;
    } else if (kind === 'size') {
      active = (style.size || 16) === Number(value);
    } else if (kind !== 'clear') {
      active = !!style[kind];
    }

    button.setAttribute('aria-pressed', String(active));
    button.style.background = active ? 'var(--soft)' : '';
    button.style.boxShadow = active
      ? 'inset 0 -3px 0 currentColor'
      : '';
  }
}

function appendRuns(fragment, runs) {
  for (const run of runs) {
    if (!run.text) continue;

    const span = document.createElement('span');
    span.style.cssText = css(run);
    span.textContent = run.text;
    fragment.appendChild(span);
  }
}

function point(editor, offset) {
  const walker = document.createTreeWalker(editor, 4);
  let node;
  let last;

  while ((node = walker.nextNode())) {
    last = node;

    if (offset <= node.length) {
      return [node, offset];
    }

    offset -= node.length;
  }

  return last
    ? [last, last.length]
    : [editor, 0];
}

export function applyRichFormat(editor, kind, value) {
  if (
    !editor ||
    ![
      'bold', 'italic', 'underline',
      'color', 'size', 'clear'
    ].includes(kind)
  ) {
    return false;
  }

  if (kind === 'color' && !NOTE_COLORS.includes(value)) {
    return false;
  }

  if (
    kind === 'size' &&
    !SIZES.includes(Number(value))
  ) {
    return false;
  }

  const range = currentRange(editor);
  const runs = readRichEditor(editor);
  const [start, end] = offsets(editor, range);
  const total = richText(runs).length;
  const style = selectionStyle(editor, range);
  const state = stateFor(editor);

  let desired = {...style};

  if (kind === 'clear') {
    desired = defaults();
  } else if (kind === 'color') {
    desired.color = style.color === value
      ? 'default'
      : value;
  } else if (kind === 'size') {
    desired.size = (style.size || 16) === Number(value)
      ? 16
      : Number(value);
  } else {
    desired[kind] = !style[kind];
  }

  const before = slice(runs, 0, start);
  const after = slice(runs, end, total);
  let middle = slice(runs, start, end);

  if (kind === 'clear') {
    middle = plainRuns(
      middle.map(run => run.text).join('')
    );
  } else {
    const key = kind === 'size'
      ? 'size'
      : kind === 'color'
        ? 'color'
        : kind;

    middle = middle.map(run => ({
      ...run,
      [key]: desired[key]
    }));
  }

  validateRich([...before, ...middle, ...after]);

  const fragment = document.createDocumentFragment();
  appendRuns(fragment, before);

  let marker;

  if (range.collapsed) {
    marker = document.createElement('span');
    marker.style.cssText = css(desired);
    marker.textContent = '\u200b';
    fragment.appendChild(marker);
  } else {
    appendRuns(fragment, middle);
  }

  appendRuns(fragment, after);

  editor.replaceChildren(fragment);
  editor.focus({preventScroll: true});

  const restored = document.createRange();

  if (marker) {
    restored.setStart(marker.firstChild, 1);
    restored.collapse(true);
  } else {
    const [startNode, startOffset] = point(editor, start);
    const [endNode, endOffset] = point(editor, end);

    restored.setStart(startNode, startOffset);
    restored.setEnd(endNode, endOffset);
  }

  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(restored);

  state.range = restored.cloneRange();
  state.marker = marker || null;
  state.style = desired;

  showButtons(editor, desired);
  return true;
}

if (
  typeof document !== 'undefined' &&
  document.addEventListener
) {
  document.addEventListener('selectionchange', () => {
    const editor = document.getElementById('inline-notes');
    const selection = window.getSelection();

    if (
      !editor ||
      !selection?.rangeCount ||
      !inside(editor, selection.getRangeAt(0))
    ) {
      return;
    }

    const range = selection.getRangeAt(0);
    stateFor(editor).range = range.cloneRange();

    showButtons(
      editor,
      selectionStyle(editor, range)
    );
  });
}

export function printNoteHTML(topic, syllabus, runs) {
  return `<!doctype html>
<html lang="hi">
<head>
<meta charset="utf-8">
<title>${escapeNote(topic)} - Notes</title>
<style>
  @page { size: A4; margin: 18mm; }

  body {
    font: 12pt/1.65 'Nirmala UI','Mangal',system-ui,sans-serif;
    color: #18251e;
    background: white;
  }

  h1 {
    font-size: 20pt;
    line-height: 1.3;
    overflow-wrap: anywhere;
  }

  header {
    border-bottom: 1px solid #ccc;
    margin-bottom: 20px;
    padding-bottom: 12px;
  }

  small { color: #555; }

  .printed-notes {
    white-space: normal;
    overflow-wrap: anywhere;
  }

  * {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
</style>
</head>
<body>
<header>
  <small>${escapeNote(syllabus)}</small>
  <h1>${escapeNote(topic)}</h1>
</header>
<article class="printed-notes">${richHTML(runs)}</article>
</body>
</html>`;
}

export function exportNotePDF(topic, syllabus, runs) {
  const iframe = document.createElement('iframe');

  iframe.setAttribute('title', 'Notes PDF print view');

  iframe.style.cssText =
    'position:fixed;width:1px;height:1px;' +
    'left:-9999px;top:0;border:0';

  iframe.onload = () => {
    const printWindow = iframe.contentWindow;

    printWindow.addEventListener(
      'afterprint',
      () => iframe.remove(),
      {once: true}
    );

    printWindow.focus();
    printWindow.print();
  };

  iframe.srcdoc = printNoteHTML(topic, syllabus, runs);
  document.body.appendChild(iframe);
}
