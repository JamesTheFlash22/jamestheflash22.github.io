const API_BASE = 'https://asdfghjjjjj.mx-labs.net'; // Replace with real API if dummy
let bedwarsChart, kitpvpChart;

function getTeamColor(team) {
  const colors = {
    'RED': '#ff0000',
    'BLUE': '#0000ff',
    'GREEN': '#00ff00',
    'YELLOW': '#ffff00',
    'AQUA': '#00ffff',
    'WHITE': '#ffffff',
    'PINK': '#ff00ff',
    'GRAY': '#808080'
  };
  return colors[team.toUpperCase()] || '#ffffff';
}

async function fetchData(endpoint) {
  console.log('Fetching:', `${API_BASE}${endpoint}`); // Debug log
  try {
    const res = await fetch(`${API_BASE}${endpoint}`);
    console.log('Response status:', res.status); // Debug log
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Errore sconosciuto');
    }
    return data;
  } catch (err) {
    console.error('Fetch error:', err); // Debug log
    document.getElementById('error').innerText = `Errore: ${err.message}`;
    return null;
  }
}

// Rest of script unchanged...
async function getPlayerData() {
  const username = document.getElementById('username').value;
  if (!username) {
    document.getElementById('error').innerText = 'Inserisci un username';
    return;
  }
  const [info, bedwars, kitpvp] = await Promise.all([
    fetchData(`/player/info/${username}`),
    fetchData(`/bedwars/stats/${username}`),
    fetchData(`/kitpvp/stats/${username}`)
  ]);
  if (info) {
    document.getElementById('playerProfile').innerHTML = `
      <img src="https://skin.ggtn.ch/headiso/${username}" alt="Head di ${username}" class="w-20 h-20">
      <div>
        <h3 class="text-lg font-semibold text-blue-500">${info.username}</h3>
        <p class="text-gray-300">Online: ${info.isOnline ? 'Sì' : 'No'}<br>VIP: ${info.isVip ? 'Sì' : 'No'}<br>Ultimo accesso: ${new Date(info.lastSeen).toLocaleString('it-IT')}</p>
      </div>
    `;
    document.getElementById('playerProfile').classList.add('fade-in');
  }
  if (bedwars) {
    const kd = bedwars.deaths === 0 ? bedwars.kills : (bedwars.kills / bedwars.deaths).toFixed(2);
    document.getElementById('bedwarsText').innerHTML = `
      <h3 class="text-lg font-semibold text-blue-500 mb-2">Bedwars Stats</h3>
      <p class="text-gray-300">Livello: ${bedwars.level}<br>Vittorie: ${bedwars.wins}<br>Serie di vittorie: ${bedwars.winstreak}<br>Perdite: ${bedwars.losses}<br>K/D: ${kd}<br>Letti rotti: ${bedwars.beds_broken}<br>Monete: ${bedwars.coins}<br>Clan: ${bedwars.clan_name || 'Nessuno'}</p>
    `;
    document.getElementById('bedwarsText').classList.add('fade-in');
    if (bedwarsChart) bedwarsChart.destroy();
    const ctxBed = document.getElementById('bedwarsChart').getContext('2d');
    bedwarsChart = new Chart(ctxBed, {
      type: 'bar',
      data: {
        labels: ['Vittorie', 'Perdite', 'Uccisioni', 'Morti', 'Letti Rotti'],
        datasets: [{
          label: 'Bedwars Stats',
          data: [bedwars.wins, bedwars.losses, bedwars.kills, bedwars.deaths, bedwars.beds_broken],
          backgroundColor: ['#22d55e', '#ff4444', '#3b82f6', '#ff7316', '#ffb308']
        }]
      },
      options: { scales: { y: { beginAtZero: true } } }
    });
  }
  if (kitpvp) {
    const kd = kitpvp.overall_deaths === 0 ? kitpvp.overall_kills : (kitpvp.overall_kills / kitpvp.overall_deaths).toFixed(2);
    document.getElementById('kitpvpText').innerHTML = `
      <h3 class="text-lg font-semibold text-blue-500 mb-2">KitPvP Stats</h3>
      <p class="text-gray-300">Saldo: ${kitpvp.balance}<br>Uccisioni: ${kitpvp.overall_kills}<br>Morti: ${kitpvp.overall_deaths}<br>K/D: ${kd}<br>Serie uccisioni attuale: ${kitpvp.overall_killstreak}<br>Serie uccisioni massima: ${kitpvp.overall_max_killstreak}<br>Taglia attuale: ${kitpvp.bounty}<br>Taglia massima: ${kitpvp.max_bounty}<br>Gang: ${kitpvp.gang_name || 'Nessuna'}<br>Rango Gang: ${kitpvp.gang_rank_name || 'Nessuno'}</p>
    `;
    document.getElementById('kitpvpText').classList.add('fade-in');
    if (kitpvpChart) kitpvpChart.destroy();
    const ctxKit = document.getElementById('kitpvpChart').getContext('2d');
    kitpvpChart = new Chart(ctxKit, {
      type: 'doughnut',
      data: {
        labels: ['Uccisioni', 'Morti', 'Serie Max', 'Taglia Max'],
        datasets: [{
          label: 'KitPvP Stats',
          data: [kitpvp.overall_kills, kitpvp.overall_deaths, kitpvp.overall_max_killstreak, kitpvp.max_bounty],
          backgroundColor: ['#3b82f6', '#ff4444', '#22d55e', '#ffb308']
        }]
      }
    });
  }
  document.getElementById('defaultOpen').click();
}

function openTab(evt, tabName) {
  const tabcontent = document.getElementsByClassName('tabcontent');
  for (let i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = 'none';
  }
  const tablinks = document.getElementsByClassName('tablinks');
  for (let i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(' active', '');
  }
  document.getElementById(tabName).style.display = 'grid';
  evt.currentTarget.className += ' active';
}

async function getRecentMatches() {
  const username = document.getElementById('username').value;
  if (!username) {
    document.getElementById('error').innerText = 'Inserisci un username';
    return;
  }
  const matches = await fetchData(`/bedwars/matches/${username}`);
  if (matches) {
    const tbody = document.getElementById('matchesTable').querySelector('tbody');
    tbody.innerHTML = '';
    matches.forEach(m => {
      const tr = document.createElement('tr');
      tr.classList.add('fade-in', 'hover:bg-gray-600');
      tr.innerHTML = `
        <td class="p-3">${m.match_id}</td>
        <td class="p-3">${m.arena_name}</td>
        <td class="p-3">${m.match_type_name}</td>
        <td class="p-3">${m.match_outcome}</td>
        <td class="p-3">${Math.floor(m.match_duration_seconds / 60)}m ${m.match_duration_seconds % 60}s</td>
        <td class="p-3">${new Date(m.match_start).toLocaleString('it-IT')}</td>
        <td class="p-3"><button onclick="getMatchDetailsInModal(${m.match_id})" class="px-2 py-1 bg-blue-700 hover:bg-blue-800 rounded transition">Vedi Dettagli</button></td>
      `;
      tbody.appendChild(tr);
    });
  }
}

function viewMatchById() {
  const matchId = parseInt(document.getElementById('matchIdInput').value);
  if (!matchId || isNaN(matchId)) {
    document.getElementById('error').innerText = 'Inserisci un ID match valido';
    return;
  }
  getMatchDetailsInModal(matchId);
}

async function getMatchDetailsInModal(matchId) {
  document.getElementById('modalError').innerHTML = '';
  const detail = await fetchData(`/bedwars/match/${matchId}`);
  if (detail) {
    const min = Math.floor(detail.duration_seconds / 60);
    const sec = detail.duration_seconds % 60;
    const startDate = new Date(detail.start_time).toLocaleString('it-IT', { dateStyle: 'full', timeStyle: 'short' });
    const endDate = detail.end_time ? new Date(detail.end_time).toLocaleString('it-IT', { dateStyle: 'full', timeStyle: 'short' }) : 'N/A';
    document.getElementById('modalMatchDetails').innerHTML = `
      <h3 class="text-lg font-semibold text-blue-500 mb-2">Dettagli Match ${detail.match_id}</h3>
      <ul class="text-gray-300 list-disc pl-5">
        <li><strong>Arena:</strong> ${detail.arena_name}</li>
        <li><strong>Tipo:</strong> ${detail.type_name}</li>
        <li><strong>Durata:</strong> ${min} minuti e ${sec} secondi</li>
        <li><strong>Vincitore:</strong> <span style="color: ${getTeamColor(detail.winning_team_name)};">${detail.winning_team_name}</span></li>
        <li><strong>Inizio:</strong> ${startDate}</li>
        <li><strong>Fine:</strong> ${endDate}</li>
      </ul>
    `;
    document.getElementById('modalMatchDetails').classList.add('fade-in');
    const tbody = document.getElementById('modalPlayerStatsTable').querySelector('tbody');
    tbody.innerHTML = '';
    detail.per_player_stats.forEach(p => {
      const tr = document.createElement('tr');
      tr.classList.add('fade-in', 'hover:bg-gray-600');
      tr.innerHTML = `
        <td class="p-3">${p.username}</td>
        <td class="p-3" style="color: ${getTeamColor(p.team_name)};">${p.team_name}</td>
        <td class="p-3">${p.kills}</td>
        <td class="p-3">${p.final_kills}</td>
        <td class="p-3">${p.deaths}</td>
        <td class="p-3">${p.beds_broken}</td>
        <td class="p-3">${p.score}</td>
        <td class="p-3">${p.kd}</td>
      `;
      tbody.appendChild(tr);
    });
    document.getElementById('matchModal').style.display = 'flex';
  } else {
    document.getElementById('modalMatchDetails').innerHTML = '';
    document.getElementById('modalPlayerStatsTable').querySelector('tbody').innerHTML = '';
    document.getElementById('modalError').innerHTML = 'Match non trovato. Verifica l\'ID del match e riprova. Potrebbe essere un ID non valido o un errore temporaneo del server.';
    document.getElementById('matchModal').style.display = 'flex';
  }
}

function closeModal() {
  document.getElementById('matchModal').style.display = 'none';
}

window.onclick = function(event) {
  if (event.target == document.getElementById('matchModal')) {
    closeModal();
  }
}const API_BASE = 'https://asdfghjjjjj.mx-labs.net'; // Replace with real API if dummy
let bedwarsChart, kitpvpChart;

function getTeamColor(team) {
  const colors = {
    'RED': '#ff0000',
    'BLUE': '#0000ff',
    'GREEN': '#00ff00',
    'YELLOW': '#ffff00',
    'AQUA': '#00ffff',
    'WHITE': '#ffffff',
    'PINK': '#ff00ff',
    'GRAY': '#808080'
  };
  return colors[team.toUpperCase()] || '#ffffff';
}

async function fetchData(endpoint) {
  console.log('Fetching:', `${API_BASE}${endpoint}`); // Debug log
  try {
    const res = await fetch(`${API_BASE}${endpoint}`);
    console.log('Response status:', res.status); // Debug log
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Errore sconosciuto');
    }
    return data;
  } catch (err) {
    console.error('Fetch error:', err); // Debug log
    document.getElementById('error').innerText = `Errore: ${err.message}`;
    return null;
  }
}

// Rest of script unchanged...
async function getPlayerData() {
  const username = document.getElementById('username').value;
  if (!username) {
    document.getElementById('error').innerText = 'Inserisci un username';
    return;
  }
  const [info, bedwars, kitpvp] = await Promise.all([
    fetchData(`/player/info/${username}`),
    fetchData(`/bedwars/stats/${username}`),
    fetchData(`/kitpvp/stats/${username}`)
  ]);
  if (info) {
    document.getElementById('playerProfile').innerHTML = `
      <img src="https://skin.ggtn.ch/headiso/${username}" alt="Head di ${username}" class="w-20 h-20">
      <div>
        <h3 class="text-lg font-semibold text-blue-500">${info.username}</h3>
        <p class="text-gray-300">Online: ${info.isOnline ? 'Sì' : 'No'}<br>VIP: ${info.isVip ? 'Sì' : 'No'}<br>Ultimo accesso: ${new Date(info.lastSeen).toLocaleString('it-IT')}</p>
      </div>
    `;
    document.getElementById('playerProfile').classList.add('fade-in');
  }
  if (bedwars) {
    const kd = bedwars.deaths === 0 ? bedwars.kills : (bedwars.kills / bedwars.deaths).toFixed(2);
    document.getElementById('bedwarsText').innerHTML = `
      <h3 class="text-lg font-semibold text-blue-500 mb-2">Bedwars Stats</h3>
      <p class="text-gray-300">Livello: ${bedwars.level}<br>Vittorie: ${bedwars.wins}<br>Serie di vittorie: ${bedwars.winstreak}<br>Perdite: ${bedwars.losses}<br>K/D: ${kd}<br>Letti rotti: ${bedwars.beds_broken}<br>Monete: ${bedwars.coins}<br>Clan: ${bedwars.clan_name || 'Nessuno'}</p>
    `;
    document.getElementById('bedwarsText').classList.add('fade-in');
    if (bedwarsChart) bedwarsChart.destroy();
    const ctxBed = document.getElementById('bedwarsChart').getContext('2d');
    bedwarsChart = new Chart(ctxBed, {
      type: 'bar',
      data: {
        labels: ['Vittorie', 'Perdite', 'Uccisioni', 'Morti', 'Letti Rotti'],
        datasets: [{
          label: 'Bedwars Stats',
          data: [bedwars.wins, bedwars.losses, bedwars.kills, bedwars.deaths, bedwars.beds_broken],
          backgroundColor: ['#22d55e', '#ff4444', '#3b82f6', '#ff7316', '#ffb308']
        }]
      },
      options: { scales: { y: { beginAtZero: true } } }
    });
  }
  if (kitpvp) {
    const kd = kitpvp.overall_deaths === 0 ? kitpvp.overall_kills : (kitpvp.overall_kills / kitpvp.overall_deaths).toFixed(2);
    document.getElementById('kitpvpText').innerHTML = `
      <h3 class="text-lg font-semibold text-blue-500 mb-2">KitPvP Stats</h3>
      <p class="text-gray-300">Saldo: ${kitpvp.balance}<br>Uccisioni: ${kitpvp.overall_kills}<br>Morti: ${kitpvp.overall_deaths}<br>K/D: ${kd}<br>Serie uccisioni attuale: ${kitpvp.overall_killstreak}<br>Serie uccisioni massima: ${kitpvp.overall_max_killstreak}<br>Taglia attuale: ${kitpvp.bounty}<br>Taglia massima: ${kitpvp.max_bounty}<br>Gang: ${kitpvp.gang_name || 'Nessuna'}<br>Rango Gang: ${kitpvp.gang_rank_name || 'Nessuno'}</p>
    `;
    document.getElementById('kitpvpText').classList.add('fade-in');
    if (kitpvpChart) kitpvpChart.destroy();
    const ctxKit = document.getElementById('kitpvpChart').getContext('2d');
    kitpvpChart = new Chart(ctxKit, {
      type: 'doughnut',
      data: {
        labels: ['Uccisioni', 'Morti', 'Serie Max', 'Taglia Max'],
        datasets: [{
          label: 'KitPvP Stats',
          data: [kitpvp.overall_kills, kitpvp.overall_deaths, kitpvp.overall_max_killstreak, kitpvp.max_bounty],
          backgroundColor: ['#3b82f6', '#ff4444', '#22d55e', '#ffb308']
        }]
      }
    });
  }
  document.getElementById('defaultOpen').click();
}

function openTab(evt, tabName) {
  const tabcontent = document.getElementsByClassName('tabcontent');
  for (let i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = 'none';
  }
  const tablinks = document.getElementsByClassName('tablinks');
  for (let i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(' active', '');
  }
  document.getElementById(tabName).style.display = 'grid';
  evt.currentTarget.className += ' active';
}

async function getRecentMatches() {
  const username = document.getElementById('username').value;
  if (!username) {
    document.getElementById('error').innerText = 'Inserisci un username';
    return;
  }
  const matches = await fetchData(`/bedwars/matches/${username}`);
  if (matches) {
    const tbody = document.getElementById('matchesTable').querySelector('tbody');
    tbody.innerHTML = '';
    matches.forEach(m => {
      const tr = document.createElement('tr');
      tr.classList.add('fade-in', 'hover:bg-gray-600');
      tr.innerHTML = `
        <td class="p-3">${m.match_id}</td>
        <td class="p-3">${m.arena_name}</td>
        <td class="p-3">${m.match_type_name}</td>
        <td class="p-3">${m.match_outcome}</td>
        <td class="p-3">${Math.floor(m.match_duration_seconds / 60)}m ${m.match_duration_seconds % 60}s</td>
        <td class="p-3">${new Date(m.match_start).toLocaleString('it-IT')}</td>
        <td class="p-3"><button onclick="getMatchDetailsInModal(${m.match_id})" class="px-2 py-1 bg-blue-700 hover:bg-blue-800 rounded transition">Vedi Dettagli</button></td>
      `;
      tbody.appendChild(tr);
    });
  }
}

function viewMatchById() {
  const matchId = parseInt(document.getElementById('matchIdInput').value);
  if (!matchId || isNaN(matchId)) {
    document.getElementById('error').innerText = 'Inserisci un ID match valido';
    return;
  }
  getMatchDetailsInModal(matchId);
}

async function getMatchDetailsInModal(matchId) {
  document.getElementById('modalError').innerHTML = '';
  const detail = await fetchData(`/bedwars/match/${matchId}`);
  if (detail) {
    const min = Math.floor(detail.duration_seconds / 60);
    const sec = detail.duration_seconds % 60;
    const startDate = new Date(detail.start_time).toLocaleString('it-IT', { dateStyle: 'full', timeStyle: 'short' });
    const endDate = detail.end_time ? new Date(detail.end_time).toLocaleString('it-IT', { dateStyle: 'full', timeStyle: 'short' }) : 'N/A';
    document.getElementById('modalMatchDetails').innerHTML = `
      <h3 class="text-lg font-semibold text-blue-500 mb-2">Dettagli Match ${detail.match_id}</h3>
      <ul class="text-gray-300 list-disc pl-5">
        <li><strong>Arena:</strong> ${detail.arena_name}</li>
        <li><strong>Tipo:</strong> ${detail.type_name}</li>
        <li><strong>Durata:</strong> ${min} minuti e ${sec} secondi</li>
        <li><strong>Vincitore:</strong> <span style="color: ${getTeamColor(detail.winning_team_name)};">${detail.winning_team_name}</span></li>
        <li><strong>Inizio:</strong> ${startDate}</li>
        <li><strong>Fine:</strong> ${endDate}</li>
      </ul>
    `;
    document.getElementById('modalMatchDetails').classList.add('fade-in');
    const tbody = document.getElementById('modalPlayerStatsTable').querySelector('tbody');
    tbody.innerHTML = '';
    detail.per_player_stats.forEach(p => {
      const tr = document.createElement('tr');
      tr.classList.add('fade-in', 'hover:bg-gray-600');
      tr.innerHTML = `
        <td class="p-3">${p.username}</td>
        <td class="p-3" style="color: ${getTeamColor(p.team_name)};">${p.team_name}</td>
        <td class="p-3">${p.kills}</td>
        <td class="p-3">${p.final_kills}</td>
        <td class="p-3">${p.deaths}</td>
        <td class="p-3">${p.beds_broken}</td>
        <td class="p-3">${p.score}</td>
        <td class="p-3">${p.kd}</td>
      `;
      tbody.appendChild(tr);
    });
    document.getElementById('matchModal').style.display = 'flex';
  } else {
    document.getElementById('modalMatchDetails').innerHTML = '';
    document.getElementById('modalPlayerStatsTable').querySelector('tbody').innerHTML = '';
    document.getElementById('modalError').innerHTML = 'Match non trovato. Verifica l\'ID del match e riprova. Potrebbe essere un ID non valido o un errore temporaneo del server.';
    document.getElementById('matchModal').style.display = 'flex';
  }
}

function closeModal() {
  document.getElementById('matchModal').style.display = 'none';
}

window.onclick = function(event) {
  if (event.target == document.getElementById('matchModal')) {
    closeModal();
  }
}
