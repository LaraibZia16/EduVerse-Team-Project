document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    /* =========================================================
       STUDENT MESSAGES - EDVERSE
       ========================================================= */

    const STORAGE_KEY = "eduverse_student_messages";

    // -----------------------------
    // Helper
    // -----------------------------
    function $(selector) {
        return document.querySelector(selector);
    }

    function $$(selector) {
        return document.querySelectorAll(selector);
    }

    // -----------------------------
    // Default conversations
    // -----------------------------
    const defaultContacts = {
        "Dr. Ahmed Khan": {
            role: "Computer Science Teacher",
            avatar: "AK",
            online: true,
            messages: [
                {
                    sender: "teacher",
                    text: "Hello Fatima! How are you doing with your programming assignment?",
                    time: "10:30 AM"
                },
                {
                    sender: "student",
                    text: "Hello Sir! I am doing well. I have completed most of it.",
                    time: "10:35 AM"
                },
                {
                    sender: "teacher",
                    text: "That's great! Let me know if you need any help.",
                    time: "10:37 AM"
                }
            ]
        },

        "Sara Malik": {
            role: "Mathematics Teacher",
            avatar: "SM",
            online: true,
            messages: [
                {
                    sender: "teacher",
                    text: "Hi Fatima! Don't forget about tomorrow's mathematics quiz.",
                    time: "9:15 AM"
                },
                {
                    sender: "student",
                    text: "Thank you for reminding me, Ma'am.",
                    time: "9:20 AM"
                }
            ]
        },

        "Usman Ali": {
            role: "English Teacher",
            avatar: "UA",
            online: false,
            messages: [
                {
                    sender: "teacher",
                    text: "Your English assignment has been reviewed.",
                    time: "Yesterday"
                },
                {
                    sender: "student",
                    text: "Thank you Sir. Is there anything I need to improve?",
                    time: "Yesterday"
                }
            ]
        },

        "Ayesha Noor": {
            role: "Science Teacher",
            avatar: "AN",
            online: true,
            messages: [
                {
                    sender: "teacher",
                    text: "Please review Chapter 5 before our next class.",
                    time: "Monday"
                }
            ]
        }
    };

    // -----------------------------
    // Load messages from localStorage
    // -----------------------------
    let contacts;

    try {
        const savedMessages = localStorage.getItem(STORAGE_KEY);

        if (savedMessages) {
            contacts = JSON.parse(savedMessages);
        } else {
            contacts = JSON.parse(JSON.stringify(defaultContacts));
            saveMessages();
        }
    } catch (error) {
        console.error("Could not load messages:", error);
        contacts = JSON.parse(JSON.stringify(defaultContacts));
    }

    function saveMessages() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
        } catch (error) {
            console.error("Could not save messages:", error);
        }
    }

    // -----------------------------
    // Current conversation
    // -----------------------------
    let currentTeacher = "Dr. Ahmed Khan";

    // -----------------------------
    // Elements
    // -----------------------------
    const conversationList = $("#conversationList");
    const chatMessages = $("#chatMessages");
    const chatTeacherName = $("#chatTeacherName");
    const chatTeacherRole = $("#chatTeacherRole");
    const chatTeacherAvatar = $("#chatTeacherAvatar");
    const messageInput = $("#messageInput");
    const sendMessageBtn = $("#sendMessageBtn");
    const attachmentInput = $("#attachmentInput");
    const attachBtn = $("#attachBtn");
    const studentSearch = $("#studentSearch");
    const chatArea = $("#chatArea");
    const conversationArea = $("#conversationArea");
    const mobileBackBtn = $("#mobileBackBtn");

    // -----------------------------
    // Create toast
    // -----------------------------
    function showToast(message, type = "success") {
        let toastContainer = $("#studentToastContainer");

        if (!toastContainer) {
            toastContainer = document.createElement("div");
            toastContainer.id = "studentToastContainer";

            toastContainer.style.position = "fixed";
            toastContainer.style.top = "80px";
            toastContainer.style.right = "20px";
            toastContainer.style.zIndex = "99999";
            toastContainer.style.display = "flex";
            toastContainer.style.flexDirection = "column";
            toastContainer.style.gap = "10px";

            document.body.appendChild(toastContainer);
        }

        const toast = document.createElement("div");

        toast.style.padding = "12px 18px";
        toast.style.borderRadius = "10px";
        toast.style.background = type === "error" ? "#dc3545" : "rgb(10, 10, 136)";
        toast.style.color = "#ffffff";
        toast.style.fontSize = "14px";
        toast.style.fontWeight = "500";
        toast.style.boxShadow = "0 8px 25px rgba(0,0,0,0.15)";
        toast.style.maxWidth = "300px";

        toast.textContent = message;

        toastContainer.appendChild(toast);

        setTimeout(function () {
            toast.style.opacity = "0";
            toast.style.transform = "translateY(-10px)";
            toast.style.transition = "all 0.3s ease";

            setTimeout(function () {
                toast.remove();
            }, 300);
        }, 2500);
    }

    // -----------------------------
    // Render conversation list
    // -----------------------------
    function renderConversationList(filter = "") {
        if (!conversationList) {
            return;
        }

        conversationList.innerHTML = "";

        const searchText = filter.trim().toLowerCase();

        Object.keys(contacts).forEach(function (teacherName) {
            const teacher = contacts[teacherName];

            if (
                searchText &&
                !teacherName.toLowerCase().includes(searchText) &&
                !teacher.role.toLowerCase().includes(searchText)
            ) {
                return;
            }

            const messages = teacher.messages || [];
            const lastMessage =
                messages.length > 0
                    ? messages[messages.length - 1]
                    : null;

            const item = document.createElement("div");

            item.className =
                "conversation-item" +
                (teacherName === currentTeacher ? " active" : "");

            item.dataset.teacher = teacherName;

            item.innerHTML = `
                <div class="conversation-avatar">
                    ${escapeHTML(teacher.avatar || getInitials(teacherName))}
                    ${teacher.online ? '<span class="online-dot"></span>' : ""}
                </div>

                <div class="conversation-info">
                    <div class="conversation-top">
                        <strong>${escapeHTML(teacherName)}</strong>
                        <span class="conversation-time">
                            ${lastMessage ? escapeHTML(lastMessage.time) : ""}
                        </span>
                    </div>

                    <div class="conversation-bottom">
                        <span class="conversation-preview">
                            ${
                                lastMessage
                                    ? escapeHTML(lastMessage.text)
                                    : "Start a conversation"
                            }
                        </span>
                    </div>
                </div>
            `;

            item.addEventListener("click", function () {
                openConversation(teacherName);
            });

            conversationList.appendChild(item);
        });

        if (!conversationList.children.length) {
            conversationList.innerHTML = `
                <div style="
                    padding:30px 15px;
                    text-align:center;
                    color:#777;
                    font-size:14px;
                ">
                    No teachers found.
                </div>
            `;
        }
    }

    // -----------------------------
    // Open conversation
    // -----------------------------
    function openConversation(teacherName) {
        if (!contacts[teacherName]) {
            return;
        }

        currentTeacher = teacherName;

        const teacher = contacts[teacherName];

        if (chatTeacherName) {
            chatTeacherName.textContent = teacherName;
        }

        if (chatTeacherRole) {
            chatTeacherRole.textContent = teacher.role;
        }

        if (chatTeacherAvatar) {
            chatTeacherAvatar.textContent =
                teacher.avatar || getInitials(teacherName);
        }

        renderConversationList(
            studentSearch ? studentSearch.value : ""
        );

        renderMessages();

        // Mobile view
        if (window.innerWidth <= 768) {
            if (conversationArea) {
                conversationArea.style.display = "none";
            }

            if (chatArea) {
                chatArea.style.display = "flex";
            }
        }
    }

    // -----------------------------
    // Render chat messages
    // -----------------------------
    function renderMessages() {
        if (!chatMessages) {
            return;
        }

        chatMessages.innerHTML = "";

        const teacher = contacts[currentTeacher];

        if (!teacher) {
            return;
        }

        const messages = teacher.messages || [];

        if (messages.length === 0) {
            chatMessages.innerHTML = `
                <div style="
                    text-align:center;
                    padding:40px 20px;
                    color:#777;
                ">
                    No messages yet. Start the conversation.
                </div>
            `;

            scrollToBottom();
            return;
        }

        messages.forEach(function (message) {
            const messageRow = document.createElement("div");

            messageRow.className =
                message.sender === "student"
                    ? "message-row student-message"
                    : "message-row teacher-message";

            const bubble = document.createElement("div");
            bubble.className = "message-bubble";

            bubble.innerHTML = `
                <div class="message-text">
                    ${escapeHTML(message.text)}
                </div>

                <div class="message-time">
                    ${escapeHTML(message.time || "")}
                </div>
            `;

            messageRow.appendChild(bubble);
            chatMessages.appendChild(messageRow);
        });

        scrollToBottom();
    }

    // -----------------------------
    // Send message
    // -----------------------------
    function sendMessage() {
        if (!messageInput) {
            return;
        }

        const text = messageInput.value.trim();

        if (!text) {
            return;
        }

        if (!contacts[currentTeacher]) {
            return;
        }

        const now = new Date();

        const time = now.toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit"
        });

        contacts[currentTeacher].messages.push({
            sender: "student",
            text: text,
            time: time
        });

        saveMessages();

        messageInput.value = "";

        renderMessages();
        renderConversationList(
            studentSearch ? studentSearch.value : ""
        );

        simulateTeacherReply();
    }

    // -----------------------------
    // Simulated teacher reply
    // -----------------------------
    function simulateTeacherReply() {
        const teacherName = currentTeacher;

        const replies = [
            "Thanks for your message!",
            "Sure, I will help you with that.",
            "Okay Fatima, I understand.",
            "That's great! Keep up the good work.",
            "I will check it and get back to you.",
            "You can ask me anytime if you need help."
        ];

        const randomReply =
            replies[Math.floor(Math.random() * replies.length)];

        setTimeout(function () {
            if (!contacts[teacherName]) {
                return;
            }

            const now = new Date();

            const time = now.toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit"
            });

            contacts[teacherName].messages.push({
                sender: "teacher",
                text: randomReply,
                time: time
            });

            saveMessages();

            if (currentTeacher === teacherName) {
                renderMessages();
            }

            renderConversationList(
                studentSearch ? studentSearch.value : ""
            );

            showToast("New reply from " + teacherName);
        }, 1500);
    }

    // -----------------------------
    // Attachment
    // -----------------------------
    function handleAttachment(event) {
        const files = event.target.files;

        if (!files || files.length === 0) {
            return;
        }

        const file = files[0];

        if (!contacts[currentTeacher]) {
            return;
        }

        const now = new Date();

        const time = now.toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit"
        });

        contacts[currentTeacher].messages.push({
            sender: "student",
            text: "📎 Attachment: " + file.name,
            time: time
        });

        saveMessages();
        renderMessages();
        renderConversationList(
            studentSearch ? studentSearch.value : ""
        );

        showToast("File attached successfully.");

        event.target.value = "";
    }

    // -----------------------------
    // Enter key
    // -----------------------------
    function handleMessageKeydown(event) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    }

    // -----------------------------
    // Mobile back
    // -----------------------------
    function goBackToConversations() {
        if (window.innerWidth <= 768) {
            if (chatArea) {
                chatArea.style.display = "none";
            }

            if (conversationArea) {
                conversationArea.style.display = "block";
            }
        }
    }

    // -----------------------------
    // Phone call
    // -----------------------------
    function startPhoneCall() {
        showCallModal("Phone Call", "Calling " + currentTeacher + "...");
    }

    // -----------------------------
    // Video call
    // -----------------------------
    function startVideoCall() {
        showCallModal("Video Call", "Starting video call with " + currentTeacher + "...");
    }

    // -----------------------------
    // Call modal
    // -----------------------------
    function showCallModal(title, text) {
        removeCustomModal();

        const modal = document.createElement("div");

        modal.id = "studentCustomModal";

        modal.style.position = "fixed";
        modal.style.inset = "0";
        modal.style.background = "rgba(0,0,0,0.55)";
        modal.style.display = "flex";
        modal.style.alignItems = "center";
        modal.style.justifyContent = "center";
        modal.style.zIndex = "100000";
        modal.style.padding = "20px";

        modal.innerHTML = `
            <div style="
                width:100%;
                max-width:400px;
                background:#fff;
                border-radius:16px;
                padding:30px;
                text-align:center;
                box-shadow:0 20px 50px rgba(0,0,0,0.2);
            ">
                <div style="
                    width:65px;
                    height:65px;
                    margin:0 auto 15px;
                    border-radius:50%;
                    background:rgb(10, 10, 136);
                    color:#fff;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    font-size:25px;
                ">
                    <i class="fas fa-phone"></i>
                </div>

                <h4 style="margin-bottom:10px;">
                    ${escapeHTML(title)}
                </h4>

                <p style="color:#777;margin-bottom:25px;">
                    ${escapeHTML(text)}
                </p>

                <button
                    type="button"
                    id="closeCustomModal"
                    style="
                        border:none;
                        background:rgb(10, 10, 136);
                        color:#fff;
                        padding:10px 25px;
                        border-radius:8px;
                        cursor:pointer;
                    "
                >
                    Close
                </button>
            </div>
        `;

        document.body.appendChild(modal);

        const closeButton = $("#closeCustomModal");

        if (closeButton) {
            closeButton.addEventListener("click", removeCustomModal);
        }

        modal.addEventListener("click", function (event) {
            if (event.target === modal) {
                removeCustomModal();
            }
        });
    }

    function removeCustomModal() {
        const modal = $("#studentCustomModal");

        if (modal) {
            modal.remove();
        }
    }

    // -----------------------------
    // Chat options
    // -----------------------------
    function showChatOptions() {
        removeCustomModal();

        const modal = document.createElement("div");

        modal.id = "studentCustomModal";

        modal.style.position = "fixed";
        modal.style.inset = "0";
        modal.style.background = "rgba(0,0,0,0.55)";
        modal.style.display = "flex";
        modal.style.alignItems = "center";
        modal.style.justifyContent = "center";
        modal.style.zIndex = "100000";
        modal.style.padding = "20px";

        modal.innerHTML = `
            <div style="
                width:100%;
                max-width:380px;
                background:#fff;
                border-radius:16px;
                padding:25px;
                box-shadow:0 20px 50px rgba(0,0,0,0.2);
            ">
                <div style="
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                    margin-bottom:20px;
                ">
                    <h4 style="margin:0;">
                        Chat Options
                    </h4>

                    <button
                        type="button"
                        id="closeOptions"
                        style="
                            border:none;
                            background:transparent;
                            font-size:22px;
                            cursor:pointer;
                        "
                    >
                        ×
                    </button>
                </div>

                <button
                    type="button"
                    id="clearChatBtn"
                    style="
                        width:100%;
                        padding:12px;
                        margin-bottom:10px;
                        border:1px solid #eee;
                        background:#fff;
                        border-radius:8px;
                        text-align:left;
                        cursor:pointer;
                    "
                >
                    <i class="fas fa-trash"></i>
                    &nbsp; Clear Conversation
                </button>

                <button
                    type="button"
                    id="closeOptionsBottom"
                    style="
                        width:100%;
                        padding:12px;
                        border:none;
                        background:rgb(10, 10, 136);
                        color:#fff;
                        border-radius:8px;
                        cursor:pointer;
                    "
                >
                    Close
                </button>
            </div>
        `;

        document.body.appendChild(modal);

        const closeOptions = $("#closeOptions");
        const closeOptionsBottom = $("#closeOptionsBottom");
        const clearChatBtn = $("#clearChatBtn");

        if (closeOptions) {
            closeOptions.addEventListener("click", removeCustomModal);
        }

        if (closeOptionsBottom) {
            closeOptionsBottom.addEventListener(
                "click",
                removeCustomModal
            );
        }

        if (clearChatBtn) {
            clearChatBtn.addEventListener(
                "click",
                clearCurrentConversation
            );
        }

        modal.addEventListener("click", function (event) {
            if (event.target === modal) {
                removeCustomModal();
            }
        });
    }

    // -----------------------------
    // Clear current conversation
    // -----------------------------
    function clearCurrentConversation() {
        if (!contacts[currentTeacher]) {
            return;
        }

        const confirmed = window.confirm(
            "Are you sure you want to clear this conversation?"
        );

        if (!confirmed) {
            return;
        }

        contacts[currentTeacher].messages = [];

        saveMessages();
        renderMessages();
        renderConversationList(
            studentSearch ? studentSearch.value : ""
        );

        removeCustomModal();

        showToast("Conversation cleared.");
    }

    // -----------------------------
    // Notification button
    // -----------------------------
    function showNotifications() {
        showToast("You have 5 notifications.");
    }

    // -----------------------------
    // Navbar search
    // -----------------------------
    function setupNavbarSearch() {
        const searchInput =
            document.querySelector(
                '.navbar input[type="search"], .top-navbar input[type="search"], input[placeholder*="Search"]'
            );

        if (!searchInput) {
            return;
        }

        searchInput.addEventListener("keydown", function (event) {
            if (event.key !== "Enter") {
                return;
            }

            const value = searchInput.value.trim();

            if (!value) {
                return;
            }

            showToast("Searching for: " + value);
        });
    }

    // -----------------------------
    // Sidebar toggle
    // -----------------------------
    function setupSidebarToggle() {
        const toggleButtons = $$(
            ".sidebar-toggle, #sidebarToggle, .menu-toggle"
        );

        toggleButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                const sidebar = $(".sidebar");

                if (!sidebar) {
                    return;
                }

                sidebar.classList.toggle("show");
            });
        });
    }

    // -----------------------------
    // Escape HTML
    // -----------------------------
    function escapeHTML(value) {
        const div = document.createElement("div");

        div.textContent = value == null ? "" : String(value);

        return div.innerHTML;
    }

    // -----------------------------
    // Get initials
    // -----------------------------
    function getInitials(name) {
        return name
            .split(" ")
            .map(function (word) {
                return word.charAt(0);
            })
            .join("")
            .substring(0, 2)
            .toUpperCase();
    }

    // -----------------------------
    // Scroll chat bottom
    // -----------------------------
    function scrollToBottom() {
        if (!chatMessages) {
            return;
        }

        setTimeout(function () {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 50);
    }

    // =========================================================
    // EVENT LISTENERS
    // =========================================================

    if (sendMessageBtn) {
        sendMessageBtn.addEventListener("click", sendMessage);
    }

    if (messageInput) {
        messageInput.addEventListener(
            "keydown",
            handleMessageKeydown
        );
    }

    if (attachBtn && attachmentInput) {
        attachBtn.addEventListener("click", function () {
            attachmentInput.click();
        });
    }

    if (attachmentInput) {
        attachmentInput.addEventListener(
            "change",
            handleAttachment
        );
    }

    if (studentSearch) {
        studentSearch.addEventListener("input", function () {
            renderConversationList(studentSearch.value);
        });
    }

    if (mobileBackBtn) {
        mobileBackBtn.addEventListener(
            "click",
            goBackToConversations
        );
    }

    // Phone button
    const phoneButtons = $$(".phone-btn, #phoneBtn, [data-action='phone']");

    phoneButtons.forEach(function (button) {
        button.addEventListener("click", startPhoneCall);
    });

    // Video button
    const videoButtons = $$(".video-btn, #videoBtn, [data-action='video']");

    videoButtons.forEach(function (button) {
        button.addEventListener("click", startVideoCall);
    });

    // Options button
    const optionButtons = $$(
        ".chat-options-btn, #chatOptionsBtn, [data-action='options']"
    );

    optionButtons.forEach(function (button) {
        button.addEventListener("click", showChatOptions);
    });

    // Notification
    const notificationButtons = $$(
        ".notification-btn, #notificationBtn, .fa-bell"
    );

    notificationButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            showNotifications();
        });
    });

    // Setup
    setupNavbarSearch();
    setupSidebarToggle();

    // First load
    renderConversationList();
    openConversation(currentTeacher);

    console.log("EduVerse Student Messages loaded successfully.");
});