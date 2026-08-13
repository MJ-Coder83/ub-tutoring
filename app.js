/* Where the enquiry form posts.
   On Vercel we use our own serverless handler at /api/enquiry.
   GitHub Pages is static-only and cannot run it, so fall back to FormSubmit. */
const CONTACT_EMAIL = 'umartnba.1992@gmail.com';
const FORM_ENDPOINT = location.hostname.endsWith('github.io')
  ? 'https://formsubmit.co/ajax/' + CONTACT_EMAIL
  : '/api/enquiry';

window.addEventListener('scroll', () => {
  document.getElementById('nav').classList.toggle('scrolled', window.scrollY > 20);
});

/* --- Mobile menu ------------------------------------------------------- */
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');

function setMenu(open) {
  mobileMenu.classList.toggle('open', open);
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
}

menuBtn.addEventListener('click', () => setMenu(!mobileMenu.classList.contains('open')));
mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
    setMenu(false);
    menuBtn.focus();
  }
});

/* --- FAQ accordion ----------------------------------------------------- */
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const wasOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => {
      i.classList.remove('open');
      i.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
    });
    if (!wasOpen) {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});

/* --- Pricing buttons preselect the package in the form ----------------- */
document.querySelectorAll('[data-package]').forEach(el => {
  el.addEventListener('click', () => {
    const select = document.getElementById('c-package');
    if (!select) return;
    select.value = el.getAttribute('data-package');
    select.style.borderColor = 'var(--gold)';
    setTimeout(() => { select.style.borderColor = ''; }, 1500);
  });
});

/* --- Enquiry form ------------------------------------------------------ */
const consentBox = document.getElementById('c-consent');
const submitBtn = document.getElementById('submitBtn');
const enquiryForm = document.getElementById('enquiryForm');
const formSuccess = document.getElementById('formSuccess');
const formError = document.getElementById('formError');
const retryBtn = document.getElementById('retryBtn');

if (consentBox && submitBtn) {
  consentBox.addEventListener('change', () => {
    submitBtn.disabled = !consentBox.checked;
  });
}

function showPanel(panel) {
  enquiryForm.classList.toggle('hidden', panel !== 'form');
  formSuccess.classList.toggle('show', panel === 'success');
  formError.classList.toggle('show', panel === 'error');
}

if (retryBtn) {
  retryBtn.addEventListener('click', () => {
    showPanel('form');
    document.getElementById('c-name').focus();
  });
}

function collectPayload(form) {
  const data = new FormData(form);
  const payload = {};
  for (const [key, value] of data.entries()) {
    if (!value) continue;
    // "Focus" is a checkbox group and can appear multiple times.
    payload[key] = payload[key] ? payload[key] + ', ' + value : value;
  }
  payload._subject = 'UB Tutoring Enquiry' + (payload.Name ? ' — ' + payload.Name : '');
  payload._template = 'table';
  payload._captcha = 'false';
  return payload;
}

if (enquiryForm) {
  enquiryForm.addEventListener('submit', async e => {
    e.preventDefault();

    if (!enquiryForm.reportValidity()) return;
    if (!consentBox.checked) return;

    const originalLabel = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.classList.add('sending');
    submitBtn.textContent = 'Sending…';

    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(collectPayload(enquiryForm))
      });

      if (!response.ok) throw new Error('Request failed with status ' + response.status);

      // FormSubmit returns {success: "true"}; our own handler returns {success: true}.
      const result = await response.json().catch(() => ({ success: true }));
      if (result.success === false || result.success === 'false') {
        throw new Error(result.message || 'Submission rejected');
      }

      showPanel('success');
      formSuccess.scrollIntoView({ block: 'center' });
      enquiryForm.reset();
    } catch (err) {
      console.error('Enquiry submission failed:', err);
      showPanel('error');
      formError.scrollIntoView({ block: 'center' });
    } finally {
      submitBtn.disabled = !consentBox.checked;
      submitBtn.classList.remove('sending');
      submitBtn.textContent = originalLabel;
    }
  });
}
