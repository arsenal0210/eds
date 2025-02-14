// 🚀 탭 전환 기능
function openTab(tabName) {
    let tabs = document.querySelectorAll(".tab-content");
    let buttons = document.querySelectorAll("button");

    tabs.forEach(tab => tab.classList.remove("active"));
    buttons.forEach(btn => btn.classList.remove("active"));

    document.getElementById(tabName).classList.add("active");
}

// ✅ 로그인 기능
async function loginUser() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const response = await fetch("https://your-vercel-api.com/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (response.ok) {
        localStorage.setItem("authToken", data.token);
        document.getElementById("authContainer").style.display = "none";
        document.getElementById("mainContainer").style.display = "block";
        loadLogistics();
        loadMessages();
    } else {
        alert("❌ 로그인 실패: " + data.detail);
    }
}

// ✅ 매크로 메시지 전송
function sendMacroMessage(message) {
    sendMessage(message);
}

// ✅ 채팅 메시지 전송
async function sendMessage(message = null) {
    let chatInput = document.getElementById("chatMessage");
    let chatMessage = message ? message : chatInput.value.trim();
    let nickname = document.getElementById("nickname").value;

    if (!chatMessage) {
        alert("메시지를 입력하세요!");
        return;
    }

    let now = new Date();
    let time = now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

    let newMessage = {
        nickname: nickname,
        message: chatMessage,
        time: time
    };

    await fetch("https://your-vercel-api.com/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMessage),
    });

    chatInput.value = "";
    loadMessages();
}

// ✅ 채팅 내역 불러오기
async function loadMessages() {
    const response = await fetch("https://your-vercel-api.com/messages");
    const messagesList = await response.json();
    let chatBox = document.getElementById("chatBox");
    chatBox.innerHTML = "";

    messagesList.forEach((msg, index) => {
        let messageDiv = document.createElement("div");
        messageDiv.classList.add("chat-message");
        messageDiv.innerHTML = `
            <strong>${msg.nickname}</strong>: ${msg.message} <span>(${msg.time})</span>
            <div class="message-actions">
                <button onclick="pinMessage(this)">📌</button>
                <button onclick="deleteMessage(${index})">🗑️</button>
            </div>
        `;
        chatBox.appendChild(messageDiv);
    });
}

// ✅ 채팅 고정 기능
function pinMessage(button) {
    let pinnedMessage = document.getElementById("pinnedMessage");
    let pinnedMessageContainer = document.getElementById("pinnedMessageContainer");

    pinnedMessage.innerHTML = button.parentElement.parentElement.innerHTML;
    pinnedMessageContainer.style.display = "block";
}

// ✅ 채팅 고정 해제
function unpinMessage() {
    document.getElementById("pinnedMessage").innerHTML = "";
    document.getElementById("pinnedMessageContainer").style.display = "none";
}

// ✅ 채팅 메시지 삭제 기능
async function deleteMessage(index) {
    let messages = await fetch("https://your-vercel-api.com/messages").then(res => res.json());
    messages.splice(index, 1);
    
    // 서버에서 삭제하는 기능 추가해야 함
    loadMessages();
}

// ✅ 배송 정보 서버로 전송
async function submitLogistics() {
    let newLogistics = {
        date: document.getElementById("deliveryDate").value,
        time: document.getElementById("deliveryTime").value,
        sender: document.getElementById("sender").value,
        receiver: document.getElementById("receiver").value,
        bus: document.getElementById("busNumber").value,
        bag: parseInt(document.getElementById("bagCount").value),
        box: parseInt(document.getElementById("boxCount").value),
        dolly: parseInt(document.getElementById("dollyCount").value)
    };

    await fetch("https://your-vercel-api.com/logistics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLogistics),
    });

    alert("✅ 배송 정보 저장 완료!");
    loadLogistics();
}

// ✅ 배송 내역 불러오기
async function loadLogistics() {
    const response = await fetch("https://your-vercel-api.com/logistics");
    const logisticsList = await response.json();
    let logisticsContainer = document.getElementById("logisticsList");
    logisticsContainer.innerHTML = "";

    logisticsList.forEach(log => {
        let itemDiv = document.createElement("div");
        itemDiv.classList.add("logistics-item");
        itemDiv.innerHTML = `
            <p>📅 ${log.date} ${log.time}</p>
            <p>📍 ${log.sender} → ${log.receiver}</p>
            <p>🚌 ${log.bus}</p>
            <p>🎒 ${log.bag} | 📦 ${log.box} | 🔄 ${log.dolly}</p>
        `;
        logisticsContainer.prepend(itemDiv);
    });
}

// ✅ 페이지 로드 시 실행
document.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem("authToken")) {
        document.getElementById("authContainer").style.display = "none";
        document.getElementById("mainContainer").style.display = "block";
        loadLogistics();
        loadMessages();
    }
});
