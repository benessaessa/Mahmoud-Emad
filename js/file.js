// استعادة البيانات من التخزين المحلي
let users = JSON.parse(localStorage.getItem('sys_users')) || [{name: "Mahmoud", pass: "191997", role: "admin", createdAt: new Date().toLocaleDateString('ar-EG')}];
let records = JSON.parse(localStorage.getItem('sys_records')) || [];
let activityLog = JSON.parse(localStorage.getItem('sys_logs')) || [];
let currentUser = JSON.parse(sessionStorage.getItem('currentUser')) || null;

// تسجيل الدخول محسّن (for old login page compatibility)
function handleLogin() {
    const loginUserInput = document.getElementById('login_user');
    const loginPassInput = document.getElementById('login_pass');
    const u = loginUserInput.value.trim();
    const p = loginPassInput.value.trim();

    if (!u || !p) {
        showAlert("يرجى إدخال اسم المستخدم وكلمة المرور", "error");
        return;
    }

    const user = users.find(x => x.name === u && x.pass === p);

    if (user) {
        currentUser = user;
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        document.getElementById('loginPage').style.display = 'none';
        document.getElementById('mainApp').style.display = 'flex';
        document.getElementById('userBadge').innerText = user.name;
        document.getElementById('adminLink').style.display = (user.role === 'admin') ? 'block' : 'none';
        
        logActivity(`سجل المستخدم ${user.name} الدخول للمنظومة`);
        updateDashboard();
        renderUsers();
        renderLogs();
        loginUserInput.value = '';
        loginPassInput.value = '';
    } else {
        showAlert("خطأ! بيانات الدخول غير صحيحة", "error");
    }
}

// دالة إظهار التنبيهات محسّنة مع Bootstrap
function showAlert(message, type = "success") {
    const alertDiv = document.createElement('div');
    const alertClass = type === 'error' ? 'alert-danger' : 'alert-success';
    const icon = type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle';
    
    alertDiv.className = `alert ${alertClass}`;
    alertDiv.innerHTML = `<i class="fas ${icon}" style="margin-left: 10px;"></i> ${message}`;
    alertDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        min-width: 300px;
        border-radius: 10px;
        z-index: 9999;
        animation: slideIn 0.3s ease-out;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    `;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => alertDiv.remove(), 300);
    }, 3000);
}

// إضافة animation fadeOut
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; transform: translateX(0); }
        to { opacity: 0; transform: translateX(300px); }
    }
`;
document.head.appendChild(style);

// التخزين المحلي - الحفظ محسّن
function saveData() {
    const name = document.getElementById('acc_name').value.trim();
    const id = document.getElementById('acc_id').value.trim();
    const type = document.getElementById('crime_type').value;
    const caseNum = document.getElementById('case_num').value.trim();
    const details = document.getElementById('crime_details').value.trim();
    const vicName = document.getElementById('vic_name').value.trim();
    const phones = document.getElementById('acc_phones').value.trim();

    if (!name) {
        showAlert("يرجى إدخال اسم المتهم", "error");
        return;
    }
    if (!id) {
        showAlert("يرجى إدخال الرقم القومي", "error");
        return;
    }

    const data = {
        id: Date.now(),
        name: name,
        nationalId: id,
        type: type,
        case: caseNum,
        details: details,
        victimName: vicName,
        phones: phones,
        img1: document.getElementById('p1').src || '',
        img2: document.getElementById('p2').src || '',
        createdBy: currentUser.name,
        time: new Date().toLocaleString('ar-EG')
    };

    records.push(data);
    localStorage.setItem('sys_records', JSON.stringify(records));
    
    logActivity(`قام ${currentUser.name} بإدراج بيانات المتهم: ${name}`);
    showAlert("تم حفظ البيانات بنجاح", "success");
    document.getElementById('crimeForm').reset();
    document.getElementById('p1').style.display = 'none';
    document.getElementById('p2').style.display = 'none';
    updateDashboard();
}

// سجل النشاط محسّن
function logActivity(msg) {
    activityLog.unshift({
        msg: msg,
        user: currentUser ? currentUser.name : 'نظام',
        time: new Date().toLocaleTimeString('ar-EG'),
        date: new Date().toLocaleDateString('ar-EG')
    });
    if (activityLog.length > 100) activityLog.pop(); // الحد من حجم السجل
    localStorage.setItem('sys_logs', JSON.stringify(activityLog));
    renderLogs();
}

function renderLogs() {
    const list = document.getElementById('logList');
    if (!list) return;
    
    if (activityLog.length === 0) {
        list.innerHTML = '<div class="alert alert-info"><i class="fas fa-info-circle"></i> لا توجد سجلات نشاط حتى الآن</div>';
        return;
    }
    
    list.innerHTML = activityLog.map((l, i) => `
        <div class="log-item">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span class="log-item-user">
                    <i class="fas fa-user-circle" style="margin-left: 8px;"></i>${l.user}
                </span>
                <span class="log-item-time">
                    <i class="fas fa-clock" style="margin-left: 8px;"></i>${l.time}
                </span>
            </div>
            <div class="log-item-message">
                <i class="fas fa-arrow-left" style="margin-left: 8px; color: #667eea;"></i>${l.msg}
            </div>
        </div>
    `).join('');
}

// تحديث لوحة المعلومات محسّنة
function updateDashboard() {
    const types = ["نصب إلكتروني", "نقد", "مراهنات", "مستندي"];
    const container = document.getElementById('statsContainer');
    
    let html = `
        <div class="col-md-6 col-lg-4 mb-4">
            <div class="stat-card">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <h4>إجمالي الحالات</h4>
                        <div class="stat-value" style="color: #667eea;">${records.length}</div>
                    </div>
                    <i class="fas fa-database"></i>
                </div>
            </div>
        </div>
    `;
    
    html += types.map(t => {
        const count = records.filter(r => r.type.includes(t)).length;
        return `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="stat-card ${count > 0 ? 'up' : ''}">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h4>${t}</h4>
                            <div class="stat-value" style="color: ${count > 0 ? '#51cf66' : '#6b7280'};">${count}</div>
                        </div>
                        <i class="fas ${count > 0 ? 'fa-arrow-up' : 'fa-minus'}" style="color: ${count > 0 ? '#51cf66' : '#ccc'};"></i>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
}

// إدارة المستخدمين محسّنة
function addUser() {
    if (currentUser.role !== 'admin') {
        showAlert("صلاحيتك غير كافية لإضافة مستخدمين", "error");
        return;
    }

    const n = document.getElementById('new_u_name').value.trim();
    const p = document.getElementById('new_u_pass').value.trim();
    const r = document.getElementById('new_u_role').value;

    if (!n) {
        showAlert("يرجى إدخال اسم المستخدم", "error");
        return;
    }
    if (!p) {
        showAlert("يرجى إدخال كلمة السر", "error");
        return;
    }
    if (p.length < 4) {
        showAlert("كلمة السر يجب أن تكون 4 أحرف على الأقل", "error");
        return;
    }
    if (users.find(u => u.name === n)) {
        showAlert("هذا المستخدم موجود بالفعل", "error");
        return;
    }

    users.push({
        name: n, 
        pass: p, 
        role: r,
        createdAt: new Date().toLocaleDateString('ar-EG')
    });
    localStorage.setItem('sys_users', JSON.stringify(users));
    renderUsers();
    logActivity(`أضاف الأدمن مستخدم جديد: ${n} (${r === 'admin' ? 'أدمن' : 'مستخدم عادي'})`);
    showAlert("تم إضافة المستخدم بنجاح", "success");
    
    document.getElementById('new_u_name').value = '';
    document.getElementById('new_u_pass').value = '';
    document.getElementById('new_u_role').value = 'user';
}

function delUser(index) {
    if (currentUser.role !== 'admin') {
        showAlert("صلاحيتك غير كافية", "error");
        return;
    }
    
    if (users[index].name === 'Mahmoud') {
        showAlert("لا يمكن حذف المسؤول الأساسي", "error");
        return;
    }

    if (confirm(`هل تريد حذف المستخدم: ${users[index].name}؟`)) {
        const deletedUser = users[index];
        users.splice(index, 1);
        localStorage.setItem('sys_users', JSON.stringify(users));
        renderUsers();
        logActivity(`قام الأدمن بحذف المستخدم: ${deletedUser.name}`);
        showAlert("تم حذف المستخدم بنجاح", "success");
    }
}

function renderUsers() {
    const list = document.getElementById('usersList');
    if (!list) return;
    
    if (users.length === 0) {
        list.innerHTML = '<tr><td colspan="4" class="text-center text-muted"><i class="fas fa-users"></i> لا توجد مستخدمين</td></tr>';
        return;
    }
    
    list.innerHTML = users.map((u, i) => `
        <tr>
            <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-user-circle" style="color: #667eea; font-size: 1.5rem;"></i>
                    <strong>${u.name}</strong>
                </div>
            </td>
            <td>
                <span class="badge" style="background: ${u.role === 'admin' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'linear-gradient(135deg, #51cf66 0%, #37b24d 100%)'}; padding: 6px 12px;">
                    ${u.role === 'admin' ? '<i class="fas fa-crown"></i> أدمن' : '<i class="fas fa-user"></i> مستخدم'}
                </span>
            </td>
            <td><small class="text-muted">${u.createdAt || '-'}</small></td>
            <td>
                <button onclick="delUser(${i})" class="btn btn-sm btn-danger" title="حذف المستخدم">
                    <i class="fas fa-trash-alt"></i> حذف
                </button>
            </td>
        </tr>
    `).join('');
}

// التنقل محسّن
function switchTab(id) {
    document.querySelectorAll('.tab-view').forEach(v => v.style.display = 'none');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    
    document.getElementById(id).style.display = 'block';
    event.currentTarget.classList.add('active');
    
    if(id === 'activityLog') renderLogs();
    if(id === 'adminSection') renderUsers();
}

// تسجيل الخروج محسّن
function logout() {
    if(confirm("هل تريد تسجيل الخروج والعودة لشاشة الدخول؟")) {
        if (currentUser) {
            logActivity(`سجل المستخدم ${currentUser.name} الخروج من المنظومة`);
        }
        sessionStorage.removeItem('currentUser');
        currentUser = null;
        showAlert("تم تسجيل الخروج بنجاح", "success");
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 800);
    }
}

// معاينة الصور محسّنة
function preview(input, id) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        
        // التحقق من نوع الملف
        if (!file.type.startsWith('image/')) {
            showAlert("يرجى تحديد ملف صورة", "error");
            return;
        }

        // التحقق من حجم الملف (5MB)
        if (file.size > 5 * 1024 * 1024) {
            showAlert("حجم الصورة كبير جداً (الحد الأقصى 5MB)", "error");
            return;
        }

        const reader = new FileReader();
        reader.onload = e => {
            const img = document.getElementById(id);
            img.src = e.target.result;
            img.style.display = 'block';
        };
        reader.onerror = () => {
            showAlert("حدث خطأ في قراءة الملف", "error");
        };
        reader.readAsDataURL(file);
    }
}

// تصفية سجل النشاط
function filterLogs() {
    const searchText = document.getElementById('logSearch').value.trim().toLowerCase();
    const logItems = document.querySelectorAll('.log-item');
    
    logItems.forEach(item => {
        const text = item.innerText.toLowerCase();
        if (text.includes(searchText)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// مسح سجل النشاط
function clearActivityLog() {
    if (currentUser.role !== 'admin') {
        showAlert("صلاحيتك غير كافية", "error");
        return;
    }
    
    if (confirm("هل تريد مسح جميع سجلات النشاط؟ هذا الإجراء لا يمكن التراجع عنه!")) {
        activityLog = [];
        localStorage.setItem('sys_logs', JSON.stringify(activityLog));
        renderLogs();
        logActivity(`قام الأدمن بمسح سجلات النشاط`);
        showAlert("تم مسح سجلات النشاط بنجاح", "success");
    }
}

// تحديث إحصائيات الإدارة
function updateAdminStats() {
    const totalUsers = users.length;
    const totalRecords = records.length;
    const totalLogs = activityLog.length;
    
    const totalUsersEl = document.getElementById('totalUsers');
    const totalRecordsEl = document.getElementById('totalRecords');
    const totalLogsEl = document.getElementById('totalLogs');
    
    if (totalUsersEl) totalUsersEl.innerText = totalUsers;
    if (totalRecordsEl) totalRecordsEl.innerText = totalRecords;
    if (totalLogsEl) totalLogsEl.innerText = totalLogs;
}

// مسح جميع البيانات
function clearAllData() {
    if (currentUser.role !== 'admin') {
        showAlert("صلاحيتك غير كافية", "error");
        return;
    }
    
    if (confirm("⚠️ تحذير: هل تريد مسح جميع البيانات بما فيها المستخدمين والحالات والسجلات؟\nهذا الإجراء لا يمكن التراجع عنه!")) {
        if (confirm("هل أنت متأكد فعلاً؟ اكتب 'نعم' لتأكيد")) {
            records = [];
            activityLog = [];
            localStorage.setItem('sys_records', JSON.stringify(records));
            localStorage.setItem('sys_logs', JSON.stringify(activityLog));
            logActivity(`قام الأدمن بمسح جميع البيانات`);
            showAlert("تم مسح البيانات بنجاح", "success");
            updateDashboard();
            updateAdminStats();
        }
    }
}

// تصدير البيانات
function exportData() {
    const exportData = {
        users: users,
        records: records,
        logs: activityLog,
        exportDate: new Date().toLocaleString('ar-EG')
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `system_export_${new Date().getTime()}.json`;
    link.click();
    
    logActivity(`قام الأدمن بتصدير البيانات`);
    showAlert("تم تصدير البيانات بنجاح", "success");
}

// نسخ احتياطي للبيانات
function backupData() {
    if (currentUser.role !== 'admin') {
        showAlert("صلاحيتك غير كافية", "error");
        return;
    }
    
    const backupData = {
        users: users,
        records: records,
        logs: activityLog,
        backupDate: new Date().toLocaleString('ar-EG'),
        backupBy: currentUser.name
    };
    
    // Save backup to localStorage
    let backups = JSON.parse(localStorage.getItem('sys_backups')) || [];
    backups.push(backupData);
    localStorage.setItem('sys_backups', JSON.stringify(backups));
    
    logActivity(`قام الأدمن بإنشاء نسخة احتياطية`);
    showAlert(`تم إنشاء نسخة احتياطية بنجاح (إجمالي: ${backups.length} نسخة)`, "success");
}

// تهيئة الصفحة عند التحميل
window.addEventListener('DOMContentLoaded', function() {
    // التحقق من حالة تسجيل الدخول
    if (currentUser) {
        document.getElementById('loginPage').style.display = 'none';
        document.getElementById('mainApp').style.display = 'flex';
    } else {
        document.getElementById('loginPage').style.display = 'flex';
        document.getElementById('mainApp').style.display = 'none';
    }
});
