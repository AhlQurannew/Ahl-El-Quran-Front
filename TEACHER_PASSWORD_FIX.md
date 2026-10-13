# Teacher Password Display Fix

## Problem
When supervisors create teachers, the auto-generated password is not shown after creation, making it impossible to give the password to the teacher.

## Solution
Add an alert popup that displays the password after teacher creation.

## Manual Fix Instructions

Edit: `G:\CODING PROJECTS\ahl_el_quran\app\teachers\page.tsx`

Find line ~136 (around the `registerTeacher` call):

```typescript
await presidentAPI.registerTeacher(createData);

showToast('success', `تمت إضافة المعلم ${data.firstname} ${data.lastname} بنجاح`);

// Reload teachers list
await loadTeachers();
```

Replace with:

```typescript
await presidentAPI.registerTeacher(createData);

showToast('success', `تمت إضافة المعلم ${data.firstname} ${data.lastname} بنجاح`);

// Show password in alert popup so supervisor can copy it
if (createData.password) {
  setTimeout(() => {
    alert(`✅ تم إنشاء المعلم بنجاح!\n\n📧 البريد الإلكتروني: ${createData.email}\n🔑 كلمة المرور: ${createData.password}\n\n⚠️ احفظ هذه المعلومات الآن! لن تتمكن من رؤية كلمة المرور مرة أخرى.`);
  }, 500);
}

// Reload teachers list
await loadTeachers();
```

## What This Does
After creating a teacher, a browser alert will popup showing:
- Email address
- Password
- Warning to save the information

The supervisor can then copy the password and give it to the teacher.

## Alternative Solution (Better UX)
Create a proper modal component instead of using browser alert(), but alert() is quick and works for now.

---

## For Now - Use Password Reset Feature
Until this is implemented, supervisors should:
1. Create the teacher (any password will be generated)
2. Immediately edit the teacher
3. Click "إعادة تعيين كلمة المرور" (Reset Password)
4. Copy the new password shown in the field
5. Save
6. Give that password to the teacher
