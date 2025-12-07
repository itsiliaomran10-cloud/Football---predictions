const leagues = {
    premier: ["Arsenal","Aston Villa","Bournemouth","Brentford","Brighton","Burnley","Chelsea","Crystal Palace","Everton","Fulham","Leeds","Liverpool","Man City","Man United","Newcastle","Nottingham Forest","Sunderland","Tottenham","West Ham","Wolves"],
    
    laliga: ["Alavés","Athletic Club","Atlético Madrid","Barcelona","Betis","Celta Vigo","Getafe","Girona","Levante","Oviedo","Elche","Mallorca","Osasuna","Rayo Vallecano","Real Madrid","Real Sociedad","Sevilla","Valencia","Villarreal","Espanyol"],
    
    seriea: ["Atalanta","Bologna","Cagliari","Como","Sassuolo","Fiorentina","Genoa","Inter","Juventus","Lazio","Lecce","Milan","Pisa","Napoli","Cremonese","Roma","Torino","Udinese","Parma","Hellas Verona"],
    
    bundesliga: ["Augsburg","Bayern","Dortmund"," Frankfurt","Freiburg","Heidenheim","Hoffenheim","Köln","Mainz","Mönchengladbach","Stuttgart","Leipzig","Leverkusen","StPauli","Union Berlin","Werder Bremen","Wolfsburg","HSV"], 
    
    ligue1: ["Angers","Auxerre","Brest","Le Havre","Lens","Lille","Lorient","Lyon","Marseille","Monaco","Nantes","Nice","PSG","Rennes", "Paris", "Metz", "Toulouse", "Strasbourg"], 
};

const container = document.getElementById("tables-container");
const saveBtn = document.getElementById("save-btn");
let resetBtn; 
let currentLeague = "premier";
let draggedItem = null;

function getTeamLogoSrc(teamName) {
    const fileName = teamName.replace(/\s/g, ''); 
    return `Logos/${fileName}.png`; 
}

function getSavedPredictions(league) {
    const data = localStorage.getItem(`predictions_${league}`);
    return data ? JSON.parse(data) : leagues[league];
}

function resetPredictions() {
    if (confirm(`Are you sure you want to reset the ${currentLeague.toUpperCase()} predictions?`)) {
        localStorage.removeItem(`predictions_${currentLeague}`);
        loadLeague(currentLeague); 
    }
}

function savePredictions() {
    const predictorName = document.getElementById('predictor-name').value.trim();
    
    if (!predictorName) {
        // پیام اخطار انگلیسی
        alert("Please enter your name or Instagram ID.");
        return;
    }

    const teamElements = Array.from(container.querySelectorAll(".team-card"));
    const currentOrder = teamElements.map(card => card.dataset.team);
    
    localStorage.setItem(`predictions_${currentLeague}`, JSON.stringify(currentOrder));

    // ذخیره‌سازی در Firebase
    const predictionData = {
        name: predictorName,
        league: currentLeague,
        order: currentOrder,
        timestamp: window.serverTimestamp() 
    };

    window.addDoc(window.collection(window.db, "predictions"), predictionData)
        .then(() => {
            // پیام موفقیت انگلیسی
            alert(`Prediction by ${predictorName} for ${currentLeague.toUpperCase()} successfully saved!`);
        })
        .catch((error) => {
            console.error("Error writing document: ", error);
            // پیام خطای انگلیسی
            alert("Error saving prediction. Please try again.");
        });
}

function handleDragStart(e) {
    draggedItem = e.target;
    e.dataTransfer.effectAllowed = "move";
    e.target.classList.add("dragging");
    
    const nameInput = document.getElementById('predictor-name');
    if (nameInput) {
        nameInput.blur(); 
    }
}

function handleDragEnd(e) {
    e.target.classList.remove("dragging");
    draggedItem = null;
    updateRanks();
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    
    const box = container.querySelector(".table-box");
    const draggingCard = document.querySelector('.dragging');
    if (!draggingCard) return;

    const afterElement = getDragAfterElement(box, e.clientY);
    
    if (afterElement == null) {
        box.appendChild(draggingCard);
    } else {
        box.insertBefore(draggingCard, afterElement);
    }
}

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

function handleDrop(e) {
    e.preventDefault();
    savePredictions(); 
}

function updateRanks() {
    const teamElements = container.querySelectorAll(".team-card");
    teamElements.forEach((card, index) => {
        const rank = index + 1;
        card.querySelector(".rank-number").textContent = rank;
        
        const rankNumberSpan = card.querySelector(".rank-number");
        const medalIconSpan = card.querySelector(".medal-icon");

        rankNumberSpan.classList.remove('rank-champions-dark-border', 'rank-europa-light-border', 'rank-relegation-dark-border');
        medalIconSpan.innerHTML = "";
        
        const leagueLength = leagues[currentLeague].length;
        
        if (rank === 1) {
            medalIconSpan.innerHTML = '🥇'; 
        }

        if (leagueLength === 20) {
            if (rank <= 4) {
                rankNumberSpan.classList.add('rank-champions-dark-border');
            } else if (rank === 5) {
                rankNumberSpan.classList.add('rank-europa-light-border');
            } else if (rank >= 18) {
                rankNumberSpan.classList.add('rank-relegation-dark-border');
            }
        } 
        else if (leagueLength === 18) {
            if (rank <= 4) {
                rankNumberSpan.classList.add('rank-champions-dark-border'); 
            } else if (rank === 5) {
                rankNumberSpan.classList.add('rank-europa-light-border'); 
            } else if (rank >= 16) { 
                 rankNumberSpan.classList.add('rank-relegation-dark-border'); 
            }
        }
    });
}


function loadLeague(league) {
    currentLeague = league;
    container.innerHTML = "";
    
    const teams = getSavedPredictions(league);

    const box = document.createElement("div");
    box.className = "table-box";

    teams.forEach((team, index) => {
        const logoSrc = getTeamLogoSrc(team); 

        const card = document.createElement("div");
        card.className = "team-card " + league;
        card.draggable = true;
        card.dataset.team = team;

        card.innerHTML = `
            <span class="rank-number">${index + 1}</span>
            <img src="${logoSrc}" alt="${team} Logo" class="team-logo" onerror="this.style.display='none'">
            <span class="medal-icon"></span> 
            <strong>${team}</strong>
            <span class="drag-handle">≡</span>
        `;
        
        card.addEventListener("dragstart", handleDragStart);
        card.addEventListener("dragend", handleDragEnd);
        box.appendChild(card);
    });
    
    box.addEventListener("dragover", handleDragOver);
    box.addEventListener("drop", handleDrop);

    container.appendChild(box);
    updateRanks(); 
}

document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector(".tab-btn.active").classList.remove("active");
        btn.classList.add("active");
        loadLeague(btn.dataset.league);
    });
});

if (saveBtn) {
    saveBtn.addEventListener("click", savePredictions);
}

document.addEventListener('DOMContentLoaded', () => {
    resetBtn = document.getElementById('reset-btn');
    
    if (resetBtn) {
        resetBtn.addEventListener('click', resetPredictions);
    }
    
    loadLeague("premier");
});