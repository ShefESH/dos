// Performance data for graph
const performanceData = [];

function drawGraph() {
    const canvas = document.getElementById('performanceGraph');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Canvas dimensions
    const width = 700;
    const height = 400;
    const marginLeft = 60;
    const marginBottom = 40;
    const marginTop = 40;
    const marginRight = 30;

    // Calculate cumulative totals for X axis
    let cumulativeTotals = [];
    let runningTotal = 0;
    for (let i = 0; i < performanceData.length; i++) {
        runningTotal += performanceData[i].count;
        cumulativeTotals.push(runningTotal);
    }

    // Axis ranges
    const minTotal = cumulativeTotals.length > 0 ? Math.min(...cumulativeTotals) : 0;
    const maxTotal = cumulativeTotals.length > 0 ? Math.max(...cumulativeTotals) : 1000;
    const xMin = minTotal;
    const xMax = maxTotal > xMin ? maxTotal : xMin + 1000;

    const maxTime = performanceData.length > 0 ? Math.max(...performanceData.map(d => d.time)) : 100;
    const minTime = 0;

    // Draw axes
    ctx.strokeStyle = '#888';
    ctx.beginPath();
    // X axis
    ctx.moveTo(marginLeft, height - marginBottom);
    ctx.lineTo(width - marginRight, height - marginBottom);
    // Y axis
    ctx.moveTo(marginLeft, height - marginBottom);
    ctx.lineTo(marginLeft, marginTop);
    ctx.stroke();

    // Axis labels
    ctx.fillStyle = '#333';
    ctx.font = '14px Arial';
    ctx.fillText('Total Number of Objects', width / 2 - 80, height - 10);
    ctx.save();
    ctx.translate(20, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Performance Time (ms)', 0, 0);
    ctx.restore();

    // Draw X axis ticks and values
    ctx.font = '12px Arial';
    ctx.fillStyle = '#333';
    const xTicks = 5;
    for (let i = 0; i <= xTicks; i++) {
        const val = Math.round(xMin + (i * (xMax - xMin) / xTicks));
        const x = marginLeft + (i * (width - marginLeft - marginRight) / xTicks);
        ctx.beginPath();
        ctx.moveTo(x, height - marginBottom);
        ctx.lineTo(x, height - marginBottom + 6);
        ctx.stroke();
        ctx.fillText(val, x - 15, height - marginBottom + 22);
    }

    // Draw Y axis ticks and values
    const yTicks = 5;
    for (let i = 0; i <= yTicks; i++) {
        const val = Math.round(minTime + (i * (maxTime - minTime) / yTicks));
        const y = height - marginBottom - (i * (height - marginTop - marginBottom) / yTicks);
        ctx.beginPath();
        ctx.moveTo(marginLeft - 6, y);
        ctx.lineTo(marginLeft, y);
        ctx.stroke();
        ctx.fillText(val, marginLeft - 45, y + 5);
    }

    // Draw data points and lines
    if (performanceData.length > 0) {
        ctx.strokeStyle = '#007bff';
        ctx.beginPath();
        for (let i = 0; i < performanceData.length; i++) {
            // Map cumulative total to X
            const x = marginLeft + ((cumulativeTotals[i] - xMin) / (xMax - xMin)) * (width - marginLeft - marginRight);
            // Map time to Y
            const y = height - marginBottom - (performanceData[i].time / maxTime) * (height - marginTop - marginBottom);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Draw points
        ctx.fillStyle = '#ff6600';
        for (let i = 0; i < performanceData.length; i++) {
            const x = marginLeft + ((cumulativeTotals[i] - xMin) / (xMax - xMin)) * (width - marginLeft - marginRight);
            const y = height - marginBottom - (performanceData[i].time / maxTime) * (height - marginTop - marginBottom);
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 2 * Math.PI);
            ctx.fill();
        }
    }
}

document.getElementById('createBtn').addEventListener('click', function() {
    const count = parseInt(document.getElementById('objectCount').value);
    const resultDiv = document.getElementById('result');
    const maxTotal = 9999999;
    const crashLimit = 99999;
    const currentTotal = performanceData.reduce((sum, d) => sum + d.count, 0);
    if (currentTotal >= crashLimit) {
        showServerCrash();
        return;
    }
    if (isNaN(count) || count < 1) {
        resultDiv.textContent = 'Please enter a valid number.';
        return;
    }
    if (currentTotal + count > maxTotal) {
        resultDiv.textContent = `Maximum total number of objects (${maxTotal}) exceeded.`;
        return;
    }
    if (currentTotal + count >= crashLimit) {
        showServerCrash();
        return;
    }
    // Object creation simulation (randomized size, no delay)
    let objects = [];
    try {
        for (let i = 0; i < count; i++) {
            // Randomize array length between 500 and 2000
            const arrLength = 500 + Math.floor(Math.random() * 1500);
            // Randomize data content
            const data = Array.from({length: arrLength}, () => Math.random());
            objects.push({id: i, data});
        }
        // Simulate exponential time taken with noise
        const base = 10; // base ms
        const growthRate = 0.00001; // increased for faster growth
        const totalObjects = currentTotal + count;
        const pureTime = base * Math.exp(growthRate * totalObjects);
        const noise = pureTime * (Math.random() * 0.2 - 0.1); // -10% to +10%
        let timeTaken = pureTime + noise;
        let resultMsg = `Created <b>${count}</b> objects.<br>Time taken: <b>${timeTaken.toFixed(2)}</b> ms.`;
        resultDiv.innerHTML = resultMsg;
        // Add to performance data and update graph
        performanceData.push({count, time: timeTaken});
        updateTotalObjects();
        drawGraph();
    } catch (e) {
        resultDiv.textContent = 'Error: ' + e.message;
    }
});

function showServerCrash() {
    // Hide main content and show error with reset button
    document.body.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;background:#181a1b;color:#fff;font-family:'Fira Mono',monospace;">
            <h1 style="color:#ff4444;font-size:2.5em;margin-bottom:20px;">500 Internal Server Error</h1>
            <p style="font-size:1.3em;margin-bottom:30px;">The server encountered an internal error or misconfiguration and was unable to complete your request.</p>
            <p style="color:#00bfff;">Please try again later.</p>
            <button id="resetBtnCrash" style="margin-top:30px;background:#ff4444;color:#fff;font-size:1.2em;padding:12px 32px;border:none;border-radius:6px;cursor:pointer;">Reset</button>
        </div>
    `;
    document.getElementById('resetBtnCrash').onclick = function() { location.reload(); };
}

// Add reset button functionality to main page
window.addEventListener('DOMContentLoaded', function() {
    var resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.onclick = function() { location.reload(); };
    }
});

function updateTotalObjects() {
    const total = performanceData.reduce((sum, d) => sum + d.count, 0);
    document.getElementById('totalObjects').innerHTML = `Total objects created: <b>${total}</b>`;
}

// Initial draw
updateTotalObjects();
drawGraph();