/* =========================================================
   FIELDHUB
   Field Work Command Center
   ========================================================= */


/* ================= DATA ================= */

let visits =
  JSON.parse(localStorage.getItem("fieldhub_visits")) || [];

let expenses =
  JSON.parse(localStorage.getItem("fieldhub_expenses")) || [];

let currentGPS = null;
let toastTimer = null;


/* ================= DATE HELPERS ================= */

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

  const date = new Date(dateString + "T00:00:00");

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}


function formatTime() {
  return new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit"
  });
}


/* ================= INITIALIZATION ================= */

document.addEventListener("DOMContentLoaded", function () {

  const expenseDate = document.getElementById("expenseDate");

  if (expenseDate) {
    expenseDate.value = getToday();
  }

  updateDate();
  updateDashboard();
  updateReports();
  setupForms();
  updateConnectionStatus();
  registerServiceWorker();

});


/* ================= TOAST ================= */

function showToast(message) {

  const toast = document.getElementById("toast");

  if (!toast) return;

  clearTimeout(toastTimer);

  toast.textContent = message;
  toast.classList.add("show");

  toastTimer = setTimeout(function () {
    toast.classList.remove("show");
  }, 2500);

}


/* ================= DATE DISPLAY ================= */

function updateDate() {

  const element = document.getElementById("todayDate");

  if (!element) return;

  const now = new Date();

  element.textContent = now.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long"
  });

}


/* ================= PAGE NAVIGATION ================= */

function showPage(pageName) {

  document.querySelectorAll(".page").forEach(function (page) {
    page.classList.remove("active");
  });


  const selectedPage = document.getElementById(pageName);

  if (!selectedPage) {
    console.error("Page not found:", pageName);
    return;
  }


  selectedPage.classList.add("active");


  document.querySelectorAll(".nav-item").forEach(function (item) {

    item.classList.remove("active");

    if (item.dataset.page === pageName) {
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


/* ================= FORM SETUP ================= */

function setupForms() {

  const workForm = document.getElementById("workForm");
  const expenseForm = document.getElementById("expenseForm");


  /* ================= WORK VISIT ================= */

  if (workForm) {

    workForm.addEventListener("submit", function (event) {

      event.preventDefault();


      const companyElement =
        document.getElementById("company");

      const company =
        companyElement
          ? companyElement.value.trim()
          : "";


      if (!company) {

        showToast("Company name is required.");

        if (companyElement) {
          companyElement.focus();
        }

        return;
      }


      const visit = {

        id: Date.now(),

        date: getToday(),

        time: formatTime(),

        company: company,

        person:
          document.getElementById("person").value.trim(),

        designation:
          document.getElementById("designation").value.trim(),

        phone:
          document.getElementById("phone").value.trim(),

        email:
          document.getElementById("email").value.trim(),

        industry:
          document.getElementById("industry").value.trim(),

        service:
          document.getElementById("service").value,

        requirement:
          document.getElementById("requirement").value.trim(),

        outcome:
          document.getElementById("outcome").value,

        followup:
          document.getElementById("followup").value,

        notes:
          document.getElementById("notes").value.trim(),

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
        document.getElementById("gpsStatus");

      if (gpsStatus) {
        gpsStatus.textContent =
          "Location not captured";
      }


      updateDashboard();
      updateReports();


      showToast("✓ Visit saved successfully");


      setTimeout(function () {
        showPage("dashboard");
      }, 400);

    });

  }


  /* ================= EXPENSE ================= */

  if (expenseForm) {

    expenseForm.addEventListener("submit", function (event) {

      event.preventDefault();


      const amountElement =
        document.getElementById("expenseAmount");

      const amount =
        Number(
          amountElement
            ? amountElement.value
            : 0
        );


      if (isNaN(amount) || amount < 0) {

        showToast("Enter a valid expense amount.");

        if (amountElement) {
          amountElement.focus();
        }

        return;
      }


      const expense = {

        id: Date.now(),

        date:
          document.getElementById("expenseDate").value,

        time:
          formatTime(),

        from:
          document.getElementById("fromPlace").value.trim(),

        to:
          document.getElementById("toPlace").value.trim(),

        mode:
          document.getElementById("travelMode").value,

        amount:
          amount,

        purpose:
          document.getElementById("expensePurpose").value.trim(),

        notes:
          document.getElementById("expenseNotes").value.trim()

      };


      expenses.push(expense);


      localStorage.setItem(
        "fieldhub_expenses",
        JSON.stringify(expenses)
      );


      expenseForm.reset();


      document.getElementById("expenseDate").value =
        getToday();


      updateDashboard();
      updateReports();


      showToast("✓ Expense saved successfully");


      setTimeout(function () {
        showPage("dashboard");
      }, 400);

    });

  }

}


/* ================= GPS ================= */

function captureGPS() {

  const status =
    document.getElementById("gpsStatus");


  if (!status) return;


  if (!navigator.geolocation) {

    status.textContent =
      "GPS is not supported by this browser.";

    showToast(
      "GPS is not supported."
    );

    return;
  }


  status.textContent =
    "⌖ Getting your location...";


  navigator.geolocation.getCurrentPosition(

    function (position) {

      currentGPS = {

        latitude:
          Number(
            position.coords.latitude.toFixed(6)
          ),

        longitude:
          Number(
            position.coords.longitude.toFixed(6)
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


      showToast("✓ Location captured");

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
          "Location is currently unavailable.";
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
    visits.filter(function (visit) {
      return visit.date === today;
    });


  const todayExpenses =
    expenses.filter(function (expense) {
      return expense.date === today;
    });


  const expenseTotal =
    todayExpenses.reduce(
      function (sum, item) {
        return sum + Number(item.amount || 0);
      },
      0
    );


  const followups =
    visits.filter(function (visit) {

      return (
        visit.followup === today ||
        (
          visit.outcome === "Follow-up required" &&
          visit.date === today
        )
      );

    });


  const requirements =
    todayVisits.filter(function (visit) {

      return (
        visit.requirement &&
        visit.requirement.trim() !== ""
      );

    });


  const visitCount =
    document.getElementById("visitCount");

  const expenseToday =
    document.getElementById("expenseToday");

  const followupCount =
    document.getElementById("followupCount");

  const requirementCount =
    document.getElementById("requirementCount");


  if (visitCount) {
    visitCount.textContent =
      todayVisits.length;
  }


  if (expenseToday) {
    expenseToday.textContent =
      "₹" +
      expenseTotal.toLocaleString("en-IN");
  }


  if (followupCount) {
    followupCount.textContent =
      followups.length;
  }


  if (requirementCount) {
    requirementCount.textContent =
      requirements.length;
  }


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


  visits.forEach(function (visit) {

    activities.push({

      id: visit.id,

      title: visit.company,

      description:
        "Company visit" +
        (
          visit.person
            ? " · " + visit.person
            : ""
        ),

      time: visit.time,

      icon: "🏢"

    });

  });


  expenses.forEach(function (expense) {

    activities.push({

      id: expense.id,

      title:
        "₹" +
        Number(expense.amount || 0)
          .toLocaleString("en-IN"),

      description:
        expense.mode + " travel",

      time: expense.time,

      icon: "₹"

    });

  });


  activities.sort(function (a, b) {
    return b.id - a.id;
  });


  if (activities.length === 0) {

    container.innerHTML = `
      <div class="empty-state">

        <div class="empty-icon">
          ◌
        </div>

        <strong>
          No activity yet
        </strong>

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
      .map(function (activity) {

        return `
          <div class="history-item">

            <strong>
              ${activity.icon}
              ${escapeHTML(activity.title)}
            </strong>

            <small>
              ${escapeHTML(activity.description)}
              ·
              ${escapeHTML(activity.time)}
            </small>

          </div>
        `;

      })
      .join("");

}


/* ================= REPORTS ================= */

function updateReports() {

  const totalExpense =
    expenses.reduce(
      function (sum, item) {
        return sum + Number(item.amount || 0);
      },
      0
    );


  const requirements =
    visits.filter(function (visit) {

      return (
        visit.requirement &&
        visit.requirement.trim() !== ""
      );

    });


  const totalVisits =
    document.getElementById(
      "totalVisits"
    );

  const totalExpenses =
    document.getElementById(
      "totalExpenses"
    );

  const totalRequirements =
    document.getElementById(
      "totalRequirements"
    );


  if (totalVisits) {
    totalVisits.textContent =
      visits.length;
  }


  if (totalExpenses) {
    totalExpenses.textContent =
      "₹" +
      totalExpense.toLocaleString("en-IN");
  }


  if (totalRequirements) {
    totalRequirements.textContent =
      requirements.length;
  }


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

        <div class="empty-icon">
          🏢
        </div>

        <strong>
          No visits recorded
        </strong>

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
      .map(function (visit) {

        return `
          <div class="history-item glass">

            <strong>
              🏢
              ${escapeHTML(visit.company)}
            </strong>

            <small>
              ${escapeHTML(
                formatDate(visit.date)
              )}
              ·
              ${escapeHTML(visit.time)}
            </small>

            ${
              visit.person
                ? `
                  <small>
                    👤
                    ${escapeHTML(
                      visit.person
                    )}
                  </small>
                `
                : ""
            }

            ${
              visit.designation
                ? `
                  <small>
                    💼
                    ${escapeHTML(
                      visit.designation
                    )}
                  </small>
                `
                : ""
            }

            ${
              visit.phone
                ? `
                  <small>
                    📞
                    ${escapeHTML(
                      visit.phone
                    )}
                  </small>
                `
                : ""
            }

            ${
              visit.email
                ? `
                  <small>
                    📧
                    ${escapeHTML(
                      visit.email
                    )}
                  </small>
                `
                : ""
            }

            ${
              visit.service
                ? `
                  <span class="tag">
                    ${escapeHTML(
                      visit.service
                    )}
                  </span>
                `
                : ""
            }

            ${
              visit.outcome
                ? `
                  <span class="tag">
                    ${escapeHTML(
                      visit.outcome
                    )}
                  </span>
                `
                : ""
            }

          </div>
        `;

      })
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

        <div class="empty-icon">
          ₹
        </div>

        <strong>
          No expenses recorded
        </strong>

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
      .map(function (expense) {

        return `
          <div class="history-item glass">

            <strong>
              ₹${Number(
                expense.amount || 0
              ).toLocaleString("en-IN")}
            </strong>

            <small>
              ${escapeHTML(expense.mode)}
              ·
              ${escapeHTML(
                expense.from || "-"
              )}
              →
              ${escapeHTML(
                expense.to || "-"
              )}
            </small>

            <small>
              ${escapeHTML(
                formatDate(expense.date)
              )}
              ·
              ${escapeHTML(
                expense.time || ""
              )}
            </small>

            ${
              expense.purpose
                ? `
                  <span class="tag">
                    ${escapeHTML(
                      expense.purpose
                    )}
                  </span>
                `
                : ""
            }

          </div>
        `;

      })
      .join("");

}


/* ================= WHATSAPP REPORT ================= */

function generateWhatsApp() {

  const today = getToday();


  const todayVisits =
    visits.filter(function (visit) {
      return visit.date === today;
    });


  const todayExpenses =
    expenses.filter(function (expense) {
      return expense.date === today;
    });


  const totalExpense =
    todayExpenses.reduce(
      function (sum, expense) {
        return (
          sum +
          Number(expense.amount || 0)
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
      function (visit, index) {

        message +=
`
*${index + 1}. ${visit.company}*

👤 Person: ${visit.person || "-"}
💼 Designation: ${visit.designation || "-"}
📞 Contact: ${visit.phone || "-"}
📧 Email: ${visit.email || "-"}
🏭 Industry: ${visit.industry || "-"}
⚡ Service: ${visit.service || "-"}
📌 Outcome: ${visit.outcome || "-"}
🎯 Requirement: ${visit.requirement || "-"}
📅 Follow-up: ${
  visit.followup
    ? formatDate(visit.followup)
    : "-"
}
📝 Notes: ${visit.notes || "-"}
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
      function (expense, index) {

        message +=
`${index + 1}. ${expense.mode}
${expense.from || "-"} → ${expense.to || "-"}
Amount: ₹${expense.amount}
Purpose: ${expense.purpose || "-"}

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


/* ================= COPY TEXT ================= */

function copyText(text) {

  if (
    navigator.clipboard &&
    window.isSecureContext
  ) {

    navigator.clipboard
      .writeText(text)
      .then(function () {

        showToast(
          "✓ WhatsApp report copied"
        );

      })
      .catch(function () {

        fallbackCopy(text);

      });

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
  area.style.left = "-9999px";
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
    document.createElement(
      "a"
    );


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
    event.target.files &&
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
          !Array.isArray(data.visits) ||
          !Array.isArray(data.expenses)
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


      } catch (error) {

        console.error(
          "Restore error:",
          error
        );

        showToast(
          "Could not read backup."
        );

      }

    };


  reader.readAsText(file);


  event.target.value = "";

}


/* ================= DELETE DATA ================= */

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
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


/* ================= ONLINE / OFFLINE ================= */

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


  try {

    deferredInstallPrompt.prompt();


    const result =
      await deferredInstallPrompt.userChoice;


    console.log(
      "Install result:",
      result.outcome
    );


  } catch (error) {

    console.error(
      "Install error:",
      error
    );

  }


  deferredInstallPrompt = null;


  if (button) {

    button.style.display =
      "none";

  }

}


/* ================= APP INSTALLED ================= */

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

  if (
    !("serviceWorker" in navigator)
  ) {
    return;
  }


  /*
    Service workers require HTTPS or localhost.
    GitHub Pages provides HTTPS.
  */


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

            console.warn(
              "Service Worker unavailable:",
              error
            );

          }
        );

    }
  );

}
