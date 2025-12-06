const leagues = {
    premier: ["Arsenal","Aston Villa","Bournemouth","Brentford","Brighton","Chelsea","Crystal Palace","Everton","Fulham","Ipswich","Leicester","Liverpool","Man City","Man United","Newcastle","Nottingham","Southampton","Tottenham","West Ham","Wolves"],
    laliga: ["Alavés","Athletic Club","Atlético Madrid","Barcelona","Betis","Celta Vigo","Espanyol","Getafe","Girona","Las Palmas","Mallorca","Osasuna","Rayo Vallecano","Real Madrid","Real Sociedad","Sevilla","Valencia","Villarreal","Leganés","Valladolid"],
    seriea: ["Atalanta","Bologna","Cagliari","Como","Empoli","Fiorentina","Frosinone","Genoa","Inter","Juventus","Lazio","Lecce","Milan","Monza","Napoli","Roma","Salernitana","Sassuolo","Torino","Udinese"],
    bundesliga: ["Augsburg","Bayern","Bochum","Darmstadt","Dortmund","Eintracht","Freiburg","Heidenheim","Hoffenheim","Köln","Leipzig","Leverkusen","Mainz","Mönchengladbach","Stuttgart","Union Berlin","Werder Bremen","Wolfsburg"],
    ligue1: ["Angers","Auxerre","Brest","Clermont","Dijon","Lille","Lorient","Lyon","Marseille","Metz","Monaco","Montpellier","Nantes","Nice","PSG","Reims","Rennes","Strasbourg","Toulouse","Le Havre"]
};

const container = document.getElementById("tables-container");

function loadLeague(league) {
    container.innerHTML = "";

    const box = document.createElement("div");
    box.className = "table-box";

    leagues[league].forEach((team, index) => {
        const card = document.createElement("div");
        card.className = "team-card " + league;
        card.draggable = true;

        card.innerHTML = `
            <span>${index + 1}</span>
            <strong>${team}</strong>
            <span class="drag-handle">≡</span>
        `;

        box.appendChild(card);
    });

    container.appendChild(box);
}

document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector(".tab-btn.active").classList.remove("active");
        btn.classList.add("active");
        loadLeague(btn.dataset.league);
    });
});

loadLeague("premier");
