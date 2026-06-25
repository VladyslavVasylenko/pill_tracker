// --- TRANSLATIONS DICTIONARY ---
const translations = {
    en: {
        formTitleAdd: "Log Medication",
        formTitleEdit: "Edit Medication Entry",
        lblDate: "Date",
        lblTime: "Time",
        lblPillName: "Medication Name",
        lblDose: "Dosage",
        btnSaveAdd: "Save Entry",
        btnSaveEdit: "Update Entry",
        calendarTitle: "Calendar",
        developer: "Developer: Vladyslav Vasylenko",
        weekdays: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
        months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        noRecords: "No medications recorded for this day.",
        dayStatus: "Quick Status for the whole day:",
        btnTaken: "Taken",
        btnMissed: "Missed",
        btnActionEdit: "Edit",
        btnActionDelete: "Delete",
        alertSaved: "Entry saved!",
        alertUpdated: "Entry updated!",
        confirmDelete: "Are you sure you want to delete this log?"
    },
    uk: {
        formTitleAdd: "Внесення ліків",
        formTitleEdit: "Редагування запису",
        lblDate: "Дата",
        lblTime: "Час",
        lblPillName: "Назва ліків",
        lblDose: "Дозування",
        btnSaveAdd: "Зберегти запис",
        btnSaveEdit: "Оновити запис",
        calendarTitle: "Календар",
        developer: "Розробник: Владислав Василенко",
        weekdays: ["Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
        months: ["Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень", "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень"],
        noRecords: "Немає записів про прийом ліків на цей день.",
        dayStatus: "Швидкий статус для всього дня:",
        btnTaken: "Прийнято",
        btnMissed: "Пропущено",
        btnActionEdit: "Редагувати",
        btnActionDelete: "Видалити",
        alertSaved: "Запис збережено!",
        alertUpdated: "Запис оновлено!",
        confirmDelete: "Ви впевнені, що хочете видалити цей запис?"
    },
    cs: {
        formTitleAdd: "Záznam léků",
        formTitleEdit: "Upravit záznam léků",
        lblDate: "Datum",
        lblTime: "Čas",
        lblPillName: "Název léku",
        lblDose: "Dávkování",
        btnSaveAdd: "Uložit záznam",
        btnSaveEdit: "Aktualizovat",
        calendarTitle: "Kalendář",
        developer: "Vývojář: Vladyslav Vasylenko",
        weekdays: ["Ne", "Po", "Út", "St", "Čt", "Pá", "So"],
        months: ["Leden", "Únor", "Březen", "Duben", "Květen", "Červen", "Červenec", "Srpen", "Září", "Říjen", "Listopad", "Prosinec"],
        noRecords: "Pro tento den nejsou zaznamenány žádné léky.",
        dayStatus: "Rychlý status pro celý den:",
        btnTaken: "Užito",
        btnMissed: "Vynecháno",
        btnActionEdit: "Upravit",
        btnActionDelete: "Smazat",
        alertSaved: "Záznam uložen!",
        alertUpdated: "Záznam aktualizován!",
        confirmDelete: "Opravdu chcete tento záznam smazat?"
    }
};

// --- STATE MANAGEMENT ---
let currentLang = 'en';
let currentDate = new Date();
let selectedDateStr = '';

let pillLogs = JSON.parse(localStorage.getItem('pill_logs')) || [];
let dayStatuses = JSON.parse(localStorage.getItem('day_statuses')) || {};

// --- INITIALIZATION ---
window.addEventListener('DOMContentLoaded', () => {
    setDefaultDateTime();
    changeLanguage('en'); // English defaults on startup
});

function setDefaultDateTime() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('pillDate').value = today;
    
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    document.getElementById('pillTime').value = timeStr;
}

// --- TRANSLATION ENGINE ---
function changeLanguage(lang) {
    currentLang = lang;
    document.getElementById('langSelect').value = lang;
    
    const t = translations[lang];
    const isEditing = document.getElementById('editIndex').value !== "-1";
    
    // Update Form Title and Button state depending on active mode (Add vs Edit)
    document.getElementById('txtFormTitle').innerText = isEditing ? t.formTitleEdit : t.formTitleAdd;
    document.getElementById('btnSave').innerText = isEditing ? t.btnSaveEdit : t.btnSaveAdd;

    document.getElementById('lblDate').innerText = t.lblDate;
    document.getElementById('lblTime').innerText = t.lblTime;
    document.getElementById('lblPillName').innerText = t.lblPillName;
    document.getElementById('lblDose').innerText = t.lblDose;
    document.getElementById('txtCalendarTitle').innerText = t.calendarTitle;
    document.getElementById('txtDeveloper').innerText = t.developer;
    document.getElementById('lblDayStatus').innerText = t.dayStatus;
    document.getElementById('btnStatusTaken').innerText = t.btnTaken;
    document.getElementById('btnStatusMissed').innerText = t.btnMissed;

    renderCalendar();
}

// --- CALENDAR LOGIC ---
function renderCalendar() {
    const grid = document.getElementById('calendarGrid');
    grid.innerHTML = '';
    
    const t = translations[currentLang];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    document.getElementById('currentMonthYear').innerText = `${t.months[month]} ${year}`;

    t.weekdays.forEach(day => {
        const dayElem = document.createElement('div');
        dayElem.className = 'weekday';
        dayElem.innerText = day;
        grid.appendChild(dayElem);
    });

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDayIndex; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'day empty';
        grid.appendChild(emptyCell);
    }

    for (let day = 1; day <= totalDays; day++) {
        const dayElem = document.createElement('div');
        dayElem.className = 'day';
        dayElem.innerText = day;

        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        let status = dayStatuses[dateStr];
        
        if (!status) {
            const hasLogs = pillLogs.some(log => log.date === dateStr);
            if (hasLogs) status = 'taken';
        }

        if (status === 'taken') {
            dayElem.classList.add('taken');
        } else if (status === 'missed') {
            dayElem.classList.add('missed');
        } else {
            dayElem.classList.add('gray');
        }

        dayElem.onclick = () => openDayModal(dateStr);
        grid.appendChild(dayElem);
    }
}

function changeMonth(direction) {
    currentDate.setMonth(currentDate.getMonth() + direction);
    renderCalendar();
}

// --- DATA FORM MANAGEMENT (SAVE & UPDATE) ---
function saveLog(e) {
    e.preventDefault();
    
    const editIndex = parseInt(document.getElementById('editIndex').value);
    const date = document.getElementById('pillDate').value;
    const time = document.getElementById('pillTime').value;
    const name = document.getElementById('pillName').value;
    const dose = document.getElementById('pillDose').value;

    if (editIndex === -1) {
        // Mode: CREATE NEW LOG
        pillLogs.push({ date, time, name, dose });
        if (!dayStatuses[date]) {
            dayStatuses[date] = 'taken';
        }
        alert(translations[currentLang].alertSaved);
    } else {
        // Mode: UPDATE EXISTING LOG
        const oldDate = pillLogs[editIndex].date;
        pillLogs[editIndex] = { date, time, name, dose };
        
        // Clean up status of the old date if no entries left there
        cleanUpDayStatus(oldDate);
        
        // Ensure new date gets active status indicator
        if (!dayStatuses[date]) {
            dayStatuses[date] = 'taken';
        }
        
        alert(translations[currentLang].alertUpdated);
    }

    localStorage.setItem('pill_logs', JSON.stringify(pillLogs));
    localStorage.setItem('day_statuses', JSON.stringify(dayStatuses));

    resetForm();
    renderCalendar();
}

function resetForm() {
    document.getElementById('editIndex').value = "-1";
    document.getElementById('pillName').value = '';
    document.getElementById('pillDose').value = '';
    document.getElementById('btnCancelEdit').style.display = 'none';
    setDefaultDateTime();
    changeLanguage(currentLang);
}

// --- EDIT & DELETE ENTRIES FROM MODAL ---
function startEditLog(globalIndex) {
    const log = pillLogs[globalIndex];
    
    document.getElementById('editIndex').value = globalIndex;
    document.getElementById('pillDate').value = log.date;
    document.getElementById('pillTime').value = log.time;
    document.getElementById('pillName').value = log.name;
    document.getElementById('pillDose').value = log.dose;
    
    document.getElementById('btnCancelEdit').style.display = 'block';
    
    // Jump user focus to the input form section on mobile viewport
    document.getElementById('formSection').scrollIntoView({ behavior: 'smooth' });
    
    closeModal();
    changeLanguage(currentLang);
}

function deleteLog(globalIndex) {
    if (!confirm(translations[currentLang].confirmDelete)) return;
    
    const targetDate = pillLogs[globalIndex].date;
    
    // Remove element from global logs array
    pillLogs.splice(globalIndex, 1);
    localStorage.setItem('pill_logs', JSON.stringify(pillLogs));
    
    cleanUpDayStatus(targetDate);
    localStorage.setItem('day_statuses', JSON.stringify(dayStatuses));
    
    // If modal is open, refresh its current items list dynamically or close if empty
    const remainingPills = pillLogs.filter(log => log.date === targetDate);
    if (remainingPills.length > 0) {
        openDayModal(targetDate);
    } else {
        closeModal();
    }
    
    renderCalendar();
}

function cleanUpDayStatus(dateStr) {
    const hasAnyLogsLeft = pillLogs.some(log => log.date === dateStr);
    if (!hasAnyLogsLeft && (dayStatuses[dateStr] === 'taken')) {
        delete dayStatuses[dateStr];
    }
}

// --- MODAL / DETAIL VIEW ---
function openDayModal(dateStr) {
    selectedDateStr = dateStr;
    const modal = document.getElementById('dayModal');
    const title = document.getElementById('modalDateTitle');
    const listContainer = document.getElementById('modalPillsList');
    const t = translations[currentLang];

    title.innerText = dateStr;
    listContainer.innerHTML = '';

    // Filter pills for this specific day, keeping track of original array indices
    const dayPillsWithIndex = pillLogs
        .map((log, index) => ({ ...log, globalIndex: index }))
        .filter(log => log.date === dateStr);

    // Sort entries strictly by execution clock time
    dayPillsWithIndex.sort((a, b) => a.time.localeCompare(b.time));

    if (dayPillsWithIndex.length === 0) {
        listContainer.innerHTML = `<p style="color: var(--text-muted); font-size:0.9rem;">${t.noRecords}</p>`;
    } else {
        dayPillsWithIndex.forEach(pill => {
            const item = document.createElement('div');
            item.className = 'pill-list-item';
            item.innerHTML = `
                <div class="pill-info">
                    <strong>${pill.name}</strong><br>
                    <span style="color: var(--text-muted); font-size: 0.9rem;">${pill.dose}</span>
                </div>
                <div class="pill-actions-wrapper">
                    <span class="pill-time">⏰ ${pill.time}</span>
                    <div class="action-buttons">
                        <button class="btn-action edit" onclick="startEditLog(${pill.globalIndex})">${t.btnActionEdit}</button>
                        <button class="btn-action delete" onclick="deleteLog(${pill.globalIndex})">${t.btnActionDelete}</button>
                    </div>
                </div>
            `;
            listContainer.appendChild(item);
        });
    }

    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('dayModal').style.display = 'none';
}

function setDayStatus(status) {
    if (!selectedDateStr) return;
    
    dayStatuses[selectedDateStr] = status;
    localStorage.setItem('day_statuses', JSON.stringify(dayStatuses));
    
    renderCalendar();
    closeModal();
}

window.onclick = function(event) {
    const modal = document.getElementById('dayModal');
    if (event.target == modal) {
        closeModal();
    }
}
