const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const messages = document.getElementById("messages");
const welcome = document.getElementById("welcome");

// سجل المحادثة الحالي
let conversationHistory = [];


// إرسال الرسالة
async function sendMessage() {
    const message = messageInput.value.trim();

    if (!message) return;

    // إخفاء شاشة الترحيب
    if (welcome) {
        welcome.style.display = "none";
    }

    // إضافة رسالة المستخدم للواجهة
    addMessage(message, "user");

    // إضافة الرسالة لسجل المحادثة
    conversationHistory.push({
        role: "user",
        content: message
    });

    messageInput.value = "";

    // رسالة انتظار
    const loading = addMessage("🤖 جاري التفكير...", "bot");

    // تعطيل الزر أثناء الرد
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

        // حذف رسالة الانتظار
        loading.remove();

        if (!response.ok) {
            throw new Error(data.error || "حدث خطأ في السيرفر");
        }

        // إضافة رد AMER AI للواجهة
        addMessage(data.reply, "bot");

        // إضافة رد الذكاء الاصطناعي للسجل
        conversationHistory.push({
            role: "assistant",
            content: data.reply
        });

    } catch (error) {

        console.error(error);

        loading.remove();

        // لو حصل خطأ نحذف آخر رسالة للمستخدم من السجل
        conversationHistory.pop();

        addMessage(
            "⚠️ حصل خطأ أثناء الاتصال بـ AMER AI. حاول مرة أخرى.",
            "bot"
        );

    } finally {

        // إعادة تفعيل زر الإرسال
        sendButton.disabled = false;

        messageInput.focus();
    }
}


// إضافة رسالة للمحادثة
function addMessage(text, type) {

    const messageDiv = document.createElement("div");

    messageDiv.className = `message ${type}`;

    messageDiv.textContent = text;

    messages.appendChild(messageDiv);

    messages.scrollTop = messages.scrollHeight;

    return messageDiv;
}


// زر الإرسال
sendButton.addEventListener("click", sendMessage);


// الضغط على Enter
messageInput.addEventListener("keydown", function(event) {

    if (event.key === "Enter" && !event.shiftKey) {

        event.preventDefault();

        sendMessage();
    }

});


// الاقتراحات الموجودة في الصفحة
document.querySelectorAll(".suggestion").forEach(button => {

    button.addEventListener("click", function() {

        messageInput.value = this.textContent.trim();

        messageInput.focus();

        sendMessage();
    });

});


// محادثة جديدة
const newChat = document.getElementById("newChat");

if (newChat) {

    newChat.addEventListener("click", function() {

        messages.innerHTML = "";

        conversationHistory = [];

        if (welcome) {
            welcome.style.display = "block";
        }

        messageInput.value = "";

        messageInput.focus();

    });
}


// مسح المحادثة
const clearButton = document.getElementById("clearButton");

if (clearButton) {

    clearButton.addEventListener("click", function() {

        messages.innerHTML = "";

        conversationHistory = [];

        if (welcome) {
            welcome.style.display = "block";
        }

        messageInput.focus();

    });
}


// الوضع الليلي
const themeButton = document.getElementById("themeButton");

if (themeButton) {

    themeButton.addEventListener("click", function() {

        document.body.classList.toggle("light-mode");

        const span = themeButton.querySelector("span");

        if (span) {

            if (document.body.classList.contains("light-mode")) {
                span.textContent = "الوضع النهاري";
            } else {
                span.textContent = "الوضع الليلي";
            }

        }

    });
}
