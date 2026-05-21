function createField(text, doc) {
  const field = doc.createElement('div');
  field.className = 'form-field';

  const isTextarea = text.startsWith('{textarea}');
  const isSelect = text.startsWith('{select:');
  const fieldText = text.replace(/^\{textarea\}\s*/, '').replace(/^\{select:[^}]*\}\s*/, '');
  const required = fieldText.includes('*');

  const label = doc.createElement('label');
  label.className = 'form-label';
  label.textContent = fieldText;
  field.append(label);

  if (isTextarea) {
    const textarea = doc.createElement('textarea');
    textarea.name = fieldText.toLowerCase().replace(/[^a-z]/g, '-').replace(/-+/g, '-');
    textarea.placeholder = fieldText.replace(' *', '');
    textarea.rows = 4;
    textarea.required = required;
    field.append(textarea);
  } else if (isSelect) {
    const optionsStr = text.match(/\{select:([^}]*)\}/)?.[1] || '';
    const options = optionsStr.split(',').map((o) => o.trim());
    const select = doc.createElement('select');
    select.name = fieldText.toLowerCase().replace(/[^a-z]/g, '-').replace(/-+/g, '-');
    select.required = required;
    const defaultOpt = doc.createElement('option');
    defaultOpt.value = '';
    defaultOpt.textContent = `Select ${fieldText.replace(' *', '')}`;
    select.append(defaultOpt);
    options.forEach((o) => {
      const opt = doc.createElement('option');
      opt.value = o.toLowerCase().replace(/\s+/g, '-');
      opt.textContent = o;
      select.append(opt);
    });
    field.append(select);
  } else {
    const input = doc.createElement('input');
    input.type = fieldText.toLowerCase().includes('email') ? 'email' : 'text';
    input.name = fieldText.toLowerCase().replace(/[^a-z]/g, '-').replace(/-+/g, '-');
    input.placeholder = fieldText.replace(' *', '');
    input.required = required;
    field.append(input);
  }

  return field;
}

export default function decorate(block) {
  const form = document.createElement('form');
  form.className = 'form-content';
  form.setAttribute('novalidate', '');

  const rows = [...block.children];
  rows.forEach((row) => {
    const cols = [...row.children];
    if (cols.length === 0) return;

    const fieldRow = document.createElement('div');
    fieldRow.className = 'form-row';

    cols.forEach((col) => {
      const text = col.textContent.trim();
      if (!text) return;

      // Check for HTML content (disclaimers with links)
      if (col.querySelector('a')) {
        const disclaimer = document.createElement('p');
        disclaimer.className = 'form-disclaimer';
        disclaimer.innerHTML = col.innerHTML;
        fieldRow.append(disclaimer);
        return;
      }

      const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
      lines.forEach((line) => {
        if (line.toLowerCase() === 'submit' || line.toLowerCase() === 'sign up') {
          const btn = document.createElement('button');
          btn.type = 'submit';
          btn.className = 'form-submit';
          btn.textContent = line;
          fieldRow.append(btn);
        } else if (line.startsWith('[') && line.endsWith(']')) {
          const options = line.slice(1, -1).split(',').map((o) => o.trim());
          const group = document.createElement('div');
          group.className = 'form-field form-checkbox-group';
          const legend = document.createElement('span');
          legend.className = 'form-label';
          legend.textContent = 'Topics of Interest';
          group.append(legend);
          const checkboxes = document.createElement('div');
          checkboxes.className = 'form-checkboxes';
          options.forEach((opt) => {
            const label = document.createElement('label');
            label.className = 'form-checkbox';
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.name = 'topics';
            input.value = opt.toLowerCase().replace(/\s+/g, '-');
            const span = document.createElement('span');
            span.textContent = opt;
            label.append(input, span);
            checkboxes.append(label);
          });
          group.append(checkboxes);
          fieldRow.append(group);
        } else if (line.includes('|') && !line.startsWith('{')) {
          const fields = line.split('|').map((f) => f.trim());
          fields.forEach((fieldName) => {
            fieldRow.append(createField(fieldName, document));
          });
          fieldRow.classList.add('form-row-inline');
        } else if (line.startsWith('##')) {
          const heading = document.createElement('h2');
          heading.className = 'form-heading';
          heading.textContent = line.replace(/^#+\s*/, '');
          fieldRow.append(heading);
        } else if (line.startsWith('--')) {
          const desc = document.createElement('p');
          desc.className = 'form-description';
          desc.textContent = line.replace(/^--\s*/, '');
          fieldRow.append(desc);
        } else {
          fieldRow.append(createField(line, document));
        }
      });
    });

    if (fieldRow.children.length) form.append(fieldRow);
  });

  // Group consecutive textarea fields into an <ol>
  const textareaRows = form.querySelectorAll('.form-row:has(textarea)');
  if (textareaRows.length > 1) {
    const ol = document.createElement('ol');
    ol.className = 'form-questions';
    const firstRow = textareaRows[0];
    firstRow.before(ol);
    textareaRows.forEach((row) => {
      const li = document.createElement('li');
      li.className = 'form-question-item';
      while (row.firstChild) li.append(row.firstChild);
      ol.append(li);
      row.remove();
    });
    const olRow = document.createElement('div');
    olRow.className = 'form-row';
    ol.before(olRow);
    olRow.append(ol);
  }

  block.textContent = '';
  block.append(form);
}
