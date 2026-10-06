document.addEventListener('DOMContentLoaded', () => {
  // 1. Reveal Animations on Scroll
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-active');
      } else {
        entry.target.classList.remove('reveal-active');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => {
    revealObserver.observe(el);
  });

  // 2. Navbar Scroll Effect
  const navbar = document.querySelector('.navbar');
  const handleScroll = () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll);
  handleScroll(); // Run once on load

  // 3. Navigation Link Active State Tracking
  const sections = document.querySelectorAll('section, header');
  const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        if (id) {
          navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            }
          });
        }
      }
    });
  }, {
    threshold: 0.3,
    rootMargin: '-20% 0px -60% 0px'
  });

  sections.forEach(section => {
    sectionObserver.observe(section);
  });

  // 4. Contact Form Interaction & Google Sheets Submission
  // ⚠️ Deployed Google Apps Script Web App URL:
  const GOOGLE_SHEETS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx9dOR6YfViRZZd_1qHxPq__25DGyq3_jBj5t5oeyYcbl0YTLFVkocJ-8ZmTKPbQAwo/exec';

  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Get field values
      const service = document.getElementById('userService').value;
      const name = document.getElementById('userName').value.trim();
      const email = document.getElementById('userEmail').value.trim();
      const phone = document.getElementById('userPhone').value.trim();
      const message = document.getElementById('userMessage').value.trim();

      // Simple validation
      if (!service || !name || !email || !message) {
        showToast('Please fill out all required fields.', 'danger');
        return;
      }

      // Submit Button Loading state
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Sending...';

      if (GOOGLE_SHEETS_SCRIPT_URL && GOOGLE_SHEETS_SCRIPT_URL.trim() !== '') {
        try {
          // Prepare parameters
          const params = new URLSearchParams({
            name: name,
            email: email,
            phone: phone,
            service: service,
            message: message
          });

          // Send via fetch with URL query parameters for 100% Google Apps Script e.parameter compatibility
          await fetch(`${GOOGLE_SHEETS_SCRIPT_URL}?${params.toString()}`, {
            method: 'POST',
            mode: 'no-cors'
          });

          submitBtn.innerHTML = '<i class="fas fa-check-circle"></i> Message Sent!';
          showToast(`Thank you, ${name}! Your inquiry for ${service} has been sent successfully.`, 'success');
        } catch (error) {
          console.error('Error submitting form to Google Sheets:', error);
          showToast('Failed to save message. Please try again or reach out directly.', 'danger');
        } finally {
          setTimeout(() => {
            contactForm.reset();
            document.querySelectorAll('.form-input-custom').forEach(input => {
              input.dispatchEvent(new Event('input'));
            });
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
          }, 2000);
        }
      } else {
        // Setup reminder if Google Apps Script URL has not been added yet
        setTimeout(() => {
          submitBtn.innerHTML = '<i class="fas fa-check-circle"></i> Message Sent!';
          showToast(`Thank you, ${name}! (Please add your Google Apps Script URL in js/script.js to save leads to Sheets)`, 'warning');

          setTimeout(() => {
            contactForm.reset();
            document.querySelectorAll('.form-input-custom').forEach(input => {
              input.dispatchEvent(new Event('input'));
            });
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
          }, 3000);
        }, 1000);
      }
    });
  }

// JS form submission code is above

  // Helper function to create and show floating premium toasts
  function showToast(message, type = 'success') {
    // Check if container already exists
    let toastContainer = document.querySelector('.custom-toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.className = 'custom-toast-container';
      document.body.appendChild(toastContainer);

      // Inject container styles if they aren't in CSS
      const style = document.createElement('style');
      style.textContent = `
        .custom-toast-container {
          position: fixed;
          bottom: 30px;
          right: 30px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 15px;
          pointer-events: none;
        }
        .custom-toast {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-left: 5px solid #5944d1;
          color: #0e122b;
          padding: 16px 24px;
          border-radius: 16px;
          box-shadow: 0 15px 35px rgba(14, 18, 43, 0.12);
          font-family: 'Outfit', sans-serif;
          font-weight: 600;
          font-size: 0.95rem;
          min-width: 300px;
          max-width: 450px;
          display: flex;
          align-items: center;
          gap: 12px;
          pointer-events: auto;
          transform: translateX(120%);
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .custom-toast.show {
          transform: translateX(0);
        }
        .custom-toast.success {
          border-left-color: #0acf83;
        }
        .custom-toast.danger {
          border-left-color: #ff5c5c;
        }
        .custom-toast-icon {
          font-size: 1.25rem;
        }
        .custom-toast.success .custom-toast-icon {
          color: #0acf83;
        }
        .custom-toast.danger .custom-toast-icon {
          color: #ff5c5c;
        }
      `;
      document.head.appendChild(style);
    }

    // Create toast
    const toast = document.createElement('div');
    toast.className = `custom-toast ${type}`;

    const iconClass = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    toast.innerHTML = `
      <i class="fas ${iconClass} custom-toast-icon"></i>
      <div>${message}</div>
    `;

    toastContainer.appendChild(toast);

    // Trigger transition
    setTimeout(() => {
      toast.classList.add('show');
    }, 50);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.remove();
      }, 500);
    }, 4000);
  }

  // 5. Custom Cursor Movement & Hover Interactions
  const cursorDot = document.querySelector('.custom-cursor-dot');
  const cursorFollower = document.querySelector('.custom-cursor-follower');

  if (cursorDot && cursorFollower) {
    let mouseX = -100, mouseY = -100;
    let currentX = -100, currentY = -100;
    const speed = 0.15; // Follower lag speed factor

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Instantly position the inner dot
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    });

    // Animate the follower with smooth physics-based interpolation (lerp)
    const animateFollower = () => {
      const dx = mouseX - currentX;
      const dy = mouseY - currentY;

      currentX += dx * speed;
      currentY += dy * speed;

      cursorFollower.style.left = `${currentX}px`;
      cursorFollower.style.top = `${currentY}px`;

      requestAnimationFrame(animateFollower);
    };
    animateFollower();

    // Hover triggers for interactive elements
    const hoverElements = document.querySelectorAll(
      'a, button, input, select, textarea, .service-card, .project-card, .article-card, .tool-badge-card, .navbar-brand, .form-input-custom'
    );

    hoverElements.forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursorFollower.classList.add('hovered');
        cursorDot.classList.add('hovered');
      });
      el.addEventListener('mouseleave', () => {
        cursorFollower.classList.remove('hovered');
        cursorDot.classList.remove('hovered');
      });
    });

    // Hide cursor when leaving window
    document.addEventListener('mouseleave', () => {
      cursorDot.style.opacity = '0';
      cursorFollower.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      cursorDot.style.opacity = '1';
      cursorFollower.style.opacity = '1';
    });
  }
});
