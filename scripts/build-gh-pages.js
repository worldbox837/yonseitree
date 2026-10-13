const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const db = require('../lib/db');

const ROOT_DIR = path.join(__dirname, '..');
const VIEWS_DIR = path.join(ROOT_DIR, 'views');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');

// Ensure images directory exists in root
const rootImagesDir = path.join(ROOT_DIR, 'images');
if (!fs.existsSync(rootImagesDir)) {
  fs.mkdirSync(rootImagesDir, { recursive: true });
}

// Copy public/images to root images/
function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach(child => {
      copyRecursive(path.join(src, child), path.join(dest, child));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}
copyRecursive(path.join(PUBLIC_DIR, 'images'), rootImagesDir);

// Prepare data
const settings = db.getSettings();
const doctors = db.getDoctors();
const subjects = db.getSubjects();
const posts = db.getPosts();
const gallery = db.getGallery();
const nonCovered = db.getNonCovered();

function fixLinks(html) {
  return html
    // Navigation & internal links
    .replace(/href="\/(#[^"]*)"/g, 'href="index.html$1"')
    .replace(/href="\/"/g, 'href="index.html"')
    .replace(/href="\/doctors"/g, 'href="doctors.html"')
    .replace(/href="\/location(#?[^"]*)"/g, 'href="location.html$1"')
    .replace(/href="\/non-covered"/g, 'href="non-covered.html"')
    .replace(/href="\/subjects(#?[^"]*)"/g, 'href="subjects.html$1"')
    .replace(/href="\/posts"/g, 'href="posts.html"')
    .replace(/onclick="location\.href='\/location(#?[^']*)'"/g, 'onclick="location.href=\'location.html$1\'"')
    // Image assets
    .replace(/src="\/images\//g, 'src="./images/')
    .replace(/href="\/images\//g, 'href="./images/');
}

async function renderPage(viewName, data, outputPath) {
  const filePath = path.join(VIEWS_DIR, `${viewName}.ejs`);
  const html = await ejs.renderFile(filePath, data, {
    views: [VIEWS_DIR]
  });
  const fixed = fixLinks(html);
  fs.writeFileSync(outputPath, fixed, 'utf8');
  console.log(`Generated: ${path.basename(outputPath)}`);
}

async function build() {
  const globalData = {
    settings,
    isAdmin: false
  };

  // 1. Main index.html
  await renderPage('index', {
    ...globalData,
    doctors,
    subjects,
    posts,
    gallery
  }, path.join(ROOT_DIR, 'index.html'));

  // 2. doctors.html
  await renderPage('doctors', {
    ...globalData,
    doctors
  }, path.join(ROOT_DIR, 'doctors.html'));

  // 3. location.html
  await renderPage('location', {
    ...globalData
  }, path.join(ROOT_DIR, 'location.html'));

  // 4. non-covered.html
  await renderPage('non-covered', {
    ...globalData,
    nonCovered
  }, path.join(ROOT_DIR, 'non-covered.html'));

  // 5. subjects.html
  await renderPage('subjects', {
    ...globalData,
    subjects
  }, path.join(ROOT_DIR, 'subjects.html'));

  // 6. posts.html
  await renderPage('posts', {
    ...globalData,
    posts
  }, path.join(ROOT_DIR, 'posts.html'));

  console.log('GitHub Pages static build completed successfully!');
}

build().catch(err => {
  console.error('Build error:', err);
  process.exit(1);
});
