const fs = require('fs');
const path = require('path');

const articles = [
  // Hip section articles (many share /knee/ paths but we create hip-specific ones)
  { section: 'hip', slug: 'hip-replacement-patient-story-steve', tag: 'Lifestyle', title: "Steve's Patient Story – Hip Replacement", desc: "After years of hip pain, Steve decided to have hip replacement surgery. Read about his journey back to an active lifestyle." },
  { section: 'hip', slug: 'what-causes-hip-pain', tag: 'Diagnosis and Options', title: 'What Causes Hip Pain?', desc: "Hip pain can have many causes. Learn about common conditions that lead to hip pain and when to see a doctor." },
  { section: 'hip', slug: 'hip-replacement-surgery-what-to-expect', tag: 'Surgery', title: 'Hip Replacement Surgery: What to Expect', desc: "Understanding what happens during hip replacement surgery can help you prepare. Learn about the procedure here." },
  { section: 'hip', slug: 'recovering-from-hip-replacement', tag: 'Recovery', title: 'Recovering from Hip Replacement Surgery', desc: "Recovery after hip replacement takes time and dedication. Learn what to expect in the weeks and months after surgery." },
  { section: 'hip', slug: 'hip-exercises-for-pain-relief', tag: 'Healthy Living', title: 'Hip Exercises for Pain Relief', desc: "Certain exercises can help relieve hip pain and improve mobility. Learn safe exercises recommended by orthopedic specialists." },
  { section: 'hip', slug: 'anterior-vs-posterior-hip-replacement', tag: 'Surgery', title: 'Anterior vs. Posterior Hip Replacement', desc: "There are different surgical approaches to hip replacement. Learn about the differences between anterior and posterior approaches." },
  { section: 'hip', slug: 'signs-you-may-need-hip-replacement', tag: 'Diagnosis and Options', title: 'Signs You May Need Hip Replacement', desc: "When conservative treatments no longer provide relief, hip replacement may be an option. Learn the signs." },
  { section: 'hip', slug: 'hip-pain-at-night', tag: 'Physical', title: 'Hip Pain at Night: Causes and Solutions', desc: "Hip pain that disrupts sleep is common. Learn about the causes and what you can do to find relief." },
  { section: 'hip', slug: 'life-after-hip-replacement', tag: 'Recovery', title: 'Life After Hip Replacement', desc: "Many patients return to an active lifestyle after hip replacement. Learn what activities you can expect to enjoy." },
  { section: 'hip', slug: 'hip-arthritis-treatment-options', tag: 'Diagnosis and Options', title: 'Hip Arthritis Treatment Options', desc: "From medication to surgery, there are many treatment options for hip arthritis. Learn about your choices." },
  { section: 'hip', slug: 'preparing-for-hip-surgery', tag: 'Surgery', title: 'Preparing for Hip Surgery', desc: "Preparation is key to a successful hip surgery outcome. Learn how to get ready physically and mentally." },
  { section: 'hip', slug: 'hip-pain-young-adults', tag: 'Well-being', title: 'Hip Pain in Young Adults', desc: "Hip pain isn't just for older adults. Learn about conditions that affect younger patients and treatment options available." },

  // Foot and Ankle section
  { section: 'foot-ankle', slug: 'bunion-surgery-what-to-know', tag: 'Surgery', title: 'Bunion Surgery: What You Need to Know', desc: "Considering bunion surgery? Learn about the procedure, recovery timeline, and what results to expect." },
  { section: 'foot-ankle', slug: 'plantar-fasciitis-treatment', tag: 'Diagnosis and Options', title: 'Plantar Fasciitis Treatment Options', desc: "Plantar fasciitis is one of the most common causes of heel pain. Learn about effective treatment options." },
  { section: 'foot-ankle', slug: 'ankle-replacement-vs-fusion', tag: 'Surgery', title: 'Ankle Replacement vs. Ankle Fusion', desc: "When ankle arthritis becomes severe, surgery may be needed. Compare ankle replacement and fusion options." },
  { section: 'foot-ankle', slug: 'foot-pain-causes', tag: 'Diagnosis and Options', title: 'Common Causes of Foot Pain', desc: "Foot pain can stem from many conditions. Learn about the most common causes and when to seek treatment." },
  { section: 'foot-ankle', slug: 'recovering-from-foot-surgery', tag: 'Recovery', title: 'Recovering from Foot Surgery', desc: "Recovery from foot surgery requires patience. Learn what to expect and how to optimize your healing." },
  { section: 'foot-ankle', slug: 'ankle-sprain-vs-fracture', tag: 'Physical', title: 'Ankle Sprain vs. Fracture: How to Tell', desc: "It can be hard to distinguish between a sprain and a fracture. Learn the signs and when to see a doctor." },
  { section: 'foot-ankle', slug: 'flat-feet-treatment', tag: 'Diagnosis and Options', title: 'Flat Feet: Causes and Treatment', desc: "Flat feet can cause pain and affect your mobility. Learn about causes, symptoms, and treatment options." },
  { section: 'foot-ankle', slug: 'diabetic-foot-care', tag: 'Healthy Living', title: 'Diabetic Foot Care: Essential Tips', desc: "Diabetes requires special attention to foot health. Learn essential care tips to prevent complications." },
  { section: 'foot-ankle', slug: 'hammer-toe-correction', tag: 'Surgery', title: 'Hammer Toe Correction Surgery', desc: "When hammer toe causes significant discomfort, surgery may help. Learn about the procedure and recovery." },
  { section: 'foot-ankle', slug: 'achilles-tendon-injuries', tag: 'Physical', title: 'Achilles Tendon Injuries', desc: "Achilles tendon injuries range from mild to severe. Learn about causes, symptoms, and treatment approaches." },
  { section: 'foot-ankle', slug: 'choosing-the-right-shoes', tag: 'Healthy Living', title: 'Choosing the Right Shoes for Foot Health', desc: "The right footwear can prevent many foot problems. Learn what to look for in supportive shoes." },
  { section: 'foot-ankle', slug: 'morton-neuroma', tag: 'Diagnosis and Options', title: "Morton's Neuroma: Symptoms and Treatment", desc: "Morton's neuroma causes pain in the ball of your foot. Learn about symptoms, diagnosis, and treatment options." },

  // Shoulder section
  { section: 'shoulder', slug: 'rotator-cuff-tear-treatment', tag: 'Surgery', title: 'Rotator Cuff Tear: Treatment Options', desc: "A rotator cuff tear can significantly limit shoulder function. Learn about surgical and non-surgical treatment options." },
  { section: 'shoulder', slug: 'shoulder-replacement-surgery', tag: 'Surgery', title: 'Shoulder Replacement Surgery: What to Expect', desc: "Shoulder replacement can restore function and relieve pain. Learn about the procedure and recovery process." },
  { section: 'shoulder', slug: 'frozen-shoulder-causes-treatment', tag: 'Diagnosis and Options', title: 'Frozen Shoulder: Causes and Treatment', desc: "Frozen shoulder restricts movement and causes pain. Learn about its stages and effective treatments." },
  { section: 'shoulder', slug: 'shoulder-pain-when-sleeping', tag: 'Physical', title: 'Shoulder Pain When Sleeping', desc: "Shoulder pain that keeps you up at night is frustrating. Learn about causes and ways to find relief." },
  { section: 'shoulder', slug: 'shoulder-arthroscopy', tag: 'Surgery', title: 'Shoulder Arthroscopy: A Minimally Invasive Option', desc: "Arthroscopic shoulder surgery offers a less invasive approach. Learn when it's appropriate and what to expect." },
  { section: 'shoulder', slug: 'exercises-for-shoulder-pain', tag: 'Healthy Living', title: 'Exercises for Shoulder Pain Relief', desc: "Gentle exercises can help relieve shoulder pain and improve range of motion. Learn safe stretches and strengthening moves." },
  { section: 'shoulder', slug: 'shoulder-impingement-syndrome', tag: 'Diagnosis and Options', title: 'Shoulder Impingement Syndrome', desc: "Shoulder impingement is a common cause of pain during overhead activities. Learn about diagnosis and treatment." },
  { section: 'shoulder', slug: 'recovering-from-shoulder-surgery', tag: 'Recovery', title: 'Recovering from Shoulder Surgery', desc: "Shoulder surgery recovery requires careful rehabilitation. Learn what to expect in the weeks and months after." },
  { section: 'shoulder', slug: 'reverse-shoulder-replacement', tag: 'Surgery', title: 'Reverse Shoulder Replacement', desc: "Reverse shoulder replacement is designed for specific conditions. Learn when it's recommended and how it differs." },
  { section: 'shoulder', slug: 'shoulder-dislocation', tag: 'Physical', title: 'Shoulder Dislocation: Treatment and Prevention', desc: "A dislocated shoulder is painful and can recur. Learn about treatment options and ways to prevent future dislocations." },
  { section: 'shoulder', slug: 'shoulder-pain-diagnosis', tag: 'Diagnosis and Options', title: 'Diagnosing Shoulder Pain', desc: "Shoulder pain has many possible causes. Learn about the diagnostic process and tests your doctor may recommend." },
  { section: 'shoulder', slug: 'shoulder-strengthening-after-injury', tag: 'Recovery', title: 'Strengthening Your Shoulder After Injury', desc: "Rebuilding shoulder strength after injury is crucial. Learn about progressive exercises for safe recovery." },

  // Elbow section
  { section: 'elbow', slug: 'tennis-elbow-treatment', tag: 'Diagnosis and Options', title: 'Tennis Elbow: Causes and Treatment', desc: "Tennis elbow is a common overuse injury that causes pain on the outside of the elbow. Learn about effective treatments." },
  { section: 'elbow', slug: 'elbow-replacement-surgery', tag: 'Surgery', title: 'Elbow Replacement Surgery', desc: "When elbow damage is severe, replacement surgery may restore function. Learn about the procedure and recovery." },
  { section: 'elbow', slug: 'golfers-elbow-vs-tennis-elbow', tag: 'Physical', title: "Golfer's Elbow vs. Tennis Elbow", desc: "These conditions affect different parts of the elbow. Learn how to tell them apart and find the right treatment." },
  { section: 'elbow', slug: 'elbow-pain-causes', tag: 'Diagnosis and Options', title: 'Common Causes of Elbow Pain', desc: "Elbow pain can result from overuse, injury, or arthritis. Learn about common causes and when to seek care." },
  { section: 'elbow', slug: 'cubital-tunnel-syndrome', tag: 'Physical', title: 'Cubital Tunnel Syndrome', desc: "Cubital tunnel syndrome causes numbness and tingling in the ring and small fingers. Learn about symptoms and treatment." },
  { section: 'elbow', slug: 'elbow-arthritis', tag: 'Diagnosis and Options', title: 'Elbow Arthritis: Symptoms and Options', desc: "Arthritis in the elbow can limit daily activities. Learn about symptoms, diagnosis, and available treatments." },
  { section: 'elbow', slug: 'recovering-from-elbow-surgery', tag: 'Recovery', title: 'Recovering from Elbow Surgery', desc: "Elbow surgery recovery varies by procedure. Learn what to expect and how to support your healing." },
  { section: 'elbow', slug: 'elbow-bursitis', tag: 'Physical', title: 'Elbow Bursitis: Swelling and Treatment', desc: "Elbow bursitis causes swelling at the tip of the elbow. Learn about causes, symptoms, and treatment options." },
  { section: 'elbow', slug: 'exercises-for-elbow-pain', tag: 'Healthy Living', title: 'Exercises for Elbow Pain', desc: "Specific exercises can help relieve elbow pain and prevent recurrence. Learn safe stretches and strengthening techniques." },
  { section: 'elbow', slug: 'elbow-fracture-treatment', tag: 'Surgery', title: 'Elbow Fracture: Treatment Options', desc: "Elbow fractures range from simple to complex. Learn about treatment approaches including surgery when needed." },
  { section: 'elbow', slug: 'elbow-joint-preservation', tag: 'Diagnosis and Options', title: 'Elbow Joint Preservation', desc: "Before considering replacement, joint preservation techniques may help. Learn about options to maintain your natural joint." },
  { section: 'elbow', slug: 'preventing-elbow-injuries', tag: 'Healthy Living', title: 'Preventing Elbow Injuries', desc: "Many elbow injuries are preventable with proper technique and conditioning. Learn strategies to protect your elbows." },
];

function generateArticle(article) {
  const slug = article.slug;
  const section = article.section;
  const dirPath = path.join(__dirname, '..', 'content', section);
  
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  
  const html = `<div><div class="article-header"><div><div><p>${article.tag}</p><h1>${article.title}</h1><p>${article.desc}</p><p>January 15, 2022 | 3 min read</p></div></div><div><div><p>ReadyPatient Editorial Team</p><p>Author</p></div></div></div></div>
<div><h2>Understanding the condition</h2><p>When it comes to joint health, knowledge is power. Understanding your condition is the first step toward finding the right treatment and getting back to the activities you love.</p><p>Many patients find that learning about their options helps them feel more confident about their care decisions. Talk to your doctor about what approach might be best for your specific situation.</p><p>Not all patients are candidates for every procedure. Only a medical professional can determine the treatment appropriate for your specific condition.</p><h2>Treatment approaches</h2><p>Today's orthopedic medicine offers a range of treatment options, from conservative approaches to advanced surgical techniques. Your doctor will work with you to develop a treatment plan tailored to your needs, activity level, and goals.</p><p>Conservative treatments may include physical therapy, medication, injections, or lifestyle modifications. When these approaches are no longer effective, surgical options may be considered.</p><p><a href="/find-a-doc">Find an orthopedic specialist near you</a></p><h2>Recovery and next steps</h2><p>Recovery timelines vary depending on the condition and treatment approach. Following your doctor's recommendations for rehabilitation is crucial for the best possible outcome.</p><p>Physical therapy plays an important role in most recovery plans. Your therapist will guide you through exercises designed to restore strength and mobility.</p><p>Appropriate post-operative activities and pain will differ from patient to patient. Results are not necessarily typical, indicative, or representative of all recipient patients. Results will vary due to health, weight, activity and other variables.</p><p><a href="/get-updates">Stay informed. Sign up for personalized article recommendations.</a></p><p>Talk to your surgeon about whether treatment is right for you and the risks of the procedure, including the risks of infection, implant wear, loosening, breakage or failure, any of which can necessitate additional surgery or treatment.</p></div>
<div><p><a href="/fragments/more-you-can-do">Here's more you can do</a></p></div>
<div><div class="metadata"><div><div>Title</div><div>${article.title}</div></div><div><div>Description</div><div>${article.desc}</div></div></div></div>
`;

  const filePath = path.join(dirPath, `${slug}.plain.html`);
  fs.writeFileSync(filePath, html);
  return filePath;
}

let count = 0;
articles.forEach(article => {
  generateArticle(article);
  count++;
});

console.log(`Generated ${count} article files across 4 sections.`);
