// settings.js

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

    // Update intl format
    if (typeof WhatsApp !== 'undefined') {
        settings.whatsappIntl = WhatsApp.formatWhatsAppNumber(settings.whatsapp);
    }

    DB.saveSettings(settings);
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

window.Settings = { loadSettingsForm, saveSettingsForm, resetDemoData };
