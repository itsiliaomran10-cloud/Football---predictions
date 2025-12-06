const leagues = {
    // اصلاح لیست بر اساس تصاویر ارسالی شما
    premier: ["Arsenal","Aston Villa","Bournemouth","Brentford","Brighton","Burnley","Chelsea","Crystal Palace","Everton","Fulham","Leeds United","Liverpool","Man City","Man United","Newcastle","Nottingham Forest","Sunderland","Tottenham","West Ham","Wolves"],
    laliga: ["Alavés","Athletic Club","Atlético Madrid","Barcelona","Betis","Celta Vigo","Espanyol","Getafe","Girona","Las Palmas","Mallorca","Osasuna","Rayo Vallecano","Real Madrid","Real Sociedad","Sevilla","Valencia","Villarreal","Leganés","Valladolid"],
    seriea: ["Atalanta","Bologna","Cagliari","Como","Empoli","Fiorentina","Frosinone","Genoa","Inter","Juventus","Lazio","Lecce","Milan","Monza","Napoli","Roma","Salernitana","Sassuolo","Torino","Udinese"],
    bundesliga: ["Augsburg","Bayern","Bochum","Darmstadt","Dortmund","Eintracht","Freiburg","Heidenheim","Hoffenheim","Köln","Leipzig","Leverkusen","Mainz","Mönchengladbach","Stuttgart","Union Berlin","Werder Bremen","Wolfsburg"],
    ligue1: ["Angers","Auxerre","Brest","Clermont","Dijon","Lille","Lorient","Lyon","Marseille","Metz","Monaco","Montpellier","Nantes","Nice","PSG","Reims","Rennes","Strasbourg","Toulouse","Le Havre"]
};

const container = document.getElementById("tables-container");
const saveBtn = document.getElementById("save-btn");
let currentLeague = "premier";
let draggedItem = null;

function getTeamLogoSrc(teamName) {
    // منطق ساخت نام فایل لوگو (بدون فاصله، بدون پسوند اضافی)
    const fileName = teamName.replace(/\s/g, ''); 
    return `logos/${fileName}.png`;
}

function getSavedPredictions(league) {
    const data = localStorage.getItem(`predictions_${league}`);
    return data ? JSON.parse(data) : leagues[league];
}

function savePredictions() {
    const teamElements = Array.from(container.querySelectorAll(".team-card"));
    const currentOrder = teamElements.map(card => card.dataset.team);
    localStorage.setItem(`predictions_${currentLeague}`, JSON.stringify(currentOrder));
    alert(`${currentLeague.toUpperCase()} prediction saved successfully!`);
}

function handleDragStart(e) {
    draggedItem = e.target;
    e.dataTransfer.effectAllowed = "move";
    e.target.classList.add("dragging");
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
    const afterElement = getDragAfterElement(box, e.clientY);
    
    if (afterElement) {
        if (afterElement.offsetTop > draggedItem.offsetTop) {
            box.insertBefore(draggedItem, afterElement.nextSibling);
        } else {
            box.insertBefore(draggedItem, afterElement);
        }
    } else {
        box.appendChild(draggedItem);
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
}

function updateRanks() {
    const teamElements = container.querySelectorAll(".team-card");
    teamElements.forEach((card, index) => {
        card.querySelector(".rank-number").textContent = index + 1;
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
}

document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector(".tab-btn.active").classList.remove("active");
        btn.classList.add("active");
        loadLeague(btn.dataset.league);
    });
});

saveBtn.addEventListener("click", savePredictions);

loadLeague("premier");
