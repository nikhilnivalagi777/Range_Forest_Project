const express = require("express");
const mysql = require("mysql");
const path = require("path");
const app = express();


const multer = require("multer");
const XLSX = require("xlsx");
const fs = require("fs");
const upload = multer({
    dest: path.join(__dirname, "uploads")
});

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/login.html");
});
app.get("/master.html", (req, res) => {
    res.sendFile(__dirname + "/public/master.html");
});

app.get("/estimate.html", (req, res) => {
    res.sendFile(__dirname + "/public/estimate.html");
});

// DEFAULT LOGIN PAGE
app.post("/login", (req, res) => {

    const { username, password } = req.body;

    const sql = "SELECT * FROM users WHERE username = ? AND password = ?";

    db.query(sql, [username, password], (err, result) => {

        if (err) {
            console.log("LOGIN ERROR:", err);
            return res.json({ success: false });
        }

        if (result.length === 0) {
            return res.json({ success: false, message: "Invalid login" });
        }

        const user = result[0];

        res.json({
            success: true,
            user_id: user.id,
            username: user.username,
            role: user.role
        });

    });

});

// MYSQL CONNECTION
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "forest_db"
});

db.connect(err => {
    if (err) {
        console.log("DB Error:", err);
    } else {
        console.log("MySQL Connected");
    }
});

//ssr only admin
app.post("/upload-ssr-master-excel", upload.single("ssr_file"), (req, res) => {
    const user_id = req.body.user_id;

    if (!user_id) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        return res.json({ success: false, message: "User not logged in" });
    }

    db.query("SELECT role FROM users WHERE id = ? LIMIT 1", [user_id], (userErr, userRows) => {
        if (userErr) {
            if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            console.log("CHECK ADMIN ERROR:", userErr);
            return res.json({ success: false, message: "Failed to verify user" });
        }

        if (!userRows || userRows.length === 0) {
            if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            return res.json({ success: false, message: "User not found" });
        }

        if (userRows[0].role !== "admin") {
            if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            return res.json({ success: false, message: "Only admin can upload SSR master" });
        }

        if (!req.file) {
            return res.json({ success: false, message: "No file uploaded" });
        }

        const filePath = req.file.path;

        try {
            const workbook = XLSX.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

            if (!rows || rows.length === 0) {
                fs.unlinkSync(filePath);
                return res.json({ success: false, message: "Excel file is empty" });
            }

            const values = [];

            rows.forEach((row) => {
                const sr_no = String(row.sr_no || row["sr_no"] || row["SR_NO"] || "").trim();
                const description = String(row.description || row["description"] || row["DESCRIPTION"] || "").trim();
                const unit = String(row.unit || row["unit"] || row["UNIT"] || "").trim();
                const rate = parseFloat(row.rate || row["rate"] || row["RATE"] || 0) || 0;

                if (!sr_no || !description) return;

                values.push([sr_no, description, unit, rate]);
            });

            if (values.length === 0) {
                fs.unlinkSync(filePath);
                return res.json({ success: false, message: "No valid rows found in Excel" });
            }

            const clearSql = "TRUNCATE TABLE ssr_master";
            const insertSql = `
                INSERT INTO ssr_master (sr_no, description, unit, rate)
                VALUES ?
            `;

            db.query(clearSql, (clearErr) => {
                if (clearErr) {
                    fs.unlinkSync(filePath);
                    console.log("CLEAR SSR MASTER ERROR:", clearErr);
                    return res.json({ success: false, message: "Failed to clear old SSR data" });
                }

                db.query(insertSql, [values], (err) => {
                    fs.unlinkSync(filePath);

                    if (err) {
                        console.log("UPLOAD SSR MASTER EXCEL ERROR:", err);
                        return res.json({ success: false, message: "Database insert failed" });
                    }

                    res.json({
                        success: true,
                        message: values.length + " SSR rows uploaded successfully"
                    });
                });
            });

        } catch (error) {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }

            console.log("READ SSR EXCEL ERROR:", error);
            res.json({ success: false, message: "Failed to read Excel file" });
        }
    });
});


// SAVE RANGE
app.post("/save-range", (req, res) => {
    console.log("SAVE RANGE BODY FROM BACKEND:", req.body);

    let {
        user_id,
        division,
        sub_division,
        range_name,
        range_id,
        rfo_name,
        acf_name,
        cert1,
        cert2,
        cert3,
        acf_recommendation
    } = req.body;

    if (!user_id) {
        return res.send("User not logged in");
    }

    const sql = `
        INSERT INTO ranges (
            division,
            sub_division,
            range_name,
            range_id,
            rfo_name,
            acf_name,
            cert1,
            cert2,
            cert3,
            acf_recommendation,
            user_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        division,
        sub_division,
        range_name,
        range_id,
        rfo_name,
        acf_name,
        cert1,
        cert2,
        cert3,
        acf_recommendation,
        user_id
    ];

    console.log("SAVE RANGE SQL VALUES:", values);

    db.query(sql, values, (err, result) => {
        if (err) {
            console.log("SAVE RANGE ERROR:", err);
            return res.send("Error saving range");
        }

        console.log("SAVE RANGE RESULT:", result);
        res.send("Range Saved Successfully");
    });
});

// ================= SSR SAVE =================
app.post("/add-ssr", (req, res) => {

    const { sr_no, description, unit, rate } = req.body;

    const sql = "INSERT INTO ssr_master (sr_no, description, unit, rate) VALUES (?, ?, ?, ?)";

    db.query(sql, [sr_no, description, unit, rate], (err, result) => {
        if (err) {
            console.log("Error inserting SSR:", err);
            return res.status(500).send("Database error");
        }
        res.send("SSR Saved");
    });

});

// ================= section SAVE =================
app.post("/add-section", (req, res) => {

    let section_name = req.body.section_name;
    let user_id = req.body.user_id;

    console.log("ADD SECTION BODY:", req.body);

    if (!user_id) {
        return res.send("User not logged in");
    }

    if (!section_name || section_name.trim() === "") {
        return res.send("Enter section name");
    }

    const sql = "INSERT INTO section_master (section_name, user_id) VALUES (?, ?)";

    db.query(sql, [section_name, user_id], (err, result) => {
        if (err) {
            console.log("SAVE SECTION ERROR:", err);
            return res.send("Error saving section");
        }

        res.send("Section Saved");
    });
});

// ================= HOA SAVE =================
app.post("/add-hoa", (req, res) => {

    let hoa_name = req.body.hoa_name;
    let user_id = req.body.user_id;

    console.log("ADD HOA BODY:", req.body);

    if (!user_id) {
        return res.send("User not logged in");
    }

    if (!hoa_name || hoa_name.trim() === "") {
        return res.send("Enter HOA name");
    }

    const sql = "INSERT INTO hoa (hoa_name, user_id) VALUES (?, ?)";

    db.query(sql, [hoa_name, user_id], (err, result) => {
        if (err) {
            console.log("SAVE HOA ERROR:", err);
            return res.send("Error saving HOA");
        }

        res.send("HOA Saved");
    });
});


// ================= WORK SAVE =================
app.post("/add-work", (req, res) => {

    const { user_id, work_name } = req.body;

    console.log("ADD WORK BODY:", req.body);

    const sql = "INSERT INTO works (user_id, work_name) VALUES (?, ?)";

    db.query(sql, [user_id, work_name], (err, result) => {
        if (err) {
            console.log("SAVE WORK ERROR:", err);
            return res.send("Error saving work");
        }

        res.send("Work saved successfully");
    });
});

// GET SSR BY SSR NO
app.get("/search-ssr/:term", (req, res) => {
    const term = req.params.term.trim();

    const sql = `
        SELECT sr_no, description, unit, rate
        FROM ssr_master
        WHERE sr_no LIKE ?
        ORDER BY sr_no
        LIMIT 20
    `;

    db.query(sql, [term + "%"], (err, result) => {
        if (err) {
            console.log("SSR SEARCH ERROR:", err);
            return res.json({
                success: false,
                data: []
            });
        }

        console.log("SSR SEARCH TERM:", term);
        console.log("SSR SEARCH RESULT:", result);

        res.json({
            success: true,
            data: result
        });
    });
});

// OPTIONAL: GET ALL WORKS
app.get("/get-works", (req, res) => {
    const user_id = req.query.user_id;

    db.query("SELECT work_name FROM works WHERE user_id = ? ORDER BY work_name", [user_id], (err, result) => {
        if (err) {
            console.log("GET WORKS ERROR:", err);
            return res.json({ success: false, data: [] });
        }

        res.json({ success: true, data: result });
    });
});


app.get("/get-masters", (req, res) => {
    const user_id = req.query.user_id;

    if (!user_id) {
        return res.json({ success: false, message: "User not logged in" });
    }

    const data = {};

    db.query("SELECT DISTINCT year FROM year_master ORDER BY year", (err, yearResult) => {
        if (err) {
            console.log("GET YEARS ERROR:", err);
            return res.json({ success: false });
        }

        data.year = yearResult;

        db.query("SELECT DISTINCT estimate_type FROM estimate_type_master ORDER BY estimate_type", (err2, typeResult) => {
            if (err2) {
                console.log("GET ESTIMATE TYPES ERROR:", err2);
                return res.json({ success: false });
            }

            data.type = typeResult;

            db.query("SELECT work_name FROM works WHERE user_id = ? ORDER BY work_name", [user_id], (err3, workResult) => {
                if (err3) {
                    console.log("GET WORKS ERROR:", err3);
                    return res.json({ success: false });
                }

                data.work = workResult;

                db.query("SELECT hoa_name FROM hoa WHERE user_id = ? ORDER BY hoa_name", [user_id], (err4, hoaResult) => {
                    if (err4) {
                        console.log("GET HOA ERROR:", err4);
                        return res.json({ success: false });
                    }

                    data.hoa = hoaResult;

                    db.query("SELECT section_name FROM section_master WHERE user_id = ? ORDER BY section_name", [user_id], (err5, sectionResult) => {
                        if (err5) {
                            console.log("GET SECTION ERROR:", err5);
                            return res.json({ success: false });
                        }

                        data.section = sectionResult;

                        res.json({
                            success: true,
                            data: data
                        });
                    });
                });
            });
        });
    });
});
app.get("/next-est-no", (req, res) => {
    const user_id = req.query.user_id;

    console.log("NEXT EST NO USER_ID:", user_id);

    if (!user_id) {
        return res.json({ success: false, est_no: 1, message: "user_id required" });
    }

    const sql = `
        SELECT MAX(CAST(est_no AS UNSIGNED)) AS maxNo
        FROM estimate_details
        WHERE user_id = ?
    `;

    db.query(sql, [user_id], (err, result) => {
        if (err) {
            console.log("NEXT EST NO ERROR:", err);
            return res.json({ success: true, est_no: 1 });
        }

        console.log("NEXT EST NO RESULT:", result);

        const nextNo = ((result[0].maxNo || 0) + 1);

        res.json({
            success: true,
            est_no: nextNo
        });
    });
});


// ================= GET RANGE INFO =================
app.get("/get-range-info", (req, res) => {
    const user_id = req.query.user_id;

    const sql = `
        SELECT *
        FROM ranges
        WHERE user_id = ?
        LIMIT 1
    `;

    db.query(sql, [user_id], (err, rows) => {
        if (err) {
            console.log("GET RANGE INFO ERROR:", err);
            return res.json({ success: false, message: "Failed to load range info" });
        }

        if (!rows || rows.length === 0) {
            return res.json({ success: true, data: null });
        }

        res.json({ success: true, data: rows[0] });
    });
});

// ================= SAVE RANGE INFO =================
app.post("/save-range-info", (req, res) => {
    const {
        user_id,
        division,
        sub_division,
        range_name,
        range_id,
        rfo_name,
        acf_name,
        cert1,
        cert2,
        cert3,
        acf_recommendation
    } = req.body;

    const checkSql = "SELECT id FROM ranges WHERE user_id = ? LIMIT 1";

    db.query(checkSql, [user_id], (checkErr, checkRows) => {
        if (checkErr) {
            console.log("CHECK RANGE INFO ERROR:", checkErr);
            return res.json({ success: false, message: "Save failed" });
        }

        if (checkRows && checkRows.length > 0) {
            const updateSql = `
                UPDATE ranges
                SET division = ?, sub_division = ?, range_name = ?, range_id = ?,
                    rfo_name = ?, acf_name = ?, cert1 = ?, cert2 = ?, cert3 = ?, acf_recommendation = ?
                WHERE user_id = ?
            `;

            db.query(
                updateSql,
                [division, sub_division, range_name, range_id, rfo_name, acf_name, cert1, cert2, cert3, acf_recommendation, user_id],
                (err) => {
                    if (err) {
                        console.log("UPDATE RANGE INFO ERROR:", err);
                        return res.json({ success: false, message: "Update failed" });
                    }

                    res.json({ success: true, message: "Range info updated successfully" });
                }
            );
        } else {
            const insertSql = `
                INSERT INTO ranges (
                    division,
                    sub_division,
                    range_name,
                    range_id,
                    rfo_name,
                    acf_name,
                    cert1,
                    cert2,
                    cert3,
                    acf_recommendation,
                    user_id
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            db.query(
                insertSql,
                [division, sub_division, range_name, range_id, rfo_name, acf_name, cert1, cert2, cert3, acf_recommendation, user_id],
                (err) => {
                    if (err) {
                        console.log("INSERT RANGE INFO ERROR:", err);
                        return res.json({ success: false, message: "Insert failed" });
                    }

                    res.json({ success: true, message: "Range info saved successfully" });
                }
            );
        }
    });
});


// ================= UPDATE RANGE INFO =================
app.post("/update-range", (req, res) => {
    const {
        user_id,
        division,
        sub_division,
        range_name,
        range_id,
        rfo_name,
        acf_name,
        cert1,
        cert2,
        cert3,
        acf_recommendation
    } = req.body;

    if (!user_id) {
        return res.json({ success: false, message: "User not logged in" });
    }

    const sql = `
        UPDATE ranges
        SET
            division = ?,
            sub_division = ?,
            range_name = ?,
            range_id = ?,
            rfo_name = ?,
            acf_name = ?,
            cert1 = ?,
            cert2 = ?,
            cert3 = ?,
            acf_recommendation = ?
        WHERE user_id = ?
    `;

    db.query(sql, [
        division,
        sub_division,
        range_name,
        range_id,
        rfo_name,
        acf_name,
        cert1,
        cert2,
        cert3,
        acf_recommendation,
        user_id
    ], (err, result) => {
        if (err) {
            console.log("UPDATE RANGE ERROR:", err);
            return res.json({ success: false, message: "Update failed" });
        }

        res.json({ success: true, message: "Range updated successfully" });
    });
});






                        // ESTIMATE MODULE
app.post("/save-estimate", (req, res) => {
    const d = req.body;

    console.log("SAVE ESTIMATE BODY STRING:", JSON.stringify(d, null, 2));

    const sql = `
    INSERT INTO estimate_details (
        user_id,
        est_no,
        year,
        estimate_type,
        constituency,
        section,
        circle,
        division,
        subdivision,
        range_name,
        taluk,
        work,
        head_of_account,
        location,
        extent,
        model,
        vfc,
        brush_wood_fence,
        cpt_length,
        bw,
        sw,
        asset_id,
        sanction_authority,
        species,
        pit_size,
        seedling_size,
        working_circle,
        total_amount,
        balance_amount,
        trenches,
        seedlings
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

    const values = [
    d.user_id || 0,
    d.est_no || "",
    d.year || "",
    d.estimate_type || "",
    d.constituency || "",
    d.section || "",
    d.circle || "",
    d.division || "",
    d.subdivision || "",
    d.range_name || "",
    d.taluk || "",
    d.work || "",
    d.head_of_account || "",
    d.location || "",
    d.extent || "",
    d.model || "",
    d.vfc || "",
    d.brush_wood_fence || "",
    d.cpt_length || "",
    d.bw || "",
    d.sw || "",
    d.asset_id || "",
    d.sanction_authority || "",
    d.species || "",
    d.pit_size || "",
    d.seedling_size || "",
    d.working_circle || "",
    d.total_amount || 0,
    d.balance_amount || 0,
    JSON.stringify(d.trenches || []),
    JSON.stringify(d.seedlings || [])
];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.log("SAVE ESTIMATE ERROR:", err);
            return res.json({ success: false, message: "Estimate header save failed" });
        }

        const estimateId = result.insertId;

        if (!d.ssrItems || d.ssrItems.length === 0) {
            return res.json({ success: true, estimate_id: estimateId });
        }

        const itemSql = `
            INSERT INTO estimate_ssr_items
            (estimate_id, sr_no, description, qty, unit, rate, rate_per, days, amount)
            VALUES ?
        `;

        const itemValues = d.ssrItems.map(item => [
            estimateId,
            item.sr_no || "",
            item.description || "",
            item.qty || 0,
            item.unit || "",
            item.rate || 0,
            item.rate_per || 1,
            item.days || 1,
            item.amount || 0
        ]);

        db.query(itemSql, [itemValues], (itemErr) => {
            if (itemErr) {
                console.log("SAVE SSR ERROR:", itemErr);
                return res.json({ success: false, message: "SSR items save failed" });
            }

            res.json({ success: true, estimate_id: estimateId });
        });
    });
});

app.get("/get-estimates", (req, res) => {
    const search = req.query.search ? req.query.search.trim() : "";
    const user_id = req.query.user_id;

    let sql = `
        SELECT *
        FROM estimate_details
        WHERE user_id = ?
    `;

    let values = [user_id];

    if (search !== "") {
        sql += ` AND (est_no LIKE ? OR work LIKE ?) `;
        values.push(`%${search}%`, `%${search}%`);
    }

    sql += ` ORDER BY id DESC`;

    db.query(sql, values, (err, result) => {
        if (err) {
            console.log("GET ESTIMATES ERROR:", err);
            return res.json({ success: false, data: [] });
        }

        res.json({ success: true, data: result });
    });
});


app.get("/get-estimate/:id", (req, res) => {
    const id = req.params.id;

    const sql1 = "SELECT * FROM estimate_details WHERE id = ? LIMIT 1";
    const sql2 = "SELECT * FROM estimate_ssr_items WHERE estimate_id = ? ORDER BY id ASC";

    db.query(sql1, [id], (err, estimateRows) => {
        if (err) {
            console.log("GET ESTIMATE ERROR:", err);
            return res.json({ success: false });
        }

        if (!estimateRows || estimateRows.length === 0) {
            return res.json({ success: false, message: "Estimate not found" });
        }

        db.query(sql2, [id], (err2, ssrRows) => {
            if (err2) {
                console.log("GET ESTIMATE SSR ERROR:", err2);
                return res.json({ success: false });
            }

            res.json({
                success: true,
                estimate: estimateRows[0],
                ssrItems: ssrRows || []
            });
        });
    });
});

app.get("/get-estimate-for-edit/:id", (req, res) => {
    const id = req.params.id;
    const user_id = req.query.user_id;

    const sql1 = "SELECT * FROM estimate_details WHERE id = ? AND user_id = ? LIMIT 1";
    const sql2 = "SELECT * FROM estimate_ssr_items WHERE estimate_id = ? ORDER BY id ASC";

    db.query(sql1, [id, user_id], (err, estimateRows) => {
        if (err) {
            console.log("GET EDIT ESTIMATE ERROR:", err);
            return res.json({ success: false });
        }

        if (!estimateRows || estimateRows.length === 0) {
            return res.json({ success: false, message: "Estimate not found" });
        }

        db.query(sql2, [id], (err2, ssrRows) => {
            if (err2) {
                console.log("GET EDIT SSR ERROR:", err2);
                return res.json({ success: false });
            }

            res.json({
                success: true,
                estimate: estimateRows[0],
                ssrItems: ssrRows || []
            });
        });
    });
});

app.post("/update-estimate/:id", (req, res) => {
    const id = req.params.id;
    const d = req.body;

    const checkSql = "SELECT id FROM estimate_details WHERE id = ? AND user_id = ? LIMIT 1";

    db.query(checkSql, [id, d.user_id], (checkErr, checkRows) => {
        if (checkErr) {
            console.log("CHECK ESTIMATE OWNER ERROR:", checkErr);
            return res.json({ success: false, message: "Update failed" });
        }

        if (!checkRows || checkRows.length === 0) {
            return res.json({ success: false, message: "Estimate not found" });
        }

        const sql = `
            UPDATE estimate_details SET
                est_no = ?,
                year = ?,
                estimate_type = ?,
                constituency = ?,
                section = ?,
                circle = ?,
                division = ?,
                subdivision = ?,
                range_name = ?,
                taluk = ?,
                work = ?,
                head_of_account = ?,
                location = ?,
                extent = ?,
                model = ?,
                vfc = ?,
                brush_wood_fence = ?,
                cpt_length = ?,
                bw = ?,
                sw = ?,
                asset_id = ?,
                sanction_authority = ?,
                species = ?,
                pit_size = ?,
                seedling_size = ?,
                working_circle = ?,
                total_amount = ?,
                balance_amount = ?,
                trenches = ?,
                seedlings = ?
            WHERE id = ? AND user_id = ?
        `;

        const values = [
            d.est_no || "",
            d.year || "",
            d.estimate_type || "",
            d.constituency || "",
            d.section || "",
            d.circle || "",
            d.division || "",
            d.subdivision || "",
            d.range_name || "",
            d.taluk || "",
            d.work || "",
            d.head_of_account || "",
            d.location || "",
            d.extent || "",
            d.model || "",
            d.vfc || "",
            d.brush_wood_fence || "",
            d.cpt_length || "",
            d.bw || "",
            d.sw || "",
            d.asset_id || "",
            d.sanction_authority || "",
            d.species || "",
            d.pit_size || "",
            d.seedling_size || "",
            d.working_circle || "",
            d.total_amount || 0,
            d.balance_amount || 0,
            JSON.stringify(d.trenches || []),
            JSON.stringify(d.seedlings || []),
            id,
            d.user_id
        ];

        db.query(sql, values, (err) => {
            if (err) {
                console.log("UPDATE ESTIMATE ERROR:", err);
                return res.json({ success: false, message: "Estimate update failed" });
            }

            db.query("DELETE FROM estimate_ssr_items WHERE estimate_id = ?", [id], (err2) => {
                if (err2) {
                    console.log("DELETE OLD SSR ERROR:", err2);
                    return res.json({ success: false, message: "Old SSR delete failed" });
                }

                if (!d.ssrItems || d.ssrItems.length === 0) {
                    return res.json({ success: true });
                }

                const itemSql = `
                    INSERT INTO estimate_ssr_items
                    (estimate_id, sr_no, description, qty, unit, rate, rate_per, days, amount)
                    VALUES ?
                `;

                const itemValues = d.ssrItems.map(item => [
                    id,
                    item.sr_no || "",
                    item.description || "",
                    item.qty || 0,
                    item.unit || "",
                    item.rate || 0,
                    item.rate_per || 1,
                    item.days || 1,
                    item.amount || 0
                ]);

                db.query(itemSql, [itemValues], (err3) => {
                    if (err3) {
                        console.log("UPDATE SSR INSERT ERROR:", err3);
                        return res.json({ success: false, message: "SSR update failed" });
                    }

                    res.json({ success: true, message: "Estimate updated successfully" });
                });
            });
        });
    });
});

app.post("/delete-estimate/:id", (req, res) => {
    const id = req.params.id;
    const user_id = req.body.user_id;

    const checkSql = "SELECT id FROM estimate_details WHERE id = ? AND user_id = ? LIMIT 1";

    db.query(checkSql, [id, user_id], (checkErr, checkRows) => {
        if (checkErr) {
            console.log("CHECK DELETE OWNER ERROR:", checkErr);
            return res.json({ success: false, message: "Delete failed" });
        }

        if (!checkRows || checkRows.length === 0) {
            return res.json({ success: false, message: "Estimate not found" });
        }

        db.query("DELETE FROM estimate_ssr_items WHERE estimate_id = ?", [id], (err) => {
            if (err) {
                console.log("DELETE SSR ERROR:", err);
                return res.json({ success: false, message: "Failed to delete SSR items" });
            }

            db.query("DELETE FROM estimate_details WHERE id = ? AND user_id = ?", [id, user_id], (err2) => {
                if (err2) {
                    console.log("DELETE ESTIMATE ERROR:", err2);
                    return res.json({ success: false, message: "Failed to delete estimate" });
                }

                res.json({ success: true, message: "Estimate deleted successfully" });
            });
        });
    });
});

app.get("/get-ranges", (req, res) => {

    const user_id = req.query.user_id;

    const sql = "SELECT * FROM ranges WHERE user_id = ?";

    db.query(sql, [user_id], (err, result) => {
        if (err) {
            console.log(err);
            return res.json({ success: false });
        }

        res.json({ success: true, data: result });
    });
});

app.get("/get-sections", (req, res) => {
    const user_id = req.query.user_id;

    const sql = "SELECT * FROM section_master WHERE user_id = ? ORDER BY section_name";

    db.query(sql, [user_id], (err, result) => {
        if (err) {
            console.log("GET SECTIONS ERROR:", err);
            return res.json({ success: false, data: [] });
        }

        res.json({ success: true, data: result });
    });
});

app.get("/get-works", (req, res) => {
    const user_id = req.query.user_id;

    const sql = "SELECT * FROM works WHERE user_id = ? ORDER BY work_name";

    db.query(sql, [user_id], (err, result) => {
        if (err) {
            console.log("GET WORKS ERROR:", err);
            return res.json({ success: false, data: [] });
        }

        res.json({ success: true, data: result });
    });
});

app.get("/get-hoa", (req, res) => {
    const user_id = req.query.user_id;

    db.query("SELECT hoa_name FROM hoa WHERE user_id = ? ORDER BY hoa_name", [user_id], (err, result) => {
        if (err) {
            console.log("GET HOA ERROR:", err);
            return res.json({ success: false, data: [] });
        }

        res.json({ success: true, data: result });
    });
});

                    // INDENT MODULE
app.get("/get-unsanctioned-estimates", (req, res) => {
    const search = req.query.search ? req.query.search.trim() : "";
    const user_id = req.query.user_id;

    let sql = `
        SELECT e.id, e.est_no, e.year, e.estimate_type, e.work, e.total_amount, e.created_at
        FROM estimate_details e
        LEFT JOIN estimate_sanctions s ON e.id = s.estimate_id
        WHERE s.estimate_id IS NULL
          AND e.user_id = ?
    `;

    let values = [user_id];

    if (search !== "") {
        sql += ` AND (e.est_no LIKE ? OR e.work LIKE ?) `;
        values.push(`%${search}%`, `%${search}%`);
    }

    sql += ` ORDER BY e.id DESC`;

    db.query(sql, values, (err, result) => {
        if (err) {
            console.log("GET UNSANCTIONED ERROR:", err);
            return res.json({ success: false, data: [] });
        }

        res.json({ success: true, data: result });
    });
});

app.get("/get-sanctioned-estimates", (req, res) => {
    const search = req.query.search ? req.query.search.trim() : "";
    const user_id = req.query.user_id;

    let sql = `
        SELECT 
            s.id AS sanction_id,
            e.id AS estimate_id,
            e.est_no,
            e.year,
            e.estimate_type,
            e.work,
            e.total_amount,
            s.sanction_no,
            s.sanction_date,
            s.created_at
        FROM estimate_details e
        INNER JOIN estimate_sanctions s ON e.id = s.estimate_id
        WHERE e.user_id = ?
    `;

    let values = [user_id];

    if (search !== "") {
        sql += ` AND (e.est_no LIKE ? OR e.work LIKE ? OR s.sanction_no LIKE ?) `;
        values.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ` ORDER BY s.created_at DESC`;

    db.query(sql, values, (err, result) => {
        if (err) {
            console.log("GET SANCTIONED ERROR:", err);
            return res.json({ success: false, data: [] });
        }

        res.json({ success: true, data: result });
    });
});

app.post("/sanction-estimate", (req, res) => {
    const { estimate_id, sanction_no, sanction_date, user_id } = req.body;

    if (!estimate_id || !sanction_no || !user_id) {
        return res.json({ success: false, message: "Estimate, user, and sanction number required" });
    }

    const checkSql = "SELECT id FROM estimate_details WHERE id = ? AND user_id = ? LIMIT 1";

    db.query(checkSql, [estimate_id, user_id], (checkErr, checkRows) => {
        if (checkErr) {
            console.log("CHECK SANCTION OWNER ERROR:", checkErr);
            return res.json({ success: false, message: "Sanction failed" });
        }

        if (!checkRows || checkRows.length === 0) {
            return res.json({ success: false, message: "Estimate not found" });
        }

        const sql = `
            INSERT INTO estimate_sanctions (estimate_id, sanction_no, sanction_date)
            VALUES (?, ?, ?)
        `;

        db.query(sql, [estimate_id, sanction_no, sanction_date || null], (err) => {
            if (err) {
                console.log("SANCTION ESTIMATE ERROR:", err);
                return res.json({ success: false, message: "Failed to sanction estimate" });
            }

            res.json({ success: true, message: "Estimate sanctioned successfully" });
        });
    });
});

app.post("/update-sanction/:estimate_id", (req, res) => {
    const estimate_id = req.params.estimate_id;
    const { sanction_no, sanction_date, user_id } = req.body;

    if (!sanction_no || !user_id) {
        return res.json({ success: false, message: "Sanction number and user required" });
    }

    const checkSql = "SELECT id FROM estimate_details WHERE id = ? AND user_id = ? LIMIT 1";

    db.query(checkSql, [estimate_id, user_id], (checkErr, checkRows) => {
        if (checkErr) {
            console.log("CHECK UPDATE SANCTION OWNER ERROR:", checkErr);
            return res.json({ success: false, message: "Update failed" });
        }

        if (!checkRows || checkRows.length === 0) {
            return res.json({ success: false, message: "Estimate not found" });
        }

        const sql = `
            UPDATE estimate_sanctions
            SET sanction_no = ?, sanction_date = ?
            WHERE estimate_id = ?
        `;

        db.query(sql, [sanction_no, sanction_date || null, estimate_id], (err, result) => {
            if (err) {
                console.log("UPDATE SANCTION ERROR:", err);
                return res.json({ success: false, message: "Failed to update sanction" });
            }

            if (result.affectedRows === 0) {
                return res.json({ success: false, message: "No sanction record found" });
            }

            res.json({ success: true, message: "SONO updated successfully" });
        });
    });
});


// indent 
app.get("/get-indent-init-data", (req, res) => {
    const user_id = req.query.user_id;

    const sql = `
        SELECT 
            IFNULL(MAX(indent_no), 0) + 1 AS next_indent_no,
            IFNULL(SUM(total_amount), 0) AS grand_total
        FROM indent_entries
        WHERE user_id = ?
    `;

    db.query(sql, [user_id], (err, result) => {
        if (err) {
            console.log("GET INDENT INIT ERROR:", err);
            return res.json({ success: false });
        }

        res.json({
            success: true,
            next_indent_no: result[0].next_indent_no || 1,
            grand_total: result[0].grand_total || 0
        });
    });
});

app.get("/get-indent-hoa", (req, res) => {
    const user_id = req.query.user_id;

    db.query(
        "SELECT hoa_name FROM hoa WHERE user_id = ? ORDER BY hoa_name",
        [user_id],
        (err, result) => {
            if (err) {
                console.log("GET INDENT HOA ERROR:", err);
                return res.json({ success: false, data: [] });
            }

            res.json({ success: true, data: result });
        }
    );
});

app.get("/get-indent-sono-list", (req, res) => {
    const user_id = req.query.user_id;
    const month = req.query.month;
    const year = req.query.year;
    const hoa_name = req.query.hoa_name;

    console.log("SONO FILTER:", user_id, month, year, hoa_name);

    const sql = `
        SELECT 
            ed.id AS estimate_id,
            ed.est_no,
            ed.total_amount,
            es.sanction_no,
            es.sanction_date
        FROM estimate_details ed
        JOIN estimate_sanctions es ON ed.id = es.estimate_id
        WHERE ed.user_id = ?
          AND ed.head_of_account = ?
          AND MONTH(es.sanction_date) = ?
          AND YEAR(es.sanction_date) = ?
        ORDER BY es.sanction_date DESC
    `;

    db.query(sql, [user_id, hoa_name, month, year], (err, result) => {
        if (err) {
            console.log("GET INDENT SONO LIST ERROR:", err);
            return res.json({ success: false, data: [] });
        }

        res.json({ success: true, data: result });
    });
});

app.get("/get-indent-estimate-details/:estimate_id", (req, res) => {
    const estimate_id = req.params.estimate_id;
    const user_id = req.query.user_id;

    const estimateSql = `
        SELECT id, est_no, total_amount
        FROM estimate_details
        WHERE id = ? AND user_id = ?
        LIMIT 1
    `;

    const ssrSql = `
        SELECT 
            e.id,
            e.sr_no,
            e.description,
            e.qty AS original_qty,
            COALESCE(SUM(i.qty), 0) AS used_qty,
            (e.qty - COALESCE(SUM(i.qty), 0)) AS remaining_qty,
            e.unit,
            e.rate,
            e.rate_per,
            e.days,
            e.amount
        FROM estimate_ssr_items e
        LEFT JOIN indent_entries h
            ON h.estimate_id = e.estimate_id
           AND h.user_id = ?
        LEFT JOIN indent_ssr_items i
            ON i.indent_id = h.id
           AND i.sr_no = e.sr_no
        WHERE e.estimate_id = ?
        GROUP BY 
            e.id,
            e.sr_no,
            e.description,
            e.qty,
            e.unit,
            e.rate,
            e.rate_per,
            e.days,
            e.amount
        HAVING remaining_qty > 0
        ORDER BY e.id ASC
    `;

    db.query(estimateSql, [estimate_id, user_id], (err, estRows) => {
        if (err) {
            console.log("GET INDENT ESTIMATE ERROR:", err);
            return res.json({ success: false, message: "Estimate fetch failed" });
        }

        if (!estRows || estRows.length === 0) {
            return res.json({ success: false, message: "Estimate not found" });
        }

        db.query(ssrSql, [user_id, estimate_id], (err2, ssrRows) => {
            if (err2) {
                console.log("GET REMAINING SSR ERROR:", err2);
                return res.json({ success: false, message: "SSR fetch failed" });
            }

            console.log("REMAINING SSR ROWS:", ssrRows);

            res.json({
                success: true,
                estimate: estRows[0],
                ssrItems: ssrRows || []
            });
        });
    });
});

app.post("/save-indent-entry", (req, res) => {
    const d = req.body;

    const headerSql = `
        INSERT INTO indent_entries (
            indent_no,
            estimate_id,
            est_no,
            sanction_no,
            work_type,
            indent_month,
            hoa_name,
            total_amount,
            grand_total,
            user_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const headerValues = [
        d.indent_no,
        d.estimate_id,
        d.est_no,
        d.sanction_no,
        d.work_type,
        d.indent_month,
        d.hoa_name,
        d.total_amount,
        d.grand_total,
        d.user_id
    ];

    db.query(headerSql, headerValues, (err, result) => {
        if (err) {
            console.log("SAVE INDENT HEADER ERROR:", err);
            return res.json({ success: false, message: "Indent save failed" });
        }

        const indentId = result.insertId;

        if (!d.ssrItems || d.ssrItems.length === 0) {
            return res.json({ success: true, message: "Indent saved successfully" });
        }

        const itemSql = `
    INSERT INTO indent_ssr_items (
        indent_id,
        sr_no,
        particulars,
        qty,
        times_days,
        unit,
        rate,
        rate_per,
        total,
        acf_date,
        nb_no,
        page_no,
        pow,
        rfo_date,
        wages_from,
        wages
    ) VALUES ?
`;

        const itemValues = d.ssrItems.map(item => [
    indentId,
    item.sr_no || "",
    item.particulars || "",
    item.qty || 0,
    item.times_days || "",
    item.unit || "",
    item.rate || 0,
    item.rate_per || 1,
    item.total || 0,
    item.acf_date || null,
    item.nb_no || "",
    item.page_no || "",
    item.pow || "",
    item.rfo_date || null,
    item.wages_from || "",
    item.wages || ""
]);

        db.query(itemSql, [itemValues], (itemErr) => {
            if (itemErr) {
                console.log("SAVE INDENT SSR ERROR:", itemErr);
                return res.json({ success: false, message: "Indent SSR save failed" });
            }

            res.json({ success: true, message: "Indent saved successfully" });
        });
    });
});

app.get("/get-indent-grand-total", (req, res) => {
    const user_id = req.query.user_id;
    const hoa_name = req.query.hoa_name;

    const sql = `
        SELECT IFNULL(SUM(total_amount), 0) AS grand_total
        FROM indent_entries
        WHERE user_id = ? AND hoa_name = ?
    `;

    db.query(sql, [user_id, hoa_name], (err, result) => {
        if (err) {
            console.log("GET INDENT GRAND TOTAL ERROR:", err);
            return res.json({ success: false, grand_total: 0 });
        }

        res.json({
            success: true,
            grand_total: result[0].grand_total || 0
        });
    });
});



app.get("/get-indent-list-for-modify", (req, res) => {
    const user_id = req.query.user_id;
    const indent_month = req.query.indent_month;
    const hoa_name = req.query.hoa_name;

    const sql = `
        SELECT id, indent_no, sanction_no
        FROM indent_entries
        WHERE user_id = ?
          AND indent_month = ?
          AND hoa_name = ?
        ORDER BY indent_no DESC
    `;

    db.query(sql, [user_id, indent_month, hoa_name], (err, result) => {
        if (err) {
            console.log("GET MODIFY INDENT LIST ERROR:", err);
            return res.json({ success: false, data: [] });
        }

        res.json({ success: true, data: result });
    });
});

app.get("/get-indent-for-edit/:id", (req, res) => {
    const id = req.params.id;
    const user_id = req.query.user_id;

    const headerSql = `
        SELECT 
            ie.*,
            ed.division,
            ed.range_name,
            ed.work AS work_name,
            ed.total_amount AS estimate_total_amount,
            rg.rfo_name,
            rg.sub_division,
            rg.division AS range_division
        FROM indent_entries ie
        LEFT JOIN estimate_details ed 
            ON ie.estimate_id = ed.id
        LEFT JOIN ranges rg
            ON rg.user_id = ie.user_id
           AND LOWER(TRIM(rg.range_name)) = LOWER(TRIM(ed.range_name))
        WHERE ie.id = ? AND ie.user_id = ?
        LIMIT 1
    `;

    const itemSql = `
        SELECT *
        FROM indent_ssr_items
        WHERE indent_id = ?
        ORDER BY id ASC
    `;

    db.query(headerSql, [id, user_id], (err, headerRows) => {
        if (err) {
            console.log("GET INDENT FOR EDIT ERROR:", err);
            return res.json({ success: false, message: "Indent fetch failed" });
        }

        if (!headerRows || headerRows.length === 0) {
            return res.json({ success: false, message: "Indent not found" });
        }

        const indent = headerRows[0];

        db.query(itemSql, [id], (err2, itemRows) => {
            if (err2) {
                console.log("GET INDENT ITEMS FOR EDIT ERROR:", err2);
                return res.json({ success: false, message: "Indent SSR fetch failed" });
            }

            res.json({
                success: true,
                indent,
                ssrItems: itemRows || []
            });
        });
    });
});

app.post("/update-indent/:id", (req, res) => {
    const id = req.params.id;
    const d = req.body;

    const checkSql = `
        SELECT id
        FROM indent_entries
        WHERE id = ? AND user_id = ?
        LIMIT 1
    `;

    db.query(checkSql, [id, d.user_id], (checkErr, checkRows) => {
        if (checkErr) {
            console.log("CHECK UPDATE INDENT OWNER ERROR:", checkErr);
            return res.json({ success: false, message: "Update failed" });
        }

        if (!checkRows || checkRows.length === 0) {
            return res.json({ success: false, message: "Indent not found" });
        }

        const headerSql = `
            UPDATE indent_entries
            SET work_type = ?, total_amount = ?, grand_total = ?
            WHERE id = ? AND user_id = ?
        `;

        db.query(
            headerSql,
            [d.work_type, d.total_amount, d.grand_total, id, d.user_id],
            (err) => {
                if (err) {
                    console.log("UPDATE INDENT HEADER ERROR:", err);
                    return res.json({ success: false, message: "Header update failed" });
                }

                db.query("DELETE FROM indent_ssr_items WHERE indent_id = ?", [id], (delErr) => {
                    if (delErr) {
                        console.log("DELETE OLD INDENT SSR ERROR:", delErr);
                        return res.json({ success: false, message: "SSR reset failed" });
                    }

                    if (!d.ssrItems || d.ssrItems.length === 0) {
                        return res.json({ success: true, message: "Indent updated successfully" });
                    }

                    const itemSql = `
                        INSERT INTO indent_ssr_items (
                            indent_id,
                            sr_no,
                            particulars,
                            qty,
                            times_days,
                            unit,
                            rate,
                            rate_per,
                            total,
                            acf_date,
                            nb_no,
                            page_no,
                            pow,
                            rfo_date,
                            wages_from,
                            wages
                        ) VALUES ?
                    `;

                    const itemValues = d.ssrItems.map(item => [
                        id,
                        item.sr_no || "",
                        item.particulars || "",
                        item.qty || 0,
                        item.times_days || "",
                        item.unit || "",
                        item.rate || 0,
                        item.rate_per || 1,
                        item.total || 0,
                        item.acf_date || null,
                        item.nb_no || "",
                        item.page_no || "",
                        item.pow || "",
                        item.rfo_date || null,
                        item.wages_from || "",
                        item.wages || ""
                    ]);

                    db.query(itemSql, [itemValues], (itemErr) => {
                        if (itemErr) {
                            console.log("UPDATE INDENT SSR ERROR:", itemErr);
                            return res.json({ success: false, message: "SSR update failed" });
                        }

                        res.json({ success: true, message: "Indent updated successfully" });
                    });
                });
            }
        );
    });
});

app.get("/get-indent-list-for-delete", (req, res) => {
    const user_id = req.query.user_id;
    const indent_month = req.query.indent_month;
    const hoa_name = req.query.hoa_name;

    const sql = `
        SELECT id, indent_no, sanction_no, indent_month, hoa_name, total_amount
        FROM indent_entries
        WHERE user_id = ?
          AND indent_month = ?
          AND hoa_name = ?
        ORDER BY indent_no DESC
    `;

    db.query(sql, [user_id, indent_month, hoa_name], (err, result) => {
        if (err) {
            console.log("GET DELETE INDENT LIST ERROR:", err);
            return res.json({ success: false, data: [] });
        }

        res.json({ success: true, data: result });
    });
});

app.post("/delete-indent/:id", (req, res) => {
    const id = req.params.id;
    const { user_id } = req.body;

    if (!user_id) {
        return res.json({ success: false, message: "User not logged in" });
    }

    const checkSql = `
        SELECT id
        FROM indent_entries
        WHERE id = ? AND user_id = ?
        LIMIT 1
    `;

    db.query(checkSql, [id, user_id], (checkErr, checkRows) => {
        if (checkErr) {
            console.log("CHECK DELETE INDENT OWNER ERROR:", checkErr);
            return res.json({ success: false, message: "Delete failed" });
        }

        if (!checkRows || checkRows.length === 0) {
            return res.json({ success: false, message: "Indent not found" });
        }

        db.query("DELETE FROM indent_ssr_items WHERE indent_id = ?", [id], (itemErr) => {
            if (itemErr) {
                console.log("DELETE INDENT SSR ERROR:", itemErr);
                return res.json({ success: false, message: "Delete failed" });
            }

            db.query("DELETE FROM indent_entries WHERE id = ? AND user_id = ?", [id, user_id], (err) => {
                if (err) {
                    console.log("DELETE INDENT ERROR:", err);
                    return res.json({ success: false, message: "Delete failed" });
                }

                res.json({ success: true, message: "Indent deleted successfully" });
            });
        });
    });
});

// START SERVER
app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});