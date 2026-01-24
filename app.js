const API = "http://localhost:3000";

let editingWorkerId = null;

function loadWorkers() {
  fetch(`${API}/workers`)
    .then((res) => res.json())
    .then((data) => {
      const list = document.getElementById("workers");
      list.innerHTML = ""; //reset list
      data.forEach((w) => {
        const li = document.createElement("li");

        const span = document.createElement("span");
        span.innerText = `${w.name} - Rs.${w.daily_wage}`;

        const editBtn = document.createElement("button");
        editBtn.className="edit";
        editBtn.innerText = "Edit";
        editBtn.style.backgroundColor="#f7ad23";
        editBtn.onclick = ()=> editWorker(w.id, w.name, w.daily_wage);

        const delBtn = document.createElement("button");
        delBtn.style.backgroundColor="#e62020";
        delBtn.innerText="Delete";
        delBtn.onclick= ()=> delWorker(w.id);

        const btnGrp =document.createElement("div");
        btnGrp.className="btngrp";
        btnGrp.appendChild(editBtn);
        btnGrp.appendChild(delBtn);


        li.appendChild(span);
        li.appendChild(btnGrp);
        list.appendChild(li);
      });
    });
}

function addWorker() {
  const name = document.getElementById("name").value;
  const daily_wage = document.getElementById("wage").value;
  if (!name || !daily_wage) {
    showToast("Fill the fields!", "error");
    return;
  }
  if (editingWorkerId) {
    fetch(`${API}/workers/${editingWorkerId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, daily_wage }),
    }).then(() => {
      showToast("Worker Updated!");
      editingWorkerId = null;
      document.getElementById("addBtn").innerText = "Add Worker";
      loadWorkers();
    });
  } else {
    fetch(`${API}/workers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, daily_wage }),
    }).then(() => {
      showToast("Worker Added!");
      loadWorkers();
    });
  }

  document.getElementById("name").value = "";//reset
  document.getElementById("wage").value = "";
}

function editWorker(id, name, wage) {
  document.getElementById("name").value = name;
  document.getElementById("wage").value = wage;
  editingWorkerId = id;
  document.getElementById("addBtn").innerText = "Update Worker";
}

function delWorker(id){
  if(!confirm("Are you sure you want to delete this worker?"))
    return;
  fetch(`${API}/workers/${id}`,{
    method:"DELETE"
  })
  .then(res=>res.json())
  .then(()=>{
    showToast("Worker deleted successfully");
    loadWorkers();
  });
}

function loadAttendanceForDate() {
  document.getElementById("saveBtn").disabled = false;
  const date = document.getElementById("attendanceDate").value;
  if (!date) return;

  fetch(`${API}/workers`)
    .then((res) => res.json())
    .then((workers) => {
      fetch(`${API}/attendance?date=${date}`)
        .then((res) => res.json())
        .then((attendance) => {
          const attendanceMap = {};
          attendance.forEach((a) => {
            attendanceMap[a.worker_id] = a.present;
          });

          const tbody = document.getElementById("attendanceTable");
          tbody.innerHTML = "";

          let presentCount = 0;

          workers.forEach((w) => {
            const isPresent = attendanceMap[w.id] === 1;
            if (isPresent) presentCount++;

            const checked = isPresent ? "checked" : "";

            tbody.innerHTML += `
              <tr>
                <td>${w.name}</td>
                <td>
                  <input type="checkbox" data-id="${w.id}" ${checked}>
                </td>
              </tr>
            `;
          });

          const total = workers.length;
          const absent = total - presentCount;
          document.getElementById("attendanceSummary").innerText =
            `Total: ${total} | Present: ${presentCount} | Absent: ${absent}`;
          if (attendance.length === 0) {
            document.getElementById("attendanceSummary").innerText +=
              " (No attendance recorded yet)";
          }
        });
    });
}

function saveAttendance() {
  const date = document.getElementById("attendanceDate").value;
  if (!date) {
    showToast("Please select a date", "error");
    return;
  }
  const checkboxes = document.querySelectorAll(
    '#attendanceTable input[type="checkbox"]',
  );
  checkboxes.forEach((cb) => {
    const worker_id = cb.getAttribute("data-id");
    const present = cb.checked;

    fetch(`${API}/attendance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        worker_id,
        date,
        present,
      }),
    });
  });

  checkboxes.forEach((cb) => {
    cb.checked = false;
  });
  document.getElementById("attendanceDate").value = "";
  document.getElementById("attendanceSummary").innerText = "";
  document.getElementById("saveBtn").disabled = true;
  showToast("Attendance saved successfully", "good");
}

//workers list for payment dropdown 
function loadPaymentWorkers() {
  fetch(`${API}/workers`)
    .then(res => res.json())
    .then(data => {
      const select = document.getElementById("paymentSelect");
      select.innerHTML = "";
      data.forEach(w => {
        const option = document.createElement("option");
        option.value = w.id;
        option.innerText = w.name;
        select.appendChild(option);
      });
    });
}


//add payment
function addPayment() {
  const worker_id = document.getElementById("paymentSelect").value;
  const amount = document.getElementById("paymentAmount").value;
  const payment_date = document.getElementById("paymentDate").value;
  const remarks = document.getElementById("paymentRemarks").value;

  if (!worker_id || !amount || !payment_date) {
    showToast("Fill all required fields", "error");
    return;
  }

  fetch(`${API}/payments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ worker_id, amount, payment_date, remarks })
  }).then(() => {
    showToast("Payment added");
    loadPayments();
  });
}


//display payments made
function loadPayments() {
  fetch(`${API}/payments`)
    .then(res => res.json())
    .then(data => {
      const tbody = document.getElementById("paymentsTable");
      tbody.innerHTML = "";
      data.forEach(p => {
        tbody.innerHTML += `
          <tr>
            <td>${p.name}</td>
            <td>Rs.${p.amount}</td>
            <td>${p.payment_date.split("T")[0]}</td>
            <td>${p.remarks || "-"}</td>
          </tr>
        `;//.split to format date output 
      });
    });
}

//worker monthly report
function loadReport() {
  const month = document.getElementById("month").value;
  fetch(`${API}/report/monthly?month=${month}`)
    .then((res) => res.json())
    .then((data) => {
      const tbody = document.getElementById("report");
      tbody.innerHTML = "";
      data.forEach((r) => {
        tbody.innerHTML += `
                <tr>
                <td>${r.name}</td>
                <td>Rs.${r.daily_wage}</td>
                <td>${r.days_present}</td>
                <td>Rs.${r.total_salary}</td>
                </tr>
                `;
      });
    });
}

function showToast(message, error = "good") {
  const toast = document.getElementById("toast");
  toast.innerText = message;
  toast.style.backgroundColor = error === "error" ? "#ff2323" : "#22ce22";
  toast.className  = "show";//show
  setTimeout(() => {
    toast.className = toast.className.replace("show", "");//hide
  }, 3000);
}

loadWorkers();
loadPaymentWorkers();
loadPayments();
