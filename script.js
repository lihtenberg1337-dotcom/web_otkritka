(() => {
  "use strict";

  const VK_LINK = "https://vk.me/web_gift";

  const form = document.getElementById("orderForm");
  const templateSelect = document.getElementById("template");
  const recipientInput = document.getElementById("recipient");
  const messageInput = document.getElementById("message");
  const photosCheckbox = document.getElementById("optPhotos");
  const musicCheckbox = document.getElementById("optMusic");
  const totalValue = document.getElementById("totalPrice");
  const totalBlock = document.querySelector(".summary__total-value");
  const templateLine = document.getElementById("templateLine");
  const templatePrice = document.getElementById("templatePrice");
  const photosRow = document.getElementById("photosRow");
  const musicRow = document.getElementById("musicRow");
  const builder = form;

  /* ---------- Header state ---------- */
  const header = document.getElementById("header");

  const syncHeader = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  };

  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });

  /* ---------- Reveal on scroll ---------- */
  const revealItems = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );

    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  /* ---------- Price calculation ---------- */
  const getTemplatePrice = () => {
    const option = templateSelect.selectedOptions[0];
    return Number(option?.dataset.price) || 0;
  };

  const getExtras = () => {
    return [
      { enabled: photosCheckbox.checked, price: Number(photosCheckbox.dataset.price) || 0, label: "фотогалерея" },
      { enabled: musicCheckbox.checked, price: Number(musicCheckbox.dataset.price) || 0, label: "фоновая музыка" },
    ].filter((extra) => extra.enabled);
  };

  let lastTotal = 0;

  const refreshTotal = (animate = true) => {
    const templateName = templateSelect.selectedOptions[0]?.value || "";
    const basePrice = getTemplatePrice();
    const extras = getExtras();
    const total = basePrice + extras.reduce((sum, extra) => sum + extra.price, 0);

    templateLine.textContent = `Шаблон «${templateName}»`;
    templatePrice.textContent = `${basePrice} ₽`;
    photosRow.hidden = !photosCheckbox.checked;
    musicRow.hidden = !musicCheckbox.checked;
    totalValue.textContent = String(total);

    if (animate && total !== lastTotal && totalBlock) {
      totalBlock.classList.remove("is-bump");
      void totalBlock.offsetWidth;
      totalBlock.classList.add("is-bump");
    }

    lastTotal = total;
    return { total, basePrice, extras, templateName };
  };

  templateSelect.addEventListener("change", () => refreshTotal());
  photosCheckbox.addEventListener("change", () => refreshTotal());
  musicCheckbox.addEventListener("change", () => refreshTotal());

  refreshTotal(false);

  /* ---------- "Выбрать" from catalog ---------- */
  const scrollToBuilder = () => {
    builder.scrollIntoView({ behavior: "smooth", block: "start" });
    builder.classList.remove("is-highlight");
    void builder.offsetWidth;
    builder.classList.add("is-highlight");
  };

  document.querySelectorAll("[data-choose]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = Array.from(templateSelect.options).find(
        (option) => option.dataset.price === button.dataset.choose
      );

      if (target) {
        templateSelect.value = target.value;
        refreshTotal();
        templateSelect.classList.remove("is-flash");
        void templateSelect.offsetWidth;
        templateSelect.classList.add("is-flash");
      }

      scrollToBuilder();
    });
  });

  /* ---------- Order message ---------- */
  const buildMessage = () => {
    const { total, basePrice, extras, templateName } = refreshTotal(false);
    const templateOption = templateSelect.selectedOptions[0];
    const isCustom = templateOption?.dataset.key === "custom";

    const templateLabel = isCustom
      ? `${templateName} (от ${basePrice} ₽)`
      : `${templateName} — ${basePrice} ₽`;

    const extrasLabel = extras.length
      ? extras.map((extra) => `${extra.label} (+${extra.price} ₽)`).join(", ")
      : "без дополнительных опций";

    return [
      "Здравствуйте! Хочу заказать интерактивную веб-открытку 💜",
      "",
      `Шаблон: ${templateLabel}`,
      `Для кого: ${recipientInput.value.trim()}`,
      `Поздравление: ${messageInput.value.trim()}`,
      `Доп. опции: ${extrasLabel}`,
      "",
      `Итого: ${total} ₽`,
      "",
      "Подскажите, пожалуйста, что нужно для старта и когда сможете приступить.",
    ].join("\n");
  };

  const markInvalid = (field) => {
    field.focus({ preventScroll: true });
    field.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      const firstInvalid = form.querySelector(":invalid");
      if (firstInvalid) markInvalid(firstInvalid);
      return;
    }

    const text = buildMessage();
    const url = `${VK_LINK}?text=${encodeURIComponent(text)}`;
    const opened = window.open(url, "_blank");

    if (opened) {
      opened.opener = null;
    } else {
      window.location.href = url;
    }
  });

  /* ---------- Footer year ---------- */
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
