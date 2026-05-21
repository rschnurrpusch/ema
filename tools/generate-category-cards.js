const fs = require('fs');
const path = require('path');

const sections = {
  hip: {
    hero: { img: '/images/banner-hip.jpg', title: "Hip pain got you down? You're not alone.", desc: "Every year, millions of people seek help from their doctor to alleviate their hip pain. Use the resources below to learn more about hip pain causes, treatments, and ways to maintain your hip joint health. Select your journey stage below to begin." },
    articles: [
      { slug: 'hip-replacement-patient-story-steve', tag: 'Lifestyle', title: "Steve's Patient Story – Hip Replacement" },
      { slug: 'what-causes-hip-pain', tag: 'Diagnosis and Options', title: 'What Causes Hip Pain?' },
      { slug: 'hip-replacement-surgery-what-to-expect', tag: 'Surgery', title: 'Hip Replacement Surgery: What to Expect' },
      { slug: 'recovering-from-hip-replacement', tag: 'Recovery', title: 'Recovering from Hip Replacement Surgery' },
      { slug: 'hip-exercises-for-pain-relief', tag: 'Healthy Living', title: 'Hip Exercises for Pain Relief' },
      { slug: 'anterior-vs-posterior-hip-replacement', tag: 'Surgery', title: 'Anterior vs. Posterior Hip Replacement' },
    ]
  },
  'foot-ankle': {
    hero: { img: '/images/banner-foot-ankle.jpg', title: "Aching feet or ankles? You're not alone.", desc: "Whether you suffer from arthritis, bunions, hammer toes or something else, we're here for you. Use the resources below to learn more about foot and ankle pain causes, treatments, and ways to maintain your joint health." },
    articles: [
      { slug: 'bunion-surgery-what-to-know', tag: 'Surgery', title: 'Bunion Surgery: What You Need to Know' },
      { slug: 'plantar-fasciitis-treatment', tag: 'Diagnosis and Options', title: 'Plantar Fasciitis Treatment Options' },
      { slug: 'ankle-replacement-vs-fusion', tag: 'Surgery', title: 'Ankle Replacement vs. Ankle Fusion' },
      { slug: 'foot-pain-causes', tag: 'Diagnosis and Options', title: 'Common Causes of Foot Pain' },
      { slug: 'recovering-from-foot-surgery', tag: 'Recovery', title: 'Recovering from Foot Surgery' },
      { slug: 'ankle-sprain-vs-fracture', tag: 'Physical', title: 'Ankle Sprain vs. Fracture: How to Tell' },
    ]
  },
  shoulder: {
    hero: { img: '/images/banner-shoulder.jpg', title: "Shoulder pain holding you back? You're not alone.", desc: "If shoulder pain is interfering with your ability to do the things you love, check out the below resources. Each are designed to help you understand possible shoulder pain causes and treatment options, as well as provide inspiration for daily living and joint health." },
    articles: [
      { slug: 'rotator-cuff-tear-treatment', tag: 'Surgery', title: 'Rotator Cuff Tear: Treatment Options' },
      { slug: 'shoulder-replacement-surgery', tag: 'Surgery', title: 'Shoulder Replacement Surgery: What to Expect' },
      { slug: 'frozen-shoulder-causes-treatment', tag: 'Diagnosis and Options', title: 'Frozen Shoulder: Causes and Treatment' },
      { slug: 'shoulder-pain-when-sleeping', tag: 'Physical', title: 'Shoulder Pain When Sleeping' },
      { slug: 'shoulder-arthroscopy', tag: 'Surgery', title: 'Shoulder Arthroscopy: A Minimally Invasive Option' },
      { slug: 'exercises-for-shoulder-pain', tag: 'Healthy Living', title: 'Exercises for Shoulder Pain Relief' },
    ]
  },
  elbow: {
    hero: { img: '/images/banner-elbow.jpg', title: "Elbow pain holding you back? You're not alone.", desc: "If elbow pain is interfering with your ability to do the things you love, check out the resources available on ReadyPatient. Each are designed to help you understand possible elbow pain causes and treatment options, as well as provide inspiration for daily living and joint health." },
    articles: [
      { slug: 'tennis-elbow-treatment', tag: 'Diagnosis and Options', title: 'Tennis Elbow: Causes and Treatment' },
      { slug: 'elbow-replacement-surgery', tag: 'Surgery', title: 'Elbow Replacement Surgery' },
      { slug: 'golfers-elbow-vs-tennis-elbow', tag: 'Physical', title: "Golfer's Elbow vs. Tennis Elbow" },
      { slug: 'elbow-pain-causes', tag: 'Diagnosis and Options', title: 'Common Causes of Elbow Pain' },
      { slug: 'cubital-tunnel-syndrome', tag: 'Physical', title: 'Cubital Tunnel Syndrome' },
      { slug: 'elbow-arthritis', tag: 'Diagnosis and Options', title: 'Elbow Arthritis: Symptoms and Options' },
    ]
  }
};

Object.entries(sections).forEach(([section, data]) => {
  const cardRows = data.articles.map(a => {
    return `<div><div><picture><source srcset="/images/articles/${a.slug}.jpg"><source srcset="/images/articles/${a.slug}.jpg" media="(min-width: 600px)"><img src="/images/articles/${a.slug}.jpg" alt="${a.title}" loading="lazy"></picture></div><div><p>${a.tag}</p><h3>${a.title}</h3><p><a href="/${section}/${a.slug}">Read more</a></p></div></div>`;
  }).join('');

  const html = `<div><div class="hero-patient"><div><div><picture><source srcset="${data.hero.img}"><source srcset="${data.hero.img}" media="(min-width: 600px)"><img src="${data.hero.img}" alt="" loading="eager"></picture></div></div><div><div><h1>${data.hero.title}</h1></div></div><div><div><p>${data.hero.desc}</p></div></div></div></div>
<div><h3 id="journey">Where are you on your journey?</h3><div class="journey-selector"><div><div></div></div></div></div>
<div><div class="article-card">${cardRows}</div></div>
<div><div class="metadata"><div><div>Title</div><div>${section.charAt(0).toUpperCase() + section.slice(1).replace('-', ' and ')} Articles</div></div><div><div>Description</div><div>Learn about ${section.replace('-', ' and ')} pain causes, treatments, and ways to maintain your joint health.</div></div></div></div>
`;

  const filePath = path.join(__dirname, '..', 'content', `${section}.plain.html`);
  fs.writeFileSync(filePath, html);
  console.log(`Written: ${filePath}`);
});
