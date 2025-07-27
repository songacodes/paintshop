// --- Shared UI Rendering Functions ---

function renderTransactionsTable(tableBodyId, transactions, userRole) {
    const tbody = document.getElementById(tableBodyId);
    if (!tbody) return;

    tbody.innerHTML = '';
    if (!transactions || transactions.length === 0) {
        tbody.innerHTML = `<tr><td colspan="13" class="text-center p-4 text-gray-500">No transactions found.</td></tr>`;
        return;
    }

    transactions.forEach(p => {
        const row = document.createElement('tr');
        
        let invoiceCell = '<span class="text-gray-400">No Invoice</span>';
        if (p.invoiceFileData) {
            invoiceCell = `<a href="#" class="text-blue-500 hover:underline" onclick="viewInvoice(event, '${p.invoiceFileData}', '${p.invoiceFileName}')">View</a>`;
        }

        let purchasedInvoiceCell = '<span class="text-gray-400">No Invoice</span>';
        if (p.purchasedInvoiceFileData) {
            purchasedInvoiceCell = `<a href="#" class="text-blue-500 hover:underline" onclick="viewInvoice(event, '${p.purchasedInvoiceFileData}', '${p.purchasedInvoiceFileName}')">View</a>`;
        }

        const itemsHtml = Array.isArray(p.purchases) ? p.purchases.map(item => `<div>${item.purchasedItem}</div>`).join('') : p.purchasedItem;
        const variantsHtml = Array.isArray(p.purchases) ? p.purchases.map(item => `<div>${item.variant || ''} ${item.variant2 || ''}</div>`).join('') : `${p.variant || ''} ${p.variant2 || ''}`;
        const unitsHtml = Array.isArray(p.purchases) ? p.purchases.map(item => `<div>${item.units || ''}</div>`).join('') : p.units || '';
        const moneyHtml = Array.isArray(p.purchases) ? p.purchases.map(item => `<div>${item.money || ''}</div>`).join('') : p.money || '';

        let actionsHtml = '';
        if (userRole === 'superadmin') {
            actionsHtml = `<button class="text-red-500 hover:underline" onclick="deleteTransaction('${p.id}')">Delete</button>`;
        }

        row.innerHTML = `
            <td class="p-2">${p.shopName || p.branchId}</td>
            <td class="p-2">${p.clientName}</td>
            <td class="p-2">${p.phoneNumber}</td>
            <td class="p-2">${itemsHtml}</td>
            <td class="p-2">${variantsHtml}</td>
            <td class="p-2">${unitsHtml}</td>
            <td class="p-2">${p.quantity || ''}</td>
            <td class="p-2">${moneyHtml}</td>
            <td class="p-2">${new Date(p.dateTimeISO).toLocaleString()}</td>
            <td class="p-2">${invoiceCell}</td>
            <td class="p-2">${purchasedInvoiceCell}</td>
            <td class="p-2">${p.invoiceNumber}</td>
            <td class="p-2">${p.comment || ''}</td>
            <td class="p-2">${actionsHtml}</td>
        `;
        tbody.appendChild(row);
    });
}

function renderUsersTable(tableBodyId, users, userRole) {
    const tbody = document.getElementById(tableBodyId);
    if (!tbody) return;

    tbody.innerHTML = '';
    const userList = Object.values(users);

    if (userList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center p-4 text-gray-500">No users found.</td></tr>`;
        return;
    }

    userList.forEach(user => {
        const row = document.createElement('tr');
        let actionsHtml = '';
        if (userRole === 'superadmin' && user.role !== 'superadmin') {
            actionsHtml = `
                <button class="text-blue-500 hover:underline" onclick="editUser('${user.username}')">Edit</button>
                <button class="text-red-500 hover:underline ml-2" onclick="deleteUser('${user.username}')">Delete</button>
            `;
        }

        row.innerHTML = `
            <td class="p-2">${user.username}</td>
            <td class="p-2">${user.role}</td>
            <td class="p-2">${user.branch || 'N/A'}</td>
            <td class="p-2">${user.password}</td>
            <td class="p-2">${new Date(user.createdAt).toLocaleString()}</td>
            <td class="p-2">${actionsHtml}</td>
        `;
        tbody.appendChild(row);
    });
}

function renderClientsTable(tableBodyId, clients, userRole) {
    const tbody = document.getElementById(tableBodyId);
    if (!tbody) return;

    tbody.innerHTML = '';
    const clientList = [];
    for (const branchId in clients) {
        clients[branchId].forEach(client => {
            clientList.push({ ...client, branchId });
        });
    }

    if (clientList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center p-4 text-gray-500">No clients found.</td></tr>`;
        return;
    }

    clientList.forEach(client => {
        const row = document.createElement('tr');
        let actionsHtml = '';
        if (userRole === 'superadmin') {
            actionsHtml = `<button class="text-red-500 hover:underline" onclick="deleteClient('${client.branchId}', '${client.id}')">Delete</button>`;
        }

        row.innerHTML = `
            <td class="p-2">${client.name}</td>
            <td class="p-2">${client.phoneNumber}</td>
            <td class="p-2">${client.branchId}</td>
            <td class="p-2">${actionsHtml}</td>
        `;
        tbody.appendChild(row);
    });
}

function renderBranchesTable(tableBodyId, branches, userRole) {
    const tbody = document.getElementById(tableBodyId);
    if (!tbody) return;

    tbody.innerHTML = '';
    const branchList = Object.values(branches);

    if (branchList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center p-4 text-gray-500">No shops found.</td></tr>`;
        return;
    }

    branchList.forEach(branch => {
        const row = document.createElement('tr');
        let actionsHtml = '';
        if (userRole === 'superadmin') {
            actionsHtml = `<button class="text-red-500 hover:underline" onclick="deleteBranch('${branch.id}')">Delete</button>`;
        }

        row.innerHTML = `
            <td class="p-2">${branch.name}</td>
            <td class="p-2">${branch.location}</td>
            <td class="p-2">${branch.id}</td>
            <td class="p-2">${actionsHtml}</td>
        `;
        tbody.appendChild(row);
    });
}

function viewInvoice(event, fileData, fileName) {
    event.preventDefault();
    const byteCharacters = atob(fileData.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const mimeType = fileName.endsWith('.pdf') ? 'application/pdf' : 'image/png';
    const blob = new Blob([byteArray], { type: mimeType });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
}