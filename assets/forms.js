/* ============ SVC Tech AI — Contact form → Google Sheets ============ */
(function () {
  var SOURCE_LABELS = {
    products: 'Products inquiry',
    services: 'Services inquiry',
    education: 'Education / Academy inquiry',
    contact: 'General contact',
  };

  var SOURCE_INTEREST = {
    products: 'Products',
    services: 'Services',
    education: 'Education',
  };

  function getSource() {
    var params = new URLSearchParams(window.location.search);
    var from = (params.get('from') || 'contact').toLowerCase();
    if (SOURCE_LABELS[from]) return from;
    return 'contact';
  }

  function initContactForm() {
    var form = document.getElementById('contactForm');
    if (!form) return;

    var thanks = document.getElementById('thanks');
    var errorEl = document.getElementById('formError');
    var submitBtn = document.getElementById('contactSubmit');
    var banner = document.getElementById('formSourceBanner');
    var source = getSource();

    if (banner && source !== 'contact') {
      banner.textContent = SOURCE_LABELS[source];
      banner.classList.remove('hidden');
    }

    var interestValue = SOURCE_INTEREST[source];
    if (interestValue) {
      form.querySelectorAll('input[name="interest"]').forEach(function (input) {
        if (input.value === interestValue) input.checked = true;
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      if (thanks) thanks.classList.add('hidden');
      if (errorEl) errorEl.classList.add('hidden');

      var formData = new FormData(form);
      var interests = formData.getAll('interest');

      var payload = {
        source: source,
        fullName: (formData.get('fullName') || '').toString().trim(),
        email: (formData.get('email') || '').toString().trim(),
        company: (formData.get('company') || '').toString().trim(),
        phone: (formData.get('phone') || '').toString().trim(),
        interests: interests,
        brief: (formData.get('brief') || '').toString().trim(),
        budget: (formData.get('budget') || '').toString(),
        timeline: (formData.get('timeline') || '').toString(),
      };

      var originalHtml = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
      }

      fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then(function (res) {
          return res.json().catch(function () { return {}; }).then(function (data) {
            if (!res.ok) {
              throw new Error(data.error || 'Submission failed. Please try again.');
            }
            return data;
          });
        })
        .then(function () {
          if (thanks) thanks.classList.remove('hidden');
          form.reset();
          if (interestValue) {
            form.querySelectorAll('input[name="interest"]').forEach(function (input) {
              if (input.value === interestValue) input.checked = true;
            });
          }
        })
        .catch(function (err) {
          if (errorEl) {
            errorEl.textContent = err.message || 'Something went wrong. Please email contact@svctechai.com instead.';
            errorEl.classList.remove('hidden');
          }
        })
        .finally(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalHtml;
          }
        });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContactForm);
  } else {
    initContactForm();
  }
})();
