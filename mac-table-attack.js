const MAC_TABLE_LIMIT = 32;
let macTable = [];
let trafficBlocked = false;

function randomMAC() {
    return Array.from({length:6},()=>Math.floor(Math.random()*256).toString(16).padStart(2,'0')).join(':');
}
function randomIP() {
    return `${Math.floor(Math.random()*256)}.${Math.floor(Math.random()*256)}.${Math.floor(Math.random()*256)}.${Math.floor(Math.random()*256)}`;
}
function updateMacTable() {
    const tbody = document.getElementById('macTableBody');
    tbody.innerHTML = '';
    macTable.forEach((entry,i) => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${entry.mac}</td><td>${entry.ip}</td>`;
        tbody.appendChild(row);
    });
}
function updateStatus() {
    const status = document.getElementById('macStatus');
    if (trafficBlocked) {
        status.textContent = 'MAC table full! Normal traffic is blocked.';
    } else {
        status.textContent = '';
    }
}
function updateTraffic() {
    const traffic = document.getElementById('macTraffic');
    if (trafficBlocked) {
        traffic.innerHTML = '<span style="color:#ff4444">Traffic blocked: Switch cannot learn new MAC addresses.</span>';
    } else {
        traffic.innerHTML = '<span style="color:#00ff00">Normal traffic flowing.</span>';
    }
}
function updateNetworkDiagram() {
    const diagram = document.getElementById('networkDiagram');
    const total = macTable.length;
    let trafficLabel = 'Normal Traffic';
    let congestion = total / MAC_TABLE_LIMIT;
    let color = '#ffae00'; // Default orange
    // Arrow width logic: capped, never overlaps boxes
    let width = 2 + Math.min(total, MAC_TABLE_LIMIT) * 0.2;
    width = Math.min(width, 10); // Max 10px, visually balanced
    if (total === 0) {
        color = '#00c853'; // Green when table is empty
        trafficLabel = 'Normal Traffic';
        width = 2;
    } else if (trafficBlocked) {
        color = '#ff2222'; // Red when flooded
        trafficLabel = 'Blocked';
        width = 2;
    } else if (congestion > 0.7) {
        trafficLabel = 'Congested';
        width = 6; // Slightly thicker for congestion, but never covers boxes
    }
    diagram.innerHTML = `
        <svg width="420" height="140">
            <rect x="40" y="40" width="60" height="40" fill="#222" stroke="#00bfff" stroke-width="3" rx="8"/>
            <text x="70" y="65" fill="#fff" font-size="14" text-anchor="middle">Router</text>
            <rect x="320" y="40" width="60" height="40" fill="#222" stroke="#00bfff" stroke-width="3" rx="8"/>
            <text x="350" y="65" fill="#fff" font-size="14" text-anchor="middle">Server</text>
            <rect x="180" y="40" width="60" height="40" fill="#23272a" stroke="#00bfff" stroke-width="3" rx="8"/>
            <text x="210" y="65" fill="#fff" font-size="14" text-anchor="middle">Switch</text>
            <line x1="100" y1="60" x2="180" y2="60" stroke="${color}" stroke-width="${width}" marker-end="url(#arrow)"/>
            <line x1="240" y1="60" x2="320" y2="60" stroke="${color}" stroke-width="${width}" marker-end="url(#arrow)"/>
            <defs>
                <marker id="arrow" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                    <polygon points="0,0 10,3.5 0,7" fill="${color}" />
                </marker>
            </defs>
            <text x="210" y="120" fill="#fff" font-size="16" text-anchor="middle">${trafficLabel}</text>
        </svg>
    `;
}
document.getElementById('floodBtn').addEventListener('click', function() {
    if (trafficBlocked) return;
    const count = parseInt(document.getElementById('macCount').value);
    if (isNaN(count) || count < 1) return;
    for (let i = 0; i < count; i++) {
        if (macTable.length >= MAC_TABLE_LIMIT) {
            trafficBlocked = true;
            break;
        }
        macTable.push({mac: randomMAC(), ip: randomIP()});
    }
    updateMacTable();
    updateStatus();
    updateTraffic();
    updateNetworkDiagram();
});
document.getElementById('resetMacBtn').addEventListener('click', function() {
    macTable = [];
    trafficBlocked = false;
    updateMacTable();
    updateStatus();
    updateTraffic();
    updateNetworkDiagram();
});
// Initial draw
updateMacTable();
updateStatus();
updateTraffic();
updateNetworkDiagram();
