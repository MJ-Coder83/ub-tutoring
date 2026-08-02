window.addEventListener('scroll', () => {
  document.getElementById('nav').classList.toggle('scrolled', window.scrollY > 20);
});

const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');
menuBtn.addEventListener('click', () => mobileMenu.classList.toggle('open'));
function closeMenu() { mobileMenu.classList.remove('open'); }

function toggleFaq(btn) {
  const item = btn.parentElement;
  const wasOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
  if (!wasOpen) item.classList.add('open');
}

function selectPackage(el) {
  const pkg = el.getAttribute('data-package');
  const select = document.getElementById('c-package');
  if (select && pkg) {
    select.value = pkg;
    select.style.borderColor = 'var(--gold)';
    setTimeout(() => { select.style.borderColor = ''; }, 1500);
  }
}

const consentBox = document.getElementById('c-consent');
const submitBtn = document.getElementById('submitBtn');
const enquiryForm = document.getElementById('enquiryForm');
const formSuccess = document.getElementById('formSuccess');

if (consentBox && submitBtn) {
  consentBox.addEventListener('change', () => {
    submitBtn.disabled = !consentBox.checked;
  });
}

if (enquiryForm) {
  enquiryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!consentBox.checked) return;
    enquiryForm.classList.add('hidden');
    formSuccess.classList.add('show');
    const data = new FormData(enquiryForm);
    let body = '';
    for (const [k, v] of data.entries()) {
      if (v) body += k + ': ' + v + '\n';
    }
    window.location.href = 'mailto:umartnba.1992@gmail.com?subject=' +
      encodeURIComponent('UB Tutoring Enquiry') +
      '&body=' + encodeURIComponent(body);
  });
}
