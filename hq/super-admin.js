console.log('[DEBUG] super-admin.js loaded and running');
window.onerror = function(message, source, lineno, colno, error) {
  console.error('[DEBUG] Global JS error:', message, 'at', source, lineno + ':' + colno, error);
};
// --- Modal-based editClient function at global scope ---
async function editClient(branch, index) {
  // Inline editing is now handled in renderClients. This function is kept for compatibility.
}

// --- Top-level: loadAndRenderClients ---
async function loadAndRenderClients() {
  console.log('[DEBUG] loadAndRenderClients() called');
  console.log('[DEBUG] Starting to load clients...');
  
  try {
    const data = await DataAPI.getClients();
    console.log('[DEBUG] Raw clients data:', data);
    // Show raw data in debug panel
    const debugPanel = document.getElementById('debug-raw-clients');
    if (debugPanel) {
      debugPanel.textContent = JSON.stringify(data, null, 2);
    }
    // Convert clients object to array with branch info
    const clientsList = [];
    for (const branchId in data) {
      const branchClients = data[branchId];
      console.log(`[DEBUG] Processing branch ${branchId} clients:`, branchClients);
      
      if (Array.isArray(branchClients)) {
        clientsList.push(...branchClients.map(client => ({
          ...client,
          branch: branchId
        })));
      }
    }
    
    console.log('[DEBUG] Processed client list:', clientsList);
    await renderClients(clientsList);
    console.log('[DEBUG] Successfully rendered clients');
  } catch (err) {
    console.error('[DEBUG] Error loading/rendering clients:', err);
    const tbody = document.getElementById('clients-table-body');
    if (tbody) {
      tbody.innerHTML = '<tr><td colspan="4" class="text-center p-4 text-red-500">Error loading clients</td></tr>';
    }
    // Show error in debug panel
    const debugPanel = document.getElementById('debug-raw-clients');
    if (debugPanel) {
      debugPanel.textContent = 'Error: ' + (err.message || err);
    }
  }
}

// Function to populate all branch-related select elements
async function populateAllBranchSelects() {
    try {
        const shops = await fetchAllShops();
        console.log('[DEBUG] Raw shops data:', shops);
        
        const filteredShops = Array.isArray(shops)
            ? shops.filter(s => s.id && s.id !== 'config')
            : [];
        console.log('[DEBUG] Filtered shops:', filteredShops);

        // Direct approach to populate dropdowns
        const clientBranchSelect = document.getElementById('client-branch');
        const excelBranchFilter = document.getElementById('excel-branch-filter');

        if (clientBranchSelect) {
            console.log('[DEBUG] Found client dropdown, current HTML:', clientBranchSelect.innerHTML);
            
            // Build options HTML
            let optionsHtml = '<option value="">Select shop</option>';
            filteredShops.forEach(shop => {
                optionsHtml += `<option value="${shop.id}">${shop.name || shop.id}</option>`;
            });
            
            // Set options directly
            console.log('[DEBUG] Setting client dropdown HTML to:', optionsHtml);
            clientBranchSelect.innerHTML = optionsHtml;
            
            // Verify
            console.log('[DEBUG] Client dropdown HTML after set:', clientBranchSelect.innerHTML);
            console.log('[DEBUG] Client dropdown options count:', clientBranchSelect.options.length);
        } else {
            console.error('[DEBUG] Client dropdown not found!');
        }

        if (excelBranchFilter) {
            console.log('[DEBUG] Found excel dropdown, current HTML:', excelBranchFilter.innerHTML);
            
            // Build options HTML
            let optionsHtml = '<option value="">📋 All Shops (Download everything)</option>';
            filteredShops.forEach(shop => {
                optionsHtml += `<option value="${shop.id}">${shop.name || shop.id}</option>`;
            });
            
            // Set options directly
            console.log('[DEBUG] Setting excel dropdown HTML to:', optionsHtml);
            excelBranchFilter.innerHTML = optionsHtml;
            
            // Verify
            console.log('[DEBUG] Excel dropdown HTML after set:', excelBranchFilter.innerHTML);
            console.log('[DEBUG] Excel dropdown options count:', excelBranchFilter.options.length);
        } else {
            console.error('[DEBUG] Excel dropdown not found!');
        }

    } catch (err) {
        console.error('[DEBUG] Error in populateAllBranchSelects:', err);
    }
}

// --- Clients Table ---
async function renderClients() {
    const clients = await DataAPI.getClients();
    const user = JSON.parse(sessionStorage.getItem('loggedInUser'));
    renderClientsTable('clients-table-body', clients, user.role);
}

function attachClientSortAndSearchListeners() {
    const sortDropdown = document.getElementById('client-sort-dropdown');
    const sortOrderDropdown = document.getElementById('client-sort-order');
    const searchInput = document.getElementById('client-search-input');
    if (sortDropdown) sortDropdown.onchange = () => { console.log('[Clients] Sort changed'); renderClients(); };
    if (sortOrderDropdown) sortOrderDropdown.onchange = () => { console.log('[Clients] Sort order changed'); renderClients(); };
    if (searchInput) searchInput.oninput = () => { console.log('[Clients] Search input'); renderClients(); };
}

// Add a search input to the client section if not present
if (document.getElementById('clients-section') && !document.getElementById('client-search-input')) {
    const section = document.getElementById('clients-section');
    const controlsDiv = section.querySelector('.flex.gap-2');
    if (controlsDiv) {
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.id = 'client-search-input';
        searchInput.placeholder = 'Search clients...';
        searchInput.className = 'border rounded px-2 py-1 text-sm';
        controlsDiv.insertBefore(searchInput, controlsDiv.firstChild);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Super admin JS loaded');
    const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
    if (!loggedInUser || loggedInUser.role !== 'superadmin') {
        window.location.href = 'login.html';
        return;
    }

    // Set sidebar heading immediately on page load
    const sidebarHeading = document.getElementById('sidebar-superadmin-heading');
    console.log('Sidebar heading element:', sidebarHeading);
    if (sidebarHeading && loggedInUser && loggedInUser.role === 'superadmin') {
        if (loggedInUser.username === 'superadmin') {
            sidebarHeading.textContent = 'Super Admin';
            sidebarHeading.className = 'text-lg font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text mb-6';
            console.log('Sidebar heading set to: Super Admin (rainbow)');
        } else {
            sidebarHeading.textContent = loggedInUser.username;
            sidebarHeading.className = 'text-lg font-bold text-gray-800 mb-6';
            console.log('Sidebar heading set to:', loggedInUser.username);
        }
    } else {
        console.log('Sidebar heading not set: missing element or user.');
    }

    // Reference the forms using their specific IDs now
    const branchForm = document.getElementById('branch-form-actual');
    const clientForm = document.getElementById('client-form-actual');

    // Initial render of all sections
    await renderTransactions();
    await renderUsers(); 
    await renderBranches();
    await renderClients();
    await populateAllBranchSelects(); // Call the unified function
        
    // --- Advanced Excel Export Logic ---
    // The branch filter population is now handled by populateAllBranchSelects,
    // so we just need to initialize event listeners for the export section.
    initializeExcelExportEventListeners(); 

    // --- Excel Import Clients Listener (REVISED: match master admin logic) ---
    const importBtn = document.getElementById('import-clients-btn');
    const importFileInput = document.getElementById('client-import-file');
    const importStatus = document.getElementById('import-status-message');
    const importSpinner = document.getElementById('import-loading-spinner');
    if (importBtn && importFileInput) {
        importBtn.onclick = async () => {
            importStatus.textContent = '';
            importSpinner.classList.remove('hidden');
            try {
                const file = importFileInput.files[0];
                if (!file) {
                    importStatus.textContent = 'Please select a file.';
                    importSpinner.classList.add('hidden');
                    return;
                }
                const data = await file.arrayBuffer();
                const workbook = XLSX.read(data, { type: 'array' });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
                if (!rows.length) {
                    importStatus.textContent = 'No data found in the file.';
                    importSpinner.classList.add('hidden');
                    return;
                }
                // Get branches for mapping
                const shops = await fetchAllShops();
                // Build name->id map (normalize: trim, lowercase)
                const shopNameToId = {};
                Object.entries(shops).forEach(([id, b]) => {
                    shopNameToId[b.name.trim().toLowerCase()] = id;
                });
                // For error reporting
                const availableShopNames = Object.keys(shopNameToId);
                // Validate and group clients by shopId
                const clientsByShop = {};
                for (const row of rows) {
                    const name = row['Client Name']?.trim();
                    const phone = row['Phone Number']?.trim();
                    // Accept both 'ShopID' and 'Shop ID' (with or without space)
                    let shopId = row['ShopID']?.trim() || row['Shop ID']?.trim();
                    let shopNameRaw = row['Shop Name']?.trim();
                    if (!shopId && shopNameRaw) {
                        shopId = shopNameToId[shopNameRaw.toLowerCase()];
                    }
                    // Debug log for mapping
                    console.log('Import row:', row, 'Mapped shopId:', shopId, 'Available shops:', shopNameToId);
                    if (!name || !phone || !shopId) {
                        let errorMsg = 'Each row must have Client Name, Phone Number, and Shop Name/ShopID.';
                        if (!shopId && shopNameRaw) {
                            errorMsg = `Shop name "${shopNameRaw}" not found. Available shops: ['${availableShopNames.join("', '") }']`;
                        }
                        importStatus.textContent = errorMsg;
                        importSpinner.classList.add('hidden');
                        return;
                    }
                    if (!clientsByShop[shopId]) clientsByShop[shopId] = [];
                    clientsByShop[shopId].push({ name, phoneNumber: phone });
                }
                // Import clients for each shop
                let total = 0;
                for (const shopId in clientsByShop) {
                    await DataAPI.saveClient(shopId, { clients: clientsByShop[shopId] });
                    total += clientsByShop[shopId].length;
                }
                importStatus.textContent = `Successfully imported ${total} clients.`;
                importSpinner.classList.add('hidden');
                await renderClients();
            } catch (err) {
                importStatus.textContent = 'Import failed: ' + (err.message || 'Unknown error.');
                importSpinner.classList.add('hidden');
            }
        };
    }


    // --- Transaction Management ---
    async function renderTransactions() {
        const purchases = await DataAPI.getPurchases();
        const user = JSON.parse(sessionStorage.getItem('loggedInUser'));
        renderTransactionsTable('transactions-table-body', purchases, user.role);
    }

    function attachTransactionSortAndSearchListeners() {
        const sortDropdown = document.getElementById('transaction-sort-dropdown');
        const sortOrderDropdown = document.getElementById('transaction-sort-order');
        const searchInput = document.getElementById('transaction-search-input');
        if (sortDropdown) sortDropdown.onchange = () => { console.log('[Transactions] Sort changed'); renderTransactions(); };
        if (sortOrderDropdown) sortOrderDropdown.onchange = () => { console.log('[Transactions] Sort order changed'); renderTransactions(); };
        if (searchInput) searchInput.oninput = () => { console.log('[Transactions] Search input'); renderTransactions(); };
    }

    const transactionSortDropdown = document.getElementById('transaction-sort-dropdown');
    if (transactionSortDropdown) transactionSortDropdown.onchange = renderTransactions;
    const transactionSortOrder = document.getElementById('transaction-sort-order');
    if (transactionSortOrder) transactionSortOrder.onchange = renderTransactions;

    const transactionSearchInput = document.getElementById('transaction-search-input');
    if (transactionSearchInput) transactionSearchInput.addEventListener('input', renderTransactions);

    // --- Branch Management ---
    if (branchForm) { 
    branchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const branchName = document.getElementById('shop-name').value.trim();
        const branchId = branchName.toLowerCase().replace(/\s+/g, '');
        const branchLocation = document.getElementById('shop-location').value.trim();
        const branchUserPassword = document.getElementById('shop-user-password').value;
        const adminUsername = document.getElementById('shop-admin-username').value.trim().toLowerCase();
        const adminPassword = document.getElementById('shop-admin-password').value;
        if (!branchName || !branchLocation || !branchUserPassword || !adminUsername || !adminPassword) {
          alert('All shop fields are required.');
          return;
        }
        try {
          // Call new API to create shop DB file with default and shop users
          const res = await fetch('/api/create-shop', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-role': JSON.parse(sessionStorage.getItem('loggedInUser'))?.role || '' },
            body: JSON.stringify({
              shopId: branchId,
              shopUser: branchId,
              shopUserPassword: branchUserPassword,
              shopManager: adminUsername,
              shopManagerPassword: adminPassword,
              location: branchLocation
            })
          });
          const result = await res.json();
          if (!result.success) throw new Error(result.error || 'Failed to create shop');
          alert('Shop and users added successfully! They can now log in.');
          branchForm.reset();
          await renderBranches();
          await renderClients();
          await renderUsers();
          await renderTransactions();
          await populateAllBranchSelects();
        } catch (error) {
          console.error('Error creating shop:', error);
          alert('Failed to create shop: ' + (error.message || 'Unknown error.'));
        }
    });
    }

    // Add shop deletion logic (delete shop DB file)
    async function deleteShop(shopId) {
      if (!confirm('Are you sure you want to delete this shop? This will remove its database file and users will not be able to log in.')) return;
      try {
        const res = await fetch(`/api/delete-shop/${shopId}`, {
          method: 'DELETE',
          headers: { 'x-user-role': JSON.parse(sessionStorage.getItem('loggedInUser'))?.role || '' }
        });
        const result = await res.json();
        if (!result.success) throw new Error(result.error || 'Failed to delete shop');
        alert('Shop deleted successfully!');
        await renderBranches();
        await renderClients();
        await renderUsers();
        await renderTransactions();
        await populateAllBranchSelects();
      } catch (error) {
        alert('Failed to delete shop: ' + (error.message || 'Unknown error.'));
      }
    }

    // --- Client Management ---
    if (clientForm) { 
        console.log("Client form found, attaching event listener."); // Debug log
    clientForm.addEventListener('submit', async (e) => {
        e.preventDefault();
            console.log("Client form submitted."); // Debug log

            const branch = document.getElementById('client-branch').value; 
            const clientName = document.getElementById('client-name').value;
            const phoneNumber = document.getElementById('client-phone').value;
            
            console.log("Client data:", { branch, clientName, phoneNumber }); // Debug log

            if (!branch) {
                alert('Please select a branch for the client.');
                console.warn("Client creation aborted: No branch selected."); // Debug log
                return;
            }
            if (!clientName || !phoneNumber) {
                alert('Client name and phone number are required.');
                console.warn("Client creation aborted: Missing name or phone number."); // Debug log
                return;
            }

            // --- Duplicate phone number check ---
            const clients = await DataAPI.getClients();
            const branchClients = clients[branch] || [];
            const duplicate = branchClients.some(c => c.phoneNumber === phoneNumber);
            if (duplicate) {
                alert('A client with this phone number already exists in this branch.');
                return;
            }
            // --- End duplicate check ---

            try {
                // DataAPI.saveClient handles adding or updating based on name/phone
                // This will now send {name, phoneNumber} inside a 'client' object
                await DataAPI.saveClient(branch, { name: clientName, phoneNumber: phoneNumber });
                
        alert('Client added successfully!');
        clientForm.reset();
                await renderClients(); // Only need to re-render clients after adding a client
                console.log("Client successfully added and rendered."); // Debug log
            } catch (error) {
                console.error("Error adding client:", error); // Debug log for API errors
                alert("Failed to add client: " + (error.message || "Unknown error."));
            }
        });
    } else {
        console.warn("Client form (client-form-actual) not found!"); // Debug log
    }

    // --- Users Table ---
    async function renderUsers() {
        const users = await DataAPI.getUsers();
        const user = JSON.parse(sessionStorage.getItem('loggedInUser'));
        renderUsersTable('users-table-body', users, user.role);
    }

    const userSortDropdown = document.getElementById('user-sort-dropdown');
    if (userSortDropdown) userSortDropdown.onchange = renderUsers;
    const userSortOrder = document.getElementById('user-sort-order');
    if (userSortOrder) userSortOrder.onchange = renderUsers;

    // --- User Actions: Edit, Save, Cancel, Show/Hide Password, Delete ---
    document.addEventListener('click', async (e) => {
        // Edit user
        const editBtn = e.target.closest('.edit-user-btn');
        if (editBtn) {
            const row = editBtn.closest('tr');
            if (!row) return;
            const oldUsername = row.querySelector('.user-username-display').textContent.trim();
            const users = await fetchAllUsers();
            const user = users[oldUsername];
            if (!user) return;
            // Only allow editing username and password for shop users/managers, role is fixed
            let roleCellHtml = '';
            if (user.role === 'branch') {
                roleCellHtml = '<span class="user-role-display">Shop User</span>';
            } else if (user.role === 'admin') {
                roleCellHtml = '<span class="user-role-display">Shopmanager</span>';
            } else {
                roleCellHtml = `<select class="edit-role border rounded p-1 text-sm w-28">
                    <option value="superadmin" ${user.role === 'superadmin' ? 'selected' : ''}>Grandadmin</option>
                    <option value="master-admin" ${user.role === 'master-admin' ? 'selected' : ''}>Admin</option>
                </select>`;
            }
            row.innerHTML = `
                <td class="p-2"><input type="text" class="edit-username border rounded p-1 text-sm w-28" value="${oldUsername}"></td>
                <td class="p-2">${roleCellHtml}</td>
                <td class="p-2 user-branch-display">${user.branch || ''}</td>
                <td class="p-2"><input type="text" class="edit-password border rounded p-1 text-sm w-28" value="${user.password || ''}"></td>
                <td class="p-2">${user.createdAt ? new Date(user.createdAt).toLocaleString() : ''}</td>
                <td class="p-2 flex gap-2">
                    <button class="save-user-btn text-green-600 hover:text-green-900 ml-1"><i class="ri-check-line"></i> Save</button>
                    <button class="cancel-user-btn text-gray-500 hover:text-gray-700 ml-1"><i class="ri-close-line"></i> Cancel</button>
                </td>
            `;
            row.querySelector('.cancel-user-btn').onclick = async function() {
                await renderUsers();
            };
            row.querySelector('.save-user-btn').onclick = async function() {
                const newUsername = row.querySelector('.edit-username').value.trim();
                const newPassword = row.querySelector('.edit-password').value;
                let newRole = user.role;
                if (user.role !== 'branch' && user.role !== 'admin') {
                    const roleSelect = row.querySelector('.edit-role');
                    if (roleSelect) newRole = roleSelect.value;
                }
                if (!newUsername || !newPassword) {
                    showNotification('Username and password cannot be empty.', 'error');
            return;
        }
                const usersAll = await fetchAllUsers();
                if (newUsername !== oldUsername && usersAll[newUsername]) {
                    showNotification('A user with this username already exists.', 'error');
                        return;
                    }
                // Cascade logic if username changes and is a shop user
                if ((user.role === 'branch' || user.role === 'admin') && newUsername !== oldUsername) {
                    // Update shopId in shops, clients, purchases, and login system
                    const shops = await fetchAllShops();
                    const shopId = user.shopId || user.branch || oldUsername;
                    const currentShopData = shops[shopId];
                    if (!currentShopData) {
                        showNotification('Shop data not found for this user.', 'error');
                        return;
                    }
                    const newShopId = newUsername;
                    if (shops[newShopId]) {
                        showNotification(`A shop with the ID "${newShopId}" already exists.`, 'error');
                    await renderUsers();
                    return;
                }
                    // Save new shop data
                    await DataAPI.saveShop(newShopId, {
                        ...currentShopData,
                        name: newShopId,
                        location: currentShopData.location
                    });
                    // Update shop user
                    await DataAPI.saveUser(newShopId, {
                        password: newPassword,
                    role: 'branch',
                        shopId: newShopId,
                        createdAt: user.createdAt || new Date().toISOString()
                    });
                    // Update admin users
                    for (const uname in usersAll) {
                        if (usersAll[uname].role === 'admin' && (usersAll[uname].shopId === shopId || usersAll[uname].branch === shopId)) {
                            await DataAPI.saveUser(uname, {
                                password: usersAll[uname].password,
                        role: 'admin',
                                shopId: newShopId,
                                createdAt: usersAll[uname].createdAt || new Date().toISOString()
                    });
                        }
                }
                // Update clients
                const clients = await DataAPI.getClients();
                    if (clients[shopId]) {
                        const updatedClientsForShop = clients[shopId].map(client => ({
                        ...client,
                            shopId: newShopId
                    }));
                        await DataAPI.saveClient(newShopId, { clients: updatedClientsForShop });
                        await DataAPI.deleteClient(shopId, 'all');
                }
                // Update purchases
                const purchases = await DataAPI.getPurchases();
                const updatedPurchases = purchases.map(p => {
                        let changed = false;
                        if (p.shopId === shopId || p.shopName === shopId) {
                            p.shopId = newShopId;
                            p.shopName = newShopId;
                            changed = true;
                        }
                        // Update client info in purchases if client was renamed
                        if (clients && clients[newShopId]) {
                            const client = clients[newShopId].find(c => c.id === p.clientId);
                            if (client) {
                                p.clientName = client.name;
                                p.phoneNumber = client.phoneNumber;
                                changed = true;
                            }
                        }
                        return changed ? p : p;
                });
                for (const p of updatedPurchases) {
                    await DataAPI.savePurchase(p);
                }
                    // Delete old shop user and old shop
                await DataAPI.deleteUser(oldUsername);
                    await DataAPI.deleteShop(shopId);
                    showNotification('Shop and user updated successfully!', 'success');
                await renderBranches();
                await renderUsers();
                await renderClients();
                await renderTransactions();
                await populateAllBranchSelects();
                return;
            } else {
                    // Normal user update
                await DataAPI.saveUser(oldUsername, {
                        password: newPassword,
                        role: newRole,
                    ...(newUsername !== oldUsername ? { newUsername } : {})
                });
                    showNotification('User updated successfully!', 'success');
                await renderUsers();
                }
            };
        }
    });


    // --- Branches Table ---
    async function renderBranches() {
        const branches = await DataAPI.getBranches();
        const user = JSON.parse(sessionStorage.getItem('loggedInUser'));
        renderBranchesTable('branches-table-body', branches, user.role);
    }

    // Ensure event listeners for shop sort dropdowns
    const shopSortDropdown = document.getElementById('shop-sort-dropdown');
    if (shopSortDropdown) shopSortDropdown.onchange = renderBranches;
    const shopSortOrder = document.getElementById('shop-sort-order');
    if (shopSortOrder) shopSortOrder.onchange = renderBranches;

    // --- Inline Edit Handler for Branches ---
    document.addEventListener('click', async (e) => {
        const editBtn = e.target.closest('.edit-branch-btn');
        if (editBtn) {
            const row = editBtn.closest('tr');
            if (!row) return;
            const shopId = row.getAttribute('data-shop-id');
            const nameCell = row.querySelector('.branch-name-cell');
            const locationCell = row.querySelector('.branch-location-cell');
            const oldName = nameCell.textContent;
            const oldLocation = locationCell.textContent;

            nameCell.innerHTML = `<input type="text" class="edit-branch-name border rounded p-1 text-sm w-28" value="${oldName}">`;
            locationCell.innerHTML = `<input type="text" class="edit-branch-location border rounded p-1 text-sm w-28" value="${oldLocation}">`;

            // Hide original action buttons, show delete button if it was hidden
            const originalDeleteBtn = row.querySelector('.delete-branch-btn');
            if (originalDeleteBtn) originalDeleteBtn.style.display = 'none'; // Hide delete during edit
            editBtn.style.display = 'none'; 

            // Add Save/Cancel buttons
            const actionCell = row.querySelector('td:last-child');
            const saveBtn = document.createElement('button');
            saveBtn.className = 'save-branch-btn text-green-600 hover:text-green-900 ml-1';
            saveBtn.innerHTML = '<i class="ri-check-line"></i> Save';
            saveBtn.setAttribute('data-id', shopId); // Store shopId for saving
            const cancelBtn = document.createElement('button');
            cancelBtn.className = 'cancel-branch-btn text-gray-500 hover:text-gray-700 ml-1';
            cancelBtn.innerHTML = '<i class="ri-close-line"></i> Cancel';
            actionCell.appendChild(saveBtn);
            actionCell.appendChild(cancelBtn);
        }

        const saveBtn = e.target.closest('.save-branch-btn');
        if (saveBtn) {
            const row = saveBtn.closest('tr');
            if (!row) return;
            const oldShopId = saveBtn.getAttribute('data-id'); // Use oldShopId as this is the current row's ID
            const newName = row.querySelector('.edit-branch-name').value.trim();
            const newLocation = row.querySelector('.edit-branch-location').value.trim();

            if (!newName || !newLocation) {
                alert('Branch name and location cannot be empty.');
                return;
            }

            try {
                // Fetch current shop data to retain existing properties like createdAt
                const shops = await DataAPI.getAllShops();
                const currentShopData = shops[oldShopId]; // Use oldShopId here

                // Construct the new shop ID based on the new name
                const newShopId = newName.toLowerCase().replace(/\s+/g, '');

                // If the shop name (and thus ID) is changing
                if (newShopId !== oldShopId) {
                    // Check if the new shop ID already exists
                    if (shops[newShopId]) {
                        alert(`A shop with the ID "${newShopId}" (from new name) already exists.`);
                        await renderBranches(); // Revert UI
                        return;
                    }

                    // Handle renaming associated users (shop user and admin user)
                    const users = await DataAPI.getUsers();
                    // Find the shop user (username matching old shopId)
                    const oldShopUser = users[oldShopId];
                    if (oldShopUser && oldShopUser.role === 'branch' && oldShopUser.shopId === oldShopId) {
                        // Create new shop user with new ID as username
                        // Ensure all required fields are present
                        await DataAPI.saveUser(newShopId, { 
                            password: oldShopUser.password,
                            role: 'branch',
                            shopId: newShopId,
                            createdAt: oldShopUser.createdAt || new Date().toISOString()
                        });
                        // Delete old shop user
                        await DataAPI.deleteUser(oldShopId);
                    }

                    // Find the admin user associated with this shop
                    const adminUsers = Object.entries(users).filter(([uname, u]) => u.role === 'admin' && u.shopId === oldShopId);
                    for (const [adminUsername, adminUser] of adminUsers) {
                        // Update admin user's shop property to the new ID
                        await DataAPI.saveUser(adminUsername, {
                            password: adminUser.password,
                            role: 'admin',
                            shopId: newShopId,
                            createdAt: adminUser.createdAt || new Date().toISOString()
                        });
                    }

                    // Update associated clients' shop property
                    const clients = await DataAPI.getClients();
                    if (clients[oldShopId]) {
                        const updatedClientsForShop = clients[oldShopId].map(client => ({
                            ...client,
                            shopId: newShopId
                        }));
                        // Save updated clients for the new shop ID
                        await DataAPI.saveClient(newShopId, { clients: updatedClientsForShop });
                        // Delete old client entry
                        await DataAPI.deleteClient(oldShopId, 'all'); 
                    }

                    // Update associated purchases' shopName/shopId
                    const purchases = await DataAPI.getPurchases();
                    const updatedPurchases = purchases.map(p => {
                        if (p.shopId === oldShopId || p.shopName === oldShopId) {
                            return { ...p, shopId: newShopId, shopName: newShopId };
                        }
                        return p;
                    });
                    // Re-save all affected purchases. This might be inefficient for very large datasets,
                    // but necessary given the current API structure.
                    for (const p of updatedPurchases) {
                        await DataAPI.savePurchase(p); 
                    }

                    // Delete the old shop entry
                    await DataAPI.deleteShop(oldShopId);

                    // Save the new shop data with the new ID
                    await DataAPI.saveShop(newShopId, {
                        ...currentShopData, // Retain other properties like createdAt if present
                        name: newName,
                        location: newLocation
                    });
                } else {
                    // If only name/location is changing, but ID remains the same
                    const updatedShopData = {
                        ...currentShopData, 
                        name: newName,
                        location: newLocation
                    };
                    await DataAPI.saveShop(oldShopId, updatedShopData); 
                }

                alert('Shop updated successfully!');
                await renderBranches(); 
                await renderUsers(); 
                await renderClients(); 
                await renderTransactions(); 
                await populateAllBranchSelects(); 
            } catch (error) {
                console.error('Error saving shop:', error);
                alert('Failed to update shop: ' + (error.message || 'Unknown error.'));
            }
        }

        const cancelBtn = e.target.closest('.cancel-branch-btn');
        if (cancelBtn) {
            await renderBranches(); 
        }
    });


    // --- Inline Edit Handler for Clients ---
    document.addEventListener('click', async (e) => {
        // Edit button
        const editBtn = e.target.closest('.edit-client-btn');
        if (editBtn) {
            console.log('Edit client button clicked');
            const row = editBtn.closest('tr');
            if (!row) return;
            const branch = row.getAttribute('data-branch');
            const clientId = row.getAttribute('data-index');
            const nameCell = row.querySelector('.client-name-cell');
            const phoneCell = row.querySelector('.client-phone-cell');
            if (!nameCell || !phoneCell) {
                showNotification('Client row structure error. Please refresh.', 'error');
                return;
            }
            const oldName = nameCell.textContent;
            const oldPhone = phoneCell.textContent;
            nameCell.innerHTML = `<input type="text" class="edit-client-name border rounded p-1 text-sm w-28" value="${oldName}">`;
            phoneCell.innerHTML = `<input type="text" class="edit-client-phone border rounded p-1 text-sm w-28" value="${oldPhone}">`;
            editBtn.style.display = 'none';
            // Add Save/Cancel
            const actionCell = row.querySelector('td:last-child');
            const saveBtn = document.createElement('button');
            saveBtn.className = 'save-client-btn text-green-600 hover:text-green-900 ml-1';
            saveBtn.innerHTML = '<i class="ri-check-line"></i>';
            const cancelBtn = document.createElement('button');
            cancelBtn.className = 'cancel-client-btn text-gray-500 hover:text-gray-700 ml-1';
            cancelBtn.innerHTML = '<i class="ri-close-line"></i>';
            actionCell.appendChild(saveBtn);
            actionCell.appendChild(cancelBtn);
        }
        // Save button
        if (e.target.closest('.save-client-btn')) {
            console.log('Save client button clicked');
            const row = e.target.closest('tr');
            if (!row) return;
            const branch = row.getAttribute('data-branch');
            const clientId = row.getAttribute('data-index');
            const nameInput = row.querySelector('.edit-client-name');
            const phoneInput = row.querySelector('.edit-client-phone');
            if (!nameInput || !phoneInput) {
                showNotification('Client row structure error. Please refresh.', 'error');
                return;
            }
            const newName = nameInput.value.trim();
            const newPhone = phoneInput.value.trim();
            if (!newName || !newPhone) {
                showNotification('Client name and phone cannot be empty.', 'error');
                return;
            }
            // --- Duplicate phone number check on edit ---
            const clients = await DataAPI.getClients();
            const shopClients = clients[branch] || [];
            const duplicate = shopClients.some(c => c.phoneNumber === newPhone && c.id != clientId);
            if (duplicate) {
                showNotification('A client with this phone number already exists in this shop.', 'error');
                return;
            }
            // --- End duplicate check ---
            // Fetch the latest array from the backend to avoid stale data
            if (!clients[branch] || !Array.isArray(clients[branch])) {
                showNotification('Client list for shop not found.', 'error');
                return;
            }
            // Find the client by ID
            const clientArr = clients[branch];
            const clientIdx = clientArr.findIndex(c => c.id == clientId);
            if (clientIdx === -1) {
                showNotification('Client not found. Aborting update.', 'error');
                return;
            }
            // Update the client in place, preserving ID
            const updatedClient = {
                id: clientId,
                name: newName,
                phoneNumber: newPhone
            };
            clientArr[clientIdx] = updatedClient;
            // Send the full updated array for the shop with replaceAll: true
            await DataAPI.saveClient(branch, { clients: clientArr, replaceAll: true }); 
            showNotification('Client updated successfully!', 'success');
            await renderClients(Object.values(clients).flat());
        }
        // Cancel button
        if (e.target.closest('.cancel-client-btn')) {
            await renderClients(Object.values(await DataAPI.getClients()).flat());
        }
    });

    // --- Delete Handler ---
    async function handleDelete(type, id1, id2) {
        if (!confirm(`Are you sure you want to delete this ${type}? This action cannot be undone.`)) {
            return;
        }

        try {
            if (type === 'transaction') {
                await DataAPI.deletePurchase(id1);
                await renderTransactions(); // Refresh transactions table after delete
            } 
            else if (type === 'branch') {
                await DataAPI.deleteShop(id1);
                // After shop delete, also need to clean up related data (users, clients, purchases)
                // This logic is also on the backend for data integrity, but we re-render affected tables.
                alert('Shop and all associated users, clients, and purchases deleted. These users can no longer log in.');
                await renderBranches();
                await renderUsers();
                await renderClients();
                await renderTransactions();
                await populateAllBranchSelects();
            }
            else if (type === 'client') {
                await DataAPI.deleteClient(id1, id2);
                await renderClients();
            }
            else if (type === 'user') {
                await DataAPI.deleteUser(id1);
                await renderUsers();
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete: ' + (error.message || 'Unknown error.'));
        }
    }

    // Event delegation for delete buttons
    document.addEventListener('click', async (e) => {
        const deleteBtn = e.target.closest('[data-delete-type]');
        if (!deleteBtn) return;

        const type = deleteBtn.getAttribute('data-delete-type');
        const id1 = deleteBtn.getAttribute('data-id') || 
                   deleteBtn.getAttribute('data-shop-id');
        const id2 = deleteBtn.getAttribute('data-index');

        await handleDelete(type, id1, id2);
    });

    // --- Create User Form Handler (NEW) ---
    const createUserForm = document.getElementById('create-user-form');
    if (createUserForm) {
        createUserForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('new-username').value.trim().toLowerCase();
            const password = document.getElementById('new-password').value;
            const role = document.getElementById('new-role').value;
            const statusEl = document.getElementById('create-user-status');
            statusEl.textContent = '';
            statusEl.className = 'text-sm mt-2';
            if (!username || !password || !role) {
                statusEl.textContent = 'All fields are required.';
                statusEl.classList.add('text-red-600');
                return;
            }
            try {
                const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
                const userPayload = { password, role };
                if (role === 'superadmin' && username !== 'superadmin') {
                    userPayload.createdBy = loggedInUser.username;
                }
                await DataAPI.saveUser(username, userPayload);
                statusEl.textContent = `User '${username}' (${role}) created successfully!`;
                statusEl.classList.add('text-green-600');
                createUserForm.reset();
                await renderUsers();
            } catch (err) {
                statusEl.textContent = err.message || 'Failed to create user.';
                statusEl.classList.add('text-red-600');
            }
        });
    }

    // ARCHIVE SIDEBAR LINK LOGIC
    const archiveSidebarLink = document.getElementById('archive-sidebar-link');
    const archiveSection = document.getElementById('archive-section');
    if (archiveSidebarLink && archiveSection) {
      archiveSidebarLink.addEventListener('click', function(e) {
        e.preventDefault();
        // Hide all other main sections
        document.querySelectorAll('main > section').forEach(sec => {
          if (sec !== archiveSection) sec.classList.add('hidden');
        });
        // Show archive section
        archiveSection.classList.remove('hidden');
        // Remove sidebar-active from all links, add to archive
        document.querySelectorAll('.sidebar-link').forEach(link => link.classList.remove('sidebar-active'));
        archiveSidebarLink.classList.add('sidebar-active');
        renderArchiveSection(); // <--- Fetch and render archive data
      });
    }

    // ENHANCED: Hide archive and show all normal sections when any other sidebar link is clicked
    document.querySelectorAll('.sidebar-link').forEach(link => {
      if (link !== archiveSidebarLink) {
        link.addEventListener('click', function(e) {
          // Hide archive section
          if (archiveSection) archiveSection.classList.add('hidden');
          // Show all other main sections (normal page)
          document.querySelectorAll('main > section').forEach(sec => {
            if (sec !== archiveSection) sec.classList.remove('hidden');
          });
          // Remove sidebar-active from all links, add to this one
          document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('sidebar-active'));
          this.classList.add('sidebar-active');
          // Let browser handle anchor jump (default behavior)
        });
      }
    });

    // --- ARCHIVE SECTION RENDERING ---
    async function renderArchiveSection() {
      try {
        console.log('[DEBUG] Rendering archive section...');
        
        // Render archived clients
        await renderArchivedClients();
        
        // ... rest of archive section rendering ...
      } catch (err) {
        console.error('[DEBUG] Error rendering archive section:', err);
      }
    }

    // --- Archive handling ---
    async function loadArchivedClients() {
      try {
        const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
        const response = await fetch('/api/archived-clients', {
          headers: { 'x-user-role': loggedInUser.role }
        });
        if (!response.ok) throw new Error('Failed to fetch archived clients');
        return await response.json();
      } catch (err) {
        console.error('[DEBUG] Error loading archived clients:', err);
        return {};
      }
    }

    async function renderArchivedClients() {
      try {
        const archivedClients = await loadArchivedClients();
        const tbody = document.getElementById('archived-clients-table-body');
        if (!tbody) return;

        tbody.innerHTML = '';
      let hasClients = false;

        for (const branchId in archivedClients) {
          const clients = archivedClients[branchId];
          if (!Array.isArray(clients) || clients.length === 0) continue;

          hasClients = true;
          clients.forEach((client, index) => {
          const row = document.createElement('tr');
          row.innerHTML = `
              <td class="p-2">${client.name}</td>
              <td class="p-2">${client.phoneNumber || ''}</td>
            <td class="p-2">${branchId}</td>
              <td class="p-2">
                <button onclick="restoreClient('${branchId}', ${index})" class="bg-green-500 text-white px-2 py-1 rounded">Restore</button>
                <button onclick="permanentlyDeleteClient('${branchId}', ${index})" class="bg-red-500 text-white px-2 py-1 rounded">Delete Permanently</button>
            </td>
          `;
            tbody.appendChild(row);
          });
        }

        if (!hasClients) {
          tbody.innerHTML = '<tr><td colspan="4" class="text-center p-4">No archived clients</td></tr>';
        }
      } catch (err) {
        console.error('[DEBUG] Error rendering archived clients:', err);
      }
    }

    // --- Client actions ---
    async function deleteClient(branch, clientId) {
      console.log('[DEBUG] Deleting client:', { branch, clientId });
      if (!confirm('Are you sure you want to archive this client?')) return;
      
      try {
        await DataAPI.deleteClient(branch, clientId);
        alert('Client archived successfully!');
        await Promise.all([
          loadAndRenderClients(),
          renderArchivedClients()
        ]);
      } catch (err) {
        console.error('[DEBUG] Error deleting client:', err);
        alert('Failed to archive client: ' + (err.message || err));
      }
    }

    async function restoreClient(branchId, clientId) {
      if (!confirm('Are you sure you want to restore this client?')) return;
      try {
        await DataAPI.restoreClient(branchId, clientId);
        await Promise.all([
          loadAndRenderClients(),
          renderArchivedClients()
        ]);
        showNotification('Client restored successfully!', 'success');
      } catch (err) {
        showNotification('Failed to restore client: ' + (err.message || err), 'error');
      }
    }

    async function permanentlyDeleteClient(branchId, index) {
      if (!confirm('Are you sure you want to PERMANENTLY delete this client? This cannot be undone!')) return;
      try {
        const response = await fetch(`/api/archived-clients/${branchId}/${index}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'x-user-role': JSON.parse(sessionStorage.getItem('loggedInUser')).role
          }
        });
        if (!response.ok) throw new Error('Failed to permanently delete client');
        
          alert('Client permanently deleted!');
        await renderArchivedClients();
      } catch (err) {
        alert('Failed to permanently delete client: ' + (err.message || err));
      }
    }

    // Helper to get headers with auth
    function getHeaders() {
      const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
      const role = loggedInUser?.role || '';
      return {
        'Content-Type': 'application/json',
        'x-user-role': role.trim()
      };
    }

    // Show archive section logic (ensure renderArchiveSection is called)
    if (archiveSidebarLink && archiveSection) {
      archiveSidebarLink.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelectorAll('main > section').forEach(sec => {
          if (sec !== archiveSection) sec.classList.add('hidden');
        });
        archiveSection.classList.remove('hidden');
        document.querySelectorAll('.sidebar-link').forEach(link => link.classList.remove('sidebar-active'));
        archiveSidebarLink.classList.add('sidebar-active');
        renderArchiveSection(); // <--- Fetch and render archive data
      });
    }

    // --- SHOP CREATION DEBUG LOGS ---
    async function createShopFromForm() {
      try {
        console.log('[DEBUG] Submitting shop creation form...');
        const form = document.getElementById('create-shop-form');
        if (!form) {
          console.error('[DEBUG] Shop creation form not found!');
          return;
        }
        const shopId = form.elements['shop-id'].value.trim();
        const shopUser = form.elements['shop-user'].value.trim();
        const shopUserPassword = form.elements['shop-user-password'].value.trim();
        const shopManager = form.elements['shop-manager'].value.trim();
        const shopManagerPassword = form.elements['shop-manager-password'].value.trim();
        const location = form.elements['shop-location'].value.trim();
        console.log('[DEBUG] Form values:', { shopId, shopUser, shopUserPassword, shopManager, shopManagerPassword, location });
        if (!shopId || !shopUser || !shopUserPassword || !shopManager || !shopManagerPassword) {
          console.error('[DEBUG] Missing required fields!');
          alert('Please fill in all required fields.');
          return;
        }
        const payload = { shopId, shopUser, shopUserPassword, shopManager, shopManagerPassword, location };
        console.log('[DEBUG] Sending POST /api/create-shop with payload:', payload);
        const response = await fetch('/api/create-shop', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (response.ok && result.success) {
          console.log('[DEBUG] Shop created successfully:', result);
          alert('Shop created successfully!');
          await renderBranches();
          await renderUsers();
          await populateAllBranchSelects();
          await testShopCreationAutomation(); // <-- Run automated test
        } else {
          console.error('[DEBUG] Shop creation failed:', result);
          alert('Shop creation failed: ' + (result.error || 'Unknown error'));
        }
      } catch (err) {
        console.error('[DEBUG] Exception during shop creation:', err);
        alert('Error creating shop: ' + (err.message || err));
      }
    }

    // Attach debug handler to the form
    window.addEventListener('DOMContentLoaded', () => {
      const form = document.getElementById('create-shop-form');
      if (form) {
        form.addEventListener('submit', function(e) {
          e.preventDefault();
          createShopFromForm();
        });
        console.log('[DEBUG] Shop creation form handler attached.');
      } else {
        console.warn('[DEBUG] Shop creation form not found on page load.');
      }
    });

    // Add debug logs to shop list rendering
    async function renderBranches() {
      try {
        console.log('[DEBUG] Fetching all shops for renderBranches...');
        const shops = await fetchAllShops();
        console.log('[DEBUG] Shops fetched:', shops);
        const tbody = document.getElementById('branches-table-body');
        if (!tbody) {
          console.warn('[DEBUG] branches-table-body not found!');
          return;
        }
        tbody.innerHTML = '';
        if (!Array.isArray(shops) || shops.length === 0) {
          tbody.innerHTML = '<tr><td colspan="4" class="text-center p-4">No shops found</td></tr>';
          console.log('[DEBUG] No shops to render.');
          return;
        }
        shops.forEach(shop => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td class="p-2">${shop.name || shop.id}</td>
            <td class="p-2">${shop.location || ''}</td>
            <td class="p-2">${shop.id}</td>
            <td class="p-2">
              <button onclick="deleteBranch('${shop.id}')" class="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
            </td>
          `;
          tbody.appendChild(row);
        });
        console.log('[DEBUG] Rendered', shops.length, 'shops.');
      } catch (err) {
        console.error('[DEBUG] Error rendering branches:', err);
      }
    }

    async function testShopCreationAutomation() {
      try {
        console.log('[TEST] Fetching all shops after creation...');
        const shops = await fetchAllShops();
        console.log('[TEST] All shops:', shops);
        if (Array.isArray(shops) && shops.length > 0) {
          console.log(`[TEST] Shop count: ${shops.length}`);
        } else {
          console.warn('[TEST] No shops found after creation!');
        }

        console.log('[TEST] Fetching all users after creation...');
        const users = await fetchAllUsers();
        console.log('[TEST] All users:', users);
        if (users && Object.keys(users).length > 0) {
          console.log(`[TEST] User count: ${Object.keys(users).length}`);
        } else {
          console.warn('[TEST] No users found after creation!');
        }

        console.log('[TEST] Fetching all clients after creation...');
        const clients = await fetchAllClients();
        console.log('[TEST] All clients:', clients);
        if (clients && Object.keys(clients).length > 0) {
          console.log(`[TEST] Clients found for shops: ${Object.keys(clients).join(', ')}`);
        } else {
          console.warn('[TEST] No clients found after creation!');
        }
        console.log('[TEST] Automated shop creation test complete.');
      } catch (err) {
        console.error('[TEST] Error during automated shop creation test:', err);
      }
    }

    // Ensure dropdowns are populated on page load
    window.addEventListener('DOMContentLoaded', async () => {
      await populateAllBranchSelects();
    });

    // Client form submission handler
    async function handleClientFormSubmit(event) {
      try {
        event.preventDefault();
        console.log('[DEBUG] Client form submitted');

        const form = event.target;
        const branchId = form.elements['client-branch'].value;
        const name = form.elements['client-name'].value;
        const phoneNumber = form.elements['client-phone'].value;

        console.log('[DEBUG] Client form data:', { branchId, name, phoneNumber });

        if (!branchId || !name || !phoneNumber) {
          alert('Please fill in all fields');
          return;
        }

        // Get user role for authorization
        const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
        console.log('[DEBUG] Logged in user:', loggedInUser);

        const response = await fetch('/api/clients', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-role': loggedInUser.role
          },
          body: JSON.stringify({
            branchId,
            client: { name, phoneNumber }
          })
        });

        console.log('[DEBUG] Client creation response status:', response.status);
        const result = await response.json();
        console.log('[DEBUG] Client creation result:', result);

        if (result.success) {
          alert('Client added successfully!');
          form.reset();
          
          console.log('[DEBUG] Refreshing clients table...');
          await loadAndRenderClients();
        } else {
          alert('Failed to add client: ' + (result.error || 'Unknown error'));
        }
      } catch (err) {
        console.error('[DEBUG] Error in handleClientFormSubmit:', err);
        alert('Error adding client: ' + err.message);
      }
    }

    // Separate function to load and render clients
    async function loadAndRenderClients() {
      console.log('[DEBUG] loadAndRenderClients() called');
      console.log('[DEBUG] Starting to load clients...');
      
      try {
        const data = await DataAPI.getClients();
        console.log('[DEBUG] Raw clients data:', data);
        
        // Convert clients object to array with branch info
        const clientsList = [];
        for (const branchId in data) {
          const branchClients = data[branchId];
          console.log(`[DEBUG] Processing branch ${branchId} clients:`, branchClients);
          
          if (Array.isArray(branchClients)) {
            clientsList.push(...branchClients.map(client => ({
              ...client,
              branch: branchId
            })));
          }
        }
        
        console.log('[DEBUG] Processed client list:', clientsList);
        await renderClients(clientsList);
        console.log('[DEBUG] Successfully rendered clients');
      } catch (err) {
        console.error('[DEBUG] Error loading/rendering clients:', err);
        const tbody = document.getElementById('clients-table-body');
        if (tbody) {
          tbody.innerHTML = '<tr><td colspan="4" class="text-center p-4 text-red-500">Error loading clients</td></tr>';
        }
      }
    }

    // Call loadAndRenderClients on page load
    document.addEventListener('DOMContentLoaded', () => {
      // Attach form handler
      const clientForm = document.getElementById('client-form-actual');
      if (clientForm) {
        console.log('[DEBUG] Found client form, attaching submit handler');
        clientForm.addEventListener('submit', handleClientFormSubmit);
      } else {
        console.error('[DEBUG] Client form not found!');
      }

      // Load initial clients
      console.log('[DEBUG] Loading initial clients...');
      loadAndRenderClients();
    });

    console.log('[DEBUG] Calling loadAndRenderClients() at top level');
    loadAndRenderClients();

    function hideEditClientModal() {
      document.getElementById('edit-client-modal').style.display = 'none';
    }
    window.hideEditClientModal = hideEditClientModal;

    

    // Update the edit client form submit handler to archive old and add new
    const editClientForm = document.getElementById('edit-client-form');
    if (editClientForm) {
      editClientForm.onsubmit = async function(e) {
        e.preventDefault();
        const branch = document.getElementById('edit-client-branch').value;
        const index = document.getElementById('edit-client-index').value;
        const newName = document.getElementById('edit-client-name').value.trim();
        const newPhone = document.getElementById('edit-client-phone').value.trim();
        if (!newName || !newPhone) {
          showNotification('Name and phone are required', 'error');
          return;
        }
        try {
          // Archive the old client first
          await fetch(`/api/clients/${branch}/${index}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'x-user-role': JSON.parse(sessionStorage.getItem('loggedInUser')).role
            }
          });
          // Add the new client
          await fetch(`/api/clients`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-user-role': JSON.parse(sessionStorage.getItem('loggedInUser')).role
            },
            body: JSON.stringify({ branchId: branch, client: { name: newName, phoneNumber: newPhone } })
          });
          hideEditClientModal();
          showNotification('Client updated and old version archived!', 'success');
          await Promise.all([
            renderClients(),
            renderArchivedClients()
          ]);
        } catch (err) {
          showNotification('Failed to update client: ' + (err.message || err), 'error');
        }
      };
    }

    // Replace old editClient calls with editClientWithModal
    async function editClientWithModal(branch, index) {
      try {
        const response = await fetch(`/api/clients`, {
          headers: {
            'x-user-role': JSON.parse(sessionStorage.getItem('loggedInUser')).role
          }
        });
        const clients = await response.json();
        const client = clients[branch][index];
        if (!client) {
          showNotification('Client not found', 'error');
          return;
        }
        // First, ask for new name
        showInputModal('Edit client name:', client.name, (newName) => {
          if (newName === null) return; // Cancelled
          // Then, ask for new phone
          showInputModal('Edit client phone number:', client.phoneNumber || '', async (newPhone) => {
            if (newPhone === null) return; // Cancelled
            // Now update the client (archive old, add new)
            try {
              await fetch(`/api/clients/${branch}/${index}`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                  'x-user-role': JSON.parse(sessionStorage.getItem('loggedInUser')).role
                }
              });
              await fetch(`/api/clients`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'x-user-role': JSON.parse(sessionStorage.getItem('loggedInUser')).role
                },
                body: JSON.stringify({ branchId: branch, client: { name: newName, phoneNumber: newPhone } })
              });
              showNotification('Client updated and old version archived!', 'success');
              await Promise.all([
                renderClients(),
                renderArchivedClients()
              ]);
            } catch (err) {
              showNotification('Failed to update client: ' + (err.message || err), 'error');
            }
          });
        });
      } catch (err) {
        showNotification('Failed to load client for editing: ' + (err.message || err), 'error');
      }
    }
});

// --- Excel Export Logic ---
async function getFilteredDataForExport() {
    const allPurchases = await DataAPI.getPurchases();
    let filtered = [...allPurchases];
    // Branch filter
    const branchFilter = document.getElementById('excel-branch-filter').value;
    if (branchFilter) {
        filtered = filtered.filter(p => 
            p.shopId === branchFilter || p.shopName === branchFilter
        );
    }
    // Date range filter
    const dateFrom = document.getElementById('excel-date-from').value;
    const dateTo = document.getElementById('excel-date-to').value;
    if (dateFrom) {
        filtered = filtered.filter(p => {
            const d = new Date(p.dateTime || p.date);
            return d >= new Date(dateFrom);
        });
    }
    if (dateTo) {
        filtered = filtered.filter(p => {
            const d = new Date(p.dateTime || p.date);
            return d <= new Date(dateTo + 'T23:59:59'); // Include whole day
        });
    }
    // Client filter
    const clientFilter = document.getElementById('excel-client-filter').value.trim().toLowerCase();
    if (clientFilter) {
        filtered = filtered.filter(p => 
            (p.clientName || '').toLowerCase().includes(clientFilter)
        );
    }
    // --- FLATTEN purchases ---
    // Each product in a transaction becomes a separate row
    let flatRows = [];
    filtered.forEach(p => {
        if (Array.isArray(p.purchases) && p.purchases.length > 0) {
            p.purchases.forEach(item => {
                let combinedVariant = '';
                if (item.variant && item.variant2) combinedVariant = item.variant + ', ' + item.variant2;
                else if (item.variant) combinedVariant = item.variant;
                else if (item.variant2) combinedVariant = item.variant2;
                flatRows.push({
                    ...p,
                    purchasedItem: item.purchasedItem,
                    variant: combinedVariant,
                    quantity: item.quantity,
                    amount: item.amount,
                    money: item.money
                });
            });
        } else {
            let combinedVariant = '';
            if (p.variant && p.variant2) combinedVariant = p.variant + ', ' + p.variant2;
            else if (p.variant) combinedVariant = p.variant;
            else if (p.variant2) combinedVariant = p.variant2;
            flatRows.push({ ...p, variant: combinedVariant });
        }
    });
    // Sort by date (newest first)
    flatRows.sort((a, b) => {
        const aTime = new Date(a.dateTime || a.date || 0).getTime();
        const bTime = new Date(b.dateTime || b.date || 0).getTime();
        return bTime - aTime;
    });
    return flatRows;
}

// --- Excel Export Event Listeners ---
function initializeExcelExportEventListeners() {
    const previewBtn = document.getElementById('preview-export-btn');
    const downloadBtn = document.getElementById('download-excel-btn');
    const clearBtn = document.getElementById('clear-filters-btn');
    previewBtn.onclick = previewExport;
    downloadBtn.onclick = downloadExcel;
    clearBtn.onclick = clearFilters;
}

async function previewExport() {
    const preview = document.getElementById('export-preview');
    const previewHeader = document.getElementById('preview-header');
    const previewBody = document.getElementById('preview-body');
    const previewCount = document.getElementById('preview-count');
    const selectedCols = Array.from(document.querySelectorAll('input[name="excel-columns"]:checked')).map(cb => cb.value);
    const allPurchases = await DataAPI.getPurchases();
    let filtered = [...allPurchases];
    // Branch filter
    const branchFilter = document.getElementById('excel-branch-filter').value;
    if (branchFilter) {
        filtered = filtered.filter(p => 
            p.shopId === branchFilter || p.shopName === branchFilter
        );
    }
    // Date range filter
    const dateFrom = document.getElementById('excel-date-from').value;
    const dateTo = document.getElementById('excel-date-to').value;
    if (dateFrom) {
        filtered = filtered.filter(p => {
            const d = new Date(p.dateTime || p.date);
            return d >= new Date(dateFrom);
        });
    }
    if (dateTo) {
        filtered = filtered.filter(p => {
            const d = new Date(p.dateTime || p.date);
            return d <= new Date(dateTo + 'T23:59:59'); // Include whole day
        });
    }
    // Client filter
    const clientFilter = document.getElementById('excel-client-filter').value.trim().toLowerCase();
    if (clientFilter) {
        filtered = filtered.filter(p => 
            (p.clientName || '').toLowerCase().includes(clientFilter)
        );
    }
    // Columns to merge (grouped):
    const mergeCols = [
        'shopName', 'clientName', 'phoneNumber', 'dateTime', 'invoiceFileName', 'purchasedInvoiceFileName', 'invoiceNumber', 'comment'
    ];
    // Build header
    previewHeader.innerHTML = '';
    selectedCols.forEach(col => {
        let label = col;
        if (col === 'shopName') label = 'Shop Name';
        if (col === 'shopId') label = 'Shop';
        if (col === 'clientName') label = 'Client Name';
        if (col === 'phoneNumber') label = 'Phone Number';
        if (col === 'purchasedItem') label = 'Item';
        if (col === 'quantity') label = 'Quantity';
        if (col === 'amount') label = 'Amount';
        if (col === 'money') label = 'Money';
        if (col === 'dateTime') label = 'Date & Time';
        if (col === 'invoiceFileName') label = 'Product Invoice File Name';
        if (col === 'purchasedInvoiceFileName') label = 'Product Purchased Invoice File Name';
        if (col === 'invoiceNumber') label = 'Invoice No.';
        if (col === 'comment') label = 'Comment';
        previewHeader.innerHTML += `<th class="p-2 min-w-[120px]">${label}</th>`;
    });
    // Build body (first 10 transactions, but may be more rows due to products)
    previewBody.innerHTML = '';
   // Build previewRows array
let previewRows = [];
for (let t = 0; t < filtered.length; t++) {
        const p = filtered[t];
        const products = Array.isArray(p.purchases) && p.purchases.length > 0 ? p.purchases : [{
            purchasedItem: p.purchasedItem,
            variant: (p.variant && p.variant2) ? p.variant + ', ' + p.variant2 : (p.variant || p.variant2 || ''),
            quantity: p.quantity,
            amount: p.amount,
            money: p.money,
            dateTime: p.dateTime,
            parentDateTime: p.dateTime || p.date
        }];
        const n = products.length;
    for (let i = 0; i < n; i++) {
        previewRows.push({
            ...products[i],
            parentDateTime: p.dateTime || p.date,
            p: p,
            i: i,
            n: n
        });
    }
}
// Sort previewRows by parentDateTime descending
previewRows.sort((a, b) => {
    const aTime = new Date(a.parentDateTime || a.dateTime || 0).getTime();
    const bTime = new Date(b.parentDateTime || b.dateTime || 0).getTime();
    return bTime - aTime;
});
// Render only the first 10 rows
previewBody.innerHTML = '';
for (let rowIdx = 0; rowIdx < Math.min(previewRows.length, 10); rowIdx++) {
    const rowObj = previewRows[rowIdx];
    const p = rowObj.p;
    const i = rowObj.i;
    const n = rowObj.n;
            let tr = '<tr>';
            selectedCols.forEach((col, colIdx) => {
                if (mergeCols.includes(col)) {
                    if (i === 0) {
                        let value = '';
                        if (col === 'dateTime') value = p.dateTime || p.date || '';
                        else if (col === 'invoiceFileName') value = p.invoiceFileName || '';
                        else if (col === 'purchasedInvoiceFileName') value = p.purchasedInvoiceFileName || '';
                        else value = p[col] !== undefined ? p[col] : '';
                tr += `<td class="p-2"${n > 1 ? ` rowspan="${Math.min(n, 10-rowIdx)}"` : ''}>${value}</td>`;
                    }
                } else if (col === 'purchasedItem') {
            tr += `<td class="p-2">${rowObj.purchasedItem || ''}</td>`;
        } else if (col === 'variant/type') {
            tr += `<td class="p-2">${rowObj.variant && rowObj.variant.trim() ? rowObj.variant : '<span style=\"color:gray\">No type</span>'}</td>`;
                } else if (col === 'quantity') {
            tr += `<td class="p-2">${rowObj.amount !== undefined ? rowObj.amount : (rowObj.quantity !== undefined ? rowObj.quantity : '')}</td>`;
                } else if (col === 'amount') {
            tr += `<td class="p-2">${rowObj.variant2 || rowObj.amount || rowObj.weight || rowObj.units || ''}</td>`;
                } else if (col === 'money') {
            tr += `<td class="p-2">${rowObj.money !== undefined ? rowObj.money : ''}</td>`;
                } else if (col === 'units') {
            tr += `<td class="p-2">${rowObj.variant2 || rowObj.amount || rowObj.weight || rowObj.units || ''}</td>`;
                } else {
                    tr += `<td class="p-2">${p[col] !== undefined ? p[col] : ''}</td>`;
                }
            });
            tr += '</tr>';
            previewBody.innerHTML += tr;
    }
    preview.classList.remove('hidden');
    // Count total rows (not just transactions)
    let totalRows = 0;
    filtered.forEach(p => {
        const products = Array.isArray(p.purchases) && p.purchases.length > 0 ? p.purchases : [{
            purchasedItem: p.purchasedItem,
            variant: (p.variant && p.variant2) ? p.variant + ', ' + p.variant2 : (p.variant || p.variant2 || ''),
            quantity: p.quantity,
            amount: p.amount,
            money: p.money
        }];
        totalRows += products.length;
    });
    previewCount.textContent = totalRows;
    // Enable download button
    document.getElementById('download-excel-btn').disabled = false;
    document.getElementById('download-excel-btn').classList.remove('bg-gray-200', 'cursor-not-allowed', 'text-gray-700');
    document.getElementById('download-excel-btn').classList.add('bg-green-600', 'hover:bg-green-700', 'text-white');
}

async function downloadExcel() {
    const selectedCols = Array.from(document.querySelectorAll('input[name="excel-columns"]:checked')).map(cb => cb.value);
    const allPurchases = await DataAPI.getPurchases();
    let filtered = [...allPurchases];
    // Branch filter
    const branchFilter = document.getElementById('excel-branch-filter').value;
    if (branchFilter) {
        filtered = filtered.filter(p => 
            p.shopId === branchFilter || p.shopName === branchFilter
        );
    }
    // Date range filter
    const dateFrom = document.getElementById('excel-date-from').value;
    const dateTo = document.getElementById('excel-date-to').value;
    if (dateFrom) {
        filtered = filtered.filter(p => {
            const d = new Date(p.dateTime || p.date);
            return d >= new Date(dateFrom);
        });
    }
    if (dateTo) {
        filtered = filtered.filter(p => {
            const d = new Date(p.dateTime || p.date);
            return d <= new Date(dateTo + 'T23:59:59'); // Include whole day
        });
    }
    // Client filter
    const clientFilter = document.getElementById('excel-client-filter').value.trim().toLowerCase();
    if (clientFilter) {
        filtered = filtered.filter(p => 
            (p.clientName || '').toLowerCase().includes(clientFilter)
        );
    }

    // --- CRITICAL: Sort transactions BEFORE flattening ---
    filtered.sort((a, b) => {
        const aTime = new Date(a.dateTime || a.date || 0).getTime();
        const bTime = new Date(b.dateTime || b.date || 0).getTime();
        return bTime - aTime;
    });

    // Columns to merge (grouped):
    const mergeCols = [
        'shopName', 'shopId', 'clientName', 'phoneNumber', 'dateTime', 'invoiceFileName', 'purchasedInvoiceFileName', 'invoiceNumber', 'comment'
    ];
    // Build export rows and track merges
    let exportRows = [];
    let merges = [];
    let rowIdx = 1; // 1-based for SheetJS merges (header is row 0)
    filtered.forEach(p => {
        const products = Array.isArray(p.purchases) && p.purchases.length > 0 ? p.purchases : [{
            purchasedItem: p.purchasedItem,
            variant: (p.variant && p.variant2) ? p.variant + ', ' + p.variant2 : (p.variant || p.variant2 || ''),
            quantity: p.quantity,
            amount: p.amount,
            money: p.money
        }];
        const n = products.length;
        for (let i = 0; i < n; i++) {
            const row = {};
            selectedCols.forEach(col => {
                if (mergeCols.includes(col)) {
                    if (i === 0) {
                        if (col === 'shopName' || col === 'shopId') row[col] = p.shopName || p.shopId || '';
                        else if (col === 'dateTime') row[col] = p.dateTime || p.date || '';
                        else if (col === 'invoiceFileName') row[col] = p.invoiceFileName || '';
                        else if (col === 'purchasedInvoiceFileName') row[col] = p.purchasedInvoiceFileName || '';
                        else row[col] = p[col] !== undefined ? p[col] : '';
                    } else {
                        row[col] = '';
                    }
                } else if (col === 'purchasedItem') {
                    row[col] = products[i]?.purchasedItem || '';
                } else if (col === 'variant/type') {
                    row[col] = (products[i]?.variant && products[i]?.variant.trim()) ? products[i].variant : 'No type';
                } else if (col === 'quantity') {
                    row[col] = products[i]?.amount !== undefined ? products[i].amount : (products[i]?.quantity !== undefined ? products[i].quantity : '');
                } else if (col === 'amount') {
                    row[col] = products[i]?.variant2 || products[i]?.amount || products[i]?.weight || products[i]?.units || '';
                } else if (col === 'money') {
                    row[col] = products[i]?.money !== undefined ? products[i].money : '';
                } else if (col === 'units') {
                    row[col] = products[i]?.variant2 || products[i]?.amount || products[i]?.weight || products[i]?.units || '';
                } else {
                    row[col] = p[col] !== undefined ? p[col] : '';
                }
            });
            exportRows.push(row);
        }
        // Add merges for each mergeCol if more than 1 product
        if (n > 1) {
            selectedCols.forEach((col, colIdx) => {
                if (mergeCols.includes(col)) {
                    merges.push({ s: { r: rowIdx, c: colIdx }, e: { r: rowIdx + n - 1, c: colIdx } });
                }
            });
        }
        rowIdx += n;
    });

    if (!exportRows.length) {
        alert('No data to export!');
        return;
    }

    // DO NOT sort exportRows after flattening! This keeps products and merged columns in sync.

    // After building exportRows and merges, set column widths and row heights for better readability
    const ws = XLSX.utils.json_to_sheet(exportRows);
    // Set column widths (wider for readability)
    const colWidths = selectedCols.map(col => {
        if (["shopName","shopId","clientName","invoiceFileName","purchasedInvoiceFileName","comment"].includes(col)) return { wch: 28 };
        if (["purchasedItem","variant"].includes(col)) return { wch: 20 };
        if (["amount","quantity","invoiceNumber","money"].includes(col)) return { wch: 16 };
        if (["dateTime"].includes(col)) return { wch: 26 };
        return { wch: 18 };
    });
    ws['!cols'] = colWidths;
    // Set row heights (taller for readability)
    ws['!rows'] = exportRows.map(() => ({ hpt: 28 }));
    // Apply merges for grouped columns
    if (merges.length) ws['!merges'] = merges;
    // Add table style (header bold, borders)
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell = ws[XLSX.utils.encode_cell({ r: 0, c: C })];
        if (cell) cell.s = { font: { bold: true }, alignment: { horizontal: 'center', vertical: 'center' }, border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } } };
    }
    for (let R = 1; R <= exportRows.length; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const cell = ws[XLSX.utils.encode_cell({ r: R, c: C })];
            if (cell) cell.s = { alignment: { vertical: 'center', horizontal: 'left', wrapText: true }, border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } } };
        }
    }
    // Build workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
    XLSX.writeFile(wb, 'transactions_export.xlsx');
}

function clearFilters() {
    document.getElementById('excel-branch-filter').value = '';
    document.getElementById('excel-date-from').value = '';
    document.getElementById('excel-date-to').value = '';
    document.getElementById('excel-client-filter').value = '';
    document.querySelectorAll('input[name="excel-columns"]').forEach(cb => cb.checked = true);
    document.getElementById('export-preview').classList.add('hidden');
    document.getElementById('download-excel-btn').disabled = true;
    document.getElementById('download-excel-btn').classList.add('bg-gray-200', 'cursor-not-allowed', 'text-gray-700');
    document.getElementById('download-excel-btn').classList.remove('bg-green-600', 'hover:bg-green-700', 'text-white');
    document.getElementById('preview-count').textContent = '0';
}

function logout() {
    sessionStorage.removeItem('loggedInUser');
    sessionStorage.setItem('logoutMessage', 'Logging out...');
    window.location.href = 'loading.html';
}

// Add the same PRODUCT_VARIANTS mapping as in purchase-script.js
const PRODUCT_VARIANTS = {
  "WEATHER GUARD CLASSIC SEMI GLOSS": { amountLabel: "Buckets" },
  "MIXED WEATHER GUARD": { amountLabel: "Buckets" },
  "SILK CLASSIC SEMI GLOSS": { amountLabel: "Buckets" },
  "MIXED SILK": { amountLabel: "Buckets" },
  "IPOLY EMULSION ECONOMIC GRADE": { amountLabel: "Buckets" },
  "PREMIUM EMULSION MATT CLASSIC": { amountLabel: "Buckets" },
  "KIPAU DESIGN": { amountLabel: "Units" },
  "KIPAU PLASTER 25kg": { amountLabel: "Bags" },
  "KIPAU PLASTER 20kg": { amountLabel: "Bags" },
  "KIPAU 2 IN 1": { amountLabel: "Units" },
  "KIPAU T3": { amountLabel: "Units" },
  "FAST DRY": { amountLabel: "Buckets" },
  "GLOSS ENAMEL": { amountLabel: "Buckets" },
  "NITRO CELLALOSE": { amountLabel: "Buckets" },
  "THINNER": { amountLabel: "Cans" },
  "2K CRYL": { amountLabel: "Buckets" },
  "WOOD GLUE": { amountLabel: "Buckets" },
};

// --- AGGREGATED DATA FETCHERS ---
async function fetchAllShops() {
  return await DataAPI.getAllShops();
}

async function fetchAllUsers() {
  return await DataAPI.getAllUsers();
}

async function fetchAllClients() {
  return await DataAPI.getAllClients();
}

// --- DASHBOARD RENDERING UPDATES ---
async function renderShops() {
  const shops = await fetchAllShops();
  const tbody = document.getElementById('branches-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';
  shops.forEach(shop => {
    const row = document.createElement('tr');
    row.innerHTML = `<td class="p-2">${shop.name || shop.id}</td><td class="p-2">${shop.location || ''}</td><td class="p-2">${shop.id}</td><td class="p-2">Actions</td>`;
    tbody.appendChild(row);
  });
}

async function renderUsers() {
  const users = await fetchAllUsers();
  const tbody = document.getElementById('users-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';
  Object.entries(users).forEach(([username, user]) => {
    const row = document.createElement('tr');
    row.innerHTML = `<td class="p-2">${username}</td><td class="p-2">${user.role}</td><td class="p-2">${user.shopId || ''}</td><td class="p-2">${user.shopId || ''}</td>`;
    tbody.appendChild(row);
  });
}

async function renderClients() {
  try {
    console.log('[DEBUG] Starting to render clients...');
    const response = await fetch('/api/clients', {
      headers: {
        'x-user-role': JSON.parse(sessionStorage.getItem('loggedInUser')).role
      }
    });
    const clients = await response.json();
    console.log('[DEBUG] Fetched clients data:', clients);

    const clientTable = document.getElementById('clients-table-body');
    if (!clientTable) {
      console.error('[DEBUG] Clients table body not found!');
      return;
    }

    let clientList = [];
    for (const branchId in clients) {
      const branchClients = clients[branchId] || [];
      console.log(`[DEBUG] Processing clients for branch ${branchId}:`, branchClients);
      
      if (Array.isArray(branchClients)) {
        clientList.push(...branchClients.map(c => ({ ...c, branch: branchId })));
      } else {
        // Handle case where branchClients might be an object
        Object.values(branchClients).forEach(c => {
          if (c && c.name) {
            clientList.push({ ...c, branch: branchId });
          }
        });
      }
    }

    console.log('[DEBUG] Final client list to render:', clientList);
    clientTable.innerHTML = '';

    if (clientList.length === 0) {
      clientTable.innerHTML = '<tr><td colspan="4" class="text-center p-4">No clients found</td></tr>';
      console.log('[DEBUG] No clients to display');
      return;
    }

    clientList.forEach((client, index) => {
      const row = document.createElement('tr');
      row.setAttribute('data-branch', client.branch);
      row.setAttribute('data-index', client.id);
      row.innerHTML = `
        <td class="p-2 client-name-cell">${client.name}</td>
        <td class="p-2 client-phone-cell">${client.phoneNumber || ''}</td>
        <td class="p-2">${client.branch || ''}</td>
        <td class="p-2 flex gap-2">
          <button class="bg-blue-500 text-white px-2 py-1 rounded edit-client-btn">Edit</button>
          <button onclick="deleteClient('${client.branch}', '${client.id}')" class="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
        </td>
      `;
      clientTable.appendChild(row);
    });

    console.log('[DEBUG] Successfully rendered', clientList.length, 'clients');
  } catch (err) {
    console.error('[DEBUG] Error rendering clients:', err);
    clientTable.innerHTML = '<tr><td colspan="4" class="text-center p-4">Error loading clients</td></tr>';
  }
}

async function deleteClient(branch, index) {
  if (!confirm('Are you sure you want to archive this client?')) return;
  try {
    const response = await fetch(`/api/clients/${branch}/${index}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': JSON.parse(sessionStorage.getItem('loggedInUser')).role
      }
    });
    if (!response.ok) throw new Error('Failed to delete client');
    
    showNotification('Client archived successfully!', 'success');
    await Promise.all([
      renderClients(),
      renderArchivedClients()
    ]);
  } catch (err) {
    showNotification('Failed to archive client: ' + (err.message || err), 'error');
  }
}

// --- Update Add Client to Shop Dropdown ---
async function populateAllBranchSelects() {
  try {
    const shops = await fetchAllShops();
    console.log('[DEBUG] Raw shops data:', shops);
    
    const filteredShops = Array.isArray(shops)
      ? shops.filter(s => s.id && s.id !== 'config')
      : [];
    console.log('[DEBUG] Filtered shops:', filteredShops);

    // Direct approach to populate dropdowns
    const clientBranchSelect = document.getElementById('client-branch');
    const excelBranchFilter = document.getElementById('excel-branch-filter');

    if (clientBranchSelect) {
      console.log('[DEBUG] Found client dropdown, current HTML:', clientBranchSelect.innerHTML);
      
      // Build options HTML
      let optionsHtml = '<option value="">Select shop</option>';
      filteredShops.forEach(shop => {
        optionsHtml += `<option value="${shop.id}">${shop.name || shop.id}</option>`;
      });
      
      // Set options directly
      console.log('[DEBUG] Setting client dropdown HTML to:', optionsHtml);
      clientBranchSelect.innerHTML = optionsHtml;
      
      // Verify
      console.log('[DEBUG] Client dropdown HTML after set:', clientBranchSelect.innerHTML);
      console.log('[DEBUG] Client dropdown options count:', clientBranchSelect.options.length);
    } else {
      console.error('[DEBUG] Client dropdown not found!');
    }

    if (excelBranchFilter) {
      console.log('[DEBUG] Found excel dropdown, current HTML:', excelBranchFilter.innerHTML);
      
      // Build options HTML
      let optionsHtml = '<option value="">📋 All Shops (Download everything)</option>';
      filteredShops.forEach(shop => {
        optionsHtml += `<option value="${shop.id}">${shop.name || shop.id}</option>`;
      });
      
      // Set options directly
      console.log('[DEBUG] Setting excel dropdown HTML to:', optionsHtml);
      excelBranchFilter.innerHTML = optionsHtml;
      
      // Verify
      console.log('[DEBUG] Excel dropdown HTML after set:', excelBranchFilter.innerHTML);
      console.log('[DEBUG] Excel dropdown options count:', excelBranchFilter.options.length);
    } else {
      console.error('[DEBUG] Excel dropdown not found!');
    }

  } catch (err) {
    console.error('[DEBUG] Error in populateAllBranchSelects:', err);
  }
}

// --- Add edit and delete client functionality ---


window.restoreClient = restoreClient;

function showNotification(message, type = 'info') {
  const modal = document.getElementById('notification-modal');
  const msgSpan = document.getElementById('notification-modal-message');
  if (!modal || !msgSpan) return;
  msgSpan.textContent = message;
  // Optionally style by type
  msgSpan.style.color = (type === 'error') ? '#dc2626' : (type === 'success' ? '#16a34a' : '#222');
  modal.style.display = 'flex';
}

function hideNotification() {
  const modal = document.getElementById('notification-modal');
  if (modal) modal.style.display = 'none';
}
window.showNotification = showNotification;
window.hideNotification = hideNotification;

// Utility for modal input (replaces prompt)
function showInputModal(message, defaultValue = '', callback) {
  // Create modal if not exists
  let modal = document.getElementById('input-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'input-modal';
    modal.style = 'display:none; position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.3); z-index:10001; align-items:center; justify-content:center;';
    modal.innerHTML = `
      <div style="background:#fff; color:#222; padding:2rem 2.5rem; border-radius:12px; box-shadow:0 4px 32px rgba(0,0,0,0.18); min-width:300px; max-width:90vw; text-align:center; font-size:1.1rem;">
        <div id="input-modal-message" class="mb-4"></div>
        <input id="input-modal-value" class="w-full border border-gray-300 rounded-md p-2 mb-4" />
        <div class="flex justify-center gap-4">
          <button id="input-modal-ok" class="bg-blue-600 text-white px-4 py-2 rounded">OK</button>
          <button id="input-modal-cancel" class="bg-gray-300 text-gray-800 px-4 py-2 rounded">Cancel</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }
  document.getElementById('input-modal-message').textContent = message;
  const input = document.getElementById('input-modal-value');
  input.value = defaultValue;
  modal.style.display = 'flex';
  input.focus();
  document.getElementById('input-modal-ok').onclick = () => {
    modal.style.display = 'none';
    callback(input.value);
  };
  document.getElementById('input-modal-cancel').onclick = () => {
    modal.style.display = 'none';
    callback(null);
  };
}

// Replace all alert() calls with showNotification()
// Example: alert('Message') => showNotification('Message', 'info')
// Example: alert('Error: ' + err) => showNotification('Error: ' + (err.message || err), 'error')
// ... existing code ...
// For prompt() calls, use showInputModal()
// Example: const value = prompt('Edit:', oldValue) => showInputModal('Edit:', oldValue, (value) => { ... })
// ... existing code ...
// --- Modal-based editClient function at global scope ---
    async function editClient(branch, index) {
      // Inline editing is now handled in renderClients. This function is kept for compatibility.
    }

// Ensure this is the last line in the file:
window.editClient = editClient;

// Add deleteBranch function for All Shops table
async function deleteBranch(shopId) {
    if (!confirm('Are you sure you want to delete this shop? This will remove its database file and users will not be able to log in.')) return;
    try {
        const res = await fetch(`/api/delete-shop/${shopId}`, {
            method: 'DELETE',
            headers: { 'x-user-role': JSON.parse(sessionStorage.getItem('loggedInUser'))?.role || '' }
        });
        const result = await res.json();
        if (!result.success) throw new Error(result.error || 'Failed to delete shop');
        showNotification('Shop deleted successfully!', 'success');
        await renderBranches();
        await renderClients();
        await renderUsers();
        await renderTransactions();
        await populateAllBranchSelects();
    } catch (error) {
        showNotification('Failed to delete shop: ' + (error.message || 'Unknown error.'), 'error');
    }
}
window.deleteBranch = deleteBranch;
