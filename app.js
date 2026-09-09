```javascript
/* =========================================================
   FIELDHUB
   Field Work Command Center
   ========================================================= */


/* ================= DATA ================= */

let visits =
  JSON.parse(
    localStorage.getItem("fieldhub_visits")
  ) || [];

let expenses =
  JSON.parse(
    localStorage.getItem("fieldhub_expenses")
  ) || [];

let currentGPS = null;
let toastTimer = null;


/* ================= DATE ================= */

function getToday() {

  const now = new Date();

  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0")
  ].join("-");
}


function formatDate(dateString) {

  if (!dateString) return "";

  const date =
    new Date(dateString + "T00:00:00");

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  );
}


function formatTime() {

  return new Date().toLocaleTimeString(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit"
    }
  );
}


/* ================= INITIALIZATION ================= */

document.addEventListener(
  "DOMContentLoaded",
  function () {

    const expenseDate =
      document.getElementById(
        "expenseDate"
      );

    if (expenseDate) {
      expenseDate.value = getToday();
    }

    updateDate();
    updateDashboard();
    updateReports();

    setupForms();
    updateConnectionStatus();

    registerServiceWorker();
  }
);


/* ================= TOAST ================= */

function showToast(message) {

  const toast =
    document.getElementById("toast");

  if (!toast) return;

  clearTimeout(toastTimer);

  toast.textContent = message;

  toast.classList.add("show");

  toastTimer = setTimeout(
    function () {
      toast.classList.remove("show");
    },
    2500
  );
}


/* ================= DATE HEADER ================= */

function updateDate() {

  const element =
    document.getElementById("todayDate");

  if (!element) return;

  const now = new Date();

  element.textContent =
    now.toLocaleDateString(
      "en-IN",
      {
        weekday: "long",
        day: "numeric",
        month: "long"
      }
    );
}


/* ================= NAVIGATION ================= */

function showPage(pageName) {

  document
    .querySelectorAll(".page")
    .forEach(function (page) {
      page.classList.remove("active");
    });

  const selected =
    document.getElementById(pageName);

  if (!selected) return;

  selected.classList.add("active");

  document
    .querySelectorAll(".nav-item")
    .forEach(function (item) {

      item.classList.remove("active");

      if (
        item.dataset.page ===
        pageName
      ) {
        item.classList.add("active");
      }
    });

  if (pageName === "dashboard") {
    updateDashboard();
  }

  if (pageName === "reports") {
    updateReports();
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


/* ================= FORMS ================= */

function setupForms() {

  const workForm =
    document.getElementById(
      "workForm"
    );

  const expenseForm =
    document.getElementById(
      "expenseForm"
    );


  /* ---------- VISIT FORM ---------- */

  if (workForm) {

    workForm.addEventListener(
      "submit",
      function (event) {

        event.preventDefault();

        const company =
          document
            .getElementById("company")
            .value
            .trim();

        if (!company) {

          showToast(
            "Company name is required."
          );

          return;
        }

        const visit = {

          id: Date.now(),

          date: getToday(),

          time: formatTime(),

          company:
            company,

          person:
            document
              .getElementById("person")
              .value
              .trim(),

          designation:
            document
              .getElementById("designation")
              .value
              .trim(),

          phone:
            document
              .getElementById("phone")
              .value
              .trim(),

          email:
            document
              .getElementById("email")
              .value
              .trim(),

          industry:
            document
              .getElementById("industry")
              .value
              .trim(),

          service:
            document
              .getElementById("service")
              .value,

          requirement:
            document
              .getElementById("requirement")
              .value
              .trim(),

          outcome:
            document
              .getElementById("outcome")
              .value,

          followup:
            document
              .getElementById("followup")
              .value,

          notes:
            document
              .getElementById("notes")
              .value
              .trim(),

          gps:
            currentGPS
        };

        visits.push(visit);

        localStorage.setItem(
          "fieldhub_visits",
          JSON.stringify(visits)
        );

        workForm.reset();

        currentGPS = null;

        const gpsStatus =
          document.getElementById(
            "gpsStatus"
          );

        if (gpsStatus) {
          gpsStatus.textContent =
            "Location not captured";
        }

        updateDashboard();
        updateReports();

        showToast(
          "✓ Visit saved successfully"
        );

        setTimeout(
          function () {
            showPage("dashboard");
          },
          400
        );
      }
    );
  }


  /* ---------- EXPENSE FORM ---------- */

  if (expenseForm) {

    expenseForm.addEventListener(
      "submit",
      function (event) {

        event.preventDefault();

        const amount =
          Number(
            document
              .getElementById(
                "expenseAmount"
              )
              .value
          );

        if (
          isNaN(amount) ||
          amount < 0
        ) {

          showToast(
            "Enter a valid expense amount."
          );

          return;
        }

        const expense = {

          id: Date.now(),

          date:
            document
              .getElementById(
                "expenseDate"
              )
              .value,

          time:
            formatTime(),

          from:
            document
              .getElementById(
                "fromPlace"
              )
              .value
              .trim(),

          to:
            document
              .getElementById(
                "toPlace"
              )
              .value
              .trim(),

          mode:
            document
              .getElementById(
                "travelMode"
              )
              .value,

          amount:
            amount,

          purpose:
            document
              .getElementById(
                "expensePurpose"
              )
              .value
              .trim(),

          notes:
            document
              .getElementById(
                "expenseNotes"
              )
              .value
              .trim()
        };

        expenses.push(expense);

        localStorage.setItem(
          "fieldhub_expenses",
          JSON.stringify(expenses)
        );

        expenseForm.reset();

        document.getElementById(
          "expenseDate"
        ).value = getToday();

        updateDashboard();
        updateReports();

        showToast(
          "✓ Expense saved successfully"
        );

        setTimeout(
          function () {
            showPage("dashboard");
          },
          400
        );
      }
    );
  }
}


/* ================= GPS ================= */

function captureGPS() {

  const status =
    document.getElementById(
      "gpsStatus"
    );

  if (!status) return;

  if (!navigator.geolocation) {

    status.textContent =
      "GPS is not supported.";

    return;
  }

  status.textContent =
    "⌖ Getting your location...";

  navigator.geolocation.getCurrentPosition(

    function (position) {

      currentGPS = {

        latitude:
          Number(
            position.coords.latitude
              .toFixed(6)
          ),

        longitude:
          Number(
            position.coords.longitude
              .toFixed(6)
          ),

        accuracy:
          Math.round(
            position.coords.accuracy
          ),

        capturedAt:
          new Date().toISOString()
      };

      status.textContent =
        "✓ Location captured (" +
        currentGPS.accuracy +
        "m accuracy)";

      showToast(
        "✓ Location captured"
      );
    },

    function (error) {

      let message =
        "Unable to capture location.";

      if (error.code === 1) {
        message =
          "Location permission was denied.";
      }

      if (error.code === 2) {
        message =
          "Location unavailable.";
      }

      if (error.code === 3) {
        message =
          "Location request timed out.";
      }

      status.textContent = message;

      showToast(message);
    },

    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    }
  );
}


/* ================= DASHBOARD ================= */

function updateDashboard() {

  const today = getToday();

  const todayVisits =
    visits.filter(
      function (v) {
        return v.date === today;
      }
    );

  const todayExpenses =
    expenses.filter(
      function (e) {
        return e.date === today;
      }
    );

  const expenseTotal =
    todayExpenses.reduce(
      function (sum, item) {
        return (
          sum +
          Number(item.amount || 0)
        );
      },
      0
    );

  const followups =
    visits.filter(
      function (v) {

        return (
          v.followup === today ||
          (
            v.outcome ===
              "Follow-up required" &&
            v.date === today
          )
        );
      }
    );

  const requirements =
    todayVisits.filter(
      function (v) {
        return (
          v.requirement &&
          v.requirement.trim() !== ""
        );
      }
    );


  document.getElementById(
    "visitCount"
  ).textContent =
    todayVisits.length;

  document.getElementById(
    "expenseToday"
  ).textContent =
    "₹" +
    expenseTotal.toLocaleString(
      "en-IN"
    );

  document.getElementById(
    "followupCount"
  ).textContent =
    followups.length;

  document.getElementById(
    "requirementCount"
  ).textContent =
    requirements.length;

  updateRecentActivity();
}


/* ================= RECENT ACTIVITY ================= */

function updateRecentActivity() {

  const container =
    document.getElementById(
      "recentActivity"
    );

  if (!container) return;

  const activities = [];

  visits.forEach(
    function (v) {

      activities.push({

        id: v.id,

        title: v.company,

        description:
          "Company visit" +
          (
            v.person
              ? " · " + v.person
              : ""
          ),

        time: v.time,

        icon: "🏢"
      });
    }
  );

  expenses.forEach(
    function (e) {

      activities.push({

        id: e.id,

        title:
          "₹" +
          Number(e.amount || 0)
            .toLocaleString("en-IN"),

        description:
          e.mode + " travel",

        time: e.time,

        icon: "₹"
      });
    }
  );

  activities.sort(
    function (a, b) {
      return b.id - a.id;
    }
  );


  if (activities.length === 0) {

    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">◌</div>
        <strong>No activity yet</strong>
        <span>
          Your latest visits and expenses
          will appear here.
        </span>
      </div>
    `;

    return;
  }


  container.innerHTML =
    activities
      .slice(0, 5)
      .map(
        function (a) {

          return `
            <div class="history-item">

              <strong>
                ${a.icon}
                ${escapeHTML(a.title)}
              </strong>

              <small>
                ${escapeHTML(a.description)}
                ·
                ${escapeHTML(a.time)}
              </small>

            </div>
          `;
        }
      )
      .join("");
}


/* ================= REPORTS ================= */

function updateReports() {

  const totalExpense =
    expenses.reduce(
      function (sum, item) {

        return (
          sum +
          Number(item.amount || 0)
        );

      },
      0
    );

  const requirements =
    visits.filter(
      function (v) {
        return (
          v.requirement &&
          v.requirement.trim() !== ""
        );
      }
    );


  document.getElementById(
    "totalVisits"
  ).textContent =
    visits.length;

  document.getElementById(
    "totalExpenses"
  ).textContent =
    "₹" +
    totalExpense.toLocaleString(
      "en-IN"
    );

  document.getElementById(
    "totalRequirements"
  ).textContent =
    requirements.length;

  renderVisitHistory();
  renderExpenseHistory();
}


/* ================= VISIT HISTORY ================= */

function renderVisitHistory() {

  const container =
    document.getElementById(
      "visitHistory"
    );

  if (!container) return;


  if (visits.length === 0) {

    container.innerHTML = `
      <div class="empty-state glass">
        <div class="empty-icon">🏢</div>
        <strong>No visits recorded</strong>
        <span>
          Add your first company visit
          from the Work section.
        </span>
      </div>
    `;

    return;
  }


  container.innerHTML =
    visits
      .slice()
      .reverse()
      .map(
        function (v) {

          return `
            <div class="history-item glass">

              <strong>
                🏢
                ${escapeHTML(v.company)}
              </strong>

              <small>
                ${escapeHTML(
                  formatDate(v.date)
                )}
                ·
                ${escapeHTML(v.time)}
              </small>

              ${
                v.person
                  ? `
                    <small>
                      👤
                      ${escapeHTML(v.person)}
                    </small>
                  `
                  : ""
              }

              ${
                v.designation
                  ? `
                    <small>
                      💼
                      ${escapeHTML(
                        v.designation
                      )}
                    </small>
                  `
                  : ""
              }

              ${
                v.phone
                  ? `
                    <small>
                      📞
                      ${escapeHTML(v.phone)}
                    </small>
                  `
                  : ""
              }

              ${
                v.email
                  ? `
                    <small>
                      📧
                      ${escapeHTML(v.email)}
                    </small>
                  `
                  : ""
              }

              ${
                v.service
                  ? `
                    <span class="tag">
                      ${escapeHTML(v.service)}
                    </span>
                  `
                  : ""
              }

              ${
                v.outcome
                  ? `
                    <span class="tag">
                      ${escapeHTML(v.outcome)}
                    </span>
                  `
                  : ""
              }

            </div>
          `;
        }
      )
      .join("");
}


/* ================= EXPENSE HISTORY ================= */

function renderExpenseHistory() {

  const container =
    document.getElementById(
      "expenseHistory"
    );

  if (!container) return;


  if (expenses.length === 0) {

    container.innerHTML = `
      <div class="empty-state glass">
        <div class="empty-icon">₹</div>
        <strong>No expenses recorded</strong>
        <span>
          Your travel expenses
          will appear here.
        </span>
      </div>
    `;

    return;
  }


  container.innerHTML =
    expenses
      .slice()
      .reverse()
      .map(
        function (e) {

          return `
            <div class="history-item glass">

              <strong>
                ₹${Number(
                  e.amount || 0
                ).toLocaleString("en-IN")}
              </strong>

              <small>
                ${escapeHTML(e.mode)}
                ·
                ${escapeHTML(
                  e.from || "-"
                )}
                →
                ${escapeHTML(
                  e.to || "-"
                )}
              </small>

              <small>
                ${escapeHTML(
                  formatDate(e.date)
                )}
                ·
                ${escapeHTML(
                  e.time || ""
                )}
              </small>

              ${
                e.purpose
                  ? `
                    <span class="tag">
                      ${escapeHTML(
                        e.purpose
                      )}
                    </span>
                  `
                  : ""
              }

            </div>
          `;
        }
      )
      .join("");
}


/* ================= WHATSAPP ================= */

function generateWhatsApp() {

  const today = getToday();

  const todayVisits =
    visits.filter(
      function (v) {
        return v.date === today;
      }
    );

  const todayExpenses =
    expenses.filter(
      function (e) {
        return e.date === today;
      }
    );

  const totalExpense =
    todayExpenses.reduce(
      function (sum, e) {
        return (
          sum +
          Number(e.amount || 0)
        );
      },
      0
    );


  let message =
`*DAILY WORK REPORT*
📅 ${formatDate(today)}

━━━━━━━━━━━━━━━━━━
*COMPANY VISITS*
━━━━━━━━━━━━━━━━━━
`;


  if (todayVisits.length === 0) {

    message +=
      "No company visits recorded.\n";

  } else {

    todayVisits.forEach(
      function (v, index) {

        message +=
`
*${index + 1}. ${v.company}*

👤 Person: ${v.person || "-"}
💼 Designation: ${v.designation || "-"}
📞 Contact: ${v.phone || "-"}
📧 Email: ${v.email || "-"}
🏭 Industry: ${v.industry || "-"}
⚡ Service: ${v.service || "-"}
📌 Outcome: ${v.outcome || "-"}
🎯 Requirement: ${v.requirement || "-"}
📅 Follow-up: ${
  v.followup
    ? formatDate(v.followup)
    : "-"
}
📝 Notes: ${v.notes || "-"}
`;
      }
    );
  }


  message +=
`
━━━━━━━━━━━━━━━━━━
*TRAVEL EXPENSE*
━━━━━━━━━━━━━━━━━━
`;


  if (todayExpenses.length === 0) {

    message +=
      "No travel expenses recorded.\n";

  } else {

    todayExpenses.forEach(
      function (e, index) {

        message +=
`${index + 1}. ${e.mode}
${e.from || "-"} → ${e.to || "-"}
Amount: ₹${e.amount}
Purpose: ${e.purpose || "-"}

`;
      }
    );
  }


  message +=
`
━━━━━━━━━━━━━━━━━━
*TOTAL TRAVEL EXPENSE: ₹${totalExpense.toLocaleString("en-IN")}*
━━━━━━━━━━━━━━━━━━
`;


  copyText(message);
}


/* ================= COPY ================= */

function copyText(text) {

  if (
    navigator.clipboard &&
    window.isSecureContext
  ) {

    navigator.clipboard
      .writeText(text)
      .then(
        function () {

          showToast(
            "✓ WhatsApp report copied"
          );
        }
      )
      .catch(
        function () {
          fallbackCopy(text);
        }
      );

  } else {

    fallbackCopy(text);
  }
}


function fallbackCopy(text) {

  const area =
    document.createElement(
      "textarea"
    );

  area.value = text;

  area.style.position = "fixed";
  area.style.opacity = "0";

  document.body.appendChild(area);

  area.focus();
  area.select();

  try {

    document.execCommand("copy");

    showToast(
      "✓ WhatsApp report copied"
    );

  } catch {

    prompt(
      "Copy your WhatsApp report:",
      text
    );
  }

  area.remove();
}


/* ================= BACKUP ================= */

function exportData() {

  const backup = {

    app: "FieldHub",

    version: 1,

    exportedAt:
      new Date().toISOString(),

    visits:
      visits,

    expenses:
      expenses
  };


  const blob =
    new Blob(
      [
        JSON.stringify(
          backup,
          null,
          2
        )
      ],
      {
        type: "application/json"
      }
    );


  const url =
    URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = url;

  link.download =
    "fieldhub-backup-" +
    getToday() +
    ".json";

  document.body.appendChild(link);

  link.click();

  link.remove();

  URL.revokeObjectURL(url);

  showToast(
    "✓ Backup downloaded"
  );
}


/* ================= RESTORE ================= */

function importData(event) {

  const file =
    event.target.files[0];

  if (!file) return;


  const reader =
    new FileReader();


  reader.onload =
    function (e) {

      try {

        const data =
          JSON.parse(
            e.target.result
          );


        if (
          !Array.isArray(
            data.visits
          ) ||
          !Array.isArray(
            data.expenses
          )
        ) {

          showToast(
            "Invalid FieldHub backup."
          );

          return;
        }


        visits =
          data.visits;

        expenses =
          data.expenses;


        localStorage.setItem(
          "fieldhub_visits",
          JSON.stringify(visits)
        );

        localStorage.setItem(
          "fieldhub_expenses",
          JSON.stringify(expenses)
        );


        updateDashboard();
        updateReports();


        showToast(
          "✓ Backup restored"
        );

      } catch {

        showToast(
          "Could not read backup."
        );
      }
    };


  reader.readAsText(file);

  event.target.value = "";
}


/* ================= DELETE ================= */

function clearAllData() {

  const confirmed =
    confirm(
      "DELETE ALL VISITS AND EXPENSES?\n\nThis cannot be undone."
    );

  if (!confirmed) return;


  visits = [];
  expenses = [];


  localStorage.removeItem(
    "fieldhub_visits"
  );

  localStorage.removeItem(
    "fieldhub_expenses"
  );


  updateDashboard();
  updateReports();


  showToast(
    "All data deleted"
  );
}


/* ================= HTML ESCAPE ================= */

function escapeHTML(value) {

  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value)
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );
}


/* ================= CONNECTION ================= */

function updateConnectionStatus() {

  const status =
    document.getElementById(
      "connectionStatus"
    );

  if (!status) return;


  if (navigator.onLine) {

    status.classList.remove(
      "offline"
    );

    status.innerHTML =
      "<span></span> ONLINE";

  } else {

    status.classList.add(
      "offline"
    );

    status.innerHTML =
      "<span></span> OFFLINE";
  }
}


window.addEventListener(
  "online",
  updateConnectionStatus
);

window.addEventListener(
  "offline",
  updateConnectionStatus
);


/* ================= PWA INSTALL ================= */

let deferredInstallPrompt = null;


window.addEventListener(
  "beforeinstallprompt",
  function (event) {

    event.preventDefault();

    deferredInstallPrompt =
      event;


    const button =
      document.getElementById(
        "installAppBtn"
      );

    if (button) {
      button.style.display =
        "block";
    }
  }
);


document.addEventListener(
  "click",
  function (event) {

    if (
      event.target &&
      event.target.id ===
        "installAppBtn"
    ) {

      installFieldHub();
    }
  }
);


async function installFieldHub() {

  const button =
    document.getElementById(
      "installAppBtn"
    );


  if (!deferredInstallPrompt) {

    showToast(
      "Use Chrome menu → Add to Home screen"
    );

    return;
  }


  deferredInstallPrompt.prompt();


  const result =
    await deferredInstallPrompt
      .userChoice;


  console.log(
    "Install result:",
    result.outcome
  );


  deferredInstallPrompt = null;


  if (button) {
    button.style.display =
      "none";
  }
}


window.addEventListener(
  "appinstalled",
  function () {

    const button =
      document.getElementById(
        "installAppBtn"
      );

    if (button) {
      button.style.display =
        "none";
    }

    showToast(
      "✓ FieldHub installed"
    );
  }
);


/* ================= SERVICE WORKER ================= */

function registerServiceWorker() {

  /*
    This only works once FieldHub is hosted
    on HTTPS or localhost.

    It is intentionally safe to leave enabled
    while developing.
  */

  if (
    !("serviceWorker" in navigator)
  ) {
    return;
  }


  window.addEventListener(
    "load",
    function () {

      navigator.serviceWorker
        .register(
          "./service-worker.js"
        )
        .then(
          function (registration) {

            console.log(
              "FieldHub Service Worker registered:",
              registration.scope
            );
          }
        )
        .catch(
          function (error) {

            console.log(
              "Service Worker unavailable:",
              error
            );
          }
        );
    }
  );
}
```
```javascript
/* =========================================================
   FIELDHUB
   Field Work Command Center
   ========================================================= */


/* ================= DATA ================= */

let visits =
  JSON.parse(
    localStorage.getItem("fieldhub_visits")
  ) || [];

let expenses =
  JSON.parse(
    localStorage.getItem("fieldhub_expenses")
  ) || [];

let currentGPS = null;
let toastTimer = null;


/* ================= DATE ================= */

function getToday() {

  const now = new Date();

  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0")
  ].join("-");
}


function formatDate(dateString) {

  if (!dateString) return "";

  const date =
    new Date(dateString + "T00:00:00");

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  );
}


function formatTime() {

  return new Date().toLocaleTimeString(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit"
    }
  );
}


/* ================= INITIALIZATION ================= */

document.addEventListener(
  "DOMContentLoaded",
  function () {

    const expenseDate =
      document.getElementById(
        "expenseDate"
      );

    if (expenseDate) {
      expenseDate.value = getToday();
    }

    updateDate();
    updateDashboard();
    updateReports();

    setupForms();
    updateConnectionStatus();

    registerServiceWorker();
  }
);


/* ================= TOAST ================= */

function showToast(message) {

  const toast =
    document.getElementById("toast");

  if (!toast) return;

  clearTimeout(toastTimer);

  toast.textContent = message;

  toast.classList.add("show");

  toastTimer = setTimeout(
    function () {
      toast.classList.remove("show");
    },
    2500
  );
}


/* ================= DATE HEADER ================= */

function updateDate() {

  const element =
    document.getElementById("todayDate");

  if (!element) return;

  const now = new Date();

  element.textContent =
    now.toLocaleDateString(
      "en-IN",
      {
        weekday: "long",
        day: "numeric",
        month: "long"
      }
    );
}


/* ================= NAVIGATION ================= */

function showPage(pageName) {

  document
    .querySelectorAll(".page")
    .forEach(function (page) {
      page.classList.remove("active");
    });

  const selected =
    document.getElementById(pageName);

  if (!selected) return;

  selected.classList.add("active");

  document
    .querySelectorAll(".nav-item")
    .forEach(function (item) {

      item.classList.remove("active");

      if (
        item.dataset.page ===
        pageName
      ) {
        item.classList.add("active");
      }
    });

  if (pageName === "dashboard") {
    updateDashboard();
  }

  if (pageName === "reports") {
    updateReports();
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


/* ================= FORMS ================= */

function setupForms() {

  const workForm =
    document.getElementById(
      "workForm"
    );

  const expenseForm =
    document.getElementById(
      "expenseForm"
    );


  /* ---------- VISIT FORM ---------- */

  if (workForm) {

    workForm.addEventListener(
      "submit",
      function (event) {

        event.preventDefault();

        const company =
          document
            .getElementById("company")
            .value
            .trim();

        if (!company) {

          showToast(
            "Company name is required."
          );

          return;
        }

        const visit = {

          id: Date.now(),

          date: getToday(),

          time: formatTime(),

          company:
            company,

          person:
            document
              .getElementById("person")
              .value
              .trim(),

          designation:
            document
              .getElementById("designation")
              .value
              .trim(),

          phone:
            document
              .getElementById("phone")
              .value
              .trim(),

          email:
            document
              .getElementById("email")
              .value
              .trim(),

          industry:
            document
              .getElementById("industry")
              .value
              .trim(),

          service:
            document
              .getElementById("service")
              .value,

          requirement:
            document
              .getElementById("requirement")
              .value
              .trim(),

          outcome:
            document
              .getElementById("outcome")
              .value,

          followup:
            document
              .getElementById("followup")
              .value,

          notes:
            document
              .getElementById("notes")
              .value
              .trim(),

          gps:
            currentGPS
        };

        visits.push(visit);

        localStorage.setItem(
          "fieldhub_visits",
          JSON.stringify(visits)
        );

        workForm.reset();

        currentGPS = null;

        const gpsStatus =
          document.getElementById(
            "gpsStatus"
          );

        if (gpsStatus) {
          gpsStatus.textContent =
            "Location not captured";
        }

        updateDashboard();
        updateReports();

        showToast(
          "✓ Visit saved successfully"
        );

        setTimeout(
          function () {
            showPage("dashboard");
          },
          400
        );
      }
    );
  }


  /* ---------- EXPENSE FORM ---------- */

  if (expenseForm) {

    expenseForm.addEventListener(
      "submit",
      function (event) {

        event.preventDefault();

        const amount =
          Number(
            document
              .getElementById(
                "expenseAmount"
              )
              .value
          );

        if (
          isNaN(amount) ||
          amount < 0
        ) {

          showToast(
            "Enter a valid expense amount."
          );

          return;
        }

        const expense = {

          id: Date.now(),

          date:
            document
              .getElementById(
                "expenseDate"
              )
              .value,

          time:
            formatTime(),

          from:
            document
              .getElementById(
                "fromPlace"
              )
              .value
              .trim(),

          to:
            document
              .getElementById(
                "toPlace"
              )
              .value
              .trim(),

          mode:
            document
              .getElementById(
                "travelMode"
              )
              .value,

          amount:
            amount,

          purpose:
            document
              .getElementById(
                "expensePurpose"
              )
              .value
              .trim(),

          notes:
            document
              .getElementById(
                "expenseNotes"
              )
              .value
              .trim()
        };

        expenses.push(expense);

        localStorage.setItem(
          "fieldhub_expenses",
          JSON.stringify(expenses)
        );

        expenseForm.reset();

        document.getElementById(
          "expenseDate"
        ).value = getToday();

        updateDashboard();
        updateReports();

        showToast(
          "✓ Expense saved successfully"
        );

        setTimeout(
          function () {
            showPage("dashboard");
          },
          400
        );
      }
    );
  }
}


/* ================= GPS ================= */

function captureGPS() {

  const status =
    document.getElementById(
      "gpsStatus"
    );

  if (!status) return;

  if (!navigator.geolocation) {

    status.textContent =
      "GPS is not supported.";

    return;
  }

  status.textContent =
    "⌖ Getting your location...";

  navigator.geolocation.getCurrentPosition(

    function (position) {

      currentGPS = {

        latitude:
          Number(
            position.coords.latitude
              .toFixed(6)
          ),

        longitude:
          Number(
            position.coords.longitude
              .toFixed(6)
          ),

        accuracy:
          Math.round(
            position.coords.accuracy
          ),

        capturedAt:
          new Date().toISOString()
      };

      status.textContent =
        "✓ Location captured (" +
        currentGPS.accuracy +
        "m accuracy)";

      showToast(
        "✓ Location captured"
      );
    },

    function (error) {

      let message =
        "Unable to capture location.";

      if (error.code === 1) {
        message =
          "Location permission was denied.";
      }

      if (error.code === 2) {
        message =
          "Location unavailable.";
      }

      if (error.code === 3) {
        message =
          "Location request timed out.";
      }

      status.textContent = message;

      showToast(message);
    },

    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    }
  );
}


/* ================= DASHBOARD ================= */

function updateDashboard() {

  const today = getToday();

  const todayVisits =
    visits.filter(
      function (v) {
        return v.date === today;
      }
    );

  const todayExpenses =
    expenses.filter(
      function (e) {
        return e.date === today;
      }
    );

  const expenseTotal =
    todayExpenses.reduce(
      function (sum, item) {
        return (
          sum +
          Number(item.amount || 0)
        );
      },
      0
    );

  const followups =
    visits.filter(
      function (v) {

        return (
          v.followup === today ||
          (
            v.outcome ===
              "Follow-up required" &&
            v.date === today
          )
        );
      }
    );

  const requirements =
    todayVisits.filter(
      function (v) {
        return (
          v.requirement &&
          v.requirement.trim() !== ""
        );
      }
    );


  document.getElementById(
    "visitCount"
  ).textContent =
    todayVisits.length;

  document.getElementById(
    "expenseToday"
  ).textContent =
    "₹" +
    expenseTotal.toLocaleString(
      "en-IN"
    );

  document.getElementById(
    "followupCount"
  ).textContent =
    followups.length;

  document.getElementById(
    "requirementCount"
  ).textContent =
    requirements.length;

  updateRecentActivity();
}


/* ================= RECENT ACTIVITY ================= */

function updateRecentActivity() {

  const container =
    document.getElementById(
      "recentActivity"
    );

  if (!container) return;

  const activities = [];

  visits.forEach(
    function (v) {

      activities.push({

        id: v.id,

        title: v.company,

        description:
          "Company visit" +
          (
            v.person
              ? " · " + v.person
              : ""
          ),

        time: v.time,

        icon: "🏢"
      });
    }
  );

  expenses.forEach(
    function (e) {

      activities.push({

        id: e.id,

        title:
          "₹" +
          Number(e.amount || 0)
            .toLocaleString("en-IN"),

        description:
          e.mode + " travel",

        time: e.time,

        icon: "₹"
      });
    }
  );

  activities.sort(
    function (a, b) {
      return b.id - a.id;
    }
  );


  if (activities.length === 0) {

    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">◌</div>
        <strong>No activity yet</strong>
        <span>
          Your latest visits and expenses
          will appear here.
        </span>
      </div>
    `;

    return;
  }


  container.innerHTML =
    activities
      .slice(0, 5)
      .map(
        function (a) {

          return `
            <div class="history-item">

              <strong>
                ${a.icon}
                ${escapeHTML(a.title)}
              </strong>

              <small>
                ${escapeHTML(a.description)}
                ·
                ${escapeHTML(a.time)}
              </small>

            </div>
          `;
        }
      )
      .join("");
}


/* ================= REPORTS ================= */

function updateReports() {

  const totalExpense =
    expenses.reduce(
      function (sum, item) {

        return (
          sum +
          Number(item.amount || 0)
        );

      },
      0
    );

  const requirements =
    visits.filter(
      function (v) {
        return (
          v.requirement &&
          v.requirement.trim() !== ""
        );
      }
    );


  document.getElementById(
    "totalVisits"
  ).textContent =
    visits.length;

  document.getElementById(
    "totalExpenses"
  ).textContent =
    "₹" +
    totalExpense.toLocaleString(
      "en-IN"
    );

  document.getElementById(
    "totalRequirements"
  ).textContent =
    requirements.length;

  renderVisitHistory();
  renderExpenseHistory();
}


/* ================= VISIT HISTORY ================= */

function renderVisitHistory() {

  const container =
    document.getElementById(
      "visitHistory"
    );

  if (!container) return;


  if (visits.length === 0) {

    container.innerHTML = `
      <div class="empty-state glass">
        <div class="empty-icon">🏢</div>
        <strong>No visits recorded</strong>
        <span>
          Add your first company visit
          from the Work section.
        </span>
      </div>
    `;

    return;
  }


  container.innerHTML =
    visits
      .slice()
      .reverse()
      .map(
        function (v) {

          return `
            <div class="history-item glass">

              <strong>
                🏢
                ${escapeHTML(v.company)}
              </strong>

              <small>
                ${escapeHTML(
                  formatDate(v.date)
                )}
                ·
                ${escapeHTML(v.time)}
              </small>

              ${
                v.person
                  ? `
                    <small>
                      👤
                      ${escapeHTML(v.person)}
                    </small>
                  `
                  : ""
              }

              ${
                v.designation
                  ? `
                    <small>
                      💼
                      ${escapeHTML(
                        v.designation
                      )}
                    </small>
                  `
                  : ""
              }

              ${
                v.phone
                  ? `
                    <small>
                      📞
                      ${escapeHTML(v.phone)}
                    </small>
                  `
                  : ""
              }

              ${
                v.email
                  ? `
                    <small>
                      📧
                      ${escapeHTML(v.email)}
                    </small>
                  `
                  : ""
              }

              ${
                v.service
                  ? `
                    <span class="tag">
                      ${escapeHTML(v.service)}
                    </span>
                  `
                  : ""
              }

              ${
                v.outcome
                  ? `
                    <span class="tag">
                      ${escapeHTML(v.outcome)}
                    </span>
                  `
                  : ""
              }

            </div>
          `;
        }
      )
      .join("");
}


/* ================= EXPENSE HISTORY ================= */

function renderExpenseHistory() {

  const container =
    document.getElementById(
      "expenseHistory"
    );

  if (!container) return;


  if (expenses.length === 0) {

    container.innerHTML = `
      <div class="empty-state glass">
        <div class="empty-icon">₹</div>
        <strong>No expenses recorded</strong>
        <span>
          Your travel expenses
          will appear here.
        </span>
      </div>
    `;

    return;
  }


  container.innerHTML =
    expenses
      .slice()
      .reverse()
      .map(
        function (e) {

          return `
            <div class="history-item glass">

              <strong>
                ₹${Number(
                  e.amount || 0
                ).toLocaleString("en-IN")}
              </strong>

              <small>
                ${escapeHTML(e.mode)}
                ·
                ${escapeHTML(
                  e.from || "-"
                )}
                →
                ${escapeHTML(
                  e.to || "-"
                )}
              </small>

              <small>
                ${escapeHTML(
                  formatDate(e.date)
                )}
                ·
                ${escapeHTML(
                  e.time || ""
                )}
              </small>

              ${
                e.purpose
                  ? `
                    <span class="tag">
                      ${escapeHTML(
                        e.purpose
                      )}
                    </span>
                  `
                  : ""
              }

            </div>
          `;
        }
      )
      .join("");
}


/* ================= WHATSAPP ================= */

function generateWhatsApp() {

  const today = getToday();

  const todayVisits =
    visits.filter(
      function (v) {
        return v.date === today;
      }
    );

  const todayExpenses =
    expenses.filter(
      function (e) {
        return e.date === today;
      }
    );

  const totalExpense =
    todayExpenses.reduce(
      function (sum, e) {
        return (
          sum +
          Number(e.amount || 0)
        );
      },
      0
    );


  let message =
`*DAILY WORK REPORT*
📅 ${formatDate(today)}

━━━━━━━━━━━━━━━━━━
*COMPANY VISITS*
━━━━━━━━━━━━━━━━━━
`;


  if (todayVisits.length === 0) {

    message +=
      "No company visits recorded.\n";

  } else {

    todayVisits.forEach(
      function (v, index) {

        message +=
`
*${index + 1}. ${v.company}*

👤 Person: ${v.person || "-"}
💼 Designation: ${v.designation || "-"}
📞 Contact: ${v.phone || "-"}
📧 Email: ${v.email || "-"}
🏭 Industry: ${v.industry || "-"}
⚡ Service: ${v.service || "-"}
📌 Outcome: ${v.outcome || "-"}
🎯 Requirement: ${v.requirement || "-"}
📅 Follow-up: ${
  v.followup
    ? formatDate(v.followup)
    : "-"
}
📝 Notes: ${v.notes || "-"}
`;
      }
    );
  }


  message +=
`
━━━━━━━━━━━━━━━━━━
*TRAVEL EXPENSE*
━━━━━━━━━━━━━━━━━━
`;


  if (todayExpenses.length === 0) {

    message +=
      "No travel expenses recorded.\n";

  } else {

    todayExpenses.forEach(
      function (e, index) {

        message +=
`${index + 1}. ${e.mode}
${e.from || "-"} → ${e.to || "-"}
Amount: ₹${e.amount}
Purpose: ${e.purpose || "-"}

`;
      }
    );
  }


  message +=
`
━━━━━━━━━━━━━━━━━━
*TOTAL TRAVEL EXPENSE: ₹${totalExpense.toLocaleString("en-IN")}*
━━━━━━━━━━━━━━━━━━
`;


  copyText(message);
}


/* ================= COPY ================= */

function copyText(text) {

  if (
    navigator.clipboard &&
    window.isSecureContext
  ) {

    navigator.clipboard
      .writeText(text)
      .then(
        function () {

          showToast(
            "✓ WhatsApp report copied"
          );
        }
      )
      .catch(
        function () {
          fallbackCopy(text);
        }
      );

  } else {

    fallbackCopy(text);
  }
}


function fallbackCopy(text) {

  const area =
    document.createElement(
      "textarea"
    );

  area.value = text;

  area.style.position = "fixed";
  area.style.opacity = "0";

  document.body.appendChild(area);

  area.focus();
  area.select();

  try {

    document.execCommand("copy");

    showToast(
      "✓ WhatsApp report copied"
    );

  } catch {

    prompt(
      "Copy your WhatsApp report:",
      text
    );
  }

  area.remove();
}


/* ================= BACKUP ================= */

function exportData() {

  const backup = {

    app: "FieldHub",

    version: 1,

    exportedAt:
      new Date().toISOString(),

    visits:
      visits,

    expenses:
      expenses
  };


  const blob =
    new Blob(
      [
        JSON.stringify(
          backup,
          null,
          2
        )
      ],
      {
        type: "application/json"
      }
    );


  const url =
    URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = url;

  link.download =
    "fieldhub-backup-" +
    getToday() +
    ".json";

  document.body.appendChild(link);

  link.click();

  link.remove();

  URL.revokeObjectURL(url);

  showToast(
    "✓ Backup downloaded"
  );
}


/* ================= RESTORE ================= */

function importData(event) {

  const file =
    event.target.files[0];

  if (!file) return;


  const reader =
    new FileReader();


  reader.onload =
    function (e) {

      try {

        const data =
          JSON.parse(
            e.target.result
          );


        if (
          !Array.isArray(
            data.visits
          ) ||
          !Array.isArray(
            data.expenses
          )
        ) {

          showToast(
            "Invalid FieldHub backup."
          );

          return;
        }


        visits =
          data.visits;

        expenses =
          data.expenses;


        localStorage.setItem(
          "fieldhub_visits",
          JSON.stringify(visits)
        );

        localStorage.setItem(
          "fieldhub_expenses",
          JSON.stringify(expenses)
        );


        updateDashboard();
        updateReports();


        showToast(
          "✓ Backup restored"
        );

      } catch {

        showToast(
          "Could not read backup."
        );
      }
    };


  reader.readAsText(file);

  event.target.value = "";
}


/* ================= DELETE ================= */

function clearAllData() {

  const confirmed =
    confirm(
      "DELETE ALL VISITS AND EXPENSES?\n\nThis cannot be undone."
    );

  if (!confirmed) return;


  visits = [];
  expenses = [];


  localStorage.removeItem(
    "fieldhub_visits"
  );

  localStorage.removeItem(
    "fieldhub_expenses"
  );


  updateDashboard();
  updateReports();


  showToast(
    "All data deleted"
  );
}


/* ================= HTML ESCAPE ================= */

function escapeHTML(value) {

  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value)
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );
}


/* ================= CONNECTION ================= */

function updateConnectionStatus() {

  const status =
    document.getElementById(
      "connectionStatus"
    );

  if (!status) return;


  if (navigator.onLine) {

    status.classList.remove(
      "offline"
    );

    status.innerHTML =
      "<span></span> ONLINE";

  } else {

    status.classList.add(
      "offline"
    );

    status.innerHTML =
      "<span></span> OFFLINE";
  }
}


window.addEventListener(
  "online",
  updateConnectionStatus
);

window.addEventListener(
  "offline",
  updateConnectionStatus
);


/* ================= PWA INSTALL ================= */

let deferredInstallPrompt = null;


window.addEventListener(
  "beforeinstallprompt",
  function (event) {

    event.preventDefault();

    deferredInstallPrompt =
      event;


    const button =
      document.getElementById(
        "installAppBtn"
      );

    if (button) {
      button.style.display =
        "block";
    }
  }
);


document.addEventListener(
  "click",
  function (event) {

    if (
      event.target &&
      event.target.id ===
        "installAppBtn"
    ) {

      installFieldHub();
    }
  }
);


async function installFieldHub() {

  const button =
    document.getElementById(
      "installAppBtn"
    );


  if (!deferredInstallPrompt) {

    showToast(
      "Use Chrome menu → Add to Home screen"
    );

    return;
  }


  deferredInstallPrompt.prompt();


  const result =
    await deferredInstallPrompt
      .userChoice;


  console.log(
    "Install result:",
    result.outcome
  );


  deferredInstallPrompt = null;


  if (button) {
    button.style.display =
      "none";
  }
}


window.addEventListener(
  "appinstalled",
  function () {

    const button =
      document.getElementById(
        "installAppBtn"
      );

    if (button) {
      button.style.display =
        "none";
    }

    showToast(
      "✓ FieldHub installed"
    );
  }
);


/* ================= SERVICE WORKER ================= */

function registerServiceWorker() {

  /*
    This only works once FieldHub is hosted
    on HTTPS or localhost.

    It is intentionally safe to leave enabled
    while developing.
  */

  if (
    !("serviceWorker" in navigator)
  ) {
    return;
  }


  window.addEventListener(
    "load",
    function () {

      navigator.serviceWorker
        .register(
          "./service-worker.js"
        )
        .then(
          function (registration) {

            console.log(
              "FieldHub Service Worker registered:",
              registration.scope
            );
          }
        )
        .catch(
          function (error) {

            console.log(
              "Service Worker unavailable:",
              error
            );
          }
        );
    }
  );
}
```
