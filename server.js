
const express = require('express');
const db = require('./database');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// ===================================
// READ - Get all students
// ===================================
app.get('/api/students', (req, res) => {
    db.all('SELECT * FROM students ORDER BY id DESC', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.json(rows);
    });
});

// ===================================
// CREATE - Add a new student
// ===================================
app.post('/api/students', (req, res) => {
    const { name, course, year_level, email } = req.body;

    if (!name || !course || !year_level || !email) {
        return res.status(400).json({
            error: 'All fields are required.'
        });
    }

    const sql = `
        INSERT INTO students (name, course, year_level, email)
        VALUES (?, ?, ?, ?)
    `;

    db.run(sql, [name, course, year_level, email], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.status(201).json({
            message: 'Student added successfully!',
            id: this.lastID
        });
    });
});

// ===================================
// UPDATE - Edit a student
// ===================================
app.put('/api/students/:id', (req, res) => {
    const { name, course, year_level, email } = req.body;
    const id = req.params.id;

    if (!name || !course || !year_level || !email) {
        return res.status(400).json({
            error: 'All fields are required.'
        });
    }

    const sql = `
        UPDATE students
        SET name = ?, course = ?, year_level = ?, email = ?
        WHERE id = ?
    `;

    db.run(sql, [name, course, year_level, email, id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (this.changes === 0) {
            return res.status(404).json({
                error: 'Student not found.'
            });
        }

        res.json({
            message: 'Student updated successfully!'
        });
    });
});

// ===================================
// DELETE - Remove a student
// ===================================
app.delete('/api/students/:id', (req, res) => {
    const id = req.params.id;

    db.run('DELETE FROM students WHERE id = ?', [id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (this.changes === 0) {
            return res.status(404).json({
                error: 'Student not found.'
            });
        }

        res.json({
            message: 'Student deleted successfully!'
        });
    });
});

// ===================================
// Start the server
// ===================================
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
