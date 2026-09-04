const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const messages = document.getElementById("messages");
const welcome = document.getElementById("welcome");
const chatHistoryElement = document.getElementById("chatHistory");

// ===============================
// إدارة المحادثات
// ===============================

let conversations = JSON.parse(
    localStorage.getItem("amerAI_conversations") || "[]"
);

let currentConversationId = null;
let conversationHistory = [];


// حفظ المحادثات
function saveConversations() {
    localStorage.setItem(
        "amerAI_conversations",
        JSON.stringify(conversations)
    );
}


// إنشاء معرف للمحادثة
function createId() {
    return Date.now().toString();
}


// إنشاء محادثة جديدة
function createNewConversation() {

    const conversation = {
        id: createId(),
        title: "محادثة جديدة",
        messages: []
    };

    conversations.unshift(conversation);

    currentConversationId = conversation.id;

    conversationHistory = [];

    saveConversations();

    renderChatHistory();

    messages.innerHTML = "";

    if (welcome) {
        welcome.style.display = "block";
    }

    messageInput.value = "";

    messageInput.focus();
}


// الحصول على المحادثة الحالية
function getCurrentConversation() {

    return conversations.find(
        conversation => conversation.id === currentConversationId
    );

}


// تحديث عنوان المحادثة
function updateConversationTitle(message) {

    const conversation = getCurrentConversation();

    if (!conversation) return;

    if (
        conversation.title === "محادثة جديدة" ||
        !conversation.title
    ) {

        conversation.title =
            message.length > 35
                ? message.substring(0, 35) + "..."
                : message;

    }

    saveConversations();

    renderChatHistory();
}


// حفظ رسالة
function saveMessage(role, content) {

    const conversation = getCurrentConversation();

    if (!conversation) return;

    conversation.messages.push({
        role: role,
        content: content
    });

    saveConversations();
}


// عرض سجل المحادثات
function renderChatHistory() {

    if (!chatHistoryElement) return;

    chatHistoryElement.innerHTML = "";

    conversations.forEach(conversation => {

        const button = document.createElement("button");

        button.className = "history-item";

        if (conversation.id === currentConversationId) {
            button.classList.add("active");
        }

        button.textContent = "💬 " + conversation.title;

        button.addEventListener("click", function() {
            loadConversation(conversation.id);
        });

        chatHistoryElement.appendChild(button);

    });

}


// تحميل محادثة
function loadConversation(id) {

    const conversation = conversations.find(
        conversation => conversation.id === id
    );

    if (!conversation) return;

    currentConversationId = id;

    conversationHistory = conversation.messages.map(message => ({
        role: message.role,
        content: message.content
    }));

    messages.innerHTML = "";

    if (welcome) {
        welcome.style.display =
            conversation.messages.length === 0
                ? "block"
                : "none";
    }

    conversation.messages.forEach(message => {

        addMessage(
            message.content,
            message.role === "user" ? "user" : "bot"
        );

    });

    renderChatHistory();

    messageInput.focus();

}


// حذف المحادثة الحالية
function deleteCurrentConversation() {

    if (!currentConversationId) return;

    conversations = conversations.filter(
        conversation =>
            conversation.id !== currentConversationId
    );

    saveConversations();

    currentConversationId = null;

    conversationHistory = [];

    messages.innerHTML = "";

    if (welcome) {
        welcome.style.display = "block";
    }

    renderChatHistory();

}


// ===============================
// إرسال الرسالة
// ===============================

async function sendMessage() {

    const message = messageInput.value.trim();

    if (!message) return;


    // إذا مفيش محادثة، أنشئ واحدة
    if (!currentConversationId) {
        createNewConversation();
    }


    // إخفاء الترحيب
    if (welcome) {
        welcome.style.display = "none";
    }


    // إضافة رسالة المستخدم
    addMessage(message, "user");


    // إضافة الرسالة للسياق
    conversationHistory.push({
        role: "user",
        content: message
    });


    // حفظ الرسالة
    saveMessage("user", message);


    // تحديث عنوان المحادثة
    updateConversationTitle(message);


    messageInput.value = "";


    // رسالة انتظار
    const loading = addMessage(
        "🤖 جاري التفكير...",
        "bot"
    );


    sendButton.disabled = true;


    try {

        const response = await fetch("/api/chat", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                message: message,

                history: conversationHistory

            })

        });


        const data = await response.json();


        loading.remove();


        if (!response.ok) {

            throw new Error(
                data.error || "حدث خطأ في السيرفر"
            );

        }


        // إضافة رد AMER AI
        addMessage(data.reply, "bot");


        // إضافة الرد للسياق
        conversationHistory.push({

            role: "assistant",

            content: data.reply

        });


        // حفظ الرد
        saveMessage(
            "assistant",
            data.reply
        );


    } catch (error) {

        console.error(error);


        loading.remove();


        // إزالة رسالة المستخدم من السياق
        conversationHistory.pop();


        // إزالة رسالة المستخدم المحفوظة
        const conversation =
            getCurrentConversation();

        if (conversation && conversation.messages.length > 0) {

            conversation.messages.pop();

            saveConversations();

        }


        addMessage(
            "⚠️ حصل خطأ أثناء الاتصال بـ AMER AI. حاول مرة أخرى.",
            "bot"
        );


    } finally {

        sendButton.disabled = false;

        messageInput.focus();

    }

}


// ===============================
// إضافة رسالة للواجهة
// ===============================

function addMessage(text, type) {

    const messageDiv =
        document.createElement("div");

    messageDiv.className =
        `message ${type}`;

    messageDiv.textContent = text;

    messages.appendChild(messageDiv);

    messages.scrollTop =
        messages.scrollHeight;

    return messageDiv;

}


// ===============================
// زر الإرسال
// ===============================

sendButton.addEventListener(
    "click",
    sendMessage
);


// ===============================
// Enter
// ===============================

messageInput.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            sendMessage();

        }

    }
);


// ===============================
// الاقتراحات
// ===============================

document
    .querySelectorAll(".suggestion")
    .forEach(button => {

        button.addEventListener(
            "click",
            function() {

                messageInput.value =
                    this.textContent.trim();

                messageInput.focus();

                sendMessage();

            }
        );

    });


// ===============================
// محادثة جديدة
// ===============================

if (newChat) {

    newChat.addEventListener(
        "click",
        function() {

            createNewConversation();

        }
    );

}


// ===============================
// مسح المحادثة
// ===============================

if (clearButton) {

    clearButton.addEventListener(
        "click",
        function() {

            deleteCurrentConversation();

        }
    );

}


// ===============================
// الوضع الليلي
// ===============================

const themeButton =
    document.getElementById("themeButton");

if (themeButton) {

    themeButton.addEventListener(
        "click",
        function() {

            document.body.classList.toggle(
                "light-mode"
            );


            const span =
                themeButton.querySelector("span");


            if (span) {

                if (
                    document.body.classList.contains(
                        "light-mode"
                    )
                ) {

                    span.textContent =
                        "الوضع النهاري";

                } else {

                    span.textContent =
                        "الوضع الليلي";

                }

            }

        }
    );

}


// ===============================
// تشغيل الموقع
// ===============================

// عرض السجل
renderChatHistory();


// تحميل آخر محادثة تلقائيًا
if (conversations.length > 0) {

    loadConversation(
        conversations[0].id
    );

} else {

    createNewConversation();

}
