import bot from "./assets/send.svg";
import user from "./assets/user.svg";
const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");

let loadInterval;

const loader = (element) => {
  element.textContent = "";

  loadInterval = setInterval(() => {
    element.textContent += ".";

    if (element.textContent === "...") {
      element.textContent = "";
    }
  }, 300);
};

const typeText = (element, text) => {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20);
};

const generateUniqueId = () => {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
};

// chart strip

function chatStripe(isAi, value, uniqueId) {
  return `
        <div class="wrapper ${isAi && "ai"}">
            <div class="chat">
                <div class="profile">
                    <img 
                      src=${isAi ? bot : user} 
                      alt="${isAi ? "bot" : "user"}" 
                    />
                </div>
                <div class="message" id=${uniqueId}>${value}</div>
            </div>
        </div>
    `;
}

const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  // generate users chartstripe

  chatContainer.innerHTML += chatStripe(false, data.get("prompt"));

  form.reset();

  // Generate bots chatstripe
  const uniqueId = generateUniqueId();

  console.log("unique id", uniqueId);
  chatContainer.innerHTML += chatStripe(true, "", uniqueId);

  chatContainer.scrollTo = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);

  loader(messageDiv);

  const response = await fetch("http://localhost:4000", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },

    body: JSON.stringify({
      prompt: data.get("prompt"),
    }),
  });

  clearInterval(loadInterval);
  messageDiv.innerHTML = "";

  if (response.ok) {
    const data = await response.json();
    const parseData = data.bot.trim();

    typeText(messageDiv, parseData);
  } else {
    const err = await response.text();

    messageDiv.innerHTML = "Something went wrong";

    alert(err);
  }
};

form.addEventListener("submit", handleSubmit);
form.addEventListener("keyup", (e) => {
  if (e.keyCode === 13) handleSubmit(e);
});
