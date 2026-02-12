/* ========== CONFIG ========== */

const tables = ["Genese","Proverbes","Les viocs","Table VIP"];

const tableCapacity = {
    "Genese": 9,
    "Proverbes": 12,
    "Les viocs": 8,
    "Table VIP": 7
};

function initTables() {
    let select = document.getElementById("table");
    select.innerHTML = "<option value=''>Choisir table</option>";

    tables.forEach(t => {
        select.innerHTML += `<option value="${t}">${t}</option>`;
    });
}

function getGuests() {
    return JSON.parse(localStorage.getItem("guests")) || [];
}

function saveGuests(guests) {
    localStorage.setItem("guests", JSON.stringify(guests));
}

let editingIndex = null;

/* ========== INIT TABLE SELECT ========== */

window.onload = function() {
    const tableSelect = document.getElementById("table");

    tables.forEach(t => {
        let option = document.createElement("option");
        option.value = t;
        option.textContent = t;
        tableSelect.appendChild(option);
    });

    showGuests();
};

/* ========== STORAGE ========== */

function getGuests() {
    return JSON.parse(localStorage.getItem("guests")) || [];
}

function saveGuests(guests) {
    localStorage.setItem("guests", JSON.stringify(guests));
}

/* ========== ADD / EDIT ========== */

function addGuest() {

    let name = document.getElementById("name").value;
    let table = document.getElementById("table").value;

    if (!name || !table) return;

    let guests = getGuests();

    if (editingIndex !== null) {
        guests[editingIndex].name = name;
        guests[editingIndex].table = table;
        editingIndex = null;
    } else {

        let count = guests.filter(g => g.table === table).length;

        if (count >= tableCapacity[table]) {
            alert("Table complète !");
            return;
        }

        guests.push({ name, table, arrived:false });
    }

    saveGuests(guests);
    document.getElementById("name").value = "";
    showGuests();
}

/* ========== SHOW ========== */

function showGuests() {

    let guests = getGuests();
    let search = document.getElementById("searchInput").value.toLowerCase();

    let list = document.getElementById("guestList");
    let tableCount = document.getElementById("tableCount");

    list.innerHTML = "";
    tableCount.innerHTML = "";

    let counter = {};
    let arrivedCount = 0;

    guests.forEach(g => {

        if (!counter[g.table]) counter[g.table]=0;
        counter[g.table]++;

        if (g.arrived) arrivedCount++;
    });

    document.getElementById("totalGuests").innerText = guests.length;
    document.getElementById("totalArrived").innerText = arrivedCount;

    for (let t of tables) {
        let count = counter[t] || 0;
        let status = count>=tableCapacity[t] ? " 🔴 Complet" : "";
        tableCount.innerHTML += `<p>${t}: ${count}/${tableCapacity[t]} ${status}</p>`;
    }

    guests.forEach((g,i)=>{

        if (!g.name.toLowerCase().includes(search)) return;

        let card=document.createElement("div");
        card.className="guest-card";

        card.innerHTML=`
            <strong>${g.name}</strong> - ${g.table}
            <br>
            ${g.arrived?"✅ Arrivé":"⏳ En attente"}
            <br><br>

            <button class="btn-arrived" onclick="toggleArrival(${i})">Statut</button>
            <button class="btn-edit" onclick="editGuest(${i})">Modifier</button>
            <button class="btn-delete" onclick="deleteGuest(${i})">Supprimer</button>

            <br><br>

            <div id="qr-${i}"></div>

            <br>

            <button onclick="downloadQR(${i})">
                📥 Télécharger QR
            </button>
        `;


        list.appendChild(card);

        let url="scan.html?name="+encodeURIComponent(g.name)
            +"&table="+encodeURIComponent(g.table);

        new QRCode(document.getElementById(`qr-${i}`),{
            text:url,width:80,height:80
        });

    });
}

/* ========== ACTIONS ========== */

function toggleArrival(i){
    let guests=getGuests();
    guests[i].arrived=!guests[i].arrived;
    saveGuests(guests);
    showGuests();
}

function editGuest(i){
    let guests=getGuests();
    document.getElementById("name").value=guests[i].name;
    document.getElementById("table").value=guests[i].table;
    editingIndex=i;
}

function deleteGuest(i){
    let guests=getGuests();
    guests.splice(i,1);
    saveGuests(guests);
    showGuests();
}

function clearGuests(){
    localStorage.removeItem("guests");
    showGuests();
}

function downloadQR(index) {

    let qrDiv = document.getElementById(`qr-${index}`);
    let img = qrDiv.querySelector("img");

    if (!img) {
        alert("QR non trouvé !");
        return;
    }

    let link = document.createElement("a");
    link.href = img.src;
    link.download = "QR_" + getGuests()[index].name + ".png";
    link.click();
}

document.addEventListener("DOMContentLoaded", function() {

    if (document.getElementById("table")) {
        initTables();
        showGuests();
    }

    if (window.location.pathname.includes("scan.html")) {
        handleScan();
    }

});
