/* ==========================================================================
   EduVerse | Teacher Messages
   messages.js
   Fully functional chat UI logic for messages.html
   Vanilla JS + Bootstrap 5 (already loaded on the page)
   ========================================================================== */

(function () {
  'use strict';

  /* ------------------------------------------------------------------------
     0. UTILITIES
     ------------------------------------------------------------------------ */

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  function toast(message, type = 'primary') {
    let container = $('#eduToastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'eduToastContainer';
      Object.assign(container.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: '2000',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      });
      document.body.appendChild(container);
    }

    const el = document.createElement('div');
    el.className = `alert alert-${type} shadow`;
    el.style.minWidth = '260px';
    el.style.opacity = '0';
    el.style.transition = 'opacity .3s ease, transform .3s ease';
    el.style.transform = 'translateX(20px)';
    el.textContent = message;

    container.appendChild(el);
    requestAnimationFrame(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateX(0)';
    });

    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateX(20px)';
      setTimeout(() => el.remove(), 300);
    }, 2600);
  }

  function buildModal(id, title, bodyHTML, footerHTML = '') {
    const existing = document.getElementById(id);
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = id;
    modal.tabIndex = -1;
    modal.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">${title}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">${bodyHTML}</div>
          ${footerHTML ? `<div class="modal-footer">${footerHTML}</div>` : ''}
        </div>
      </div>`;
    document.body.appendChild(modal);
    return modal;
  }

  function showModal(id, title, bodyHTML, footerHTML = '') {
    const modalEl = buildModal(id, title, bodyHTML, footerHTML);
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
    modalEl.addEventListener('hidden.bs.modal', () => modalEl.remove());
    return { modalEl, modal };
  }

  function nowTime() {
    return new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }

  /* ------------------------------------------------------------------------
     1. CONVERSATION DATA STORE
     Keyed by student name (matches the <h6> text in each .conversation item)
     ------------------------------------------------------------------------ */

  const CONTACTS = {
    'Ali Khan': {
      avatar: 'https://i.pravatar.cc/60?img=12',
      online: true,
      messages: [
        { type: 'received', text: 'Assalam o Alaikum Sir, I need help in JavaScript assignment.', time: '10:30 AM' },
        { type: 'sent', text: 'Wa Alaikum Assalam. Send your problem, I will check it.', time: '10:32 AM' },
        { type: 'received', text: 'I am confused about DOM events.', time: '10:35 AM' },
        { type: 'sent', text: 'I have uploaded an example lecture. Review it.', time: '10:37 AM' }
      ]
    },
    'Sara Ahmed': {
      avatar: 'https://i.pravatar.cc/60?img=32',
      online: false,
      messages: [
        { type: 'received', text: 'Sir, need help in Python topic.', time: '9:10 AM' },
        { type: 'sent', text: 'Sure, which topic exactly?', time: '9:12 AM' },
        { type: 'received', text: 'Loops and list comprehension.', time: '9:14 AM' }
      ]
    },
    'Ahmed Raza': {
      avatar: 'https://i.pravatar.cc/60?img=45',
      online: false,
      messages: [
        { type: 'sent', text: 'Great work on your last submission!', time: 'Yesterday' },
        { type: 'received', text: 'Thank you teacher', time: 'Yesterday' }
      ]
    },
    'Fatima Noor': {
      avatar: 'https://i.pravatar.cc/60?img=50',
      online: true,
      messages: [
        { type: 'received', text: 'I have a question about the UI/UX assignment.', time: 'Yesterday' }
      ]
    }
  };

  const autoReplies = [
    'Got it, thank you!',
    'Okay sir, I will check.',
    'Understood, appreciate the help.',
    'Sure, I will do that.',
    'Thanks for the quick response!'
  ];

  let activeContact = 'Ali Khan';

  /* ------------------------------------------------------------------------
     2. SIDEBAR TOGGLE
     ------------------------------------------------------------------------ */

  function initSidebarToggle() {
    const menuBtn = $('.menu-toggle');
    const wrapper = $('.dashboard-wrapper');
    const sidebar = $('.sidebar');
    if (!menuBtn || !wrapper || !sidebar) return;

    menuBtn.addEventListener('click', () => {
      wrapper.classList.toggle('sidebar-collapsed');
      sidebar.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
      const isMobile = window.innerWidth <= 992;
      if (!isMobile) return;
      if (
        sidebar.classList.contains('show') &&
        !sidebar.contains(e.target) &&
        e.target !== menuBtn &&
        !menuBtn.contains(e.target)
      ) {
        sidebar.classList.remove('show');
      }
    });
  }

  /* ------------------------------------------------------------------------
     3. NOTIFICATIONS BELL
     ------------------------------------------------------------------------ */

  function initNotifications() {
    const bell = $('.navbar-right .nav-icon');
    if (!bell) return;

    const badge = bell.querySelector('span');
    const notifications = [
      { text: 'Ali Khan sent you a new message', time: '2 min ago' },
      { text: 'Sara Ahmed is waiting for a reply', time: '20 min ago' },
      { text: 'New student joined Web Development', time: '2h ago' },
      { text: 'Assignment deadline reminder', time: '5h ago' },
      { text: 'Weekly report is ready', time: '1d ago' }
    ];

    bell.style.cursor = 'pointer';
    bell.addEventListener('click', () => {
      const listHTML = notifications
        .map(
          (n) => `
        <div class="d-flex justify-content-between border-bottom py-2">
          <span>${n.text}</span>
          <small class="text-muted ms-3">${n.time}</small>
        </div>`
        )
        .join('');

      showModal('notificationsModal', '<i class="fa-solid fa-bell me-2"></i>Notifications', listHTML);

      if (badge) {
        badge.textContent = '0';
        badge.style.display = 'none';
      }
    });
  }

  /* ------------------------------------------------------------------------
     4. RENDER CHAT AREA FOR A GIVEN CONTACT
     ------------------------------------------------------------------------ */

  function renderChat(name) {
    const contact = CONTACTS[name];
    if (!contact) return;

    activeContact = name;

    // Chat header
    const chatHeader = $('.chat-header');
    if (chatHeader) {
      const img = chatHeader.querySelector('img');
      const nameEl = chatHeader.querySelector('h5');
      const statusEl = chatHeader.querySelector('span');

      if (img) img.src = contact.avatar;
      if (nameEl) nameEl.textContent = name;
      if (statusEl) {
        statusEl.textContent = contact.online ? 'Online' : 'Offline';
        statusEl.style.color = contact.online ? '#2a9d8f' : '#8d99ae';
      }
    }

    // Chat body
    const chatBody = $('.chat-body');
    if (chatBody) {
      chatBody.innerHTML = contact.messages
        .map(
          (m) => `
        <div class="message ${m.type}">
          <p>${m.text}</p>
          <small>${m.time}</small>
        </div>`
        )
        .join('');
      chatBody.scrollTop = chatBody.scrollHeight;
    }

    // Highlight active conversation in the list + clear its "unread" look
    $$('.conversation').forEach((conv) => {
      const convName = conv.querySelector('h6')?.textContent.trim();
      conv.classList.toggle('active', convName === name);
    });
  }

  /* ------------------------------------------------------------------------
     5. CONVERSATION LIST - click to switch chat
     ------------------------------------------------------------------------ */

  function initConversationSwitch() {
    $$('.conversation').forEach((conv) => {
      conv.style.cursor = 'pointer';
      conv.addEventListener('click', () => {
        const name = conv.querySelector('h6')?.textContent.trim();
        if (name && CONTACTS[name]) {
          renderChat(name);
        }
      });
    });
  }

  /* ------------------------------------------------------------------------
     6. UPDATE SIDEBAR PREVIEW (last message + time) FOR A CONTACT
     ------------------------------------------------------------------------ */

  function updateConversationPreview(name, text, time) {
    const conv = $$('.conversation').find(
      (c) => c.querySelector('h6')?.textContent.trim() === name
    );
    if (!conv) return;

    const previewEl = conv.querySelector('.conversation-info p');
    const timeEl = conv.querySelector('.conversation-info small');
    if (previewEl) previewEl.textContent = text.length > 40 ? text.slice(0, 40) + '...' : text;
    if (timeEl) timeEl.textContent = time;

    // Move this conversation to the top of the list (most recent first)
    const list = conv.parentElement;
    if (list && list.firstElementChild !== conv) {
      // Keep the header/search blocks in place; only reorder conversation items
      const firstConv = $$('.conversation', list)[0];
      if (firstConv && firstConv !== conv) {
        list.insertBefore(conv, firstConv);
      }
    }
  }

  /* ------------------------------------------------------------------------
     7. SEND MESSAGE
     ------------------------------------------------------------------------ */

  function initSendMessage() {
    const chatInput = $('.chat-input input');
    const sendBtn = $('.chat-input .btn-primary');
    if (!chatInput || !sendBtn) return;

    function sendMessage() {
      const text = chatInput.value.trim();
      if (!text) {
        chatInput.focus();
        return;
      }

      const time = nowTime();
      const contact = CONTACTS[activeContact];
      contact.messages.push({ type: 'sent', text, time });

      const chatBody = $('.chat-body');
      if (chatBody) {
        const msgEl = document.createElement('div');
        msgEl.className = 'message sent';
        msgEl.innerHTML = `<p>${text}</p><small>${time}</small>`;
        chatBody.appendChild(msgEl);
        chatBody.scrollTop = chatBody.scrollHeight;
      }

      updateConversationPreview(activeContact, text, 'Just now');
      chatInput.value = '';

      // Simulated student reply
      const currentContact = activeContact;
      setTimeout(() => {
        const reply = autoReplies[Math.floor(Math.random() * autoReplies.length)];
        const replyTime = nowTime();
        CONTACTS[currentContact].messages.push({ type: 'received', text: reply, time: replyTime });

        if (activeContact === currentContact) {
          const body = $('.chat-body');
          if (body) {
            const el = document.createElement('div');
            el.className = 'message received';
            el.innerHTML = `<p>${reply}</p><small>${replyTime}</small>`;
            body.appendChild(el);
            body.scrollTop = body.scrollHeight;
          }
          updateConversationPreview(currentContact, reply, 'Just now');
        } else {
          toast(`New message from ${currentContact}`, 'primary');
        }
      }, 1200 + Math.random() * 800);
    }

    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  /* ------------------------------------------------------------------------
     8. FILE ATTACHMENT (paperclip button)
     ------------------------------------------------------------------------ */

  function initAttachment() {
    const chatInputBar = $('.chat-input');
    if (!chatInputBar) return;

    const attachBtn = chatInputBar.querySelector('.btn-light');
    if (!attachBtn) return;

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);

    attachBtn.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', () => {
      if (!fileInput.files || fileInput.files.length === 0) return;
      const fileName = fileInput.files[0].name;
      const time = nowTime();
      const text = `📎 ${fileName}`;

      CONTACTS[activeContact].messages.push({ type: 'sent', text, time });

      const chatBody = $('.chat-body');
      if (chatBody) {
        const msgEl = document.createElement('div');
        msgEl.className = 'message sent';
        msgEl.innerHTML = `<p>${text}</p><small>${time}</small>`;
        chatBody.appendChild(msgEl);
        chatBody.scrollTop = chatBody.scrollHeight;
      }

      updateConversationPreview(activeContact, text, 'Just now');
      toast(`Attachment "${fileName}" sent.`, 'success');
      fileInput.value = '';
    });
  }

  /* ------------------------------------------------------------------------
     9. CHAT ACTIONS - Call / Video / Ellipsis menu
     ------------------------------------------------------------------------ */

  function initChatActions() {
    const actionButtons = $$('.chat-actions .btn-light');
    if (actionButtons.length === 0) return;

    actionButtons.forEach((btn) => {
      const icon = btn.querySelector('i');
      if (!icon) return;

      if (icon.classList.contains('fa-phone')) {
        btn.addEventListener('click', () => {
          showModal(
            'callModal',
            `<i class="fa-solid fa-phone me-2"></i>Calling ${activeContact}...`,
            `
            <div class="text-center py-4">
              <img src="${CONTACTS[activeContact].avatar}" class="rounded-circle mb-3" style="width:90px;height:90px;object-fit:cover;">
              <p class="mb-0">Ringing...</p>
            </div>`,
            `<button class="btn btn-danger" data-bs-dismiss="modal"><i class="fa-solid fa-phone-slash me-1"></i>End Call</button>`
          );
        });
      } else if (icon.classList.contains('fa-video')) {
        btn.addEventListener('click', () => {
          showModal(
            'videoCallModal',
            `<i class="fa-solid fa-video me-2"></i>Video Call with ${activeContact}`,
            `
            <div class="ratio ratio-16x9 bg-dark d-flex align-items-center justify-content-center">
              <div class="text-white text-center">
                <i class="fa-solid fa-video fa-2x mb-2"></i>
                <p class="mb-0">Connecting video call...</p>
              </div>
            </div>`,
            `<button class="btn btn-danger" data-bs-dismiss="modal"><i class="fa-solid fa-phone-slash me-1"></i>End Call</button>`
          );
        });
      } else if (icon.classList.contains('fa-ellipsis')) {
        btn.addEventListener('click', () => {
          showModal(
            'chatOptionsModal',
            `<i class="fa-solid fa-ellipsis me-2"></i>Chat Options`,
            `
            <div class="d-grid gap-2">
              <button class="btn btn-outline-primary text-start" id="viewProfileOptBtn">
                <i class="fa-solid fa-user me-2"></i>View Student Profile
              </button>
              <button class="btn btn-outline-warning text-start" id="muteOptBtn">
                <i class="fa-solid fa-bell-slash me-2"></i>Mute Notifications
              </button>
              <button class="btn btn-outline-danger text-start" id="clearChatOptBtn">
                <i class="fa-solid fa-trash me-2"></i>Clear Chat
              </button>
            </div>`
          );

          $('#viewProfileOptBtn')?.addEventListener('click', () => {
            toast(`Opening ${activeContact}'s profile...`, 'primary');
          });

          $('#muteOptBtn')?.addEventListener('click', (e) => {
            const isMuted = e.currentTarget.classList.toggle('active');
            toast(`Notifications ${isMuted ? 'muted' : 'unmuted'} for ${activeContact}.`, 'warning');
          });

          $('#clearChatOptBtn')?.addEventListener('click', () => {
            CONTACTS[activeContact].messages = [];
            const chatBody = $('.chat-body');
            if (chatBody) chatBody.innerHTML = '<p class="text-muted text-center mt-4">No messages yet.</p>';
            updateConversationPreview(activeContact, 'No messages yet', '');
            bootstrap.Modal.getInstance($('#chatOptionsModal'))?.hide();
            toast(`Chat with ${activeContact} cleared.`, 'danger');
          });
        });
      }
    });
  }

  /* ------------------------------------------------------------------------
     10. SEARCH - filters the conversation list (both search boxes)
     ------------------------------------------------------------------------ */

  function initSearch() {
    const inputs = [$('.message-search input'), $('.navbar-left .search-box input')].filter(Boolean);
    if (inputs.length === 0) return;

    function filterConversations(term) {
      const list = $('.conversation-list');
      const items = $$('.conversation');
      let visibleCount = 0;

      items.forEach((item) => {
        const name = item.querySelector('h6')?.textContent.toLowerCase() || '';
        const preview = item.querySelector('.conversation-info p')?.textContent.toLowerCase() || '';
        const match = name.includes(term) || preview.includes(term);
        item.style.display = match ? '' : 'none';
        if (match) visibleCount++;
      });

      let noResults = $('#noConversationResults');
      if (visibleCount === 0 && term !== '') {
        if (!noResults && list) {
          noResults = document.createElement('p');
          noResults.id = 'noConversationResults';
          noResults.className = 'text-muted text-center mt-3';
          noResults.textContent = 'No students found.';
          list.appendChild(noResults);
        }
      } else if (noResults) {
        noResults.remove();
      }
    }

    inputs.forEach((input) => {
      input.addEventListener('input', () => {
        const term = input.value.trim().toLowerCase();
        // Keep both search boxes in sync
        inputs.forEach((i) => { if (i !== input) i.value = input.value; });
        filterConversations(term);
      });
    });
  }

  /* ------------------------------------------------------------------------
     INIT — DOM READY
     ------------------------------------------------------------------------ */

  document.addEventListener('DOMContentLoaded', () => {
    initSidebarToggle();
    initNotifications();
    initConversationSwitch();
    initSendMessage();
    initAttachment();
    initChatActions();
    initSearch();
  });
})();