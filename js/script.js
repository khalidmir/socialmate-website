// Social Mate Events UAE - Interactive Features

// Header scroll effect
window.addEventListener('scroll', function() {
  const header = document.querySelector('header');
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

// Mobile Navigation
document.addEventListener('DOMContentLoaded', function() {
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');

  if (hamburger) {
    hamburger.addEventListener('click', function() {
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('active');
    });
  }

  // Close menu when link is clicked
  const navLinks = document.querySelectorAll('.nav-menu a');
  navLinks.forEach(link => {
    link.addEventListener('click', function() {
      hamburger.classList.remove('active');
      navMenu.classList.remove('active');
    });
  });

  // Form validation and submission
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', handleFormSubmit);
  }

  const newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', handleNewsletterSubmit);
  }

  // Add fade-in animations on scroll
  observeElements();
});

// Form submission handler
async function handleFormSubmit(e) {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);

  // Basic validation
  const name = formData.get('name');
  const email = formData.get('email');
  const message = formData.get('message');
  const inquiryType = formData.get('inquiry_type');

  if (!name || !email || !message || !inquiryType) {
    showFormMessage(form, 'Please fill in all required fields.', 'error');
    return;
  }

  if (!isValidEmail(email)) {
    showFormMessage(form, 'Please enter a valid email address.', 'error');
    return;
  }

  // Show loading state
  const submitBtn = form.querySelector('#submit-btn');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Sending...';
  submitBtn.disabled = true;

  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (response.ok) {
      showFormMessage(form, data.message || 'Thank you! Your message has been sent.', 'success');
      form.reset();
    } else {
      showFormMessage(form, data.error || 'An error occurred. Please try again.', 'error');
    }
  } catch (error) {
    console.error('Form submission error:', error);
    showFormMessage(form, 'An error occurred. Please try again.', 'error');
  } finally {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
}

// Newsletter form submission
function handleNewsletterSubmit(e) {
  e.preventDefault();

  const form = e.target;
  const email = form.querySelector('input[type="email"]').value;

  if (!isValidEmail(email)) {
    alert('Please enter a valid email address.');
    return;
  }

  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Subscribing...';
  submitBtn.disabled = true;

  setTimeout(() => {
    const successMsg = document.createElement('div');
    successMsg.className = 'success-message';
    successMsg.style.cssText = `
      background: #10b981;
      color: white;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      animation: fadeInUp 0.3s ease-out;
    `;
    successMsg.textContent = 'Thank you for subscribing!';

    form.parentNode.insertBefore(successMsg, form);
    form.reset();

    setTimeout(() => {
      successMsg.style.animation = 'fadeOut 0.3s ease-out';
      setTimeout(() => successMsg.remove(), 300);
    }, 3000);

    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }, 1000);
}

// Email validation
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Show form message
function showFormMessage(form, message, type = 'success') {
  const messageEl = form.querySelector('#form-message');
  const bgColor = type === 'success' ? '#10b981' : '#ef4444';
  const textColor = 'white';

  messageEl.textContent = message;
  messageEl.style.cssText = `
    background: ${bgColor};
    color: ${textColor};
    display: block;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
    animation: fadeInUp 0.3s ease-out;
  `;

  if (type === 'success') {
    setTimeout(() => {
      messageEl.style.animation = 'fadeOut 0.3s ease-out';
      setTimeout(() => {
        messageEl.style.display = 'none';
        messageEl.style.animation = '';
      }, 300);
    }, 4000);
  }
}

// Show success message (legacy, kept for backward compatibility)
function showSuccessMessage(form) {
  showFormMessage(form, 'Thank you! We\'ll be in touch soon.', 'success');
}

// Intersection Observer for fade-in animations
function observeElements() {
  const options = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in-up');
        observer.unobserve(entry.target);
      }
    });
  }, options);

  document.querySelectorAll('.card, .feature-item, .testimonial').forEach(el => {
    observer.observe(el);
  });
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Add year to copyright
document.addEventListener('DOMContentLoaded', function() {
  const yearElement = document.getElementById('current-year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
});
