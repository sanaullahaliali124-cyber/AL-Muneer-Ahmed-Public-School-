// settings.js

function setPreviewImage(previewId, dataUrl, iconClass) {
    const box = document.getElementById(previewId);
    if (!box) return;
    if (dataUrl) {
        box.innerHTML = '<img src="' + dataUrl + '" alt="Preview" style="width:100%;height:100%;object-fit:cover;display:block;">';
    } else {
        box.innerHTML = '<i class="fas ' + (iconClass || 'fa-image') + '" style="font-size:22px;"></i>';
    }
}

function compressImageFile(file, maxSide, quality) {
    maxSide = maxSide || 800;
    quality = quality || 0.82;
    return new Promise(function (resolve, reject) {
        const reader = new FileReader();
        reader.onerror = function () { reject(new Error('read failed')); };
        reader.onload = function (e) {
            const img = new Image();
            img.onload = function () {
                let w = img.width;
                let h = img.height;
                if (w > maxSide || h > maxSide) {
                    if (w >= h) {
                        h = Math.round(h * (maxSide / w));
                        w = maxSide;
                    } else {
                        w = Math.round(w * (maxSide / h));
                        h = maxSide;
                    }
                }
                const canvas = document.createElement('canvas');
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, w, h);
                let dataUrl = canvas.toDataURL('image/jpeg', quality);
                if (dataUrl.length > 700000) {
                    dataUrl = canvas.toDataURL('image/jpeg', 0.65);
                }
                resolve(dataUrl);
            };
            img.onerror = function () { reject(new Error('image load failed')); };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

function readImageToHidden(input, hiddenId, previewId, iconClass) {
    const file = input.files && input.files[0];
    if (!file) return;
    if (!file.type || !file.type.startsWith('image/')) {
        if (typeof App !== 'undefined') App.showToast('Please select an image file', 'warning');
        input.value = '';
        return;
    }
    if (typeof App !== 'undefined') App.showToast('Uploading image...', 'info');
    compressImageFile(file, 900, 0.85).then(function (dataUrl) {
        const hidden = document.getElementById(hiddenId);
        if (hidden) hidden.value = dataUrl;
        setPreviewImage(previewId, dataUrl, iconClass);
        if (typeof App !== 'undefined') App.showToast('Image ready — Save Settings dabayein', 'success');
    }).catch(function () {
        if (typeof App !== 'undefined') App.showToast('Image upload failed', 'error');
        input.value = '';
    });
}

function previewLogo(input) {
    readImageToHidden(input, 'setting-logo', 'setting-logo-preview', 'fa-school');
}

function removeLogo() {
    const hidden = document.getElementById('setting-logo');
    const file = document.getElementById('setting-logo-file');
    if (hidden) hidden.value = '';
    if (file) file.value = '';
    setPreviewImage('setting-logo-preview', '', 'fa-school');
    if (typeof App !== 'undefined') App.showToast('Logo removed (Save to apply)', 'info');
}

function previewProfile(input) {
    readImageToHidden(input, 'setting-profilePhoto', 'setting-profile-preview', 'fa-user');
}

function removeProfile() {
    const hidden = document.getElementById('setting-profilePhoto');
    const file = document.getElementById('setting-profile-file');
    if (hidden) hidden.value = '';
    if (file) file.value = '';
    setPreviewImage('setting-profile-preview', '', 'fa-user');
    if (typeof App !== 'undefined') App.showToast('Profile removed (Save to apply)', 'info');
}

function applyBranding(settings) {
    settings = settings || (typeof DB !== 'undefined' ? DB.getSettings() : {});
    const logo = settings.logo || '';
    const profile = settings.profilePhoto || '';

    // Sidebar header logo
    const sideLogo = document.querySelector('.sidebar-header img');
    if (sideLogo) {
        if (logo && logo.startsWith('data:')) {
            sideLogo.src = logo;
        } else if (logo && logo !== 'assets/logo.png') {
            sideLogo.src = logo;
        } else if (!logo) {
            sideLogo.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%230a2540" width="100" height="100" rx="50"/><text x="50" y="55" text-anchor="middle" fill="%23d4a017" font-size="30" font-family="Arial" font-weight="bold">SMP</text></svg>';
        }
    }

    // Sidebar brand name
    const brandH2 = document.querySelector('.sidebar-brand h2');
    if (brandH2 && settings.schoolName) brandH2.textContent = settings.schoolName;
    const brandSpan = document.querySelector('.sidebar-brand span');
    if (brandSpan && settings.tagline) brandSpan.textContent = settings.tagline;

    // Sidebar footer avatar
    const avatar = document.querySelector('.sidebar-footer .avatar');
    if (avatar) {
        if (profile && profile.startsWith('data:')) {
            avatar.innerHTML = '<img src="' + profile + '" alt="Profile" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;">';
            avatar.style.padding = '0';
            avatar.style.overflow = 'hidden';
        } else {
            avatar.textContent = (settings.adminInitial || 'A');
            avatar.style.padding = '';
        }
    }

    // Page title prefix (optional)
    if (settings.schoolName) {
        document.title = document.title.replace(/^[^-]+-/, settings.schoolName + ' -');
    }
}

function loadSettingsForm() {
    const settings = DB.getSettings();
    const fields = ['schoolName', 'tagline', 'whatsapp', 'phone', 'email', 'address', 'academicSession'];
    fields.forEach(f => {
        const el = document.getElementById('setting-' + f);
        if (el) el.value = settings[f] || '';
    });

    const sideEl = document.getElementById('setting-sidebarMenu');
    if (sideEl) {
        const mode = settings.sidebarMenu || localStorage.getItem('school_sidebar_menu') || 'show';
        sideEl.value = mode === 'hide' ? 'hide' : 'show';
    }

    // Logo
    const logoVal = settings.logo && settings.logo.startsWith('data:') ? settings.logo : '';
    const logoHidden = document.getElementById('setting-logo');
    if (logoHidden) logoHidden.value = logoVal;
    const logoFile = document.getElementById('setting-logo-file');
    if (logoFile) logoFile.value = '';
    setPreviewImage('setting-logo-preview', logoVal, 'fa-school');

    // Profile
    const profileVal = settings.profilePhoto || '';
    const profileHidden = document.getElementById('setting-profilePhoto');
    if (profileHidden) profileHidden.value = profileVal;
    const profileFile = document.getElementById('setting-profile-file');
    if (profileFile) profileFile.value = '';
    setPreviewImage('setting-profile-preview', profileVal, 'fa-user');

    applyBranding(settings);
}

function saveSettingsForm() {
    const settings = DB.getSettings();
    settings.schoolName = document.getElementById('setting-schoolName')?.value || settings.schoolName;
    settings.tagline = document.getElementById('setting-tagline')?.value || settings.tagline;
    settings.whatsapp = document.getElementById('setting-whatsapp')?.value || settings.whatsapp;
    settings.phone = document.getElementById('setting-phone')?.value || settings.phone;
    settings.email = document.getElementById('setting-email')?.value || settings.email;
    settings.address = document.getElementById('setting-address')?.value || settings.address;
    settings.academicSession = document.getElementById('setting-academicSession')?.value || settings.academicSession;

    // Logo
    const logoEl = document.getElementById('setting-logo');
    if (logoEl) {
        settings.logo = logoEl.value || '';
    }

    // Profile photo
    const profileEl = document.getElementById('setting-profilePhoto');
    if (profileEl) {
        settings.profilePhoto = profileEl.value || '';
    }

    const sideEl = document.getElementById('setting-sidebarMenu');
    if (sideEl) {
        settings.sidebarMenu = sideEl.value === 'hide' ? 'hide' : 'show';
        localStorage.setItem('school_sidebar_menu', settings.sidebarMenu);
        if (settings.sidebarMenu === 'hide') {
            if (typeof hideSidebarMenu === 'function') hideSidebarMenu(false);
        } else {
            if (typeof showSidebarMenu === 'function') showSidebarMenu(false);
        }
    }

    if (typeof WhatsApp !== 'undefined') {
        settings.whatsappIntl = WhatsApp.formatWhatsAppNumber(settings.whatsapp);
    }

    DB.saveSettings(settings);
    applyBranding(settings);
    App.showToast('Settings saved successfully', 'success');
}

function resetDemoData() {
    App.confirmDialog('This will reset ALL data to demo defaults. Continue?', () => {
        DB.resetDatabase();
        localStorage.removeItem('school_sidebar_menu');
        localStorage.removeItem('school_sidebar_collapsed');
        App.showToast('Demo data reset successfully. Reloading...', 'success');
        setTimeout(() => location.reload(), 1000);
    });
}

// Apply branding on page load
document.addEventListener('DOMContentLoaded', function () {
    try {
        if (typeof DB !== 'undefined') applyBranding(DB.getSettings());
    } catch (e) {}
});

window.Settings = {
    loadSettingsForm,
    saveSettingsForm,
    resetDemoData,
    previewLogo,
    removeLogo,
    previewProfile,
    removeProfile,
    applyBranding
};
