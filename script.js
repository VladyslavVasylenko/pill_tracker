// --- TRANSLATIONS DICTIONARY ---
const translations = {
    en: {
        formTitle: "Log Medication",
        lblDate: "Date",
        lblTime: "Time",
        lblPillName: "Medication Name",
        lblDose: "Dosage",
        btnSave: "Save Entry",
        calendarTitle: "Calendar",
        developer: "Developer: Vladyslav",
        weekdays: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
        months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        noRecords: "No medications recorded for this day.",
        dayStatus: "Quick Status for the whole day:",
        btnTaken: "Taken",
        btnMissed: "Missed"
    },
    uk: {
        formTitle: "Внесення ліків",
        lblDate: "Дата",
        lblTime: "Час",
        lblPillName: "Назва ліків",
        lblDose: "Дозування",
        btnSave: "Зберегти запис",
        calendarTitle: "Календар",
        developer: "Розробник: Владислав",
        weekdays: ["Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
        months: ["Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень", "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень"],
        noRecords: "Немає записів про прийом ліків на цей день.",
        dayStatus: "Швидкий статус для всього дня:",
        btnTaken: "Прийнято",
        btnMissed: "Пропущено"
    },
    cs: {
        formTitle: "Záznam léků",
        lblDate: "Datum",
        lblTime: "Čas",
        lblPillName: "Název léku",
        lblDose: "Dávkování",
        btnSave: "Uložit záznam",
        calendarTitle: "Kalendář",
        developer: "Vývojář: Vladyslav",
        weekdays: ["Ne", "Po", "Út", "St", "Čt", "Pá", "So"],
        months: ["Leden", "Únor", "Březen", "Duben", "Květen", "Červen", "Červenec", "Srpen", "Září", "Říjen", "Listopad", "Prosinec"],
        noRecords: "Pro tento den nejsou zaznamenány žádné léky.",
        dayStatus: "Rychlý status pro celý den:",
        btnTaken: "Užito",
        btnMissed: "Vynecháno"
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
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('pillDate').value = today;
    
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    document.getElementById('pillTime').value = timeStr;

    // Англійська є головною при старті сайту
    changeLanguage('en'); 
});

// --- TRANSLATION ENGINE ---
function changeLanguage(lang) {
    currentLang = lang;
    document.getElementById('langSelect').value = lang;
    
    const t = translations[lang];
    
    document.getElementById('txtFormTitle').innerText = t.formTitle;
    document.getElementById('lblDate').innerText = t.lblDate;
    document.getElementById('lblTime').innerText = t.lblTime;
    document.getElementById('lblPillName').innerText = t.lblPillName;
    document.getElementById('lblDose').innerText = t.lblDose;
    document.getElementById('btnSave').innerText = t.btnSave;
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

// --- DATA FORM MANAGEMENT ---
function saveLog(e) {
    e.preventDefault();
    
    const date = document.getElementById('pillDate').value;
    const time = document.getElementById('pillTime').value;
    const name = document.getElementById('pillName').value;
    const dose = document.getElementById('pillDose').value;

    pillLogs.push({ date, time, name, dose });
    localStorage.setItem('pill_logs', JSON.stringify(pillLogs));

    if (!dayStatuses[date]) {
        dayStatuses[date] = 'taken';
        localStorage.setItem('day_statuses', JSON.stringify(dayStatuses));
    }

    document.getElementById('pillName').value = '';
    document.getElementById('pillDose').value = '';

    renderCalendar();
    alert(currentLang === 'uk' ? 'Запис збережено!' : (currentLang === 'cs' ? 'Záznam uložen!' : 'Entry saved!'));
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

    const dayPills = pillLogs.filter(log => log.date === dateStr);
    dayPills.sort((a,b) => a.time.localeCompare(b.time));

    if (dayPills.length === 0) {
        listContainer.innerHTML = `<p style="color: var(--text-muted); font-size:0.9rem;">${t.noRecords}</p>`;
    } else {
        dayPills.forEach(pill => {
            const item = document.createElement('div');
            item.className = 'pill-list-item';
            item.innerHTML = `
                <div class="pill-info">
                    <strong>${pill.name}</strong><br>
                    <span style="color: var(--text-muted); font-size: 0.9rem;">${pill.dose}</span>
                </div>
                <span class="pill-time">⏰ ${pill.time}</span>
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
