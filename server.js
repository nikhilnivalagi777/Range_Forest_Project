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
app.use(express.urlencoded({ extended: true }));
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

app.get("/voucher.html", (req, res) => {
    res.sendFile(__dirname + "/public/voucher.html");
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
    database: "forest_db",
    port: 3307
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

// ================= CONTRACTOR SAVE =================
app.post("/add-contractor", (req, res) => {

    let contractor_name = req.body.contractor_name;
    let user_id = req.body.user_id;

    console.log("ADD Contractor BODY:", req.body);

    if (!user_id) {
        return res.send("User not logged in");
    }

    if (!contractor_name || contractor_name.trim() === "") {
        return res.send("Enter Contractor name");
    }

    const sql = "INSERT INTO contractors (contractor_name, user_id) VALUES (?, ?)";

    db.query(sql, [contractor_name, user_id], (err, result) => {
        if (err) {
            console.log("SAVE Contractor ERROR:", err);
            return res.send("Error saving Contractor");
        }

        res.send("Contractor Saved");
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
    const scheme_name = req.query.scheme_name || "GENERAL";

    console.log("NEXT EST NO USER_ID:", user_id);
    console.log("NEXT EST NO SCHEME:", scheme_name);

    if (!user_id) {
        return res.json({
            success: false,
            est_no: 1,
            message: "user_id required"
        });
    }

    const sql = `
        SELECT MAX(CAST(est_no AS UNSIGNED)) AS maxNo
        FROM estimate_details
        WHERE user_id = ?
        AND scheme_name = ?
    `;

    db.query(sql, [user_id, scheme_name], (err, result) => {
        if (err) {
            console.log("NEXT EST NO ERROR:", err);
            return res.json({
                success: true,
                est_no: 1
            });
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
        seedlings,
        scheme_name
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
    JSON.stringify(d.seedlings || []),
    d.scheme_name || ""
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
    const scheme_name = req.query.scheme_name ? req.query.scheme_name.trim() : "";
    const month = req.query.month ? req.query.month.trim() : "";
    const hoa_name = req.query.hoa_name ? req.query.hoa_name.trim() : "";

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

    if (scheme_name !== "") {
        sql += ` AND scheme_name = ? `;
        values.push(scheme_name);
    }

    if (hoa_name !== "") {
        sql += ` AND head_of_account = ? `;
        values.push(hoa_name);
    }

    if (month !== "") {
        sql += ` AND DATE_FORMAT(created_at, '%Y-%m') = ? `;
        values.push(month);
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

app.get("/get-estimate-by-est-no/:est_no", (req, res) => {
    const est_no = req.params.est_no;
    const user_id = req.query.user_id;
    const scheme_name = req.query.scheme_name || "GENERAL";

    const headerSql = `
        SELECT *
        FROM estimate_details
        WHERE est_no = ?
          AND user_id = ?
          AND scheme_name = ?
        ORDER BY id DESC
        LIMIT 1
    `;

    const ssrSql = `
        SELECT *
        FROM estimate_ssr_items
        WHERE estimate_id = ?
        ORDER BY id ASC
    `;

    db.query(headerSql, [est_no, user_id, scheme_name], (err, headerRows) => {
        if (err) {
            console.log("GET ESTIMATE BY EST NO ERROR:", err);
            return res.json({ success: false, message: "Estimate fetch failed" });
        }

        if (!headerRows || headerRows.length === 0) {
            return res.json({ success: false, message: "Estimate not found" });
        }

        const estimate = headerRows[0];

        db.query(ssrSql, [estimate.id], (err2, ssrRows) => {
            if (err2) {
                console.log("GET ESTIMATE SSR FOR DUPLICATE ERROR:", err2);
                return res.json({ success: false, message: "Estimate SSR fetch failed" });
            }

            res.json({
                success: true,
                estimate,
                ssrItems: ssrRows || []
            });
        });
    });
});


                    // INDENT MODULE
app.get("/get-unsanctioned-estimates", (req, res) => {
    const search = req.query.search ? req.query.search.trim() : "";
    const user_id = req.query.user_id;
    const scheme_name = req.query.scheme_name ? req.query.scheme_name.trim() : "";

    let sql = `
        SELECT e.id, e.est_no, e.year, e.estimate_type, e.work, e.total_amount, e.created_at, e.scheme_name
        FROM estimate_details e
        LEFT JOIN estimate_sanctions s ON e.id = s.estimate_id
        WHERE s.estimate_id IS NULL
          AND e.user_id = ?
    `;

    let values = [user_id];

    if (scheme_name !== "") {
        sql += ` AND e.scheme_name = ? `;
        values.push(scheme_name);
    }

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
    const user_id = req.query.user_id;
    const scheme_name = req.query.scheme_name || "";
    const month = req.query.month || "";
    const hoa_name = req.query.hoa_name || "";

    let sql = `
        SELECT 
            s.id AS sanction_id,
            e.id AS estimate_id,
            e.est_no,
            e.work,
            e.total_amount,
            e.scheme_name,
            e.head_of_account,
            s.sanction_no,
            s.sanction_date
        FROM estimate_details e
        INNER JOIN estimate_sanctions s ON e.id = s.estimate_id
        WHERE e.user_id = ?
    `;

    let values = [user_id];

    if (scheme_name !== "") {
        sql += ` AND e.scheme_name = ? `;
        values.push(scheme_name);
    }

    if (hoa_name !== "") {
        sql += ` AND e.head_of_account = ? `;
        values.push(hoa_name);
    }

    if (month !== "") {
        sql += ` AND DATE_FORMAT(s.sanction_date, '%Y-%m') = ? `;
        values.push(month);
    }

    sql += ` ORDER BY s.sanction_date DESC`;

    db.query(sql, values, (err, result) => {
        if (err) {
            console.log("ERROR:", err);
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
            user_id,
            scheme_name

        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        d.user_id,
        d.scheme_name
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


//voucher 
// voucher creation
app.get("/get-contractors", (req, res) => {
    const user_id = req.query.user_id;

    db.query(
        "SELECT contractor_name FROM contractors WHERE user_id = ? ORDER BY contractor_name ASC",
        [user_id],
        (err, result) => {
            if (err) {
                console.log("GET CONTRACTORS ERROR:", err);
                return res.json({ success: false });
            }

            res.json({
                success: true,
                contractors: result
            });
        }
    );
});

app.get("/get-voucher-indents", (req, res) => {
    const { user_id, scheme_name, month_name, head_name } = req.query;

    const sql = `
        SELECT 
            ie.id,
            ie.indent_no,
            ie.sanction_no,
            ie.indent_month,
            ie.hoa_name,
            ie.scheme_name,
            IFNULL(SUM(isi.total), 0) AS total_amount
        FROM indent_entries ie
        LEFT JOIN indent_ssr_items isi ON ie.id = isi.indent_id
        WHERE ie.user_id = ?
          AND ie.scheme_name = ?
          AND ie.indent_month LIKE CONCAT(?, '%')
          AND ie.hoa_name = ?
        GROUP BY ie.id, ie.indent_no, ie.sanction_no, ie.indent_month, ie.hoa_name, ie.scheme_name
        ORDER BY CAST(ie.indent_no AS UNSIGNED) ASC
    `;

    db.query(sql, [user_id, scheme_name, month_name, head_name], (err, result) => {
        if (err) {
            console.log("GET VOUCHER INDENTS ERROR:", err);
            return res.json({ success: false });
        }

        res.json({
            success: true,
            indents: result
        });
    });
});

function getNextVoucherNumber(user_id, scheme_name, month_name) {
    return new Promise((resolve, reject) => {
        db.query(
            "SELECT * FROM voucher_sequence WHERE user_id = ? AND scheme_name = ? AND month_name = ?",
            [user_id, scheme_name, month_name],
            (err, rows) => {
                if (err) return reject(err);

                if (rows.length === 0) {
                    db.query(
                        "INSERT INTO voucher_sequence (user_id, scheme_name, month_name, last_voucher_no) VALUES (?, ?, ?, 1)",
                        [user_id, scheme_name, month_name],
                        (err2) => {
                            if (err2) return reject(err2);
                            resolve("VTR 1");
                        }
                    );
                } else {
                    const nextNo = Number(rows[0].last_voucher_no) + 1;

                    db.query(
                        "UPDATE voucher_sequence SET last_voucher_no = ? WHERE user_id = ? AND scheme_name = ? AND month_name = ?",
                        [nextNo, user_id, scheme_name, month_name],
                        (err3) => {
                            if (err3) return reject(err3);
                            resolve(`VTR ${nextNo}`);
                        }
                    );
                }
            }
        );
    });
}

function splitIndentItems(items) {
    const LIMIT = 100000;
    const vouchers = [];
    let currentVoucher = [];
    let currentTotal = 0;

    for (const item of items) {
        let amount = Number(item.total || 0);

        if (amount > LIMIT) {
            if (currentVoucher.length > 0) {
                vouchers.push({
                    items: currentVoucher,
                    total: currentTotal
                });
                currentVoucher = [];
                currentTotal = 0;
            }

            const parts = Math.ceil(amount / LIMIT);
            let remaining = amount;
            let baseAmount = Number((amount / parts).toFixed(2));

            for (let i = 0; i < parts; i++) {
                let splitAmount;

                if (i === parts - 1) {
                    splitAmount = Number(remaining.toFixed(2));
                } else {
                    splitAmount = baseAmount;
                    remaining -= baseAmount;
                }

                vouchers.push({
                    items: [{
                        ...item,
                        voucher_split_amount: splitAmount,
                        split_part: i + 1,
                        split_total_parts: parts
                    }],
                    total: splitAmount
                });
            }
        } else {
            if (currentTotal + amount <= LIMIT) {
                currentVoucher.push({
                    ...item,
                    voucher_split_amount: amount
                });
                currentTotal += amount;
            } else {
                vouchers.push({
                    items: currentVoucher,
                    total: currentTotal
                });

                currentVoucher = [{
                    ...item,
                    voucher_split_amount: amount
                }];
                currentTotal = amount;
            }
        }
    }

    if (currentVoucher.length > 0) {
        vouchers.push({
            items: currentVoucher,
            total: currentTotal
        });
    }

    return vouchers;
}

app.post("/create-voucher", async (req, res) => {
    try {
        const {
            user_id,
            scheme_name,
            month_name,
            head_name,
            indent_id,
            contractor_name,
            disbursement_date,
            vat_percent = 0,
            it_percent = 0,
            sc_percent = 0,
            ed_percent = 0,
            other_percent = 0
        } = req.body;

        db.query(
            "SELECT COUNT(*) AS total FROM vouchers WHERE indent_id = ?",
            [indent_id],
            (checkErr, checkRows) => {
                if (checkErr) {
                    console.log("CHECK VOUCHER ERROR:", checkErr);
                    return res.json({ success: false, message: "Error checking old vouchers." });
                }

                if (checkRows[0].total > 0) {
    return res.json({
        success: false,
        message: "Voucher already created for this indent. If you want any changes, please go to Modify Voucher."
    });
}
                const headerSql = `
                     SELECT id, indent_no, sanction_no, indent_month, hoa_name, scheme_name
                        FROM indent_entries
                      WHERE id = ? AND user_id = ?
                    `;
                    
                db.query(headerSql, [indent_id, user_id], (err, indentRows) => {
                    if (err) {
                        console.log("INDENT HEADER ERROR:", err);
                        return res.json({ success: false, message: "Indent fetch failed." });
                    }

                    if (indentRows.length === 0) {
                        return res.json({ success: false, message: "Indent not found." });
                    }

                    const indent = indentRows[0];

                    const itemSql = `
                        SELECT 
                            id,
                            sr_no,
                            particulars,
                            qty,
                            days,
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
                            wages,
                            times_days
                        FROM indent_ssr_items
                        WHERE indent_id = ?
                        ORDER BY id ASC
                    `;

                    db.query(itemSql, [indent_id], async (err2, itemRows) => {
                        if (err2) {
                            console.log("INDENT SSR ITEMS ERROR:", err2);
                            return res.json({ success: false, message: "Indent items fetch failed." });
                        }

                        if (itemRows.length === 0) {
                            return res.json({ success: false, message: "No particulars found in indent." });
                        }

                        const groupedVouchers = splitIndentItems(itemRows);
                        const createdVouchers = [];

                        for (const voucherGroup of groupedVouchers) {
                          const voucher_no = await getNextVoucherNumber(user_id, scheme_name, indent.indent_month);

                            const gross_amount = Number(voucherGroup.total || 0);
                            const roundedGrossAmount = Math.round(gross_amount);
                            const roundOff = Number((roundedGrossAmount - gross_amount).toFixed(2));

                            const vatP = Number(vat_percent || 0);
                            const itP = Number(it_percent || 0);
                            const scP = Number(sc_percent || 0);
                            const edP = Number(ed_percent || 0);
                            const otherP = Number(other_percent || 0);

                            const vat_amount = Number((gross_amount * vatP / 100).toFixed(2));
                            const it_amount = Number((gross_amount * itP / 100).toFixed(2));
                            const sc_amount = Number((gross_amount * scP / 100).toFixed(2));
                            const ed_amount = Number((gross_amount * edP / 100).toFixed(2));
                            const other_amount = Number((gross_amount * otherP / 100).toFixed(2));

                            const total_deduction = Number((vat_amount + it_amount + sc_amount + ed_amount + other_amount).toFixed(2));
                            const net_amount = Number((gross_amount - total_deduction).toFixed(2));

                            const voucherInsertSql = `
    INSERT INTO vouchers (
        user_id,
        scheme_name,
        voucher_no,
        indent_id,
        indent_no,
        sono,
        month_name,
        head_name,
        contractor_name,
        disbursement_date,

        gross_amount,
        round_off,
        rounded_gross_amount,

        vat_percent,
        vat_amount,
        it_percent,
        it_amount,
        sc_percent,
        sc_amount,
        ed_percent,
        ed_amount,
        other_percent,
        other_amount,

        total_deduction,
        net_amount
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

                            const voucherValues = [
    user_id,
    scheme_name,
    voucher_no,
    indent_id,
    indent.indent_no,
    indent.sanction_no,
    indent.indent_month,
    head_name,
    contractor_name,
    disbursement_date,

    gross_amount,
    roundOff,
    roundedGrossAmount,

    vatP,
    vat_amount,
    itP,
    it_amount,
    scP,
    sc_amount,
    edP,
    ed_amount,
    otherP,
    other_amount,

    total_deduction,
    net_amount
];
                            const voucherInsertResult = await new Promise((resolve, reject) => {
                                db.query(voucherInsertSql, voucherValues, (err, result) => {
                                    if (err) reject(err);
                                     else resolve(result);
                                     });
                                });

                            const voucher_id = voucherInsertResult.insertId;

                            for (const item of voucherGroup.items) {
                                const itemSqlInsert = `
                                    INSERT INTO voucher_items (
                                        voucher_id,
                                        indent_item_id,
                                        sr_no,
                                        particulars,
                                        qty,
                                        days,
                                        unit,
                                        rate,
                                        rate_per,
                                        original_amount,
                                        voucher_split_amount,
                                        acf_date,
                                        nb_no,
                                        page_no,
                                        pow,
                                        rfo_date,
                                        wages_from,
                                        wages,
                                        times_days
                                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                                `;

                                const itemValues = [
                                    voucher_id,
                                    item.id,
                                    item.sr_no || '',
                                    item.particulars || '',
                                    item.qty || 0,
                                    item.days || 0,
                                    item.unit || '',
                                    item.rate || 0,
                                    item.rate_per || 0,
                                    item.total || 0,
                                    item.voucher_split_amount || 0,
                                    item.acf_date || '',
                                    item.nb_no || '',
                                    item.page_no || '',
                                    item.pow || '',
                                    item.rfo_date || '',
                                    item.wages_from || '',
                                    item.wages || 0,
                                    item.times_days || 0
                                ];

                                await new Promise((resolve, reject) => {
                                    db.query(itemSqlInsert, itemValues, (err4, result4) => {
                                        if (err4) reject(err4);
                                        else resolve(result4);
                                    });
                                });
                            }

                           createdVouchers.push({
                             voucher_no: voucher_no,
                             amount: gross_amount
                            }); 
                        }

                        res.json({
                        success: true,
                        voucher_count: createdVouchers.length,
                         vouchers: createdVouchers
                        });
                    });
                });
            }
        );
    } catch (error) {
        console.log("CREATE VOUCHER ERROR:", error);
        res.json({
            success: false,
            message: "Server error while creating voucher."
        });
    }
});

// voucher modify
app.get("/get-vouchers-for-modify", (req, res) => {
    const { user_id, scheme_name, month_name, head_name } = req.query;

    const sql = `
        SELECT 
            id,
            voucher_no,
            indent_no,
            sono,
            contractor_name,
            disbursement_date,
            gross_amount,
            net_amount
        FROM vouchers
        WHERE user_id = ?
          AND scheme_name = ?
          AND month_name LIKE CONCAT(?, '%')
          AND head_name = ?
        ORDER BY id DESC
    `;

    db.query(sql, [user_id, scheme_name, month_name, head_name], (err, result) => {
        if (err) {
            console.log("GET VOUCHERS FOR MODIFY ERROR:", err);
            return res.json({ success: false, data: [] });
        }

        res.json({ success: true, data: result });
    });
});

app.get("/get-voucher/:id", (req, res) => {
    const id = req.params.id;
    const user_id = req.query.user_id;

    const sql = `
        SELECT *
        FROM vouchers
        WHERE id = ? AND user_id = ?
        LIMIT 1
    `;

    db.query(sql, [id, user_id], (err, rows) => {
        if (err) {
            console.log("GET SINGLE VOUCHER ERROR:", err);
            return res.json({ success: false, message: "Voucher fetch failed" });
        }

        if (!rows || rows.length === 0) {
            return res.json({ success: false, message: "Voucher not found" });
        }

        res.json({
            success: true,
            voucher: rows[0]
        });
    });
});

app.post("/update-voucher/:id", (req, res) => {
    const id = req.params.id;
    const {
        user_id,
        contractor_name,
        disbursement_date,
        vat_percent,
        it_percent,
        sc_percent,
        ed_percent,
        other_percent
    } = req.body;

    const checkSql = `
        SELECT id, gross_amount
        FROM vouchers
        WHERE id = ? AND user_id = ?
        LIMIT 1
    `;

    db.query(checkSql, [id, user_id], (checkErr, checkRows) => {
        if (checkErr) {
            console.log("CHECK UPDATE VOUCHER ERROR:", checkErr);
            return res.json({ success: false, message: "Update failed" });
        }

        if (!checkRows || checkRows.length === 0) {
            return res.json({ success: false, message: "Voucher not found" });
        }

        const gross = parseFloat(checkRows[0].gross_amount || 0);
        const vatP = parseFloat(vat_percent || 0);
        const itP = parseFloat(it_percent || 0);
        const scP = parseFloat(sc_percent || 0);
        const edP = parseFloat(ed_percent || 0);
        const otherP = parseFloat(other_percent || 0);

        const vat_amount = +(gross * vatP / 100).toFixed(2);
        const it_amount = +(gross * itP / 100).toFixed(2);
        const sc_amount = +(gross * scP / 100).toFixed(2);
        const ed_amount = +(gross * edP / 100).toFixed(2);
        const other_amount = +(gross * otherP / 100).toFixed(2);

        const total_deduction = +(vat_amount + it_amount + sc_amount + ed_amount + other_amount).toFixed(2);
        const net_amount = +(gross - total_deduction).toFixed(2);

        const updateSql = `
            UPDATE vouchers
            SET contractor_name = ?,
                disbursement_date = ?,
                vat_percent = ?, vat_amount = ?,
                it_percent = ?, it_amount = ?,
                sc_percent = ?, sc_amount = ?,
                ed_percent = ?, ed_amount = ?,
                other_percent = ?, other_amount = ?,
                total_deduction = ?,
                net_amount = ?
            WHERE id = ? AND user_id = ?
        `;

        db.query(
            updateSql,
            [
                contractor_name,
                disbursement_date,
                vatP, vat_amount,
                itP, it_amount,
                scP, sc_amount,
                edP, ed_amount,
                otherP, other_amount,
                total_deduction,
                net_amount,
                id,
                user_id
            ],
            (err) => {
                if (err) {
                    console.log("UPDATE VOUCHER ERROR:", err);
                    return res.json({ success: false, message: "Voucher update failed" });
                }

                res.json({ success: true, message: "Voucher updated successfully" });
            }
        );
    });
});

app.get("/get-voucher-with-items/:id", (req, res) => {
    const id = req.params.id;
    const user_id = req.query.user_id;

    const headerSql = `
        SELECT *
        FROM vouchers
        WHERE id = ? AND user_id = ?
        LIMIT 1
    `;

    const itemSql = `
        SELECT *
        FROM voucher_items
        WHERE voucher_id = ?
        ORDER BY id ASC
    `;

    db.query(headerSql, [id, user_id], (err, headerRows) => {
        if (err) {
            console.log("GET VOUCHER HEADER ERROR:", err);
            return res.json({ success: false, message: "Header fetch failed" });
        }

        if (!headerRows || headerRows.length === 0) {
            return res.json({ success: false, message: "Voucher not found" });
        }

        db.query(itemSql, [id], (err2, itemRows) => {
            if (err2) {
                console.log("GET VOUCHER ITEMS ERROR:", err2);
                return res.json({ success: false, message: "Items fetch failed" });
            }

            res.json({
                success: true,
                voucher: headerRows[0],
                items: itemRows || []
            });
        });
    });
});

app.post("/update-voucher-full/:id", (req, res) => {
    const id = req.params.id;
    const {
        user_id,
        contractor_name,
        disbursement_date,
        vat_percent = 0,
        it_percent = 0,
        sc_percent = 0,
        ed_percent = 0,
        other_percent = 0,
        items = []
    } = req.body;

    if (!items || items.length === 0) {
        return res.json({ success: false, message: "No voucher items found" });
    }

    const gross_amount = items.reduce((sum, item) => {
        return sum + Number(item.voucher_split_amount || 0);
    }, 0);
    const rounded_gross_amount = Math.round(gross_amount);
    const round_off = Number((rounded_gross_amount - gross_amount).toFixed(2));

    if (gross_amount > 100000) {
        return res.json({
            success: false,
            message: "Voucher total cannot exceed 1 lakh."
        });
    }

    const vatP = Number(vat_percent || 0);
    const itP = Number(it_percent || 0);
    const scP = Number(sc_percent || 0);
    const edP = Number(ed_percent || 0);
    const otherP = Number(other_percent || 0);

    const vat_amount = +(rounded_gross_amount * vatP / 100).toFixed(2);
    const it_amount = +(rounded_gross_amount * itP / 100).toFixed(2);
    const sc_amount = +(rounded_gross_amount * scP / 100).toFixed(2);
    const ed_amount = +(rounded_gross_amount * edP / 100).toFixed(2);
    const other_amount = +(rounded_gross_amount * otherP / 100).toFixed(2);

    const total_deduction = +(vat_amount + it_amount + sc_amount + ed_amount + other_amount).toFixed(2);
    const net_amount = +(rounded_gross_amount - total_deduction).toFixed(2);

    const checkSql = `
        SELECT id
        FROM vouchers
        WHERE id = ? AND user_id = ?
        LIMIT 1
    `;

    db.query(checkSql, [id, user_id], (checkErr, checkRows) => {
        if (checkErr) {
            console.log("CHECK FULL UPDATE ERROR:", checkErr);
            return res.json({ success: false, message: "Update failed" });
        }

        if (!checkRows || checkRows.length === 0) {
            return res.json({ success: false, message: "Voucher not found" });
        }

        const updateSql = `
    UPDATE vouchers SET
        contractor_name = ?,
        disbursement_date = ?,
        gross_amount = ?,
        round_off = ?,
        rounded_gross_amount = ?,
        vat_percent = ?,
        vat_amount = ?,
        it_percent = ?,
        it_amount = ?,
        sc_percent = ?,
        sc_amount = ?,
        ed_percent = ?,
        ed_amount = ?,
        other_percent = ?,
        other_amount = ?,
        total_deduction = ?,
        net_amount = ?
    WHERE id = ? AND user_id = ?
`;

db.query(
    updateSql,
    [
        contractor_name,
        disbursement_date,

        gross_amount,
        round_off,
        rounded_gross_amount,

        vatP,
        vat_amount,

        itP,
        it_amount,

        scP,
        sc_amount,

        edP,
        ed_amount,

        otherP,
        other_amount,

        total_deduction,
        net_amount,

        id,
        user_id
    ],
    (err) => {
        if (err) {
            console.log("UPDATE FULL VOUCHER ERROR:", err);
            return res.json({ success: false, message: "Voucher update failed" });
        }

                db.query("DELETE FROM voucher_items WHERE voucher_id = ?", [id], (delErr) => {
                    if (delErr) {
                        console.log("DELETE OLD VOUCHER ITEMS ERROR:", delErr);
                        return res.json({ success: false, message: "Old items delete failed" });
                    }

                    const insertSql = `
                        INSERT INTO voucher_items (
                            voucher_id,
                            indent_item_id,
                            sr_no,
                            particulars,
                            qty,
                            days,
                            unit,
                            rate,
                            rate_per,
                            original_amount,
                            voucher_split_amount,
                            acf_date,
                            nb_no,
                            page_no,
                            pow,
                            rfo_date,
                            wages_from,
                            wages,
                            times_days
                        ) VALUES ?
                    `;

                    const values = items.map(item => [
                        id,
                        item.indent_item_id || null,
                        item.sr_no || "",
                        item.particulars || "",
                        item.qty || 0,
                        item.days || 0,
                        item.unit || "",
                        item.rate || 0,
                        item.rate_per || 0,
                        item.original_amount || 0,
                        item.voucher_split_amount || 0,
                        item.acf_date || "",
                        item.nb_no || "",
                        item.page_no || "",
                        item.pow || "",
                        item.rfo_date || "",
                        item.wages_from || "",
                        item.wages || 0,
                        item.times_days || 0
                    ]);

                    db.query(insertSql, [values], (insErr) => {
                        if (insErr) {
                            console.log("INSERT NEW VOUCHER ITEMS ERROR:", insErr);
                            return res.json({ success: false, message: "New items save failed" });
                        }

                        res.json({
                            success: true,
                            message: "Voucher and items updated successfully"
                        });
                    });
                });
            }
        );
    });
});

// print voucher
            // agreement print
app.get("/get-print-indent-list", (req, res) => {
    const { user_id, month_name, head_name } = req.query;

    const sql = `
        SELECT DISTINCT
            ie.id,
            ie.indent_no,
            ie.sanction_no
        FROM indent_entries ie
        INNER JOIN vouchers v ON v.indent_id = ie.id
        WHERE ie.user_id = ?
          AND ie.indent_month LIKE CONCAT(?, '%')
          AND ie.hoa_name = ?
        ORDER BY CAST(ie.indent_no AS UNSIGNED) ASC
    `;

    db.query(sql, [user_id, month_name, head_name], (err, result) => {
        if (err) {
            console.log("GET PRINT INDENT LIST ERROR:", err);
            return res.json({ success: false, data: [] });
        }

        res.json({
            success: true,
            data: result
        });
    });
});

app.get("/get-piece-work-vouchers", (req, res) => {
    const { user_id, indent_id } = req.query;

    const sql = `
        SELECT
            id,
            voucher_no,
            contractor_name,
            gross_amount,
            disbursement_date
        FROM vouchers
        WHERE user_id = ?
          AND indent_id = ?
        ORDER BY id ASC
    `;

    db.query(sql, [user_id, indent_id], (err, result) => {
        if (err) {
            console.log("GET PIECE WORK VOUCHERS ERROR:", err);
            return res.json({ success: false, data: [] });
        }

        res.json({
            success: true,
            data: result
        });
    });
});

app.get("/get-piece-work-agreement/:voucher_id", (req, res) => {
    const voucher_id = req.params.voucher_id;
    const user_id = req.query.user_id;

    const sql = `
        SELECT 
            v.id,
            v.user_id,
            v.voucher_no,
            v.scheme_name,
            v.head_name,

            v.contractor_name,
            v.disbursement_date,

            v.gross_amount,
            v.round_off,
            v.rounded_gross_amount,
            v.net_amount,

            ie.id AS indent_id,
            ie.indent_no,
            ie.sanction_no,
            ie.indent_month,

            ed.work AS estimate_work,
            ed.location,
            ed.extent,
            ed.range_name AS estimate_range_name,
            ed.division AS estimate_division,
            ed.subdivision AS estimate_subdivision,

            r.range_name,
            r.division,
            r.sub_division

        FROM vouchers v
        LEFT JOIN indent_entries ie ON v.indent_id = ie.id
        LEFT JOIN estimate_details ed ON ie.estimate_id = ed.id
        LEFT JOIN ranges r ON r.user_id = v.user_id

        WHERE v.id = ?
        AND v.user_id = ?
        LIMIT 1
    `;

    db.query(sql, [voucher_id, user_id], (err, result) => {
        if (err) {
            console.log("PIECE WORK SQL ERROR:", err); // 👈 IMPORTANT
            return res.json({ success: false, message: "Database error" });
        }

        if (!result.length) {
            return res.json({ success: false, message: "No data found" });
        }

        res.json({
            success: true,
            data: result[0]
        });
    });
});

            // certificate print
app.get("/get-contractor-certificate/:voucher_id", (req, res) => {
    const voucher_id = req.params.voucher_id;
    const user_id = req.query.user_id;

    const sql = `
        SELECT
            v.id AS voucher_id,
            v.voucher_no,
            v.contractor_name,
            v.gross_amount,
            v.round_off,
            v.rounded_gross_amount,
            v.net_amount,
            v.disbursement_date,
            v.indent_id,
            v.head_name,

            ie.indent_no,
            ie.sanction_no,
            ie.indent_month,
            ie.hoa_name,
            ie.scheme_name,
            ie.estimate_id,

            ed.work AS estimate_work,
            ed.range_name AS estimate_range_name,
            ed.division AS estimate_division,
            ed.subdivision AS estimate_subdivision,

            rg.range_name,
            rg.rfo_name,
            rg.division,
            rg.sub_division,

            vi.nb_no,
            vi.page_no,
            vi.acf_date,
            vi.rfo_date
        FROM vouchers v
        LEFT JOIN indent_entries ie
            ON v.indent_id = ie.id
        LEFT JOIN estimate_details ed
            ON ie.estimate_id = ed.id
        LEFT JOIN ranges rg
            ON rg.user_id = v.user_id
        LEFT JOIN voucher_items vi
            ON vi.voucher_id = v.id
        WHERE v.id = ?
          AND v.user_id = ?
        LIMIT 1
    `;

    db.query(sql, [voucher_id, user_id], (err, rows) => {
        if (err) {
            console.log("GET CONTRACTOR CERTIFICATE ERROR:", err);
            return res.json({ success: false, message: "Certificate fetch failed" });
        }

        if (!rows || rows.length === 0) {
            return res.json({ success: false, message: "Voucher not found" });
        }

        res.json({
            success: true,
            data: rows[0]
        });
    });
});

            // memorandum print

app.get("/get-memorandum-of-payment/:voucher_id", (req, res) => {
    const voucher_id = req.params.voucher_id;
    const user_id = req.query.user_id;

    const sql = `
        SELECT
            v.id AS voucher_id,
            v.voucher_no,
            v.contractor_name,
            v.gross_amount,
            v.round_off,
            v.rounded_gross_amount,
            v.net_amount,
            v.total_deduction,
            v.disbursement_date,

            v.vat_percent,
            v.vat_amount,
            v.it_percent,
            v.it_amount,
            v.sc_percent,
            v.sc_amount,
            v.ed_percent,
            v.ed_amount,
            v.other_percent,
            v.other_amount,

            ie.indent_no,
            ie.sanction_no,
            ie.indent_month,
            ie.hoa_name,
            ie.scheme_name,
            ie.estimate_id,

            ed.work AS estimate_work,
            ed.range_name AS estimate_range_name,
            ed.division AS estimate_division,
            ed.subdivision AS estimate_subdivision,

            rg.range_name,
            rg.rfo_name,
            rg.division,
            rg.sub_division
        FROM vouchers v
        LEFT JOIN indent_entries ie
            ON v.indent_id = ie.id
        LEFT JOIN estimate_details ed
            ON ie.estimate_id = ed.id
        LEFT JOIN ranges rg
            ON rg.user_id = v.user_id
        WHERE v.id = ?
          AND v.user_id = ?
        LIMIT 1
    `;

    db.query(sql, [voucher_id, user_id], (err, rows) => {
        if (err) {
            console.log("GET MEMORANDUM OF PAYMENT ERROR:", err);
            return res.json({ success: false, message: "Memorandum fetch failed" });
        }

        if (!rows || rows.length === 0) {
            return res.json({ success: false, message: "Voucher not found" });
        }

        res.json({
            success: true,
            data: rows[0]
        });
    });
});            
             // work abstract  print
app.get("/get-work-abstract/:voucher_id", (req, res) => {
    const voucher_id = req.params.voucher_id;
    const user_id = req.query.user_id;

    const headerSql = `
        SELECT
            v.id AS voucher_id,
            v.voucher_no,
            v.gross_amount,
            v.round_off,
            v.rounded_gross_amount,
            v.net_amount,
            v.disbursement_date,

            ie.indent_no,
            ie.sanction_no,
            ie.indent_month,
            ie.hoa_name,
            ie.scheme_name,
            ie.estimate_id,

            ed.work AS estimate_work,
            ed.range_name AS estimate_range_name,
            ed.division AS estimate_division,
            ed.subdivision AS estimate_subdivision,

            rg.range_name,
            rg.rfo_name,
            rg.division,
            rg.sub_division

        FROM vouchers v
        LEFT JOIN indent_entries ie
            ON v.indent_id = ie.id
        LEFT JOIN estimate_details ed
            ON ie.estimate_id = ed.id
        LEFT JOIN ranges rg
            ON rg.user_id = v.user_id
        WHERE v.id = ?
          AND v.user_id = ?
        LIMIT 1
    `;

    const itemsSql = `
        SELECT
            id,
            sr_no,
            particulars,
            qty,
            days,
            unit,
            rate,
            voucher_split_amount,
            acf_date,
            nb_no,
            page_no,
            pow
        FROM voucher_items
        WHERE voucher_id = ?
        ORDER BY id ASC
    `;

    db.query(headerSql, [voucher_id, user_id], (err, headerRows) => {
        if (err) {
            console.log("GET WORK ABSTRACT HEADER ERROR:", err);
            return res.json({ success: false, message: "Work abstract header fetch failed" });
        }

        if (!headerRows || headerRows.length === 0) {
            return res.json({ success: false, message: "Voucher not found" });
        }

        db.query(itemsSql, [voucher_id], (err2, itemRows) => {
            if (err2) {
                console.log("GET WORK ABSTRACT ITEMS ERROR:", err2);
                return res.json({ success: false, message: "Work abstract items fetch failed" });
            }

            res.json({
                success: true,
                header: headerRows[0],
                items: itemRows || []
            });
        });
    });
});

            // stamp print
app.get("/get-stamp-page/:voucher_id", (req, res) => {
    const voucher_id = req.params.voucher_id;
    const user_id = req.query.user_id;

    const sql = `
        SELECT
            v.id AS voucher_id,
            v.voucher_no,
            v.contractor_name,
            v.gross_amount,
            v.round_off,
            v.rounded_gross_amount,
            v.net_amount,
            v.disbursement_date,

            ie.sanction_no,
            ie.indent_month,
            ie.hoa_name,
            ie.scheme_name,
            ie.estimate_id,

            ed.work AS estimate_work,
            ed.range_name AS estimate_range_name,
            ed.division AS estimate_division,
            ed.subdivision AS estimate_subdivision,

            rg.range_name,
            rg.rfo_name,
            rg.division,
            rg.sub_division

        FROM vouchers v
        LEFT JOIN indent_entries ie
            ON v.indent_id = ie.id
        LEFT JOIN estimate_details ed
            ON ie.estimate_id = ed.id
        LEFT JOIN ranges rg
            ON rg.user_id = v.user_id
        WHERE v.id = ?
          AND v.user_id = ?
        LIMIT 1
    `;

    db.query(sql, [voucher_id, user_id], (err, rows) => {
        if (err) {
            console.log("GET STAMP PAGE ERROR:", err);
            return res.json({ success: false, message: "Stamp page fetch failed" });
        }

        if (!rows || rows.length === 0) {
            return res.json({ success: false, message: "Voucher not found" });
        }

        res.json({
            success: true,
            data: rows[0]
        });
    });
});

             // cashbook

             // month cashbook

app.get("/get-month-cashbook", (req, res) => {
    const { user_id, month_name } = req.query;

    const sql = `
        SELECT 
            v.id AS voucher_id,
            v.voucher_no,
            v.scheme_name,
            v.head_name,
            v.disbursement_date,
            v.rounded_gross_amount,
            v.gross_amount,
            v.contractor_name,

            ie.indent_no,
            ie.sanction_no,
            ie.indent_month,

            ed.work AS estimate_work,
            ed.location,
            ed.extent,
            ed.range_name AS estimate_range_name,
            ed.division AS estimate_division,
            ed.subdivision AS estimate_subdivision,
           

            r.range_name,
            r.division,
            r.sub_division,
           

            vi.id AS item_id,
            vi.particulars,
            vi.qty,
            vi.unit,
            vi.rate,
            vi.voucher_split_amount,
            vi.pow,
            vi.nb_no,
            vi.page_no,
            vi.acf_date,
            vi.times_days

        FROM vouchers v

        LEFT JOIN indent_entries ie 
            ON v.indent_id = ie.id

        LEFT JOIN estimate_details ed 
            ON ie.estimate_id = ed.id

        LEFT JOIN ranges r 
            ON r.user_id = v.user_id

        LEFT JOIN voucher_items vi 
            ON vi.voucher_id = v.id

        WHERE v.user_id = ?
        AND ie.indent_month LIKE CONCAT('%', ?, '%')

        ORDER BY 
            FIELD(v.scheme_name, 'GENERAL', 'CAMPA'),
            CAST(REPLACE(v.voucher_no, 'VTR ', '') AS UNSIGNED),
            vi.id ASC
    `;

    db.query(sql, [user_id, month_name], (err, rows) => {
        if (err) {
            console.log("MONTH CASHBOOK ERROR:", err);
            return res.json({
                success: false,
                message: "Month cashbook loading failed"
            });
        }

        const vouchersMap = {};

        rows.forEach(row => {
            if (!vouchersMap[row.voucher_id]) {
                vouchersMap[row.voucher_id] = {
                    voucher_id: row.voucher_id,
                    voucher_no: row.voucher_no,
                    scheme_name: row.scheme_name,
                    head_name: row.head_name,
                    date: row.disbursement_date,
                    contractor: row.contractor_name,

                    work_name: row.estimate_work,
                    location: row.location,
                    extent: row.extent,

                    indent_no: row.indent_no,
                    sanction_no: row.sanction_no,
                    indent_month: row.indent_month,

                    range_name: row.range_name,
                    estimate_range_name: row.estimate_range_name,
                    division: row.division || row.estimate_division,
                    sub_division: row.sub_division || row.estimate_subdivision,

                    total_amount: row.rounded_gross_amount || row.gross_amount || 0,

                    items: []
                };
            }

            if (row.item_id) {
                vouchersMap[row.voucher_id].items.push({
                    item_id: row.item_id,
                    particulars: row.particulars,
                    qty: row.qty,
                    unit: row.unit,
                    rate: row.rate,
                    amount: row.voucher_split_amount,
                    pow: row.pow,
                    nb_no: row.nb_no,
                    page_no: row.page_no,
                    acf_date: row.acf_date,
                    times_days: row.times_days
                });
            }
        });

        res.json({
            success: true,
            data: Object.values(vouchersMap)
        });
    });
});
           
app.get("/get-headwise-cashbook", (req, res) => {
       const { user_id, month_name, head_name } = req.query;

    if (!user_id || !month_name || !head_name) {
        return res.json({
            success: false,
            message: "Missing user_id, month_name or head_name"
        });
    }

    const sql = `
        SELECT 
            v.id AS voucher_id,
            v.voucher_no,
            v.scheme_name,
            v.head_name,
            v.disbursement_date,
            v.rounded_gross_amount,
            v.gross_amount,
            v.contractor_name,

            ie.indent_no,
            ie.sanction_no,
            ed.circle,
            ie.indent_month,

            ed.work AS estimate_work,
            ed.location,
            ed.extent,
            ed.range_name AS estimate_range_name,
            ed.division AS estimate_division,
            ed.subdivision AS estimate_subdivision,
            
            

            r.range_name,
            r.division,
            r.sub_division,
            

            vi.id AS item_id,
            vi.particulars,
            vi.qty,
            vi.unit,
            vi.rate,
            vi.voucher_split_amount,
            vi.pow,
            vi.nb_no,
            vi.page_no,
            vi.acf_date,
            vi.times_days

        FROM vouchers v

        LEFT JOIN indent_entries ie 
            ON v.indent_id = ie.id

        LEFT JOIN estimate_details ed 
            ON ie.estimate_id = ed.id

        LEFT JOIN ranges r 
            ON r.user_id = v.user_id

        LEFT JOIN voucher_items vi 
            ON vi.voucher_id = v.id

        WHERE v.user_id = ?
          AND ie.indent_month LIKE CONCAT('%', ?, '%')
          AND v.head_name = ?

        ORDER BY 
            FIELD(v.scheme_name, 'GENERAL', 'CAMPA'),
            CAST(REPLACE(v.voucher_no, 'VTR ', '') AS UNSIGNED),
            vi.id ASC
    `;

    db.query(sql, [user_id, month_name, head_name], (err, rows) => {
        if (err) {
            console.log("HEADWISE CASHBOOK ERROR:", err);
            return res.json({
                success: false,
                message: "Headwise cashbook loading failed"
            });
        }

        const vouchersMap = {};

        rows.forEach(row => {
            if (!vouchersMap[row.voucher_id]) {
                vouchersMap[row.voucher_id] = {
                    voucher_id: row.voucher_id,
                    voucher_no: row.voucher_no,
                    scheme_name: row.scheme_name,
                    head_name: row.head_name,
                    date: row.disbursement_date,
                    contractor: row.contractor_name,

                    work_name: row.estimate_work,
                    location: row.location,
                    extent: row.extent,

                    indent_no: row.indent_no,
                    sanction_no: row.sanction_no,
                    indent_month: row.indent_month,

                    range_name: row.range_name,
                    circle: row.circle,
                    estimate_range_name: row.estimate_range_name,
                    division: row.division || row.estimate_division,
                    sub_division: row.sub_division || row.estimate_subdivision,

                    total_amount: row.rounded_gross_amount || row.gross_amount || 0,

                    items: []
                };
            }

            if (row.item_id) {
                vouchersMap[row.voucher_id].items.push({
                    item_id: row.item_id,
                    particulars: row.particulars,
                    qty: row.qty,
                    unit: row.unit,
                    rate: row.rate,
                    amount: row.voucher_split_amount,
                    pow: row.pow,
                    nb_no: row.nb_no,
                    page_no: row.page_no,
                    acf_date: row.acf_date,
                    times_days: row.times_days
                });
            }
        });

        res.json({
            success: true,
            data: Object.values(vouchersMap)
        });
    });
});

app.get("/get-classified-abstract", (req, res) => {
    const { user_id, month, head, indent_no } = req.query;

    if (!user_id || !month || !head || !indent_no) {
        return res.json({
            success: false,
            message: "Missing parameters"
        });
    }

    const sql = `
        SELECT 
            v.id AS voucher_id,
            v.voucher_no,
            v.scheme_name,
            v.head_name,
            v.disbursement_date,
            v.rounded_gross_amount,
            v.gross_amount,
            v.contractor_name,

            ie.indent_no,
            ie.sanction_no,
            ie.indent_month,

            ed.work AS estimate_work,
            ed.location,
            ed.extent,
            ed.circle,
            ed.division,
            ed.subdivision AS sub_division,
            ed.range_name AS estimate_range_name,

            vi.id AS item_id,
            vi.particulars,
            vi.qty,
            vi.unit,
            vi.rate,
            vi.voucher_split_amount,
            vi.pow,
            vi.nb_no,
            vi.page_no,
            vi.acf_date,
            vi.times_days

        FROM vouchers v

        LEFT JOIN indent_entries ie 
            ON v.indent_id = ie.id

        LEFT JOIN estimate_details ed 
            ON ie.estimate_id = ed.id

        LEFT JOIN voucher_items vi 
            ON vi.voucher_id = v.id

        WHERE v.user_id = ?
          AND ie.indent_month LIKE CONCAT('%', ?, '%')
          AND v.head_name = ?
          AND ie.indent_no = ?

        ORDER BY 
            CAST(REPLACE(v.voucher_no, 'VTR ', '') AS UNSIGNED),
            vi.id ASC
    `;

    db.query(sql, [user_id, month, head, indent_no], (err, rows) => {
        if (err) {
            console.log("CLASSIFIED ABSTRACT ERROR:", err);
            return res.json({
                success: false,
                message: "Classified abstract loading failed"
            });
        }

        if (!rows.length) {
            return res.json({
                success: false,
                message: "No data found",
                received: { user_id, month, head, indent_no }
            });
        }

        const vouchersMap = {};

        rows.forEach(row => {
            if (!vouchersMap[row.voucher_id]) {
                vouchersMap[row.voucher_id] = {
                    voucher_id: row.voucher_id,
                    voucher_no: row.voucher_no,
                    scheme_name: row.scheme_name,
                    head_name: row.head_name,
                    date: row.disbursement_date,
                    contractor: row.contractor_name,

                    work_name: row.estimate_work,
                    location: row.location,
                    extent: row.extent,

                    indent_no: row.indent_no,
                    sanction_no: row.sanction_no,
                    indent_month: row.indent_month,

                    range_name: row.estimate_range_name,
                    estimate_range_name: row.estimate_range_name,
                    circle: row.circle,
                    division: row.division,
                    sub_division: row.sub_division,

                    total_amount: row.rounded_gross_amount || row.gross_amount || 0,

                    items: []
                };
            }

            if (row.item_id) {
                vouchersMap[row.voucher_id].items.push({
                    item_id: row.item_id,
                    particulars: row.particulars,
                    qty: row.qty,
                    unit: row.unit,
                    rate: row.rate,
                    amount: row.voucher_split_amount,
                    pow: row.pow,
                    nb_no: row.nb_no,
                    page_no: row.page_no,
                    acf_date: row.acf_date,
                    times_days: row.times_days
                });
            }
        });

        res.json({
            success: true,
            data: Object.values(vouchersMap)
        });
    });
});


// START SERVER
app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});