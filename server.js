const express = require('express');
const session = require('express-session');
const path = require('path');
const db = require('./lib/db');
const upload = require('./lib/upload');

const app = express();
const PORT = process.env.PORT || 3000;

// Setup Template Engine & Static directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session configuration for Admin
app.use(session({
  secret: 'yonsei-tree-psychiatry-secret-key-2026',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 1 day
}));

// Global template variables middleware
app.use((req, res, next) => {
  res.locals.settings = db.getSettings();
  res.locals.isAdmin = req.session && req.session.isAdmin;
  next();
});

// Admin authentication middleware
function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) {
    return next();
  }
  res.redirect('/admin/login');
}

// ============================================================
// PUBLIC ROUTES
// ============================================================

// 1. First Page (Homepage) - Dynamic ordering & photos
app.get('/', (req, res) => {
  const settings = db.getSettings();
  const doctors = db.getDoctors();
  const subjects = db.getSubjects();
  const posts = db.getPosts();
  const gallery = db.getGallery();

  res.render('index', {
    settings,
    doctors,
    subjects,
    posts,
    gallery
  });
});

// 2. Doctors & Therapists
app.get('/doctors', (req, res) => {
  const doctors = db.getDoctors();
  res.render('doctors', { doctors });
});

// 3. Medical Subjects
app.get('/subjects', (req, res) => {
  const subjects = db.getSubjects();
  res.render('subjects', { subjects });
});

// 4. Posts & Notice List
app.get('/posts', (req, res) => {
  const posts = db.getPosts();
  res.render('posts', { posts });
});

// 5. Post Detail
app.get('/posts/:id', (req, res) => {
  const post = db.getPostById(req.params.id);
  if (!post) {
    return res.status(404).send('게시글을 찾을 수 없습니다.');
  }
  // Increment view count
  post.views = (post.views || 0) + 1;
  db.savePost(post);

  res.render('post-detail', { post });
});

// 6. Location & Timetable
app.get('/location', (req, res) => {
  res.render('location');
});

// 7. Non-covered items (비급여 항목 안내)
app.get('/non-covered', (req, res) => {
  const nonCovered = db.getNonCovered();
  res.render('non-covered', { nonCovered });
});

// ============================================================
// ADMIN ROUTES (조건 1 & 조건 3)
// ============================================================

// Admin Login
app.get('/admin/login', (req, res) => {
  if (req.session && req.session.isAdmin) {
    return res.redirect('/admin');
  }
  res.render('admin/login', { error: null });
});

app.post('/admin/login', (req, res) => {
  const { password } = req.body;
  const settings = db.getSettings();
  const validPassword = settings.adminPassword || 'admin1234';

  if (password === validPassword) {
    req.session.isAdmin = true;
    res.redirect('/admin');
  } else {
    res.render('admin/login', { error: '비밀번호가 올바르지 않습니다. (초기 비밀번호: admin1234)' });
  }
});

// Admin Logout
app.get('/admin/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/admin/login');
  });
});

// Admin Dashboard
app.get('/admin', requireAdmin, (req, res) => {
  const settings = db.getSettings();
  const doctors = db.getDoctors();
  const posts = db.getPosts();
  const gallery = db.getGallery();

  const totalSectionsCount = (settings.sections || []).length;
  const activeSectionsCount = (settings.sections || []).filter(s => s.visible).length;

  res.render('admin/dashboard', {
    settings,
    doctorsCount: doctors.length,
    postsCount: posts.length,
    galleryCount: gallery.length,
    totalSectionsCount,
    activeSectionsCount
  });
});

// --- 조건 3: 첫 페이지 배치 & 사진 등록 ---
app.get('/admin/homepage', requireAdmin, (req, res) => {
  const settings = db.getSettings();
  const success = req.query.success ? '첫 페이지 배치 및 사진 설정이 성공적으로 저장되었습니다.' : null;
  res.render('admin/homepage', { settings, success });
});

app.post('/admin/homepage', requireAdmin, upload.single('heroImage'), (req, res) => {
  const settings = db.getSettings();

  // 1. Hero settings
  settings.hero = settings.hero || {};
  settings.hero.badgeText = req.body.heroBadge || '';
  settings.hero.mainTitle = req.body.heroMainTitle || '';
  settings.hero.subTitle = req.body.heroSubTitle || '';
  settings.hero.btnText1 = req.body.heroBtnText1 || '진료과목 안내';

  if (req.file) {
    settings.hero.backgroundImage = '/uploads/' + req.file.filename;
  } else if (req.body.removeHeroImage === '1') {
    settings.hero.backgroundImage = '';
  }

  // 2. Urgent notice
  settings.urgentNotice = settings.urgentNotice || {};
  settings.urgentNotice.enabled = req.body.urgentEnabled === '1';
  settings.urgentNotice.badge = req.body.urgentBadge || '진료 안내';
  settings.urgentNotice.text = req.body.urgentText || '';

  // 3. Section ordering and visibility
  if (Array.isArray(settings.sections)) {
    settings.sections.forEach(sec => {
      const orderVal = parseInt(req.body['order_' + sec.id], 10);
      if (!isNaN(orderVal)) {
        sec.order = orderVal;
      }
      sec.visible = req.body['visible_' + sec.id] === '1';
    });
  }

  db.saveSettings(settings);
  res.redirect('/admin/homepage?success=1');
});

// --- 조건 1: 의사/치료사 관리 ---
app.get('/admin/doctors', requireAdmin, (req, res) => {
  const doctors = db.getDoctors();
  const success = req.query.success ? '의료진 정보가 성공적으로 반영되었습니다.' : null;
  res.render('admin/doctors', { doctors, success });
});

app.get('/admin/doctors/new', requireAdmin, (req, res) => {
  res.render('admin/doctor-form', { isEdit: false, doctor: { order: db.getDoctors().length + 1 } });
});

app.post('/admin/doctors', requireAdmin, upload.single('doctorImage'), (req, res) => {
  const careerLines = (req.body.career || '').split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const newDoctor = {
    id: 'doc-' + Date.now(),
    name: req.body.name,
    role: req.body.role,
    type: req.body.type || 'doctor',
    branch: req.body.branch || 'hanam',
    title: req.body.title,
    intro: req.body.intro || '',
    career: careerLines,
    order: parseInt(req.body.order, 10) || 1,
    image: req.file ? '/uploads/' + req.file.filename : ''
  };

  db.saveDoctor(newDoctor);
  res.redirect('/admin/doctors?success=1');
});

app.get('/admin/doctors/:id/edit', requireAdmin, (req, res) => {
  const doctor = db.getDoctorById(req.params.id);
  if (!doctor) return res.redirect('/admin/doctors');
  res.render('admin/doctor-form', { isEdit: true, doctor });
});

app.post('/admin/doctors/:id', requireAdmin, upload.single('doctorImage'), (req, res) => {
  const existing = db.getDoctorById(req.params.id);
  if (!existing) return res.redirect('/admin/doctors');

  const careerLines = (req.body.career || '').split('\n').map(l => l.trim()).filter(l => l.length > 0);
  let image = existing.image || '';

  if (req.file) {
    image = '/uploads/' + req.file.filename;
  } else if (req.body.removeImage === '1') {
    image = '';
  }

  const updatedDoctor = {
    ...existing,
    name: req.body.name,
    role: req.body.role,
    type: req.body.type,
    branch: req.body.branch,
    title: req.body.title,
    intro: req.body.intro || '',
    career: careerLines,
    order: parseInt(req.body.order, 10) || existing.order,
    image
  };

  db.saveDoctor(updatedDoctor);
  res.redirect('/admin/doctors?success=1');
});

app.post('/admin/doctors/:id/delete', requireAdmin, (req, res) => {
  db.deleteDoctor(req.params.id);
  res.redirect('/admin/doctors?success=1');
});

// --- 조건 1: 게시글 & 공지사항 관리 ---
app.get('/admin/posts', requireAdmin, (req, res) => {
  const posts = db.getPosts();
  const success = req.query.success ? '게시글이 성공적으로 반영되었습니다.' : null;
  res.render('admin/posts', { posts, success });
});

app.get('/admin/posts/new', requireAdmin, (req, res) => {
  res.render('admin/post-form', { isEdit: false, post: {} });
});

app.post('/admin/posts', requireAdmin, upload.single('postImage'), (req, res) => {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];

  const newPost = {
    id: 'post-' + Date.now(),
    category: req.body.category || '공지사항',
    title: req.body.title,
    content: req.body.content,
    pinned: req.body.pinned === '1',
    date: dateStr,
    views: 0,
    image: req.file ? '/uploads/' + req.file.filename : ''
  };

  db.savePost(newPost);
  res.redirect('/admin/posts?success=1');
});

app.get('/admin/posts/:id/edit', requireAdmin, (req, res) => {
  const post = db.getPostById(req.params.id);
  if (!post) return res.redirect('/admin/posts');
  res.render('admin/post-form', { isEdit: true, post });
});

app.post('/admin/posts/:id', requireAdmin, upload.single('postImage'), (req, res) => {
  const existing = db.getPostById(req.params.id);
  if (!existing) return res.redirect('/admin/posts');

  let image = existing.image || '';
  if (req.file) {
    image = '/uploads/' + req.file.filename;
  } else if (req.body.removeImage === '1') {
    image = '';
  }

  const updatedPost = {
    ...existing,
    category: req.body.category,
    title: req.body.title,
    content: req.body.content,
    pinned: req.body.pinned === '1',
    image
  };

  db.savePost(updatedPost);
  res.redirect('/admin/posts?success=1');
});

app.post('/admin/posts/:id/delete', requireAdmin, (req, res) => {
  db.deletePost(req.params.id);
  res.redirect('/admin/posts?success=1');
});

// --- 조건 3: 시설 사진 갤러리 관리 ---
app.get('/admin/gallery', requireAdmin, (req, res) => {
  const gallery = db.getGallery();
  const success = req.query.success ? '시설 사진이 성공적으로 반영되었습니다.' : null;
  res.render('admin/gallery', { gallery, success });
});

app.post('/admin/gallery', requireAdmin, upload.single('galleryImage'), (req, res) => {
  if (req.file) {
    const newItem = {
      id: 'gal-' + Date.now(),
      title: req.body.title || '원내 시설 공간',
      category: req.body.category || '시설',
      image: '/uploads/' + req.file.filename,
      order: db.getGallery().length + 1
    };
    db.saveGalleryItem(newItem);
  }
  res.redirect('/admin/gallery?success=1');
});

app.post('/admin/gallery/:id/delete', requireAdmin, (req, res) => {
  db.deleteGalleryItem(req.params.id);
  res.redirect('/admin/gallery?success=1');
});

// --- 지점 & 진료일정 관리 ---
app.get('/admin/branches', requireAdmin, (req, res) => {
  const settings = db.getSettings();
  const success = req.query.success ? '지점 설정이 성공적으로 저장되었습니다.' : null;
  res.render('admin/branches', { settings, success });
});

app.post('/admin/branches', requireAdmin, (req, res) => {
  const settings = db.getSettings();
  const branchIds = req.body.branchId || [];

  (Array.isArray(branchIds) ? branchIds : [branchIds]).forEach(id => {
    const b = (settings.branches || []).find(item => item.id === id);
    if (b) {
      b.statusBadge = req.body['statusBadge_' + id] || b.statusBadge;
      b.statusClass = req.body['statusClass_' + id] || b.statusClass;
      b.statusMessage = req.body['statusMessage_' + id] || b.statusMessage;
      b.tel = req.body['tel_' + id] || b.tel;
      b.address = req.body['address_' + id] || b.address;
      b.parking = req.body['parking_' + id] || b.parking;
      b.hours = b.hours || {};
      b.hours.weekday = req.body['weekday_' + id] || b.hours.weekday;
      b.hours.saturday = req.body['saturday_' + id] || b.hours.saturday;
      b.hours.lunch = req.body['lunch_' + id] || b.hours.lunch;
      b.hours.holiday = req.body['holiday_' + id] || b.hours.holiday;
    }
  });

  db.saveSettings(settings);
  res.redirect('/admin/branches?success=1');
});

// Start server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`[연세나무정신건강의학과] 웹 서버가 실행되었습니다!`);
  console.log(`- 홈페이지 주소: http://localhost:${PORT}`);
  console.log(`- 관리자 주소:   http://localhost:${PORT}/admin`);
  console.log(`- 관리자 비밀번호: admin1234`);
  console.log(`=======================================================`);
});
