const THRESHOLD_MS = 3000;
const AUTO_HIDE_MS = 10000;
const SESSION_KEY = "slow-load-notice-shown";

function measureLoadMs(): number | null {
  const [nav] = performance.getEntriesByType(
    "navigation"
  ) as PerformanceNavigationTiming[];
  if (nav && nav.loadEventEnd > 0) {
    return nav.loadEventEnd - nav.startTime;
  }
  return null;
}

function showToast(text: string, linkLabel: string, url: string): void {
  if (document.querySelector(".slow-notice")) return;

  const el = document.createElement("div");
  el.className = "slow-notice";
  el.setAttribute("role", "status");

  const message = document.createElement("span");
  message.className = "slow-notice-text";
  message.textContent = text;

  const link = document.createElement("a");
  link.className = "slow-notice-link";
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener";
  link.textContent = linkLabel;

  const close = document.createElement("button");
  close.className = "slow-notice-close";
  close.type = "button";
  close.setAttribute("aria-label", "Close");
  close.innerHTML = "&#10005;";

  function dismiss() {
    el.classList.remove("slow-notice-visible");
    setTimeout(() => el.remove(), 250);
  }
  close.addEventListener("click", dismiss);
  const timer = setTimeout(dismiss, AUTO_HIDE_MS);
  el.addEventListener("mouseenter", () => clearTimeout(timer));

  el.append(message, link, close);
  document.body.appendChild(el);
  // 不能用 requestAnimationFrame：后台标签页会暂停 rAF，提示将永远不可见
  setTimeout(() => el.classList.add("slow-notice-visible"), 30);
}

function initSlowLoadNotice() {
  const body = document.body;
  const text = body.dataset.slowNoticeText;
  const linkLabel = body.dataset.slowNoticeLink;
  const url = body.dataset.slowNoticeUrl;
  if (!text || !linkLabel || !url) return;

  // 供手动触发测试：window.__showSlowNotice()
  (window as any).__showSlowNotice = () => showToast(text, linkLabel, url);

  function check(durationMs: number) {
    if (!text || !linkLabel || !url || durationMs < THRESHOLD_MS) return;
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return;
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* ignore */
    }
    showToast(text, linkLabel, url);
  }

  const settled = measureLoadMs();
  if (settled !== null) {
    check(settled);
    return;
  }
  const start = performance.now();
  window.addEventListener("load", () => {
    check(measureLoadMs() ?? performance.now() - start);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSlowLoadNotice, {
    once: true,
  });
} else {
  initSlowLoadNotice();
}
