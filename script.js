
const studentTableBody = document.getElementById('studentTableBody');
const studentModal = document.getElementById('studentModal');
const studentForm = document.getElementById('studentForm');

const addStudentBtn = document.getElementById('addStudentBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelBtn = document.getElementById('cancelBtn');

const searchInput = document.getElementById('searchInput');
const modalTitle = document.getElementById('modalTitle');

let students = [];

// ===================================
// ESCAPE HTML
// ===================================
function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => {
        const entities = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        };

        return entities[character];
    });
}

// ===================================
// LOAD STUDENTS FROM DATABASE
// ===================================
async function loadStudents() {
    try {
        const response = await fetch('/api/students');

        if (!response.ok) {
            throw new Error('Failed to load students.');
        }

        students = await response.json();

        displayStudents(students);
        updateDashboard();
    } catch (error) {
        console.error('Error loading students:', error);

        studentTableBody.innerHTML = `
            <tr>
                <td colspan="6">
                    Unable to load student records.
                </td>
            </tr>
        `;
    }
}


function formatYearLevel(level) {
    const suffix = {
        1: 'st',
        2: 'nd',
        3: 'rd'
    }[level] || 'th';

    return `${level}${suffix} Year`;
}

function displayStudents(studentList) {
    if (studentList.length === 0) {
        studentTableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center;">
                    No student records found.
                </td>
            </tr>
        `;

        return;
    }

    studentTableBody.innerHTML = studentList.map(student => `
        <tr>
            <td>${escapeHTML(student.id)}</td>

            <td>${escapeHTML(student.name)}</td>

            <td>${escapeHTML(student.course)}</td>

          <td>${escapeHTML(formatYearLevel(student.year_level))}</td>

            <td>${escapeHTML(student.email)}</td>

            <td>
                <button
                    class="action-btn edit-btn"
                    data-id="${escapeHTML(student.id)}"
                    title="Edit Student">
                    <i class="fas fa-edit"></i>
                </button>

                <button
                    class="action-btn delete-btn"
                    data-id="${escapeHTML(student.id)}"
                    title="Delete Student">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// ===================================
// UPDATE DASHBOARD STATISTICS
// ===================================
function updateDashboard() {
    document.getElementById('totalStudents').textContent =
        students.length;

    const currentDate = new Date();

    const newStudents = students.filter(student => {
        const createdDate = new Date(student.created_at);

        return (
            createdDate.getMonth() === currentDate.getMonth() &&
            createdDate.getFullYear() === currentDate.getFullYear()
        );
    });

    document.getElementById('newStudents').textContent =
        newStudents.length;

    const courses = [...new Set(
        students.map(student => student.course)
    )];

    document.getElementById('totalCourses').textContent =
        courses.length;
}

// ===================================
// OPEN ADD STUDENT MODAL
// ===================================
addStudentBtn.addEventListener('click', () => {
    studentForm.reset();

    document.getElementById('studentId').value = '';

    modalTitle.textContent = 'Add New Student';

    studentModal.style.display = 'flex';
});

// ===================================
// CLOSE MODAL
// ===================================
function closeModal() {
    studentModal.style.display = 'none';
}

closeModalBtn.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);

studentModal.addEventListener('click', (event) => {
    if (event.target === studentModal) {
        closeModal();
    }
});

// ===================================
// ADD OR UPDATE STUDENT
// ===================================
studentForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const id = document.getElementById('studentId').value;

    const studentData = {
        name: document.getElementById('name').value.trim(),
        course: document.getElementById('course').value,
        year_level: Number(
            document.getElementById('year_level').value
        ),
        email: document.getElementById('email').value.trim()
    };

    const url = id
        ? `/api/students/${id}`
        : '/api/students';

    const method = id ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(studentData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Operation failed.');
        }

        alert(result.message);

        closeModal();

        studentForm.reset();

        await loadStudents();

    } catch (error) {
        alert(error.message);
    }
});

// ===================================
// EDIT OR DELETE STUDENT
// ===================================
studentTableBody.addEventListener('click', async (event) => {
    const editButton = event.target.closest('.edit-btn');
    const deleteButton = event.target.closest('.delete-btn');

    // EDIT STUDENT
    if (editButton) {
        const id = editButton.dataset.id;

        const student = students.find(
            student => String(student.id) === String(id)
        );

        if (!student) {
            return;
        }

        document.getElementById('studentId').value =
            student.id;

        document.getElementById('name').value =
            student.name;

        document.getElementById('course').value =
            student.course;

        document.getElementById('year_level').value =
            student.year_level;

        document.getElementById('email').value =
            student.email;

        modalTitle.textContent = 'Edit Student';

        studentModal.style.display = 'flex';
    }

    // DELETE STUDENT
    if (deleteButton) {
        const id = deleteButton.dataset.id;

        const confirmed = confirm(
            'Are you sure you want to delete this student?'
        );

        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch(
                `/api/students/${id}`,
                {
                    method: 'DELETE'
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.error || 'Failed to delete student.'
                );
            }

            alert(result.message);

            await loadStudents();

        } catch (error) {
            alert(error.message);
        }
    }
});

// ===================================
// SEARCH STUDENTS
// ===================================
searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase().trim();

    const filteredStudents = students.filter(student => {
        return (
            student.name.toLowerCase().includes(searchTerm) ||
            student.course.toLowerCase().includes(searchTerm) ||
            student.email.toLowerCase().includes(searchTerm)
        );
    });

    displayStudents(filteredStudents);
});

// ===================================
// INITIALIZE DASHBOARD
// ===================================
loadStudents();