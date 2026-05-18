(function () {
  function initWebsiteDashboard() {
    const root = document.querySelector(".wdbx-scope");
    if (!root) return;

    const tabs = root.querySelectorAll(".wdbx-tab");
    const panels = root.querySelectorAll(".wdbx-panel");
    const themeSwitches = root.querySelectorAll(".wdbx-theme-switch");
    const datetime = root.querySelector(".wdbx-datetime");

    function setTab(tabName) {
      tabs.forEach(function (tab) {
        const isActive = tab.getAttribute("data-tab") === tabName;
        tab.classList.toggle("is-active", isActive);
        tab.setAttribute("aria-selected", isActive ? "true" : "false");
      });

      panels.forEach(function (panel) {
        const isActive = panel.getAttribute("data-panel") === tabName;
        panel.classList.toggle("is-active", isActive);
      });
    }

    tabs.forEach(function (tab) {
      tab.setAttribute("role", "tab");
      tab.addEventListener("click", function () {
        setTab(tab.getAttribute("data-tab"));
      });
    });

    root.querySelectorAll("[data-open-tab]").forEach(function (button) {
      button.addEventListener("click", function () {
        const target = button.getAttribute("data-open-tab");
        if (target) setTab(target);
      });
    });

    root.querySelectorAll(".wdbx-design-service-card").forEach(function (card) {
      const cardButton = card.querySelector("[data-open-tab]");
      if (!cardButton) return;

      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");

      function openCardTarget() {
        const target = cardButton.getAttribute("data-open-tab");
        if (target) setTab(target);
      }

      card.addEventListener("click", function (event) {
        if (event.target.closest("button")) return;
        openCardTarget();
      });

      card.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openCardTarget();
        }
      });
    });

    function setTheme(theme) {
      const isLight = theme === "light";
      root.setAttribute("data-theme", isLight ? "light" : "dark");
      themeSwitches.forEach(function (switcher) {
        switcher.setAttribute("aria-checked", isLight ? "true" : "false");
      });
    }

    themeSwitches.forEach(function (switcher) {
      switcher.addEventListener("click", function () {
        const current = root.getAttribute("data-theme") || "dark";
        setTheme(current === "dark" ? "light" : "dark");
      });
    });

    function updateDateTime() {
      if (!datetime) return;
      const now = new Date();
      const date = now.toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });
      const time = now.toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit"
      });
      datetime.textContent = date + " · " + time;
    }

    updateDateTime();
    setInterval(updateDateTime, 1000);

    const quizForm = root.querySelector(".wdbx-quiz-form");
    if (!quizForm) return;

    const steps = Array.from(quizForm.querySelectorAll(".wdbx-quiz-step"));
    const prevButton = quizForm.querySelector(".wdbx-quiz-prev");
    const nextButton = quizForm.querySelector(".wdbx-quiz-next");
    const submitButton = quizForm.querySelector(".wdbx-quiz-submit");
    const contactInput = quizForm.querySelector('input[name="contact_value"]');
    const errorBox = quizForm.querySelector(".wdbx-quiz-error");
    const currentStepBox = root.querySelector("[data-current-step]");
    const totalStepsBox = root.querySelector("[data-total-steps]");
    let currentStep = 0;

    if (totalStepsBox) totalStepsBox.textContent = String(steps.length);

    function getCheckedValue(step) {
      const checked = step.querySelector('input[type="radio"]:checked');
      return checked ? checked.value : "";
    }

    function validateStep(index) {
      const step = steps[index];
      if (!step) return true;
      if (errorBox) errorBox.textContent = "";

      const radioGroups = Array.from(new Set(Array.from(step.querySelectorAll('input[type="radio"]')).map(function (input) {
        return input.name;
      })));

      for (let i = 0; i < radioGroups.length; i += 1) {
        const groupName = radioGroups[i];
        if (!step.querySelector('input[name="' + groupName + '"]:checked')) {
          if (errorBox) errorBox.textContent = "Выберите вариант, чтобы продолжить.";
          return false;
        }
      }

      const projectType = step.querySelector('input[name="project_type"]:checked');
      const projectOther = step.querySelector('input[name="project_type_other"]');
      if (projectType && projectType.value === "Другое" && projectOther && !projectOther.value.trim()) {
        if (errorBox) errorBox.textContent = "Напишите, что именно нужно сделать.";
        projectOther.focus();
        return false;
      }

      const budget = step.querySelector('input[name="budget"]:checked');
      const budgetOther = step.querySelector('input[name="budget_other"]');
      if (budget && budget.value === "Свой вариант" && budgetOther && !budgetOther.value.trim()) {
        if (errorBox) errorBox.textContent = "Напишите свой бюджет.";
        budgetOther.focus();
        return false;
      }

      const requiredInputs = Array.from(step.querySelectorAll("input[required]"));
      for (let j = 0; j < requiredInputs.length; j += 1) {
        const input = requiredInputs[j];
        if (!input.value.trim()) {
          if (errorBox) errorBox.textContent = "Заполните контактные данные.";
          input.focus();
          return false;
        }
      }

      return true;
    }

    function showStep(index) {
      currentStep = Math.max(0, Math.min(index, steps.length - 1));
      steps.forEach(function (step, stepIndex) {
        step.classList.toggle("is-active", stepIndex === currentStep);
      });

      if (currentStepBox) currentStepBox.textContent = String(currentStep + 1);
      if (prevButton) prevButton.style.visibility = currentStep === 0 ? "hidden" : "visible";
      if (nextButton) nextButton.style.display = currentStep === steps.length - 1 ? "none" : "inline-flex";
      if (submitButton) submitButton.style.display = currentStep === steps.length - 1 ? "inline-flex" : "none";
      if (errorBox) errorBox.textContent = "";
    }

    if (prevButton) {
      prevButton.addEventListener("click", function () {
        showStep(currentStep - 1);
      });
    }

    if (nextButton) {
      nextButton.addEventListener("click", function () {
        if (!validateStep(currentStep)) return;
        showStep(currentStep + 1);
      });
    }

    function isCustomInputRadio(radio) {
      return (radio.name === "project_type" && radio.value === "Другое") ||
        (radio.name === "budget" && radio.value === "Свой вариант");
    }

    function updateContactPlaceholder() {
      if (!contactInput) return;
      const selected = quizForm.querySelector('input[name="contact_method"]:checked');
      const method = selected ? selected.value : "Телефон";
      if (method === "Telegram") {
        contactInput.placeholder = "Введите username в Telegram";
      } else if (method === "MAX") {
        contactInput.placeholder = "Введите номер или ID в MAX";
      } else {
        contactInput.placeholder = "Введите номер телефона";
      }
    }

    quizForm.querySelectorAll('input[type="radio"]').forEach(function (radio) {
      radio.addEventListener("change", function () {
        if (errorBox) errorBox.textContent = "";

        if (radio.name === "contact_method") {
          updateContactPlaceholder();
          return;
        }

        if (isCustomInputRadio(radio)) {
          const customInput = radio.closest("label") ? radio.closest("label").querySelector(".wdbx-inline-input") : null;
          if (customInput) {
            setTimeout(function () { customInput.focus(); }, 80);
          }
          return;
        }

        if (currentStep < steps.length - 1) {
          setTimeout(function () {
            if (validateStep(currentStep)) showStep(currentStep + 1);
          }, 220);
        }
      });
    });

    quizForm.querySelectorAll(".wdbx-inline-input").forEach(function (input) {
      input.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
          event.preventDefault();
          if (validateStep(currentStep)) showStep(currentStep + 1);
        }
      });
    });

    updateContactPlaceholder();

    quizForm.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!validateStep(currentStep)) return;

      const data = new FormData(quizForm);
      const projectType = data.get("project_type") === "Другое" && data.get("project_type_other")
        ? data.get("project_type_other")
        : data.get("project_type");
      const budget = data.get("budget") === "Свой вариант" && data.get("budget_other")
        ? data.get("budget_other")
        : data.get("budget");

      const summary = [
        "Новая заявка с квиза",
        "Что нужно: " + (projectType || "—"),
        "Тип работы: " + (data.get("work_type") || "—"),
        "ТЗ: " + (data.get("tz") || "—"),
        "Сроки: " + (data.get("deadline") || "—"),
        "Бюджет: " + (budget || "—"),
        "Имя: " + (data.get("client_name") || "—"),
        "Связь: " + (data.get("contact_method") || "—"),
        "Контакт: " + (data.get("contact_value") || "—")
      ].join("\n");

      const contactMethod = data.get("contact_method") || "";
      const contactValue = data.get("contact_value") || "";
      const payload = {
        name: data.get("client_name") || "",
        projectType: projectType || "",
        workType: data.get("work_type") || "",
        tz: data.get("tz") || "",
        deadline: data.get("deadline") || "",
        budget: budget || "",
        contactMethod: contactMethod,
        phone: contactMethod === "Телефон" ? contactValue : "",
        telegram: contactMethod === "Telegram" ? contactValue : "",
        max: contactMethod === "MAX" ? contactValue : "",
        contactValue: contactValue,
        summary: summary
      };

      if (window.parent && window.parent !== window) {
        window.parent.postMessage({
          type: "siteramQuizSubmit",
          payload: payload
        }, "*");
      }

      console.log(summary);
      quizForm.reset();
      updateContactPlaceholder();
      showStep(0);
      if (errorBox) {
        errorBox.style.color = "#8cffb0";
        errorBox.textContent = "Заявка отправлена. Мы свяжемся с вами.";
        setTimeout(function () {
          errorBox.style.color = "#ff8a8a";
          errorBox.textContent = "";
        }, 4500);
      }
    });

    showStep(0);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initWebsiteDashboard);
  } else {
    initWebsiteDashboard();
  }
})();
