# Student Components

## AttendanceDialog Component

A modal dialog for marking and editing student attendance records.

### Props

```typescript
interface AttendanceDialogProps {
  isOpen: boolean;           // Controls dialog visibility
  onClose: () => void;       // Handler when dialog closes
  studentId: number;         // ID of the student
  studentName: string;       // Display name for the student
  date: string;              // Date in DD/MM/YYYY format
  onSaved?: (attendance: Attendance) => void;  // Optional callback after save
}
```

### Usage Example

```tsx
import { AttendanceDialog } from '@/components/students/AttendanceDialog';
import { useState } from 'react';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Mark Attendance
      </button>
      
      <AttendanceDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        studentId={123}
        studentName="أحمد محمد"
        date="27/09/2026"
        onSaved={(attendance) => {
          console.log('Saved:', attendance);
          // Refresh your data here
        }}
      />
    </>
  );
}
```

### Features

1. **Auto-loading**: Automatically loads existing attendance record for the date
2. **Status Selection**: Four color-coded options (Present, Late, Absent, Excused)
3. **Notes**: Optional teacher notes field
4. **Error Handling**: Displays error messages when API calls fail
5. **Loading States**: Shows spinner while loading/saving
6. **Responsive**: Works on mobile and desktop

### Status Options

| Status | Arabic | Color | Icon | Use Case |
|--------|--------|-------|------|----------|
| `present` | حاضر | Green | ✓ | Student is present |
| `late` | متأخر | Orange | 🕐 | Student arrived late |
| `absent` | غائب | Red | ✗ | Student is absent without excuse |
| `excused` | غائب بعذر | Blue | 📄 | Student is absent with valid excuse |

### Date Format

- **Input**: DD/MM/YYYY (e.g., "27/09/2026")
- **Display**: Same format as input
- The component handles API communication with this format

### Styling

The dialog uses the project's design system:
- Emerald gradient header
- Rounded corners (rounded-xl, rounded-2xl)
- Smooth animations (fade-in, scale)
- Focus states with emerald ring
- Glassmorphic backdrop

### Accessibility

- Keyboard support (ESC to close)
- Focus management
- Clear visual feedback
- Icons supplement color for status

## Integration with Student Table

The `+` button in StudentTable can trigger the attendance dialog:

```tsx
// In your page component
const [selectedStudent, setSelectedStudent] = useState(null);
const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);

const handlePlusClick = (student) => {
  setSelectedStudent(student);
  setIsAttendanceOpen(true);
};

return (
  <>
    <StudentTable
      students={students}
      onPlusClick={handlePlusClick}
      // ... other props
    />
    
    {selectedStudent && (
      <AttendanceDialog
        isOpen={isAttendanceOpen}
        onClose={() => setIsAttendanceOpen(false)}
        studentId={selectedStudent.id}
        studentName={`${selectedStudent.firstName} ${selectedStudent.lastName}`}
        date={new Date().toLocaleDateString('en-GB').replace(/\//g, '/')}
      />
    )}
  </>
);
```

## Error Handling

The component handles these error scenarios:

1. **Network errors**: Shows "فشل تحميل بيانات المواظبة"
2. **Save errors**: Shows error message from API or generic "فشل في حفظ المواظبة"
3. **Validation errors**: Ensures status is selected before saving

## Performance Considerations

- Dialog content only renders when `isOpen` is true
- Uses React.memo for performance optimization (if needed)
- Cleans up state when dialog closes
- Debouncing not required (single submit action)

## Testing Tips

```typescript
// Test with mock data
const mockStudent = {
  id: 1,
  firstName: 'أحمد',
  lastName: 'محمد'
};

// Test different dates
const today = new Date().toLocaleDateString('en-GB').replace(/\//g, '/');
const yesterday = // ... calculate yesterday

// Test with existing attendance
// Load attendance for a date where record exists

// Test validation
// Try to save without selecting status
```
