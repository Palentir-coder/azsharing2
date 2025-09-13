import './style.css';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Global variable to track the current folder ID
let currentFolderId = null; // null means root folder
let breadcrumbPath = [{ id: null, name: 'Mes Fichiers' }]; // [{id: null, name: 'Mes Fichiers'}] for root

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded. Initializing AzSharing...');

    // --- DOM Elements ---
    const authModal = document.getElementById('auth-modal');
    const closeAuthModalButton = authModal ? authModal.querySelector('.close-button') : null; // Renamed for clarity
    const authButton = document.getElementById('auth-button');
    const logoutButton = document.getElementById('logout-button'); // Main navbar logout button
    const profileNavLink = document.getElementById('profile-nav-link');

    const loginTab = document.getElementById('login-tab');
    const signupTab = document.getElementById('signup-tab');
    const loginFormContainer = document.getElementById('login-form-container');
    const signupFormContainer = document.getElementById('signup-form-container');

    const loginForm = document.getElementById('login-form');
    const loginEmailInput = document.getElementById('login-email');
    const loginPasswordInput = document.getElementById('login-password');
    const loginMessage = document.getElementById('login-message');

    const signupForm = document.getElementById('signup-form');
    const signupEmailInput = document.getElementById('signup-email');
    const signupPasswordInput = document.getElementById('signup-password');
    const signupMessage = document.getElementById('signup-message');

    const dashboardSection = document.getElementById('dashboard-section');
    const usernameDisplay = document.getElementById('username-display');
    const heroSection = document.querySelector('.hero-section');
    const testimonialsSection = document.getElementById('testimonials');
    const ctaSection = document.querySelector('.cta-section');

    // File listing elements (only present on dashboard)
    const fileListContainer = document.querySelector('.file-list-container');
    const fileListEmptyState = document.getElementById('file-list-empty');
    const fileListLoadingState = document.getElementById('file-list-loading');
    const fileListErrorState = document.getElementById('file-list-error');
    const filesTableWrapper = document.getElementById('files-table-wrapper');
    const filesTableBody = document.getElementById('files-table-body');
    const retryFilesButton = document.getElementById('retry-files-button');
    const uploadFirstFileButton = document.getElementById('upload-first-file-button');

    // File upload elements (only present on dashboard)
    const uploadFileButton = document.getElementById('upload-file-button');
    const fileUploadInput = document.getElementById('file-upload-input');
    const uploadMessage = document.getElementById('upload-message');

    // Folder creation elements
    const createFolderButton = document.getElementById('create-folder-button');
    const createFolderModal = document.getElementById('create-folder-modal');
    const closeCreateFolderModalButton = createFolderModal ? createFolderModal.querySelector('.close-button') : null;
    const createFolderForm = document.getElementById('create-folder-form');
    const folderNameInput = document.getElementById('folder-name');
    const createFolderMessage = document.getElementById('create-folder-message');
    const breadcrumbsDiv = document.getElementById('breadcrumbs');

    // Profile page elements (only present on profile.html)
    const profileForm = document.getElementById('profile-form');
    const profileUsernameInput = document.getElementById('profile-username');
    const profileCurrentEmailDisplay = document.getElementById('profile-current-email');
    const profileAddressInput = document.getElementById('profile-address');
    const profileMessage = document.getElementById('profile-message');

    // New DOM elements for email change
    const profileEmailForm = document.getElementById('profile-email-form');
    const profileNewEmailInput = document.getElementById('profile-new-email');
    const profileEmailCurrentPasswordInput = document.getElementById('profile-email-current-password');
    const profileEmailMessage = document.getElementById('profile-email-message');

    // New DOM elements for password change
    const profilePasswordForm = document.getElementById('profile-password-form');
    const profilePasswordCurrentPasswordInput = document.getElementById('profile-password-current-password');
    const profileNewPasswordInput = document.getElementById('profile-new-password');
    const profileConfirmNewPasswordInput = document.getElementById('profile-confirm-new-password');
    const profilePasswordMessage = document.getElementById('profile-password-message');

    // Contact form elements (only present on contact.html)
    const contactForm = document.getElementById('contact-form');
    const contactFormMessage = document.getElementById('contact-form-message');

    // New DOM elements for Rename Item Modal
    const renameItemModal = document.getElementById('rename-item-modal');
    const closeRenameItemModalButton = renameItemModal ? renameItemModal.querySelector('.close-button') : null;
    const renameItemForm = document.getElementById('rename-item-form');
    const renameItemNameInput = document.getElementById('rename-item-name');
    const renameItemMessage = document.getElementById('rename-item-message');
    const renameItemTypeDisplay = document.getElementById('rename-item-type');

    // New DOM elements for Move Item Modal
    const moveItemModal = document.getElementById('move-item-modal');
    const closeMoveItemModalButton = moveItemModal ? moveItemModal.querySelector('.close-button') : null;
    const moveItemForm = document.getElementById('move-item-form');
    const moveTargetFolderSelect = document.getElementById('move-target-folder');
    const moveItemMessage = document.getElementById('move-item-message');
    const moveItemTypeDisplay = document.getElementById('move-item-type');


    // Add console logs for debugging element selection
    console.log('Auth Modal Element:', authModal);
    console.log('Close Auth Modal Button Element:', closeAuthModalButton);
    console.log('Auth Button Element:', authButton);
    console.log('Logout Button Element (main navbar):', logoutButton);
    console.log('Profile Nav Link Element:', profileNavLink);
    console.log('Login Message Element:', loginMessage);
    console.log('Signup Message Element:', signupMessage);
    console.log('Upload Message Element:', uploadMessage);
    console.log('Create Folder Button Element:', createFolderButton);
    console.log('Create Folder Modal Element:', createFolderModal);
    console.log('Close Create Folder Modal Button Element:', closeCreateFolderModalButton);
    console.log('Create Folder Form Element:', createFolderForm);
    console.log('Folder Name Input Element:', folderNameInput);
    console.log('Create Folder Message Element:', createFolderMessage);
    console.log('Breadcrumbs Div Element:', breadcrumbsDiv);
    console.log('Profile Form Element:', profileForm);
    console.log('Contact Form Element:', contactForm);
    console.log('Profile Email Form Element:', profileEmailForm);
    console.log('Profile Password Form Element:', profilePasswordForm);
    console.log('Rename Item Modal Element:', renameItemModal);
    console.log('Move Item Modal Element:', moveItemModal);


    if (!authButton) {
        console.error('CRITICAL ERROR: Auth button element (#auth-button) not found!');
    }
    if (!closeAuthModalButton && authModal) {
        console.warn('WARNING: Close button element (.close-button inside #auth-modal) not found!');
    }

    // --- Utility Functions ---
    function showMessage(element, message, isError = false) {
        if (element) {
            element.textContent = message;
            element.className = `message ${isError ? 'error' : 'success'}`; // Use generic 'message' class
            console.log(`Message displayed on ${element.id}: "${message}" (Error: ${isError})`);
        } else {
            console.warn('Attempted to show message on a null element:', message);
        }
    }

    function clearMessages() {
        if (loginMessage) { loginMessage.textContent = ''; loginMessage.className = 'message'; }
        if (signupMessage) { signupMessage.textContent = ''; signupMessage.className = 'message'; }
        if (uploadMessage) { uploadMessage.textContent = ''; uploadMessage.className = 'message'; }
        if (profileMessage) { profileMessage.textContent = ''; profileMessage.className = 'message'; }
        if (profileEmailMessage) { profileEmailMessage.textContent = ''; profileEmailMessage.className = 'message'; }
        if (profilePasswordMessage) { profilePasswordMessage.textContent = ''; profilePasswordMessage.className = 'message'; }
        if (contactFormMessage) { contactFormMessage.textContent = ''; contactFormMessage.className = 'message'; }
        if (createFolderMessage) { createFolderMessage.textContent = ''; createFolderMessage.className = 'message'; } // Clear folder message
        if (renameItemMessage) { renameItemMessage.textContent = ''; renameItemMessage.className = 'message'; } // Clear rename message
        if (moveItemMessage) { moveItemMessage.textContent = ''; moveItemMessage.className = 'message'; } // Clear move message
        console.log('All messages cleared.');
    }

    function showModal(modalElement) {
        if (modalElement) {
            modalElement.classList.add('visible');
            document.body.style.overflow = 'hidden';
            clearMessages();
            console.log(`${modalElement.id} visibility set to visible.`);
        } else {
            console.error(`showModal: ${modalElement ? modalElement.id : 'null'} is null!`);
        }
    }

    function hideModal(modalElement) {
        if (modalElement) {
            modalElement.classList.remove('visible');
            document.body.style.overflow = '';
            console.log(`${modalElement.id} visibility set to hidden.`);
        } else {
            console.error(`hideModal: ${modalElement ? modalElement.id : 'null'} is null!`);
        }
    }

    function showLoginForm() {
        console.log('showLoginForm called.');
        if (loginTab && signupTab && loginFormContainer && signupFormContainer) {
            loginTab.classList.add('active');
            signupTab.classList.remove('active');
            loginFormContainer.classList.remove('hidden');
            signupFormContainer.classList.add('hidden');
            clearMessages();
            console.log('Switched to Login form.');
        } else {
            console.error('showLoginForm: One or more tab/form container elements are null!');
        }
    }

    function showSignupForm() {
        console.log('showSignupForm called.');
        if (signupTab && loginTab && signupFormContainer && loginFormContainer) {
            signupTab.classList.add('active');
            loginTab.classList.remove('active');
            signupFormContainer.classList.remove('hidden');
            loginFormContainer.classList.add('hidden');
            clearMessages();
            console.log('Switched to Signup form.');
        } else {
            console.error('showSignupForm: One or more tab/form container elements are null!');
        }
    }

    // --- File Listing Functions (only relevant for dashboard) ---
    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    function showFileState(state) {
        if (fileListEmptyState) fileListEmptyState.classList.add('hidden');
        if (fileListLoadingState) fileListLoadingState.classList.add('hidden');
        if (fileListErrorState) fileListErrorState.classList.add('hidden');
        if (filesTableWrapper) filesTableWrapper.classList.add('hidden');

        if (state === 'empty' && fileListEmptyState) {
            fileListEmptyState.classList.remove('hidden');
        } else if (state === 'loading' && fileListLoadingState) {
            fileListLoadingState.classList.remove('hidden');
        } else if (state === 'error' && fileListErrorState) {
            fileListErrorState.classList.remove('hidden');
        } else if (state === 'data' && filesTableWrapper) {
            filesTableWrapper.classList.remove('hidden');
        }
    }

    async function fetchUserFiles(folderId = null) {
        if (!dashboardSection) {
            console.log('Not on dashboard page, skipping file fetch.');
            return;
        }
        console.log(`Fetching user files for folderId: ${folderId}...`);
        showFileState('loading');
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            console.log('No user logged in, cannot fetch files.');
            showFileState('empty');
            return;
        }

        try {
            let query = supabase
                .from('files')
                .select('*')
                .eq('user_id', user.id);

            if (folderId === null) {
                query = query.is('parent_id', null); // Fetch root level items
            } else {
                query = query.eq('parent_id', folderId); // Fetch items within a specific folder
            }

            const { data: files, error } = await query.order('is_folder', { ascending: false }).order('name', { ascending: true }); // Folders first, then by name

            if (error) {
                console.error('Error fetching files:', error.message);
                showFileState('error');
                return;
            }

            console.log('Fetched files and folders:', files);
            renderFiles(files);
            renderBreadcrumbs(); // Update breadcrumbs after fetching files
        } catch (err) {
            console.error('Unexpected error fetching files:', err);
            showFileState('error');
        }
    }

    function renderFiles(items) {
        if (!filesTableBody) {
            console.error('filesTableBody element not found!');
            return;
        }
        filesTableBody.innerHTML = ''; // Clear existing rows

        if (items.length === 0) {
            showFileState('empty');
            return;
        }

        items.forEach(item => {
            const row = filesTableBody.insertRow();
            if (item.is_folder) {
                row.innerHTML = `
                    <td>
                        <div class="folder-name-cell" data-id="${item.id}" data-name="${item.name}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-folder"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h16Z"/></svg>
                            <span>${item.name}</span>
                        </div>
                    </td>
                    <td>—</td>
                    <td>Dossier</td>
                    <td>${new Date(item.created_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                    <td>
                        <div class="file-actions">
                            <button class="btn btn-icon rename-item-btn" data-id="${item.id}" data-name="${item.name}" data-is-folder="true" title="Renommer">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pencil"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="M15 5l4 4"/></svg>
                            </button>
                            <button class="btn btn-icon move-item-btn" data-id="${item.id}" data-name="${item.name}" data-is-folder="true" title="Déplacer">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-folder-open"><path d="M6 14H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2.5L7 4.5 8.5 3H18a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-2"/><path d="M10 10l-2 2l2 2"/><path d="M14 10l2 2l-2 2"/></svg>
                            </button>
                            <button class="btn btn-icon delete-file-btn btn-danger" data-id="${item.id}" data-is-folder="true" title="Supprimer le dossier">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                            </button>
                        </div>
                    </td>
                `;
            } else {
                row.innerHTML = `
                    <td>
                        <div class="file-name-cell">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>
                            <span>${item.name}</span>
                        </div>
                    </td>
                    <td>${formatBytes(item.size || 0)}</td>
                    <td>${item.mime_type || 'Inconnu'}</td>
                    <td>${new Date(item.created_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                    <td>
                        <div class="file-actions">
                            <button class="btn btn-icon download-file-btn" data-path="${item.storage_path}" title="Télécharger">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                            </button>
                            <button class="btn btn-icon share-file-btn" data-id="${item.id}" title="Partager">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-share-2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>
                            </button>
                            <button class="btn btn-icon rename-item-btn" data-id="${item.id}" data-name="${item.name}" data-is-folder="false" title="Renommer">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pencil"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="M15 5l4 4"/></svg>
                            </button>
                            <button class="btn btn-icon move-item-btn" data-id="${item.id}" data-name="${item.name}" data-is-folder="false" title="Déplacer">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-folder-open"><path d="M6 14H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2.5L7 4.5 8.5 3H18a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-2"/><path d="M10 10l-2 2l2 2"/><path d="M14 10l2 2l-2 2"/></svg>
                            </button>
                            <button class="btn btn-icon btn-danger delete-file-btn" data-id="${item.id}" data-path="${item.storage_path}" data-is-folder="false" title="Supprimer le fichier">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                            </button>
                        </div>
                    </td>
                `;
            }
        });
        showFileState('data');
        attachFileActionListeners(); // Attach listeners to new buttons
    }

    function renderBreadcrumbs() {
        if (!breadcrumbsDiv) return;

        breadcrumbsDiv.innerHTML = '';
        breadcrumbPath.forEach((crumb, index) => {
            const crumbElement = document.createElement('span');
            crumbElement.classList.add('breadcrumb-item');

            if (index < breadcrumbPath.length - 1) {
                const link = document.createElement('a');
                link.href = '#';
                link.textContent = crumb.name;
                link.dataset.id = crumb.id;
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    navigateToFolder(crumb.id, index);
                });
                crumbElement.appendChild(link);
                const separator = document.createElement('span');
                separator.classList.add('breadcrumb-separator');
                separator.textContent = ' / ';
                crumbElement.appendChild(separator);
            } else {
                const current = document.createElement('span');
                current.textContent = crumb.name;
                crumbElement.appendChild(current);
            }
            breadcrumbsDiv.appendChild(crumbElement);
        });
    }

    function navigateToFolder(folderId, index) {
        console.log(`Navigating to folder ID: ${folderId}, index: ${index}`);
        currentFolderId = folderId;
        if (index !== undefined) {
            breadcrumbPath = breadcrumbPath.slice(0, index + 1);
        } else {
            // If no index, assume we're adding a new folder to the path
            // This case is handled when a folder is clicked in renderFiles
        }
        fetchUserFiles(currentFolderId);
    }

    // --- Profile Management Functions (only relevant for profile.html) ---
    async function loadUserProfile() {
        if (!profileForm) {
            console.log('Not on profile page, skipping profile load.');
            return;
        }
        console.log('Loading user profile...');
        clearMessages();

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            console.log('No user logged in, redirecting to home.');
            window.location.href = '/';
            return;
        }

        try {
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('username, address')
                .eq('id', user.id)
                .single();

            if (error) {
                console.error('Error fetching profile:', error.message);
                showMessage(profileMessage, `Erreur lors du chargement du profil : ${error.message}`, true);
                return;
            }

            console.log('Profile fetched:', profile);
            if (profileUsernameInput) profileUsernameInput.value = profile.username || '';
            if (profileCurrentEmailDisplay) profileCurrentEmailDisplay.value = user.email || '';
            if (profileAddressInput) profileAddressInput.value = profile.address || '';
            showMessage(profileMessage, 'Profil chargé avec succès.', false);

        } catch (err) {
            console.error('Unexpected error loading profile:', err);
            showMessage(profileMessage, `Une erreur inattendue est survenue : ${err.message}`, true);
        }
    }

    async function updateUserProfile(e) {
        e.preventDefault();
        if (!profileForm) return;

        console.log('Updating user profile...');
        clearMessages();
        showMessage(profileMessage, 'Enregistrement des modifications...', false);

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            showMessage(profileMessage, 'Vous devez être connecté pour modifier votre profil.', true);
            return;
        }

        const username = profileUsernameInput.value;
        const address = profileAddressInput.value;

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ username, address })
                .eq('id', user.id);

            if (error) {
                console.error('Error updating profile:', error.message);
                showMessage(profileMessage, `Erreur lors de la mise à jour : ${error.message}`, true);
                return;
            }

            console.log('Profile updated successfully.');
            showMessage(profileMessage, 'Profil mis à jour avec succès !', false);
            if (usernameDisplay) usernameDisplay.textContent = username;

        } catch (err) {
            console.error('Unexpected error updating profile:', err);
            showMessage(profileMessage, `Une erreur inattendue est survenue : ${err.message}`, true);
        }
    }

    async function handleEmailUpdate(e) {
        e.preventDefault();
        if (!profileEmailForm) return;

        console.log('Attempting to update user email...');
        clearMessages();
        showMessage(profileEmailMessage, 'Mise à jour de l\'e-mail...', false);

        const { data: { user } = {} } = await supabase.auth.getUser(); // Destructure with default empty object
        if (!user) {
            showMessage(profileEmailMessage, 'Vous devez être connecté pour modifier votre e-mail.', true);
            return;
        }

        const newEmail = profileNewEmailInput.value;
        const currentPassword = profileEmailCurrentPasswordInput.value;

        if (!newEmail || !currentPassword) {
            showMessage(profileEmailMessage, 'Veuillez remplir tous les champs.', true);
            return;
        }

        if (newEmail === user.email) {
            showMessage(profileEmailMessage, 'La nouvelle adresse e-mail est identique à l\'actuelle.', true);
            return;
        }

        try {
            const { error: reauthError } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: currentPassword,
            });

            if (reauthError) {
                console.error('Re-authentication failed for email update:', reauthError.message);
                showMessage(profileEmailMessage, `Mot de passe actuel incorrect. ${reauthError.message}`, true);
                return;
            }
            console.log('Re-authentication successful for email update.');

            const { data, error: updateError } = await supabase.auth.updateUser({ email: newEmail });

            if (updateError) {
                console.error('Error updating email:', updateError.message);
                showMessage(profileEmailMessage, `Erreur lors de la mise à jour de l'e-mail : ${updateError.message}`, true);
                return;
            }

            console.log('Email updated successfully:', data);
            showMessage(profileEmailMessage, 'Votre adresse e-mail a été mise à jour avec succès !', false);
            if (profileCurrentEmailDisplay) profileCurrentEmailDisplay.value = newEmail;
            profileNewEmailInput.value = '';
            profileEmailCurrentPasswordInput.value = '';

        } catch (err) {
            console.error('Unexpected error during email update:', err);
            showMessage(profileEmailMessage, `Une erreur inattendue est survenue : ${err.message}`, true);
        }
    }

    async function handlePasswordUpdate(e) {
        e.preventDefault();
        if (!profilePasswordForm) return;

        console.log('Attempting to update user password...');
        clearMessages();
        showMessage(profilePasswordMessage, 'Changement du mot de passe...', false);

        const { data: { user } = {} } = await supabase.auth.getUser(); // Destructure with default empty object
        if (!user) {
            showMessage(profilePasswordMessage, 'Vous devez être connecté pour modifier votre mot de passe.', true);
            return;
        }

        const currentPassword = profilePasswordCurrentPasswordInput.value;
        const newPassword = profileNewPasswordInput.value;
        const confirmNewPassword = profileConfirmNewPasswordInput.value;

        if (!currentPassword || !newPassword || !confirmNewPassword) {
            showMessage(profilePasswordMessage, 'Veuillez remplir tous les champs.', true);
            return;
        }

        if (newPassword.length < 6) {
            showMessage(profilePasswordMessage, 'Le nouveau mot de passe doit contenir au moins 6 caractères.', true);
            return;
        }

        if (newPassword !== confirmNewPassword) {
            showMessage(profilePasswordMessage, 'Les nouveaux mots de passe ne correspondent pas.', true);
            return;
        }

        if (newPassword === currentPassword) {
            showMessage(profilePasswordMessage, 'Le nouveau mot de passe ne peut pas être identique à l\'actuel.', true);
            return;
        }

        try {
            const { error: reauthError } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: currentPassword,
            });

            if (reauthError) {
                console.error('Re-authentication failed for password update:', reauthError.message);
                showMessage(profilePasswordMessage, `Mot de passe actuel incorrect. ${reauthError.message}`, true);
                return;
            }
            console.log('Re-authentication successful for password update.');

            const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });

            if (updateError) {
                console.error('Error updating password:', updateError.message);
                showMessage(profilePasswordMessage, `Erreur lors de la mise à jour du mot de passe : ${updateError.message}`, true);
                return;
            }

            console.log('Password updated successfully.');
            showMessage(profilePasswordMessage, 'Votre mot de passe a été mis à jour avec succès !', false);
            profilePasswordCurrentPasswordInput.value = '';
            profileNewPasswordInput.value = '';
            profileConfirmNewPasswordInput.value = '';

        } catch (err) {
            console.error('Unexpected error during password update:', err);
            showMessage(profilePasswordMessage, `Une erreur inattendue est survenue : ${err.message}`, true);
        }
    }

    async function updateUIForAuth(session) {
        console.log('updateUIForAuth called with session:', session);
        if (session) {
            if (authButton) authButton.classList.add('hidden');
            if (logoutButton) logoutButton.classList.remove('hidden');
            if (profileNavLink) profileNavLink.classList.remove('hidden');

            if (dashboardSection) dashboardSection.classList.remove('hidden');
            if (heroSection) heroSection.classList.add('hidden');
            if (testimonialsSection) testimonialsSection.classList.add('hidden');
            if (ctaSection) ctaSection.classList.add('hidden');

            const { data: profile, error } = await supabase
                .from('profiles')
                .select('username')
                .eq('id', session.user.id)
                .single();

            if (error) {
                console.error('Error fetching profile for UI update:', error.message);
                if (usernameDisplay) usernameDisplay.textContent = session.user.email;
            } else {
                console.log('Profile fetched for UI update:', profile);
                if (usernameDisplay) usernameDisplay.textContent = profile.username || session.user.email;
            }

            hideModal(authModal); // Use generic hideModal
            fetchUserFiles(currentFolderId);
            loadUserProfile();
        } else {
            if (authButton) authButton.classList.remove('hidden');
            if (logoutButton) logoutButton.classList.add('hidden');
            if (profileNavLink) profileNavLink.classList.add('hidden');

            if (dashboardSection) dashboardSection.classList.add('hidden');
            if (heroSection) heroSection.classList.remove('hidden');
            if (testimonialsSection) testimonialsSection.classList.remove('hidden');
            if (ctaSection) ctaSection.classList.remove('hidden');
            console.log('UI updated for logged out state.');

            if (window.location.pathname === '/profile.html') {
                window.location.href = '/';
            }
        }
    }

    // --- File Upload Logic (only relevant for dashboard) ---
    async function uploadFile(file) {
        if (!uploadMessage) return;

        clearMessages();
        showMessage(uploadMessage, `Téléversement de "${file.name}"...`, false);

        const { data: { user } = {} } = await supabase.auth.getUser(); // Destructure with default empty object
        if (!user) {
            showMessage(uploadMessage, 'Vous devez être connecté pour téléverser des fichiers.', true);
            return;
        }

        const fileExtension = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;
        const filePath = `${user.id}/${fileName}`;

        try {
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('files')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) {
                console.error('Error uploading file to storage:', uploadError.message);
                showMessage(uploadMessage, `Erreur lors du téléversement : ${uploadError.message}`, true);
                return;
            }

            console.log('File uploaded to storage:', uploadData);

            const { data: insertData, error: insertError } = await supabase
                .from('files')
                .insert([
                    {
                        user_id: user.id,
                        name: file.name,
                        storage_path: uploadData.path,
                        mime_type: file.type,
                        size: file.size,
                        is_folder: false,
                        parent_id: currentFolderId // Associate with current folder
                    }
                ]);

            if (insertError) {
                console.error('Error inserting file metadata:', insertError.message);
                showMessage(uploadMessage, `Erreur lors de l'enregistrement des métadonnées : ${insertError.message}`, true);
                return;
            }

            console.log('File metadata inserted:', insertData);
            showMessage(uploadMessage, `"${file.name}" téléversé avec succès !`, false);
            fetchUserFiles(currentFolderId);
        } catch (err) {
            console.error('Unexpected error during file upload:', err);
            showMessage(uploadMessage, `Une erreur inattendue est survenue : ${err.message}`, true);
        }
    }

    // --- Folder Creation Logic ---
    async function createFolder(e) {
        e.preventDefault();
        if (!createFolderForm) return;

        clearMessages();
        showMessage(createFolderMessage, 'Création du dossier...', false);

        const { data: { user } = {} } = await supabase.auth.getUser(); // Destructure with default empty object
        if (!user) {
            showMessage(createFolderMessage, 'Vous devez être connecté pour créer un dossier.', true);
            return;
        }

        const folderName = folderNameInput.value.trim();
        if (!folderName) {
            showMessage(createFolderMessage, 'Le nom du dossier ne peut pas être vide.', true);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('files')
                .insert([
                    {
                        user_id: user.id,
                        name: folderName,
                        is_folder: true,
                        parent_id: currentFolderId, // Parent is the current folder
                        mime_type: 'folder', // Explicitly set for folders
                        size: 0 // Folders have 0 size
                    }
                ]);

            if (error) {
                console.error('Error creating folder:', error.message);
                showMessage(createFolderMessage, `Erreur lors de la création du dossier : ${error.message}`, true);
                return;
            }

            console.log('Folder created successfully:', data);
            showMessage(createFolderMessage, `Dossier "${folderName}" créé avec succès !`, false);
            folderNameInput.value = ''; // Clear input
            hideModal(createFolderModal);
            fetchUserFiles(currentFolderId); // Refresh file list
        } catch (err) {
            console.error('Unexpected error during folder creation:', err);
            showMessage(createFolderMessage, `Une erreur inattendue est survenue : ${err.message}`, true);
        }
    }

    // --- Rename Item Logic ---
    let currentRenameItemId = null;
    let currentRenameItemIsFolder = false;

    function showRenameModal(currentName, isFolder) {
        if (renameItemModal && renameItemNameInput && renameItemTypeDisplay) {
            renameItemNameInput.value = currentName;
            renameItemTypeDisplay.textContent = isFolder ? 'le dossier' : 'le fichier';
            showModal(renameItemModal);
            renameItemNameInput.focus();
        } else {
            console.error('showRenameModal: One or more rename modal elements are null!');
        }
    }

    async function handleRename(e) {
        e.preventDefault();
        if (!renameItemForm || !currentRenameItemId) return;

        clearMessages();
        showMessage(renameItemMessage, `Renommage du ${currentRenameItemIsFolder ? 'dossier' : 'fichier'}...`, false);

        const { data: { user } = {} } = await supabase.auth.getUser(); // Destructure with default empty object
        if (!user) {
            showMessage(renameItemMessage, 'Vous devez être connecté pour renommer des éléments.', true);
            return;
        }

        const newName = renameItemNameInput.value.trim();
        if (!newName) {
            showMessage(renameItemMessage, 'Le nouveau nom ne peut pas être vide.', true);
            return;
        }

        try {
            const { error } = await supabase
                .from('files')
                .update({ name: newName })
                .eq('id', currentRenameItemId)
                .eq('user_id', user.id); // Ensure user owns the item

            if (error) {
                console.error('Error renaming item:', error.message);
                showMessage(renameItemMessage, `Erreur lors du renommage : ${error.message}`, true);
                return;
            }

            console.log('Item renamed successfully.');
            showMessage(renameItemMessage, `${currentRenameItemIsFolder ? 'Dossier' : 'Fichier'} renommé avec succès !`, false);
            hideModal(renameItemModal);
            fetchUserFiles(currentFolderId); // Refresh file list
        } catch (err) {
            console.error('Unexpected error during rename:', err);
            showMessage(renameItemMessage, `Une erreur inattendue est survenue : ${err.message}`, true);
        }
    }

    // --- Move Item Logic ---
    let currentMoveItemId = null;
    let currentMoveItemIsFolder = false;

    async function fetchFoldersForMove(itemId, isFolder) {
        const { data: { user } = {} } = await supabase.auth.getUser(); // Destructure with default empty object
        if (!user) return [];

        const { data: allFolders, error } = await supabase
            .from('files')
            .select('id, name, parent_id')
            .eq('user_id', user.id)
            .eq('is_folder', true)
            .order('name', { ascending: true });

        if (error) {
            console.error('Error fetching folders for move:', error.message);
            return [];
        }

        let excludedFolderIds = new Set();
        excludedFolderIds.add(itemId); // Cannot move an item into itself

        if (isFolder) {
            // If moving a folder, also exclude its descendants
            const findDescendants = (folderId) => {
                const children = allFolders.filter(f => f.parent_id === folderId);
                children.forEach(child => {
                    excludedFolderIds.add(child.id);
                    findDescendants(child.id);
                });
            };
            findDescendants(itemId);
        }

        let availableFolders = [{ id: null, name: 'Racine (Mes Fichiers)' }]; // Option to move to root

        allFolders.forEach(folder => {
            // Exclude the item's current parent folder (if it's not the root)
            // and exclude the item itself and its descendants (if it's a folder)
            // and exclude the current folder we are viewing (as we can't move an item into the folder it's already in)
            if (!excludedFolderIds.has(folder.id) && folder.id !== currentFolderId) {
                availableFolders.push(folder);
            }
        });

        return availableFolders;
    }

    async function showMoveModal(itemName, isFolder) {
        if (moveItemModal && moveTargetFolderSelect && moveItemTypeDisplay) {
            moveItemTypeDisplay.textContent = isFolder ? 'le dossier' : 'le fichier';
            moveTargetFolderSelect.innerHTML = '<option value="">Chargement des dossiers...</option>';
            showMessage(moveItemMessage, '', false); // Clear previous messages

            showModal(moveItemModal);

            const folders = await fetchFoldersForMove(currentMoveItemId, isFolder);
            moveTargetFolderSelect.innerHTML = ''; // Clear loading message

            if (folders.length === 0) {
                moveTargetFolderSelect.innerHTML = '<option value="">Aucun dossier disponible</option>';
                moveTargetFolderSelect.disabled = true;
                showMessage(moveItemMessage, 'Aucun dossier de destination disponible.', true);
            } else {
                moveTargetFolderSelect.disabled = false;
                folders.forEach(folder => {
                    const option = document.createElement('option');
                    option.value = folder.id || ''; // Use empty string for null (root)
                    option.textContent = folder.name;
                    moveTargetFolderSelect.appendChild(option);
                });
                // Pre-select current folder's parent if available, or root
                const currentParentId = breadcrumbPath.length > 1 ? breadcrumbPath[breadcrumbPath.length - 2].id : null;
                moveTargetFolderSelect.value = currentParentId || '';
            }
        } else {
            console.error('showMoveModal: One or more move modal elements are null!');
        }
    }

    async function handleMove(e) {
        e.preventDefault();
        if (!moveItemForm || !currentMoveItemId) return;

        clearMessages();
        showMessage(moveItemMessage, `Déplacement du ${currentMoveItemIsFolder ? 'dossier' : 'fichier'}...`, false);

        const { data: { user } = {} } = await supabase.auth.getUser(); // Destructure with default empty object
        if (!user) {
            showMessage(moveItemMessage, 'Vous devez être connecté pour déplacer des éléments.', true);
            return;
        }

        const targetFolderId = moveTargetFolderSelect.value === '' ? null : moveTargetFolderSelect.value;

        // Get the current parent_id of the item being moved
        const { data: currentItem, error: fetchError } = await supabase
            .from('files')
            .select('parent_id')
            .eq('id', currentMoveItemId)
            .single();

        if (fetchError) {
            console.error('Error fetching current item parent_id:', fetchError.message);
            showMessage(moveItemMessage, `Erreur lors de la vérification de l'emplacement actuel : ${fetchError.message}`, true);
            return;
        }

        // Check if the item is already in the target folder
        if (currentItem && currentItem.parent_id === targetFolderId) {
            showMessage(moveItemMessage, 'L\'élément est déjà dans ce dossier.', true);
            return;
        }

        try {
            const { error } = await supabase
                .from('files')
                .update({ parent_id: targetFolderId })
                .eq('id', currentMoveItemId)
                .eq('user_id', user.id); // Ensure user owns the item

            if (error) {
                console.error('Error moving item:', error.message);
                showMessage(moveItemMessage, `Erreur lors du déplacement : ${error.message}`, true);
                return;
            }

            console.log('Item moved successfully.');
            showMessage(moveItemMessage, `${currentMoveItemIsFolder ? 'Dossier' : 'Fichier'} déplacé avec succès !`, false);
            hideModal(moveItemModal);
            fetchUserFiles(currentFolderId); // Refresh file list
        } catch (err) {
            console.error('Unexpected error during move:', err);
            showMessage(moveItemMessage, `Une erreur inattendue est survenue : ${err.message}`, true);
        }
    }


    // --- File Actions (Download, Share, Delete) (only relevant for dashboard) ---
    async function downloadFile(filePath, fileName) {
        if (!uploadMessage) return;

        console.log('Attempting to download file:', filePath);
        clearMessages();
        showMessage(uploadMessage, `Préparation du téléchargement de "${fileName}"...`, false);

        try {
            const { data, error } = await supabase.storage
                .from('files')
                .download(filePath);

            console.log('Supabase download response - data:', data, 'error:', error);

            if (error) {
                console.error('Error downloading file:', error.message);
                showMessage(uploadMessage, `Erreur lors du téléchargement : ${error.message}`, true);
                return;
            }

            if (!data) {
                console.error('Download failed: No data received from Supabase, but no explicit error.', { filePath, fileName });
                showMessage(uploadMessage, 'Erreur lors du téléchargement : Le fichier n\'a pas pu être récupéré. Vérifiez les permissions ou si le fichier existe.', true);
                return;
            }

            const url = URL.createObjectURL(data);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                clearMessages();
            }, 100);
            console.log('File download initiated for:', fileName);
            showMessage(uploadMessage, `Téléchargement de "${fileName}" initié.`, false);

        } catch (err) {
            console.error('Unexpected error during file download:', err);
            showMessage(uploadMessage, `Une erreur inattendue est survenue lors du téléchargement : ${err.message}`, true);
        }
    }

    async function deleteFile(fileId, storagePath, isFolder) {
        if (!uploadMessage) return;

        if (!confirm(`Êtes-vous sûr de vouloir supprimer ce ${isFolder ? 'dossier' : 'fichier'} ? Cette action est irréversible.`)) {
            return;
        }
        clearMessages();
        showMessage(uploadMessage, `Suppression du ${isFolder ? 'dossier' : 'fichier'}...`, false);

        try {
            if (isFolder) {
                // Check if folder is empty before deleting
                const { data: children, error: childrenError } = await supabase
                    .from('files')
                    .select('id')
                    .eq('parent_id', fileId);

                if (childrenError) {
                    console.error('Error checking folder contents:', childrenError.message);
                    showMessage(uploadMessage, `Erreur lors de la vérification du dossier : ${childrenError.message}`, true);
                    return;
                }

                if (children && children.length > 0) {
                    showMessage(uploadMessage, 'Le dossier n\'est pas vide. Veuillez supprimer tous les éléments qu\'il contient avant de le supprimer.', true);
                    return;
                }

                // Delete folder metadata
                const { error: dbError } = await supabase
                    .from('files')
                    .delete()
                    .eq('id', fileId);

                if (dbError) {
                    console.error('Error deleting folder metadata from database:', dbError.message);
                    showMessage(uploadMessage, `Erreur lors de la suppression des métadonnées du dossier : ${dbError.message}`, true);
                    return;
                }
                console.log('Folder metadata deleted from database:', fileId);

            } else {
                // 1. Delete from Supabase Storage
                const { error: storageError } = await supabase.storage
                    .from('files')
                    .remove([storagePath]);

                if (storageError) {
                    console.error('Error deleting file from storage:', storageError.message);
                    showMessage(uploadMessage, `Erreur lors de la suppression du fichier du stockage : ${storageError.message}`, true);
                    return;
                }
                console.log('File deleted from storage:', storagePath);

                // 2. Delete metadata from 'files' table
                const { error: dbError } = await supabase
                    .from('files')
                    .delete()
                    .eq('id', fileId);

                if (dbError) {
                    console.error('Error deleting file metadata from database:', dbError.message);
                    showMessage(uploadMessage, `Erreur lors de la suppression des métadonnées du fichier : ${dbError.message}`, true);
                    return;
                }
                console.log('File metadata deleted from database:', fileId);
            }

            showMessage(uploadMessage, `${isFolder ? 'Dossier' : 'Fichier'} supprimé avec succès !`, false);
            fetchUserFiles(currentFolderId);
        } catch (err) {
            console.error('Unexpected error during deletion:', err);
            showMessage(uploadMessage, `Une erreur inattendue est survenue lors de la suppression : ${err.message}`, true);
        }
    }

    function attachFileActionListeners() {
        if (!filesTableBody) return;

        // Download buttons
        document.querySelectorAll('.download-file-btn').forEach(button => {
            button.onclick = null;
            button.addEventListener('click', (e) => {
                const filePath = e.currentTarget.dataset.path;
                const fileName = e.currentTarget.closest('tr').querySelector('.file-name-cell span').textContent;
                downloadFile(filePath, fileName);
            });
        });

        // Delete buttons
        document.querySelectorAll('.delete-file-btn').forEach(button => {
            button.onclick = null;
            button.addEventListener('click', (e) => {
                const fileId = e.currentTarget.dataset.id;
                const storagePath = e.currentTarget.dataset.path; // Will be undefined for folders, which is fine
                const isFolder = e.currentTarget.dataset.isFolder === 'true';
                deleteFile(fileId, storagePath, isFolder);
            });
        });

        // Share buttons (placeholder for now)
        document.querySelectorAll('.share-file-btn').forEach(button => {
            button.onclick = null;
            button.addEventListener('click', (e) => {
                const fileId = e.currentTarget.dataset.id;
                alert(`Fonctionnalité de partage pour le fichier ${fileId} à implémenter.`);
            });
        });

        // Rename buttons
        document.querySelectorAll('.rename-item-btn').forEach(button => {
            button.onclick = null;
            button.addEventListener('click', (e) => {
                currentRenameItemId = e.currentTarget.dataset.id;
                currentRenameItemIsFolder = e.currentTarget.dataset.isFolder === 'true';
                const currentName = e.currentTarget.dataset.name;
                showRenameModal(currentName, currentRenameItemIsFolder);
            });
        });

        // Move buttons
        document.querySelectorAll('.move-item-btn').forEach(button => {
            button.onclick = null;
            button.addEventListener('click', async (e) => {
                currentMoveItemId = e.currentTarget.dataset.id;
                currentMoveItemIsFolder = e.currentTarget.dataset.isFolder === 'true';
                const itemName = e.currentTarget.dataset.name;
                await showMoveModal(itemName, currentMoveItemIsFolder);
            });
        });

        // Folder click to navigate
        document.querySelectorAll('.folder-name-cell').forEach(folderCell => {
            folderCell.onclick = null;
            folderCell.addEventListener('click', (e) => {
                const folderId = e.currentTarget.dataset.id;
                const folderName = e.currentTarget.dataset.name;
                breadcrumbPath.push({ id: folderId, name: folderName });
                navigateToFolder(folderId);
            });
        });
    }


    // --- Event Listeners ---
    if (authButton) {
        authButton.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Auth button clicked!');
            showModal(authModal); // Use generic showModal
        });
    }

    if (closeAuthModalButton) {
        closeAuthModalButton.addEventListener('click', () => {
            console.log('Close auth modal button clicked!');
            hideModal(authModal); // Use generic hideModal
        });
    } else if (authModal) {
        authModal.addEventListener('click', (e) => {
            if (e.target === authModal) {
                console.log('Clicked outside auth modal content, hiding modal.');
                hideModal(authModal);
            }
        });
    }

    if (loginTab) loginTab.addEventListener('click', showLoginForm);
    if (signupTab) signupTab.addEventListener('click', showSignupForm);

    // Login Form Submission
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('Login form submitted.');
            clearMessages();
            const email = loginEmailInput.value;
            const password = loginPasswordInput.value;
            console.log('Attempting login with:', { email, password: '***' });

            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) {
                console.error('Login error:', error.message, error);
                showMessage(loginMessage, error.message, true);
            } else {
                console.log('Login successful. Data:', data);
                showMessage(loginMessage, 'Connexion réussie ! Redirection...', false);
                updateUIForAuth(data.session);
            }
        });
    }

    // Signup Form Submission
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('Signup form submitted.');
            clearMessages();
            const email = signupEmailInput.value;
            const password = signupPasswordInput.value;
            console.log('Attempting signup with:', { email, password: '***' });

            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        username: email.split('@')[0]
                    }
                }
            });

            if (error) {
                console.error('Signup error:', error.message, error);
                showMessage(signupMessage, error.message, true);
            } else {
                console.log('Signup successful. Data:', data);
                if (data.session) {
                    showMessage(signupMessage, 'Inscription réussie et connexion automatique !', false);
                    updateUIForAuth(data.session);
                } else if (data.user) {
                    showMessage(signupMessage, 'Inscription réussie ! Veuillez vous connecter.', false);
                    showLoginForm();
                    if (loginEmailInput) loginEmailInput.value = email;
                    if (signupEmailInput) signupEmailInput.value = '';
                    if (signupPasswordInput) signupPasswordInput.value = '';
                } else {
                    showMessage(signupMessage, 'Inscription réussie, mais état inattendu. Veuillez vous connecter.', false);
                    showLoginForm();
                    if (loginEmailInput) loginEmailInput.value = email;
                }
            }
        });
    }

    // Logout Button (main navbar)
    if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
            console.log('Main Navbar Logout button clicked.');
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error('Error during logout:', error.message, error);
            } else {
                console.log('User logged out successfully from main navbar.');
                updateUIForAuth(null);
            }
        });
    }

    // Retry files button (only relevant for dashboard)
    if (retryFilesButton) {
        retryFilesButton.addEventListener('click', () => fetchUserFiles(currentFolderId));
    }

    // Upload file button click handler (only relevant for dashboard)
    if (uploadFileButton) {
        uploadFileButton.addEventListener('click', () => {
            fileUploadInput.click();
        });
    }

    // Upload first file button in empty state (only relevant for dashboard)
    if (uploadFirstFileButton) {
        uploadFirstFileButton.addEventListener('click', () => {
            fileUploadInput.click();
        });
    }

    // Handle file selection (only relevant for dashboard)
    if (fileUploadInput) {
        fileUploadInput.addEventListener('change', async (event) => {
            const files = event.target.files;
            if (files.length > 0) {
                for (const file of files) {
                    await uploadFile(file);
                }
                fileUploadInput.value = '';
            }
        });
    }

    // Create Folder Button
    if (createFolderButton) {
        createFolderButton.addEventListener('click', () => {
            console.log('Create folder button clicked!');
            showModal(createFolderModal);
            if (folderNameInput) folderNameInput.focus();
        });
    }

    // Close Create Folder Modal Button
    if (closeCreateFolderModalButton) {
        closeCreateFolderModalButton.addEventListener('click', () => {
            console.log('Close create folder modal button clicked!');
            hideModal(createFolderModal);
        });
    } else if (createFolderModal) {
        createFolderModal.addEventListener('click', (e) => {
            if (e.target === createFolderModal) {
                console.log('Clicked outside create folder modal content, hiding modal.');
                hideModal(createFolderModal);
            }
        });
    }

    // Create Folder Form Submission
    if (createFolderForm) {
        createFolderForm.addEventListener('submit', createFolder);
    }

    // Rename Item Modal Event Listeners
    if (closeRenameItemModalButton) {
        closeRenameItemModalButton.addEventListener('click', () => {
            hideModal(renameItemModal);
        });
    } else if (renameItemModal) {
        renameItemModal.addEventListener('click', (e) => {
            if (e.target === renameItemModal) {
                hideModal(renameItemModal);
            }
        });
    }
    if (renameItemForm) {
        renameItemForm.addEventListener('submit', handleRename);
    }

    // Move Item Modal Event Listeners
    if (closeMoveItemModalButton) {
        closeMoveItemModalButton.addEventListener('click', () => {
            hideModal(moveItemModal);
        });
    } else if (moveItemModal) {
        moveItemModal.addEventListener('click', (e) => {
            if (e.target === moveItemModal) {
                hideModal(moveItemModal);
            }
        });
    }
    if (moveItemForm) {
        moveItemForm.addEventListener('submit', handleMove);
    }


    // Profile Form Submission (only relevant for profile.html)
    if (profileForm) {
        profileForm.addEventListener('submit', updateUserProfile);
    }

    // Email Update Form Submission (only relevant for profile.html)
    if (profileEmailForm) {
        profileEmailForm.addEventListener('submit', handleEmailUpdate);
    }

    // Password Update Form Submission (only relevant for profile.html)
    if (profilePasswordForm) {
        profilePasswordForm.addEventListener('submit', handlePasswordUpdate);
    }

    // Contact Form Submission (only relevant for contact.html)
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('Contact form submitted.');
            clearMessages();
            showMessage(contactFormMessage, 'Envoi de votre message...', false);

            const name = document.getElementById('contact-name').value;
            const email = document.getElementById('contact-email').value;
            const subject = document.getElementById('contact-subject').value;
            const message = document.getElementById('contact-message').value;

            console.log('Contact form data:', { name, email, subject, message });

            await new Promise(resolve => setTimeout(resolve, 1500));

            showMessage(contactFormMessage, 'Votre message a été envoyé avec succès ! Nous vous répondrons bientôt.', false);
            contactForm.reset();
        });
    }


    // --- Session Management ---
    supabase.auth.getSession().then(({ data: { session } }) => {
        console.log('Initial session check:', session);
        updateUIForAuth(session);
    }).catch(err => {
        console.error('Error during initial session check:', err);
    });

    supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event, session);
        updateUIForAuth(session);
    });

    // Scroll Reveal Animation (existing logic)
    const revealElements = document.querySelectorAll('.reveal');
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    revealElements.forEach(el => {
        observer.observe(el);
    });

    // Smooth scrolling for navigation links (existing logic)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            } else {
                window.location.href = `/${targetId}`;
            }
        });
    });
});
