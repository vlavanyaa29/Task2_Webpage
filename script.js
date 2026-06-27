/* ─────────────────────────────────────────
   1. NAVIGATION
───────────────────────────────────────── */

function showSection(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(id);
  if (target) target.classList.add('active');
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  const activeLink = document.getElementById('nav-' + id);
  if (activeLink) activeLink.classList.add('active');
  document.querySelector('.nav-links').classList.remove('open');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleMenu() {
  document.querySelector('.nav-links').classList.toggle('open');
}

/* ─────────────────────────────────────────
   2. CONTACT FORM VALIDATION & SUBMIT
───────────────────────────────────────── */

const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', function (e) {
  e.preventDefault();
  if (validateForm()) submitForm();
});

function validateForm() {
  let valid = true;
  clearErrors();

  const name    = document.getElementById('fname').value.trim();
  const email   = document.getElementById('email').value.trim();
  const phone   = document.getElementById('phone').value.trim();
  const msg     = '';
  const college = document.getElementById('college').value.trim();
  const gender  = document.getElementById('gender').value;

  if (name.length < 3) {
    showError('err-name', 'Please enter your full name (min 3 characters).');
    valid = false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showError('err-email', 'Please enter a valid email address.');
    valid = false;
  }

  const phoneRegex = /^[6-9]\d{9}$/;
  if (!phoneRegex.test(phone)) {
    showError('err-phone', 'Enter a valid 10-digit Indian mobile number.');
    valid = false;
  }

  if (college.length < 3) {
    showError('err-college', 'Please enter your college name.');
    valid = false;
  }

  if (!gender) {
    showError('err-gender', 'Please select your gender.');
    valid = false;
  }



  return valid;
}

function showError(id, message) {
  const el = document.getElementById(id);
  if (el) el.textContent = message;
}

function clearErrors() {
  ['err-name', 'err-email', 'err-phone', 'err-college', 'err-gender'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  });
  document.getElementById('successMsg').textContent = '';
}

function submitForm() {
  const name  = document.getElementById('fname').value.trim();
  const email = document.getElementById('email').value.trim();

  // Save current user's email as key (to separate each user's data)
  sessionStorage.setItem('currentUser', email);
  sessionStorage.setItem('userName', name);

  // Load this user's tasks from localStorage
  loadUserTasks(email);

  // Load this user's images from sessionStorage
  loadUserImages(email);

  const successMsg = document.getElementById('successMsg');
  successMsg.textContent = '✅ Form submitted successfully! Redirecting to your dashboard…';
  contactForm.querySelector('button[type="submit"]').disabled = true;

  // Launch confetti immediately on submit
  launchConfetti();

  setTimeout(() => {
    const greet = document.getElementById('dashGreet');
    if (greet) greet.textContent = `👋 Hi ${name}, welcome to your Dashboard!`;

    showSection('dashboard');
    renderTasks();
    renderGallery();
    updateGalleryPreview();

    contactForm.reset();
    clearErrors();
    contactForm.querySelector('button[type="submit"]').disabled = false;
  }, 1500);
}

/* ─────────────────────────────────────────
   3. TO-DO LIST
   Tasks → localStorage (per user, permanent)
───────────────────────────────────────── */

let tasks = [];

// Get current user's localStorage key
function taskKey() {
  const email = sessionStorage.getItem('currentUser') || 'guest';
  return `tasks_${email}`;
}

// Load tasks for this user from localStorage
function loadUserTasks(email) {
  const key   = `tasks_${email}`;
  const saved = localStorage.getItem(key);
  tasks = saved ? JSON.parse(saved) : [];
}

// Save current tasks to localStorage under this user's key
function saveUserTasks() {
  localStorage.setItem(taskKey(), JSON.stringify(tasks));
}

function addTask() {
  const input = document.getElementById('taskInput');
  const text  = input.value.trim();

  if (!text) {
    input.focus();
    input.style.borderColor = 'var(--danger)';
    setTimeout(() => input.style.borderColor = '', 1200);
    return;
  }

  tasks.push({ id: Date.now(), text, done: false });
  input.value = '';
  input.focus();
  saveUserTasks();
  renderTasks();
}

document.getElementById('taskInput').addEventListener('keydown', function (e) {
  if (e.key === 'Enter') addTask();
});

function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) task.done = !task.done;
  saveUserTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveUserTasks();
  renderTasks();
}

function renderTasks() {
  const list     = document.getElementById('taskList');
  const emptyMsg = document.getElementById('emptyTodo');
  const countEl  = document.getElementById('taskCount');

  list.innerHTML = '';

  if (tasks.length === 0) {
    emptyMsg.style.display = 'block';
    countEl.textContent = '0';
    return;
  }

  emptyMsg.style.display = 'none';
  countEl.textContent = tasks.length;

  tasks.forEach(task => {
    const li = document.createElement('li');
    li.className = 'task-item' + (task.done ? ' done' : '');
    li.innerHTML = `
      <span class="task-text">${escapeHtml(task.text)}</span>
      <button class="check-btn" onclick="toggleTask(${task.id})" title="${task.done ? 'Mark undone' : 'Mark done'}">
        <i class="fas fa-check"></i>
      </button>
      <button class="del-btn" onclick="deleteTask(${task.id})" title="Delete task">
        <i class="fas fa-trash"></i>
      </button>
    `;
    list.appendChild(li);
  });

  updateGalleryPreview();
}

function updateTaskCount() {
  document.getElementById('taskCount').textContent = tasks.length;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

/* ─────────────────────────────────────────
   4. IMAGE GALLERY
   Images → sessionStorage (per user, tab only)
───────────────────────────────────────── */

let images = [];

// Get current user's sessionStorage key for images
function imageKey() {
  const email = sessionStorage.getItem('currentUser') || 'guest';
  return `images_${email}`;
}

// Load images for this user from sessionStorage
function loadUserImages(email) {
  const key   = `images_${email}`;
  const saved = sessionStorage.getItem(key);
  images = saved ? JSON.parse(saved) : [];
}

// Save current images to sessionStorage under this user's key
function saveUserImages() {
  sessionStorage.setItem(imageKey(), JSON.stringify(images));
}

function handleUpload(event) {
  const files = Array.from(event.target.files);
  if (!files.length) return;

  files.forEach(file => {
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      images.push({ id: Date.now() + Math.random(), src: e.target.result, name: file.name });
      saveUserImages();
      renderGallery();
      updateGalleryPreview();
    };
    reader.readAsDataURL(file);
  });

  event.target.value = '';
}

function deleteImage(id) {
  images = images.filter(img => img.id !== id);
  saveUserImages();
  renderGallery();
  updateGalleryPreview();
}

function clearGallery() {
  if (images.length === 0) return;
  if (!confirm('Delete all images from the gallery?')) return;
  images = [];
  saveUserImages();
  renderGallery();
  updateGalleryPreview();
}

function renderGallery() {
  const grid  = document.getElementById('galleryGrid');
  const empty = document.getElementById('galleryEmpty');

  grid.querySelectorAll('.gallery-item').forEach(el => el.remove());

  if (images.length === 0) {
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';

  images.forEach(img => {
    const div = document.createElement('div');
    div.className = 'gallery-item';
    div.innerHTML = `
      <img src="${img.src}" alt="${escapeHtml(img.name)}" onclick="openLightbox('${img.id}')" />
      <button class="img-del" onclick="deleteImage(${img.id})" title="Remove image">
        <i class="fas fa-times"></i>
      </button>
    `;
    grid.appendChild(div);
  });
}

function updateGalleryPreview() {
  const preview = document.getElementById('galleryPreview');
  preview.innerHTML = '';

  images.slice(0, 6).forEach(img => {
    const el = document.createElement('img');
    el.src   = img.src;
    el.alt   = img.name;
    el.title = 'Click to open gallery';
    el.onclick = () => showSection('gallery');
    preview.appendChild(el);
  });
}

/* ── Lightbox ── */

const lightbox = document.createElement('div');
lightbox.className = 'lightbox';
lightbox.innerHTML = `
  <button class="lightbox-close" onclick="closeLightbox()"><i class="fas fa-times"></i></button>
  <img id="lightboxImg" src="" alt="Full preview" />
`;
document.body.appendChild(lightbox);

lightbox.addEventListener('click', function (e) {
  if (e.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') closeLightbox();
});

function openLightbox(id) {
  const img = images.find(i => String(i.id) === String(id));
  if (!img) return;
  document.getElementById('lightboxImg').src = img.src;
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

/* ─────────────────────────────────────────
   INIT — restore session if returning user
───────────────────────────────────────── */
(function init() {
  const name  = sessionStorage.getItem('userName');
  const email = sessionStorage.getItem('currentUser');

  if (name && email) {
    const greet = document.getElementById('dashGreet');
    if (greet) greet.textContent = `👋 Hi ${name}, welcome to your Dashboard!`;

    // Restore this user's data
    loadUserTasks(email);
    loadUserImages(email);
    renderTasks();
    renderGallery();
    updateGalleryPreview();
  }

  updateTaskCount();
})();

/* ─────────────────────────────────────────
   5. DARK MODE TOGGLE
───────────────────────────────────────── */

function toggleDarkMode() {
  const isDark = document.body.classList.toggle('dark');
  localStorage.setItem('darkMode', isDark ? 'on' : 'off');
  const icon = document.getElementById('darkIcon');
  if (icon) icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
}

// Apply saved dark mode preference on page load
(function applyDarkMode() {
  if (localStorage.getItem('darkMode') === 'on') {
    document.body.classList.add('dark');
    const icon = document.getElementById('darkIcon');
    if (icon) icon.className = 'fas fa-sun';
  }
})();

/* ─────────────────────────────────────────
   6. CONFETTI ANIMATION
───────────────────────────────────────── */

function launchConfetti() {
  const colors = ['#4f46e5','#06b6d4','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899'];
  const count  = 120;

  for (let i = 0; i < count; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';

    // Random properties
    const color  = colors[Math.floor(Math.random() * colors.length)];
    const left   = Math.random() * 100;
    const delay  = Math.random() * 1.5;
    const size   = Math.random() * 8 + 6;
    const rotate = Math.random() * 360;
    const shape  = Math.random() > 0.5 ? '50%' : '2px';

    piece.style.cssText = `
      position: fixed;
      top: -20px;
      left: ${left}vw;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border-radius: ${shape};
      opacity: 1;
      z-index: 99999;
      pointer-events: none;
      animation: confettiFall ${1.8 + Math.random()}s ease-in ${delay}s forwards;
      transform: rotate(${rotate}deg);
    `;

    document.body.appendChild(piece);

    // Remove after animation ends
    setTimeout(() => piece.remove(), (delay + 2.5) * 1000);
  }
}
