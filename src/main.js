import './style.css';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded. Initializing AzSharing...');

    // --- DOM Elements ---
    const authModal = document.getElementById('auth-modal');
    if (!authModal) {
        console.error('CRITICAL ERROR: Auth modal element (#auth-modal) not found!');
        // return; // Do not stop script execution, as other pages might not need the modal
    }
    const closeButton = authModal ? authModal.querySelector('.close-button') : null;
    const authButton = document.getElementById('auth-button');
    const logoutButton = document.getElementById('logout-button'); // Main navbar logout button

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
    const dashboardLogoutButton = document.getElementById('dashboard-logout-button'); // New dashboard logout button

    // File listing elements (only present on dashboard)
    const fileListContainer = document.querySelector('.file-list-container');
    const fileListEmptyState = document.getElementById('file-list-empty');
    const fileListLoadingState = document.getElementById('file-list-loading');
    const fileListErrorState = document.getElementById('file-list-error');
    const filesTableWrapper = document.getElementById('files-table-wrapper');
    const filesTableBody = document.getElementById('files-table-body');
    const retryFilesButton = document.getElementById('retry-files-button');
    const uploadFirstFileButton = document.getElementById('upload-first-file-button'); // New

    // File upload elements (only present on dashboard)
    const uploadFileButton = document.getElementById('upload-file-button');
    const fileUploadInput = document.getElementById('file-upload-input');
    const uploadMessage = document.getElementById('upload-message');

    // Add console logs for debugging element selection
    console.log('Auth Modal Element:', authModal);
    console.log('Close Button Element:', closeButton);
    console.log('Auth Button Element:', authButton);
    console.log('Logout Button Element (main navbar):', logoutButton);
    console.log('Dashboard Logout Button Element:', dashboardLogoutButton);
    console.log('Login Message Element:', loginMessage);
    console.log('Signup Message Element:', signupMessage);
    console.log('File List Container:', fileListContainer);
    console.log('Upload File Button:', uploadFileButton);
    console.log('File Upload Input:', fileUploadInput);
    console.log('Upload Message:', uploadMessage);


    if (!authButton) {
        console.error('CRITICAL ERROR: Auth button element (#auth-button) not found!');
        // return; // Do not stop script execution, as other pages might not need this button
    }
    if (!closeButton && authModal) { // Only warn if modal exists but close button doesn't
        console.warn('WARNING: Close button element (.close-button inside #auth-modal) not found!');
        // We can still proceed, but closing the modal might be an issue.
    }

    // --- Utility Functions ---
    function showMessage(element, message, isError = false) {
        if (element) { // Defensive check
            element.textContent = message;
            element.className = `auth-message ${isError ? 'error' : 'success'}`;
            console.log(`Message displayed on ${element.id}: "${message}" (Error: ${isError})`);
        } else {
            console.warn('Attempted to show message on a null element:', message);
        }
    }

    function clearMessages() {
        if (loginMessage) { loginMessage.textContent = ''; loginMessage.className = 'auth-message'; }
        if (signupMessage) { signupMessage.textContent = ''; signupMessage.className = 'auth-message'; }
        if (uploadMessage) { uploadMessage.textContent = ''; uploadMessage.className = 'auth-message'; } // Clear upload message too
        console.log('Auth and upload messages cleared.');
    }

    function showAuthModal() {
        console.log('showAuthModal called.');
        if (authModal) {
            authModal.classList.add('visible');
            document.body.style.overflow = 'hidden'; // Prevent scrolling background
            clearMessages();
            console.log('Auth modal visibility set to visible.');
        } else {
            console.error('showAuthModal: authModal is null!');
        }
    }

    function hideAuthModal() {
        console.log('hideAuthModal called.');
        if (authModal) {
            authModal.classList.remove('visible');
            document.body.style.overflow = ''; // Restore scrolling
            console.log('Auth modal visibility set to hidden.');
        } else {
            console.error('hideAuthModal: authModal is null!');
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

    async function fetchUserFiles() {
        if (!dashboardSection) { // Only fetch files if on the dashboard page
            console.log('Not on dashboard page, skipping file fetch.');
            return;
        }
        console.log('Fetching user files...');
        showFileState('loading');
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            console.log('No user logged in, cannot fetch files.');
            showFileState('empty');
            return;
        }

        try {
            const { data: files, error } = await supabase
                .from('files')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching files:', error.message);
                showFileState('error');
                return;
            }

            console.log('Fetched files:', files);
            renderFiles(files);
        } catch (err) {
            console.error('Unexpected error fetching files:', err);
            showFileState('error');
        }
    }

    function renderFiles(files) {
        if (!filesTableBody) {
            console.error('filesTableBody element not found!');
            return;
        }
        filesTableBody.innerHTML = ''; // Clear existing rows

        if (files.length === 0) {
            showFileState('empty');
            return;
        }

        files.forEach(file => {
            const row = filesTableBody.insertRow();
            row.innerHTML = `
                <td>
                    <div class="file-name-cell">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>
                        <span>${file.name}</span>
                    </div>
                </td>
                <td>${formatBytes(file.size || 0)}</td>
                <td>${file.mime_type || 'Inconnu'}</td>
                <td>${new Date(file.created_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                <td>
                    <div class="file-actions">
                        <button class="btn btn-icon download-file-btn" data-path="${file.storage_path}" title="Télécharger">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                        </button>
                        <button class="btn btn-icon share-file-btn" data-id="${file.id}" title="Partager">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-share-2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>
                        </button>
                        <button class="btn btn-icon btn-danger delete-file-btn" data-id="${file.id}" data-path="${file.storage_path}" title="Supprimer">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                        </button>
                    </div>
                </td>
            `;
        });
        showFileState('data');
        attachFileActionListeners(); // Attach listeners to new buttons
    }

    async function updateUIForAuth(session) {
        console.log('updateUIForAuth called with session:', session);
        if (session) {
            // User is logged in
            if (authButton) authButton.classList.add('hidden'); // Hide main navbar auth button
            // main navbar logout button is implicitly hidden because heroSection is hidden
            if (dashboardSection) dashboardSection.classList.remove('hidden');
            if (heroSection) heroSection.classList.add('hidden'); // Hide hero section
            if (testimonialsSection) testimonialsSection.classList.add('hidden'); // Hide testimonials
            if (ctaSection) ctaSection.classList.add('hidden'); // Hide CTA
            if (dashboardLogoutButton) dashboardLogoutButton.classList.remove('hidden'); // Show dashboard logout button

            const { data: profile, error } = await supabase
                .from('profiles')
                .select('username')
                .eq('id', session.user.id)
                .single();

            if (error) {
                console.error('Error fetching profile:', error.message);
                if (usernameDisplay) usernameDisplay.textContent = session.user.email; // Fallback to email
            } else {
                console.log('Profile fetched:', profile);
                if (usernameDisplay) usernameDisplay.textContent = profile.username || session.user.email;
            }

            hideAuthModal();
            fetchUserFiles(); // Fetch files when user logs in (only if on dashboard)
        } else {
            // User is logged out
            if (authButton) authButton.classList.remove('hidden'); // Show main navbar auth button
            // main navbar logout button is implicitly hidden because heroSection is visible
            if (dashboardSection) dashboardSection.classList.add('hidden');
            if (heroSection) heroSection.classList.remove('hidden'); // Show hero section
            if (testimonialsSection) testimonialsSection.classList.remove('hidden'); // Show testimonials
            if (ctaSection) ctaSection.classList.remove('hidden'); // Show CTA
            if (dashboardLogoutButton) dashboardLogoutButton.classList.add('hidden'); // Hide dashboard logout button
            console.log('UI updated for logged out state.');
        }
    }

    // --- File Upload Logic (only relevant for dashboard) ---
    async function uploadFile(file) {
        if (!uploadMessage) return; // Ensure upload message element exists

        clearMessages();
        showMessage(uploadMessage, `Téléversement de "${file.name}"...`, false);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            showMessage(uploadMessage, 'Vous devez être connecté pour téléverser des fichiers.', true);
            return;
        }

        const fileExtension = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;
        const filePath = `${user.id}/${fileName}`; // Store in user-specific folder

        try {
            // Upload to Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('files') // 'files' is the bucket name
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false // Do not overwrite existing files
                });

            if (uploadError) {
                console.error('Error uploading file to storage:', uploadError.message);
                showMessage(uploadMessage, `Erreur lors du téléversement : ${uploadError.message}`, true);
                return;
            }

            console.log('File uploaded to storage:', uploadData);

            // Insert file metadata into the 'files' table
            const { data: insertData, error: insertError } = await supabase
                .from('files')
                .insert([
                    {
                        user_id: user.id,
                        name: file.name,
                        storage_path: uploadData.path, // Use the path returned by storage upload
                        mime_type: file.type,
                        size: file.size
                    }
                ]);

            if (insertError) {
                console.error('Error inserting file metadata:', insertError.message);
                // IMPORTANT: If metadata insert fails, consider deleting the file from storage
                // to prevent orphaned files. For now, we'll just log.
                showMessage(uploadMessage, `Erreur lors de l'enregistrement des métadonnées : ${insertError.message}`, true);
                return;
            }

            console.log('File metadata inserted:', insertData);
            showMessage(uploadMessage, `"${file.name}" téléversé avec succès !`, false);
            fetchUserFiles(); // Refresh the file list
        } catch (err) {
            console.error('Unexpected error during file upload:', err);
            showMessage(uploadMessage, `Une erreur inattendue est survenue : ${err.message}`, true);
        }
    }

    // --- File Actions (Download, Share, Delete) (only relevant for dashboard) ---
    async function downloadFile(filePath, fileName) {
        if (!uploadMessage) return; // Ensure upload message element exists

        console.log('Attempting to download file:', filePath);
        clearMessages(); // Clear previous messages
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

            // Create a URL for the blob and trigger download
            const url = URL.createObjectURL(data);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName; // Use original file name
            document.body.appendChild(a);
            a.click();
            // Clean up after a short delay to ensure the browser has time to initiate the download
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                clearMessages(); // Clear download message after cleanup
            }, 100); // 100ms delay
            console.log('File download initiated for:', fileName);
            showMessage(uploadMessage, `Téléchargement de "${fileName}" initié.`, false);

        } catch (err) {
            console.error('Unexpected error during file download:', err);
            showMessage(uploadMessage, `Une erreur inattendue est survenue lors du téléchargement : ${err.message}`, true);
        }
    }

    async function deleteFile(fileId, storagePath) {
        if (!uploadMessage) return; // Ensure upload message element exists

        if (!confirm('Êtes-vous sûr de vouloir supprimer ce fichier ? Cette action est irréversible.')) {
            return;
        }
        clearMessages();
        showMessage(uploadMessage, 'Suppression du fichier...', false);

        try {
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

            showMessage(uploadMessage, 'Fichier supprimé avec succès !', false);
            fetchUserFiles(); // Refresh the file list
        } catch (err) {
            console.error('Unexpected error during file deletion:', err);
            showMessage(uploadMessage, `Une erreur inattendue est survenue lors de la suppression : ${err.message}`, true);
        }
    }

    function attachFileActionListeners() {
        // Only attach if filesTableBody exists (i.e., on dashboard)
        if (!filesTableBody) return;

        // Download buttons
        document.querySelectorAll('.download-file-btn').forEach(button => {
            button.onclick = null; // Remove previous listeners to prevent duplicates
            button.addEventListener('click', (e) => {
                const filePath = e.currentTarget.dataset.path;
                const fileName = e.currentTarget.closest('tr').querySelector('.file-name-cell span').textContent;
                downloadFile(filePath, fileName);
            });
        });

        // Delete buttons
        document.querySelectorAll('.delete-file-btn').forEach(button => {
            button.onclick = null; // Remove previous listeners
            button.addEventListener('click', (e) => {
                const fileId = e.currentTarget.dataset.id;
                const storagePath = e.currentTarget.dataset.path;
                deleteFile(fileId, storagePath);
            });
        });

        // Share buttons (placeholder for now)
        document.querySelectorAll('.share-file-btn').forEach(button => {
            button.onclick = null; // Remove previous listeners
            button.addEventListener('click', (e) => {
                const fileId = e.currentTarget.dataset.id;
                alert(`Fonctionnalité de partage pour le fichier ${fileId} à implémenter.`);
            });
        });
    }


    // --- Event Listeners ---
    if (authButton) {
        authButton.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default behavior if any
            console.log('Auth button clicked!');
            showAuthModal();
        });
    }


    if (closeButton) { // Only attach if closeButton exists
        closeButton.addEventListener('click', () => {
            console.log('Close button clicked!');
            hideAuthModal();
        });
    } else if (authModal) { // If modal exists but close button doesn't, allow clicking outside
        console.warn('Close button not found, modal can only be closed by clicking outside.');
    }

    if (loginTab) loginTab.addEventListener('click', showLoginForm);
    if (signupTab) signupTab.addEventListener('click', showSignupForm);

    // Close modal if clicking outside content
    if (authModal) {
        authModal.addEventListener('click', (e) => {
            if (e.target === authModal) {
                console.log('Clicked outside modal content, hiding modal.');
                hideAuthModal();
            }
        });
    }

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
                        username: email.split('@')[0] // Initial username from email
                    }
                }
            });

            if (error) {
                console.error('Signup error:', error.message, error);
                showMessage(signupMessage, error.message, true);
            } else {
                console.log('Signup successful. Data:', data);
                // Supabase returns session on signup if email confirmation is off
                if (data.session) {
                    showMessage(signupMessage, 'Inscription réussie et connexion automatique !', false);
                    updateUIForAuth(data.session);
                } else if (data.user) {
                    showMessage(signupMessage, 'Inscription réussie ! Veuillez vous connecter.', false);
                    // Optionally switch to login form after successful signup
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
                updateUIForAuth(null); // Update UI to logged out state
            }
        });
    }

    // Logout Button (dashboard)
    if (dashboardLogoutButton) {
        dashboardLogoutButton.addEventListener('click', async () => {
            console.log('Dashboard Logout button clicked.');
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error('Error during logout:', error.message, error);
            } else {
                console.log('User logged out successfully from dashboard.');
                updateUIForAuth(null); // Update UI to logged out state
            }
        });
    }

    // Retry files button (only relevant for dashboard)
    if (retryFilesButton) {
        retryFilesButton.addEventListener('click', fetchUserFiles);
    }

    // Upload file button click handler (only relevant for dashboard)
    if (uploadFileButton) {
        uploadFileButton.addEventListener('click', () => {
            fileUploadInput.click(); // Trigger the hidden file input
        });
    }

    // Upload first file button in empty state (only relevant for dashboard)
    if (uploadFirstFileButton) {
        uploadFirstFileButton.addEventListener('click', () => {
            fileUploadInput.click(); // Trigger the hidden file input
        });
    }

    // Handle file selection (only relevant for dashboard)
    if (fileUploadInput) {
        fileUploadInput.addEventListener('change', async (event) => {
            const files = event.target.files;
            if (files.length > 0) {
                // For simplicity, we'll upload one file at a time.
                // A loop could be added here for multiple files.
                for (const file of files) {
                    await uploadFile(file);
                }
                fileUploadInput.value = ''; // Clear the input after upload
            }
        });
    }

    // --- Session Management ---
    // Check initial session on page load
    supabase.auth.getSession().then(({ data: { session } }) => {
        console.log('Initial session check:', session);
        updateUIForAuth(session);
    }).catch(err => {
        console.error('Error during initial session check:', err);
    });

    // Listen for auth state changes
    supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event, session);
        updateUIForAuth(session);
    });

    // Scroll Reveal Animation (existing logic)
    const revealElements = document.querySelectorAll('.reveal');
    const observerOptions = {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.1 // Trigger when 10% of the item is visible
    };
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Stop observing once revealed
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
                // If target is not on the current page, navigate to index.html and then scroll
                window.location.href = `/${targetId}`;
            }
        });
    });
});
