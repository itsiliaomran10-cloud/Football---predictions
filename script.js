// Global Variables for Leagues and Teams (Original Team Names)
let currentLeague = 'premier';
const teamData = {
    premier: ["Arsenal", "Aston Villa", "Bournemouth", "Brentford", "Brighton & Hove Albion", "Burnley", "Chelsea", "Crystal Palace", "Everton", "Fulham", "Liverpool", "Luton Town", "Manchester City", "Manchester United", "Newcastle United", "Nottingham Forest", "Sheffield United", "Tottenham Hotspur", "West Ham United", "Wolverhampton Wanderers"],
    laliga: ["Alavés", "Athletic Bilbao", "Atlético Madrid", "Barcelona", "Cádiz", "Celta Vigo", "Getafe", "Girona", "Granada", "Las Palmas", "Mallorca", "Osasuna", "Rayo Vallecano", "Real Madrid", "Real Sociedad", "Sevilla", "Valencia", "Villarreal", "Real Betis", "Eibar"],
    seriea: ["Atalanta", "Bologna", "Cagliari", "Empoli", "Fiorentina", "Frosinone", "Genoa", "Inter Milan", "Juventus", "Lazio", "Lecce", "AC Milan", "Monza", "Napoli", "Roma", "Salernitana", "Sassuolo", "Torino", "Udinese", "Verona"],
    bundesliga: ["Augsburg", "Bayern Munich", "Bochum", "Borussia Dortmund", "Eintracht Frankfurt", "Freiburg", "Heidenheim", "Hoffenheim", "Köln", "Leipzig", "Bayer Leverkusen", "Mainz 05", "Borussia Mönchengladbach", "RB Leipzig", "Stuttgart", "Werder Bremen", "Union Berlin", "Wolfsburg"],
    ligue1: ["Brest", "Clermont Foot", "Le Havre", "Lille", "Lorient", "Lyon", "Marseille", "Montpellier", "Nantes", "Nice", "Monaco", "Paris Saint-Germain", "Strasbourg", "Rennes", "Reims", "Saint-Étienne", "Toulouse", "Metz"]
};

// --- Initialization of DOM elements ---
const container = document.getElementById('tables-container');
const tabButtons = document.querySelectorAll('.tab-btn');
const saveBtn = document.getElementById('save-btn');
const resetBtn = document.getElementById('reset-btn');

// --- Core Functionality ---

document.addEventListener('DOMContentLoaded', () => {
    loadLeague(currentLeague);
});

tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        tabButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        currentLeague = button.dataset.league;
        loadLeague(currentLeague);
    });
});

saveBtn.addEventListener('click', savePredictions);
resetBtn.addEventListener('click', resetPredictions);

// --- Initialization and Rendering ---

function loadLeague(league) {
    container.innerHTML = '';
    const teams = teamData[league];
    const savedOrder = localStorage.getItem(`predictions_${league}`);
    let orderedTeams = teams;

    if (savedOrder) {
        const parsedOrder = JSON.parse(savedOrder);
        const validSavedOrder = parsedOrder.filter(team => teams.includes(team));
        const newTeams = teams.filter(team => !validSavedOrder.includes(team));
        orderedTeams = [...validSavedOrder, ...newTeams];
    }

    orderedTeams.forEach(team => {
        const card = document.createElement('div');
        card.className = 'team-card';
        card.draggable = true;
        card.dataset.team = team; 
        card.innerHTML = `<span class="team-name">${team}</span>`;
        container.appendChild(card);
    });
}

function resetPredictions() {
    if (confirm("Are you sure you want to reset the " + currentLeague.toUpperCase() + " predictions?")) {
        localStorage.removeItem(`predictions_${currentLeague}`);
        loadLeague(currentLeague);
    }
}

// --- Firebase Save Function ---

function savePredictions() {
    const predictorName = document.getElementById('predictor-name').value.trim();

    if (!predictorName) {
        alert("لطفاً نام یا آیدی اینستاگرام خود را وارد کنید.");
        return;
    }

    const teamElements = Array.from(container.querySelectorAll(".team-card"));
    const currentOrder = teamElements.map(card => card.dataset.team);

    localStorage.setItem(`predictions_${currentLeague}`, JSON.stringify(currentOrder));

    const predictionData = {
        name: predictorName,
        league: currentLeague,
        order: currentOrder,
        timestamp: window.serverTimestamp()
    };

    window.addDoc(window.collection(window.db, "predictions"), predictionData)
        .then(() => {
            alert(`پیش‌بینی ${predictorName} برای ${currentLeague.toUpperCase()} با موفقیت ثبت شد!`);
        })
        .catch((error) => {
            console.error("Error writing document: ", error);
            alert("خطا در ثبت پیش‌بینی. لطفاً دوباره تلاش کنید.");
        });
}

// --- Drag and Drop Logic (Stable Version) ---

container.addEventListener('dragstart', (e) => {
    if (e.target.classList.contains('team-card')) {
        e.target.classList.add('dragging');
        
        const nameInput = document.getElementById('predictor-name');
        if (nameInput) {
            nameInput.blur();
        }

        e.dataTransfer.setData('text/plain', e.target.dataset.team);
    }
});

container.addEventListener('dragover', (e) => {
    e.preventDefault();
    const draggingCard = document.querySelector('.dragging');
    if (!draggingCard) return;

    const afterElement = getDragAfterElement(container, e.clientY);

    if (afterElement == null) {
        container.appendChild(draggingCard);
    } else {
        container.insertBefore(draggingCard, afterElement);
    }
});

container.addEventListener('drop', (e) => {
    e.preventDefault();
    savePredictions(); 
});

container.addEventListener('dragend', (e) => {
    e.target.classList.remove('dragging');
});

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.team-card:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}
