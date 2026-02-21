// =============================================
// دوال مركز المعلومات
// =============================================

// عرض المستخدمين في مركز المعلومات
function renderInfoCenterUsers() {
    const list = document.getElementById('infoCenterUsersList');
    if (!list) return;
    
    if (users.length === 0) {
        list.innerHTML = '<tr><td colspan="5" class="text-center text-muted"><i class="fas fa-users"></i> لا توجد مستخدمين</td></tr>';
        return;
    }
    
    const searchText = document.getElementById('infoCenterSearch') ? document.getElementById('infoCenterSearch').value.trim().toLowerCase() : '';
    let filteredUsers = users;
    if (searchText) {
        filteredUsers = users.filter(u => u.name.toLowerCase().includes(searchText) || (u.role && u.role.toLowerCase().includes(searchText)));
    }
    
    list.innerHTML = filteredUsers.map((u, i) => `
        <tr>
            <td>${i + 1}</td>
            <td><strong>${u.name}</strong></td>
            <td>
                <span class="badge" style="background: ${u.role === 'admin' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'linear-gradient(135deg, #51cf66 0%, #37b24d 100%)'}; padding: 6px 12px;">
                    ${u.role === 'admin' ? '<i class="fas fa-crown"></i> أدمن' : '<i class="fas fa-user"></i> مستخدم'}
                </span>
            </td>
            <td><small class="text-muted">${u.createdAt || '-'}</small></td>
            <td>
                <div class="d-flex gap-2">
                    ${u.name !== 'Mahmoud' ? `
                    <button onclick="deleteUserFromInfoCenter(${users.indexOf(u)})" class="btn btn-sm btn-danger" title="حذف">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join('');
}

// بحث المستخدمين
function searchUsers() {
    renderInfoCenterUsers();
}

// إضافة مستخدم من مركز المعلومات
function addUserFromInfoCenter() {
    if (currentUser.role !== 'admin') {
        showAlert("صلاحيتك غير كافية لإضافة مستخدمين", "error");
        return;
    }

    const n = document.getElementById('ic_new_u_name').value.trim();
    const p = document.getElementById('ic_new_u_pass').value.trim();
    const r = document.getElementById('ic_new_u_role').value;

    if (!n || !p || p.length < 4 || users.find(u => u.name === n)) {
        showAlert("يرجى إدخال بيانات صحيحة", "error");
        return;
    }

    users.push({name: n, pass: p, role: r, createdAt: new Date().toLocaleDateString('ar-EG')});
    localStorage.setItem('sys_users', JSON.stringify(users));
    renderInfoCenterUsers();
    logActivity(`أضاف مستخدم جديد: ${n}`);
    showAlert("تم إضافة المستخدم بنجاح", "success");
    
    document.getElementById('ic_new_u_name').value = '';
    document.getElementById('ic_new_u_pass').value = '';
    document.getElementById('ic_new_u_role').value = 'user';
}

// حذف مستخدم من مركز المعلومات
function deleteUserFromInfoCenter(index) {
    if (currentUser.role !== 'admin') {
        showAlert("صلاحيتك غير كافية", "error");
        return;
    }
    
    if (users[index].name === 'Mahmoud') {
        showAlert("لا يمكن حذف المسؤول الأساسي", "error");
        return;
    }

    if (confirm(`هل تريد حذف المستخدم: ${users[index].name}؟`)) {
        users.splice(index, 1);
        localStorage.setItem('sys_users', JSON.stringify(users));
        renderInfoCenterUsers();
        logActivity(`حذف المستخدم: ${users[index].name}`);
        showAlert("تم حذف المستخدم بنجاح", "success");
    }
}

// تصدير المستخدمين كـ PDF
function exportUsersPDF() {
    if (typeof window.jspdf === 'undefined') {
        showAlert("خطأ في تحميل مكتبة PDF", "error");
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    doc.text("تقرير المستخدمين - المنظومة الأمنية للأموال العامة", 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`تاريخ التقرير: ${new Date().toLocaleDateString('ar-EG')}`, 105, 28, { align: 'center' });
    
    const tableData = users.map((u, i) => [i + 1, u.name, u.role === 'admin' ? 'أدمن' : 'مستخدم عادي', u.createdAt || '-']);
    
    doc.autoTable({
        head: [['م', 'اسم المستخدم', 'الصلاحية', 'تاريخ الإنشاء']],
        body: tableData,
        startY: 35,
        theme: 'striped',
        headStyles: { fillColor: [102, 126, 234], textColor: 255, fontStyle: 'bold' },
        styles: { font: 'arial', fontSize: 10, textAlign: 'center' },
        alternateRowStyles: { fillColor: [245, 245, 245] }
    });
    
    doc.save(`users_report_${new Date().getTime()}.pdf`);
    logActivity(`قام بتصدير تقرير المستخدمين PDF`);
    showAlert("تم تصدير التقرير بنجاح", "success");
}

// عرض السجلات في مركز المعلومات
function renderInfoCenterRecords() {
    const list = document.getElementById('infoCenterRecordsList');
    if (!list) return;
    
    if (records.length === 0) {
        list.innerHTML = '<tr><td colspan="7" class="text-center text-muted"><i class="fas fa-database"></i> لا توجد بيانات</td></tr>';
        return;
    }
    
    const searchText = document.getElementById('infoCenterRecordsSearch') ? document.getElementById('infoCenterRecordsSearch').value.trim().toLowerCase() : '';
    let filteredRecords = records;
    if (searchText) {
        filteredRecords = records.filter(r => (r.name && r.name.toLowerCase().includes(searchText)) || (r.nationalId && r.nationalId.toLowerCase().includes(searchText)) || (r.case && r.case.toLowerCase().includes(searchText)));
    }
    
    list.innerHTML = filteredRecords.map((r, i) => `
        <tr>
            <td>${i + 1}</td>
            <td><strong>${r.name || '-'}</strong></td>
            <td><small>${r.nationalId || '-'}</small></td>
            <td>${r.type || '-'}</td>
            <td><small>${r.case || '-'}</small></td>
            <td><small class="text-muted">${r.time || '-'}</small></td>
            <td>
                <div class="d-flex gap-2">
                    <button onclick="editRecordFromInfoCenter(${r.id})" class="btn btn-sm btn-primary" title="تعديل"><i class="fas fa-edit"></i></button>
                    <button onclick="deleteRecordFromInfoCenter(${r.id})" class="btn btn-sm btn-danger" title="حذف"><i class="fas fa-trash-alt"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
}

// بحث السجلات
function searchRecords() {
    renderInfoCenterRecords();
}

// تعديل سجل من مركز المعلومات
function editRecordFromInfoCenter(recordId) {
    const record = records.find(r => r.id === recordId);
    if (!record) {
        showAlert("السجل غير موجود", "error");
        return;
    }
    
    localStorage.setItem('editingRecordId', recordId);
    
    document.getElementById('acc_name').value = record.name || '';
    document.getElementById('acc_id').value = record.nationalId || '';
    document.getElementById('acc_dob').value = record.dob || '';
    document.getElementById('acc_qual').value = record.qual || '';
    document.getElementById('acc_job').value = record.job || '';
    document.getElementById('acc_address').value = record.address || '';
    document.getElementById('acc_phones').value = record.phones || '';
    document.getElementById('crime_type').value = record.type || '';
    document.getElementById('vic_name').value = record.victimName || '';
    document.getElementById('vic_phones').value = record.vicPhones || '';
    document.getElementById('case_num').value = record.case || '';
    document.getElementById('crime_details').value = record.details || '';
    
    if (record.img1) { document.getElementById('p1').src = record.img1; document.getElementById('p1').style.display = 'block'; }
    if (record.img2) { document.getElementById('p2').src = record.img2; document.getElementById('p2').style.display = 'block'; }
    
    switchTab('entryForm');
    showAlert(`جاري تعديل بيانات: ${record.name}`, "success");
}

// حذف سجل من مركز المعلومات
function deleteRecordFromInfoCenter(recordId) {
    if (currentUser.role !== 'admin') {
        showAlert("صلاحيتك غير كافية", "error");
        return;
    }
    
    const record = records.find(r => r.id === recordId);
    if (!record) {
        showAlert("السجل غير موجود", "error");
        return;
    }
    
    if (confirm(`هل تريد حذف بيانات: ${record.name}؟`)) {
        const index = records.findIndex(r => r.id === recordId);
        if (index !== -1) {
            records.splice(index, 1);
            localStorage.setItem('sys_records', JSON.stringify(records));
            renderInfoCenterRecords();
            logActivity(`حذف بيانات المتهم: ${record.name}`);
            showAlert("تم حذف البيانات بنجاح", "success");
            updateDashboard();
        }
    }
}

// تصدير السجلات كـ PDF
function exportRecordsPDF() {
    if (typeof window.jspdf === 'undefined') {
        showAlert("خطأ في تحميل مكتبة PDF", "error");
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    doc.text("تقرير البيانات - المنظومة الأمنية للأموال العامة", 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`تاريخ التقرير: ${new Date().toLocaleDateString('ar-EG')}`, 105, 28, { align: 'center' });
    
    const searchText = document.getElementById('infoCenterRecordsSearch') ? document.getElementById('infoCenterRecordsSearch').value.trim().toLowerCase() : '';
    let filteredRecords = records;
    if (searchText) {
        filteredRecords = records.filter(r => (r.name && r.name.toLowerCase().includes(searchText)) || (r.nationalId && r.nationalId.toLowerCase().includes(searchText)) || (r.case && r.case.toLowerCase().includes(searchText)));
    }
    
    const tableData = filteredRecords.map((r, i) => [i + 1, r.name || '-', r.nationalId || '-', r.type || '-', r.case || '-', r.time || '-']);
    
    doc.autoTable({
        head: [['م', 'الاسم', 'الرقم القومي', 'نوع الجريمة', 'رقم القضية', 'التاريخ']],
        body: tableData,
        startY: 35,
        theme: 'striped',
        headStyles: { fillColor: [102, 126, 234], textColor: 255, fontStyle: 'bold' },
        styles: { font: 'arial', fontSize: 9, textAlign: 'center' },
        alternateRowStyles: { fillColor: [245, 245, 245] }
    });
    
    doc.save(`records_report_${new Date().getTime()}.pdf`);
    logActivity(`قام بتصدير تقرير البيانات PDF`);
    showAlert("تم تصدير التقرير بنجاح", "success");
}
