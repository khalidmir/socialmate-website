// Social Mate Events UAE - Interactive Features

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
function handleFormSubmit(e) {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);

  // Basic validation
  const name = formData.get('name');
  const email = formData.get('email');
  const message = formData.get('message');

  if (!name || !email || !message) {
    alert('Please fill in all required fields.');
    return;
  }

  if (!isValidEmail(email)) {
    alert('Please enter a valid email address.');
    return;
  }

  // Show loading state
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Sending...';
  submitBtn.disabled = true;

  // Submit to FormSubmit (client-side)
  // The form's action attribute handles the actual submission

  // Simulate successful submission
  setTimeout(() => {
    showSuccessMessage(form);
    form.reset();
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }, 1000);
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
    showSuccessMessage(form);
    form.reset();
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }, 1000);
}

// Email validation
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Show success message
function showSuccessMessage(form) {
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
  successMsg.textContent = 'Thank you! We\'ll be in touch soon.';

  form.parentNode.insertBefore(successMsg, form);

  setTimeout(() => {
    successMsg.style.animation = 'fadeOut 0.3s ease-out';
    setTimeout(() => successMsg.remove(), 300);
  }, 3000);
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
