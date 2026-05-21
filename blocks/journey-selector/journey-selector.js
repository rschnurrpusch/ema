export default function decorate(block) {
  const categories = [
    { label: 'Diagnosis and Options', value: 'diagnosis-and-options' },
    { label: 'Surgery', value: 'surgery' },
    { label: 'Recovery', value: 'recovery' },
    { label: 'Healthy Living', value: 'healthy-living' },
  ];

  const filtersContainer = document.createElement('div');
  filtersContainer.className = 'journey-selector-filters';

  categories.forEach((cat, i) => {
    const pill = document.createElement('div');
    pill.className = `journey-selector-pill journey-selector-tag-${i + 1}`;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.name = 'journey';
    checkbox.value = cat.value;
    checkbox.className = 'journey-selector-input';

    const label = document.createElement('label');
    label.className = 'journey-selector-label';

    const number = document.createElement('span');
    number.className = 'journey-selector-number';
    number.textContent = i + 1;

    const text = document.createElement('span');
    text.className = 'journey-selector-text';
    text.textContent = cat.label;

    label.append(number, text);
    pill.append(checkbox, label);

    pill.addEventListener('click', () => {
      checkbox.checked = !checkbox.checked;
      pill.classList.toggle('is-checked', checkbox.checked);
    });

    filtersContainer.append(pill);
  });

  const progressBar = document.createElement('div');
  progressBar.className = 'journey-selector-bar';

  const cardCount = document.createElement('div');
  cardCount.className = 'journey-selector-count';
  cardCount.innerHTML = '<span class="journey-selector-count-number">0</span><span>Articles Found</span>';

  const results = document.createElement('div');
  results.className = 'journey-selector-results';
  results.textContent = 'Select a journey stage above to filter articles.';

  block.textContent = '';
  block.append(filtersContainer, progressBar, cardCount, results);
}
