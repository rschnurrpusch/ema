export default function decorate(block) {
  const categories = ['Diagnosis and Options', 'Surgery', 'Recovery', 'Healthy Living'];
  const wrapper = document.createElement('div');
  wrapper.className = 'journey-selector-filters';

  categories.forEach((cat) => {
    const label = document.createElement('label');
    label.className = 'journey-selector-option';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.name = 'journey';
    checkbox.value = cat.toLowerCase().replace(/\s+/g, '-');
    const span = document.createElement('span');
    span.textContent = cat;
    label.append(checkbox, span);
    wrapper.append(label);
  });

  const results = document.createElement('div');
  results.className = 'journey-selector-results';
  results.textContent = 'Select a journey stage above to filter articles.';

  block.textContent = '';
  block.append(wrapper, results);
}
