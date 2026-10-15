const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readJson(filename, defaultValue) {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    writeJson(filename, defaultValue);
    return defaultValue;
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${filename}:`, err);
    return defaultValue;
  }
}

function writeJson(filename, data) {
  const filePath = path.join(DATA_DIR, filename);
  const tempPath = `${filePath}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tempPath, filePath);
}

// Default Settings
const defaultSettings = {
  hospitalName: '연세나무정신건강의학과',
  tagline: '아이마다 타고난 바탕이 다릅니다. 기질을 알면 육아가 달라집니다.',
  adminPassword: 'admin1234', // Default password for initial setup
  hero: {
    badgeText: '아이마다 타고난 바탕이 다릅니다 · 기질을 알면 육아가 달라집니다',
    mainTitle: '아이의 성장을 기다려주는 마음의 숲,\n연세나무정신건강의학과',
    subTitle: '우리 아이, 왜 이럴까 자책하며 홀로 힘들어하셨나요? 부모님의 탓이 아닙니다. 《기질육아》 저자 원장단과 1급 전문 치료사진이 아이의 기질을 깊이 이해하고 덜 싸우며 더 잘 사랑할 수 있도록 따뜻한 위안과 맞춤 양육의 답을 찾아드립니다.',
    backgroundImage: '', // if empty, uses default CSS gradient/pattern
    btnText1: '병원 철학 & 도서 소개',
    btnLink1: '#philosophy',
    btnText2: '의료진 소개',
    btnLink2: '/doctors'
  },
  urgentNotice: {
    enabled: false,
    badge: '진료 안내',
    text: '',
    link: '/location'
  },
  // Section Ordering and Visibility
  sections: [
    { id: 'hero', name: '메인 히어로 비주얼 (J-Min Full-Width)', visible: true, order: 1 },
    { id: 'philosophy', name: '병원 철학 & 기질육아 부모 위안 메시지', visible: true, order: 2 },
    { id: 'book', name: '원장단 저서 《기질육아》 특별 소개', visible: true, order: 3 },
    { id: 'features', name: '연세나무 3대 핵심 가치 (병원 소개)', visible: true, order: 4 },
    { id: 'banners', name: '시그니처 4열 클리닉 바로가기 카드', visible: true, order: 5 },
    { id: 'gallery', name: '병원 둘러보기 (시설 사진 갤러리)', visible: true, order: 6 },
    { id: 'non-covered', name: '비급여 항목 안내 (진료비 고지)', visible: true, order: 7 },
    { id: 'location', name: '오시는 길 & 진료시간 (통합 인포)', visible: true, order: 8 }
  ],
  branches: [
    {
      id: 'hanam',
      name: '하남미사 클리닉',
      tel: '031-795-5272',
      address: '경기도 하남시 미사강변남로 103 (미사역 8번 출구 인근)',
      parking: '건물 지하 주차장 완비 (진료 환자 무료 주차 지원)',
      statusBadge: '',
      statusClass: '',
      statusMessage: '',
      hours: {
        weekday: '월~금 : 09:00 ~ 18:30',
        saturday: '토요일 : 휴진',
        lunch: '점심시간 : 13:00 ~ 14:00',
        holiday: '토요일, 일요일 및 공휴일 휴진'
      },
      mapUrl: 'https://map.naver.com/p/directions/-/127.1931918,37.5609174,%EC%97%B0%EC%84%B8%EB%82%98%EB%AC%B4%EC%A0%95%EC%8B%A0%EA%B1%B4%EA%B0%95%EC%9D%98%ED%95%99%EA%B3%BC%20%ED%95%98%EB%82%A8%EB%AF%B8%EC%82%AC%ED%81%B4%EB%A6%AC%EB%8B%89,,ADDRESS_POI/-/car'
    },
    {
      id: 'sejong',
      name: '세종 클리닉',
      tel: '0507-1320-5272',
      address: '세종특별자치시 나성북로 30 (어반아트리움 인근)',
      parking: '건물 내 주차 가능',
      statusBadge: '',
      statusClass: '',
      statusMessage: '',
      hours: {
        weekday: '평일 : 09:00 ~ 18:30',
        saturday: '토요일 : 휴진',
        lunch: '점심시간 : 13:00 ~ 14:00',
        holiday: '토요일, 일요일 및 공휴일 휴진'
      },
      mapUrl: 'https://map.naver.com/p/directions/-/127.2601756,36.4891287,%EC%97%B0%EC%84%B8%EB%82%98%EB%AC%B4%EC%A0%95%EC%8B%A0%EA%B1%B4%EA%B0%95%EC%9D%98%ED%95%99%EA%B3%BC%20%EC%84%B8%EC%A2%85%ED%81%B4%EB%A6%AC%EB%8B%89,,ADDRESS_POI/-/car'
    }
  ]
};

// Default Doctors & Therapists
const defaultDoctors = [
  {
    id: 'doc-1',
    name: '차지민',
    role: '대표원장',
    type: 'doctor', // 'doctor' or 'therapist'
    branch: 'hanam', // 'hanam', 'sejong', 'all'
    title: '소아청소년정신의학 세부전문의 / 정신건강의학과 전문의',
    image: '/images/doctors/doc_chajimin.jpg',
    career: [
      '소아청소년정신의학 세부전문의',
      '정신건강의학과 전문의',
      '도서 《기질육아》 공동 저자',
      '소아전문 분과 심층 임상 및 기질 맞춤 치료',
      '대한소아청소년정신의학회 정회원',
      '대한신경정신의학회 정회원'
    ],
    intro: '아이들의 작은 목소리에도 귀 기울이며, 부모님과 함께 건강한 성장을 도모하는 든든한 동반자가 되겠습니다.',
    order: 1
  },
  {
    id: 'doc-2',
    name: '김남욱',
    role: '대표원장',
    type: 'doctor',
    branch: 'hanam',
    title: '소아청소년정신의학 세부전문의 / 정신건강의학과 전문의',
    image: '/images/doctors/doc_kimnamwook.jpg',
    career: [
      '소아청소년정신의학 세부전문의',
      '정신건강의학과 전문의',
      'SBS Plus [우리 아이가 달라졌어요 리턴즈] EP.11 현장 진단 및 솔루션 자문의',
      '도서 《기질육아》 공동 저자',
      '소아전문 분과 심층 임상 및 행동·정서 코칭',
      '대한소아청소년정신의학회 정회원',
      '대한신경정신의학회 정회원'
    ],
    intro: '체계적인 원인 진단과 따뜻한 상담으로 온 가족의 마음에 평안을 찾아드립니다.',
    order: 2
  },
  {
    id: 'doc-3',
    name: '김현진',
    role: '대표원장',
    type: 'doctor',
    branch: 'sejong',
    title: '소아청소년정신의학 세부전문의 / 정신건강의학과 전문의',
    image: '/images/doctors/doc_kimhyunjin.jpg',
    career: [
      '소아청소년정신의학 세부전문의',
      '정신건강의학과 전문의',
      '소아전문 분과 심층 임상 및 발달·언어 클리닉',
      '소아 정서발달 및 성인 우울·불안 클리닉 전문',
      '대한소아청소년정신의학회 정회원',
      '대한신경정신의학회 정회원'
    ],
    intro: '세종 지역 가족분들을 위한 따뜻하고 전문적인 마음 치유 공간을 만들어가겠습니다.',
    order: 3
  },
  {
    id: 'staff-1',
    name: '정지연',
    role: '임상심리전문가',
    type: 'therapist',
    branch: 'hanam',
    title: '임상심리전문가 (한국임상심리학회) / 임상심리사 1급 (한국산업인력공단)',
    image: '/images/doctors/staff_jungjiyeon.jpg',
    career: [
      '한국임상심리학회 공인 임상심리전문가',
      '한국산업인력공단 임상심리사 1급',
      '종합심리평가(Full Battery), 아동·청소년 인지 및 정서 평가 전문',
      '병원 및 상담센터 심리평가 임상 경력'
    ],
    intro: '공인된 전문 평가 도구를 통해 마음의 상태를 깊이 있고 객관적으로 탐색합니다.',
    order: 4
  },
  {
    id: 'staff-2',
    name: '이선경',
    role: '정신건강임상심리사',
    type: 'therapist',
    branch: 'hanam',
    title: '정신건강임상심리사 1급 (보건복지부) / 임상심리전문가 (한국임상심리학회)',
    image: '/images/doctors/staff_leesunkyung.jpg',
    career: [
      '보건복지부 공인 정신건강임상심리사 1급',
      '한국임상심리학회 공인 임상심리전문가',
      '대학병원 정신건강의학과 임상심리 수련',
      '지능평가, 웩슬러 검사, 정서 및 성격 검사 전문'
    ],
    intro: '아이와 성인의 내면을 따뜻하고 정밀하게 살펴 최적의 치료 방향을 제시합니다.',
    order: 5
  },
  {
    id: 'staff-3',
    name: '박지연',
    role: '언어치료사',
    type: 'therapist',
    branch: 'hanam',
    title: '언어재활사 1급 (보건복지부) / 인지학습상담전문가 2급',
    image: '/images/doctors/staff_parkjiyeon.jpg',
    career: [
      '보건복지부 공인 언어재활사 1급',
      '대한학습치료사협회 인지학습상담전문가 2급',
      '언어발달지연, 조음치료, 화용언어 및 사회성 그룹 치료 전문',
      '아동 발달센터 및 병원 언어치료 임상 경력 다수'
    ],
    intro: '즐거운 소통을 통해 아이가 스스로 세상과 당당하게 이야기할 수 있도록 돕습니다.',
    order: 6
  }
];

// Default Subjects
const defaultSubjects = [
  {
    id: 'sub-1',
    category: '소아·청소년',
    title: '발달 및 언어지연',
    desc: '자폐스펙트럼장애, 상호작용의 어려움, 언어발달지연 아동을 위한 정밀 발달평가와 1:1 맞춤 언어·놀이 치료',
    icon: '🌱',
    image: '',
    tags: ['언어재활 1급', '발달평가', '놀이치료', '사회성그룹'],
    order: 1
  },
  {
    id: 'sub-2',
    category: '소아·청소년',
    title: '소아청소년 ADHD & 틱/뚜렛',
    desc: '주의집중력 결핍, 과잉행동, 충동성, 틱 증상에 대해 전산화 종합주의력검사(CAT)를 통한 정확한 원인 규명 및 치료',
    icon: '⚡',
    image: '',
    tags: ['주의력검사(CAT)', '약물치료', '행동수정', '인지치료'],
    order: 2
  },
  {
    id: 'sub-3',
    category: '성인 클리닉',
    title: '우울증 & 공황장애',
    desc: '마음의 감기라 불리는 우울증, 이유 없는 불안과 가슴 두근거림의 공황발작을 전문의의 심층 면담과 안정적 케어로 회복',
    icon: '🩺',
    image: '',
    tags: ['심층면담', '공황치료', '불안장애', '약물요법'],
    order: 3
  },
  {
    id: 'sub-4',
    category: '성인 클리닉',
    title: '수면장애 & 스트레스/번아웃',
    desc: '잠들기 어려운 불면증, 잦은 각성, 직무 스트레스로 인한 번아웃 증후군 환자를 위한 수면 리듬 재정립 및 스트레스 평가',
    icon: '🌙',
    image: '',
    tags: ['불면증치료', '자율신경검사', '수면위생', '번아웃케어'],
    order: 4
  },
  {
    id: 'sub-5',
    category: '심리평가센터',
    title: '종합심리평가 (Full Battery)',
    desc: '보건복지부 1급 임상심리전문가가 진행하는 지능, 정서, 사고, 성격, 대인관계 양상에 대한 체계적인 정밀 심리평가',
    icon: '🧠',
    image: '',
    tags: ['1급임상심리전문가', '웩슬러지능', '정서평가', '다면적인성검사'],
    order: 5
  },
  {
    id: 'sub-6',
    category: '상담 & 코칭',
    title: '학습상담 & 부모 양육코칭',
    desc: '난독증, 시험불안, 등교거부 및 아이 양육에 지친 부모님을 위한 실질적인 훈육 코칭과 마음 치유 솔루션',
    icon: '📚',
    image: '',
    tags: ['부모양육상담', '난독증케어', '학습치료', '정서안정'],
    order: 6
  }
];

// Default Posts
const defaultPosts = [
  {
    id: 'post-1',
    category: '공지사항',
    title: '미사연세나무정신과 초진 접수 및 진료 일정 안내',
    content: '저희 병원을 찾아주셔서 진심으로 감사드립니다.\n\n아쉽게도 현재 미사연세나무정신과는 환자분들께 더욱 깊이 있는 진료를 제공해 드리기 위해 진료시간이 부족하여 초진 접수를 받지 못하고 있습니다.\n\n※ 당일 방문 접수도 불가하오니 방문 전 확인을 부탁드립니다.\n\n재진 예약 환자분들께서는 예약된 일시에 맞추어 방문해 주시기 바랍니다.\n이용에 불편을 드려 대단히 죄송합니다.',
    date: '2026-10-10',
    pinned: true,
    image: '',
    views: 412
  },
  {
    id: 'post-2',
    category: '언론보도',
    title: '[방송출연] SBS Plus \'우리 아이가 달라졌어요 리턴즈\' 김남욱 원장 출연',
    content: 'SBS Plus \'우리 아이가 달라졌어요 리턴즈\' EP.11에 연세나무정신건강의학과 김남욱 원장님이 현장 자문의로 참여하셨습니다.\n\n쌍둥이 형제의 속마음을 듣고 정서적 갈등을 진단하여 부모님께 명쾌한 양육 솔루션을 전달해 드렸습니다.\n아이들의 건강한 성장을 위해 언제나 최선을 다하겠습니다.',
    date: '2026-09-15',
    pinned: true,
    image: '',
    views: 890
  },
  {
    id: 'post-3',
    category: '마음건강 칼럼',
    title: '우리 아이가 산만할 때, ADHD일까요? 주의력 결핍 신호 체크',
    content: '새 학기가 시작되거나 단체 생활을 시작하면서 "선생님께 자주 지적을 받아요", "자리에 가만히 앉아있지 못해요"라는 고민으로 병원을 찾는 부모님들이 많습니다.\n\n단순한 활발함과 ADHD의 차이는 집중 지속 시간과 충동성 조절 능력에서 나타납니다. 조기에 정확한 검사를 받는 것이 아이의 자존감을 지키는 지름길입니다.',
    date: '2026-08-20',
    pinned: false,
    image: '',
    views: 520
  }
];

// Default Gallery (Hospital interior & rooms)
const defaultGallery = [
  {
    id: 'gal-1',
    title: '따뜻하고 아늑한 대기 공간',
    category: '대기실',
    image: '/images/gallery/gallery_lounge.jpg',
    order: 1
  },
  {
    id: 'gal-2',
    title: '정갈한 병원 입구 및 안내데스크',
    category: '병원 입구',
    image: '/images/gallery/gallery_entrance.jpg',
    order: 2
  },
  {
    id: 'gal-3',
    title: '마음의 안정을 주는 힐링 존',
    category: '원내 전경',
    image: '/images/gallery/gallery_healing.jpg',
    order: 3
  },
  {
    id: 'gal-4',
    title: '프라이빗 심층 진료 및 치료실',
    category: '진료실/치료실',
    image: '/images/gallery/gallery_corridor.jpg',
    order: 4
  }
];

// Database API
module.exports = {
  // Settings
  getSettings: () => readJson('settings.json', defaultSettings),
  saveSettings: (data) => writeJson('settings.json', data),

  // Doctors
  getDoctors: () => readJson('doctors.json', defaultDoctors).sort((a, b) => (a.order || 0) - (b.order || 0)),
  getDoctorById: (id) => {
    const list = readJson('doctors.json', defaultDoctors);
    return list.find(d => d.id === id);
  },
  saveDoctor: (doctor) => {
    const list = readJson('doctors.json', defaultDoctors);
    const idx = list.findIndex(d => d.id === doctor.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...doctor };
    } else {
      list.push(doctor);
    }
    writeJson('doctors.json', list);
    return doctor;
  },
  deleteDoctor: (id) => {
    const list = readJson('doctors.json', defaultDoctors);
    const filtered = list.filter(d => d.id !== id);
    writeJson('doctors.json', filtered);
  },

  // Subjects
  getSubjects: () => readJson('subjects.json', defaultSubjects).sort((a, b) => (a.order || 0) - (b.order || 0)),
  saveSubject: (subject) => {
    const list = readJson('subjects.json', defaultSubjects);
    const idx = list.findIndex(s => s.id === subject.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...subject };
    } else {
      list.push(subject);
    }
    writeJson('subjects.json', list);
    return subject;
  },
  deleteSubject: (id) => {
    const list = readJson('subjects.json', defaultSubjects);
    const filtered = list.filter(s => s.id !== id);
    writeJson('subjects.json', filtered);
  },

  // Posts
  getPosts: () => readJson('posts.json', defaultPosts).sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || new Date(b.date) - new Date(a.date)),
  getPostById: (id) => {
    const list = readJson('posts.json', defaultPosts);
    return list.find(p => p.id === id);
  },
  savePost: (post) => {
    const list = readJson('posts.json', defaultPosts);
    const idx = list.findIndex(p => p.id === post.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...post };
    } else {
      list.push(post);
    }
    writeJson('posts.json', list);
    return post;
  },
  deletePost: (id) => {
    const list = readJson('posts.json', defaultPosts);
    const filtered = list.filter(p => p.id !== id);
    writeJson('posts.json', filtered);
  },

  // Gallery
  getGallery: () => readJson('gallery.json', defaultGallery).sort((a, b) => (a.order || 0) - (b.order || 0)),
  saveGalleryItem: (item) => {
    const list = readJson('gallery.json', defaultGallery);
    const idx = list.findIndex(g => g.id === item.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...item };
    } else {
      list.push(item);
    }
    writeJson('gallery.json', list);
    return item;
  },
  deleteGalleryItem: (id) => {
    const list = readJson('gallery.json', defaultGallery);
    const filtered = list.filter(g => g.id !== id);
    writeJson('gallery.json', filtered);
  },

  // Non-Covered Fees
  getNonCovered: () => readJson('non-covered.json', { notice: {}, items: [] })
};
