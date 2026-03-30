const form = document.getElementById("form");
const submitBtn = document.getElementById("submitBtn");
const btnText = submitBtn.querySelector(".btn-text");
const btnSpinner = submitBtn.querySelector(".btn-spinner");
const results = document.getElementById("results");
const candidateList = document.getElementById("candidateList");
const errorMsg = document.getElementById("errorMsg");
const copyAllBtn = document.getElementById("copyAllBtn");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const context = document.getElementById("context").value.trim();
  const type = document.getElementById("type").value;
  const convention = document.getElementById("convention").value;
  const language = document.getElementById("language").value;

  if (!context) {
    showError("맥락 설명을 입력해주세요.");
    return;
  }

  setLoading(true);
  hideError();
  showLoadingPlaceholder();

  let rawText = "";

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ context, type, convention, language }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "서버 오류가 발생했습니다.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop();

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        try {
          const data = JSON.parse(line.slice(6));
          if (data.error) throw new Error(data.error);
          if (data.text) rawText += data.text;
          if (data.done) {
            renderCandidates(rawText);
          }
        } catch (err) {
          // JSON 파싱 오류는 무시, 실제 에러(API 오류 등)는 상위로 전파
          if (!(err instanceof SyntaxError)) {
            throw err;
          }
        }
      }
    }
  } catch (err) {
    showError(err.message);
    results.hidden = true;
  } finally {
    setLoading(false);
  }
});

function setLoading(isLoading) {
  submitBtn.disabled = isLoading;
  btnText.hidden = isLoading;
  btnSpinner.hidden = !isLoading;
}

function showLoadingPlaceholder() {
  results.hidden = false;
  candidateList.innerHTML = `
    <div class="loading-placeholder">
      <div class="loading-bar"></div>
      <div class="loading-bar"></div>
      <div class="loading-bar"></div>
      <div class="loading-bar"></div>
    </div>
  `;
}

function renderCandidates(rawText) {
  try {
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("JSON을 찾을 수 없습니다.");

    const parsed = JSON.parse(jsonMatch[0]);
    const candidates = parsed.candidates;

    if (!candidates || !candidates.length) {
      throw new Error("후보가 없습니다.");
    }

    candidateList.innerHTML = "";
    candidates.forEach((c) => {
      const item = createCandidateItem(c.name, c.description);
      candidateList.appendChild(item);
    });

    results.hidden = false;
  } catch {
    candidateList.innerHTML = `<pre class="streaming-raw">${escapeHtml(rawText)}</pre>`;
    results.hidden = false;
  }
}

function createCandidateItem(name, description) {
  const item = document.createElement("div");
  item.className = "candidate-item";

  const nameEl = document.createElement("span");
  nameEl.className = "candidate-name";
  nameEl.textContent = name;

  const descEl = document.createElement("span");
  descEl.className = "candidate-desc";
  descEl.textContent = description || "";

  const copyBtn = document.createElement("button");
  copyBtn.className = "copy-btn";
  copyBtn.textContent = "복사";
  copyBtn.addEventListener("click", () => copyToClipboard(name, copyBtn));

  item.appendChild(nameEl);
  item.appendChild(descEl);
  item.appendChild(copyBtn);

  return item;
}

function copyToClipboard(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    const original = btn.textContent;
    btn.textContent = "복사됨!";
    btn.classList.add("copied");
    setTimeout(() => {
      btn.textContent = original;
      btn.classList.remove("copied");
    }, 1500);
  });
}

copyAllBtn.addEventListener("click", () => {
  const names = [...document.querySelectorAll(".candidate-name")]
    .map((el) => el.textContent)
    .join("\n");
  copyToClipboard(names, copyAllBtn);
});

function showError(msg) {
  errorMsg.textContent = msg;
  errorMsg.hidden = false;
}

function hideError() {
  errorMsg.hidden = true;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
