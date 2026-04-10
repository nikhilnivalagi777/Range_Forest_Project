const express = require("express");
const mysql = require("mysql");
const path = require("path");

const app = express();

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
app.get("/get-range", (req, res) => {
    const user_id = req.query.user_id;

    if (!user_id) {
        return res.json({ success: false, message: "User not logged in" });
    }

    const sql = "SELECT * FROM ranges WHERE user_id = ? LIMIT 1";

    db.query(sql, [user_id], (err, result) => {
        if (err) {
            console.log("GET RANGE ERROR:", err);
            return res.json({ success: false, data: null });
        }

        if (!result || result.length === 0) {
            return res.json({ success: true, data: null });
        }

        res.json({
            success: true,
            data: result[0]
        });
    });
});

// ================= SAVE RANGE INFO =================
app.post("/add-range", (req, res) => {
    const {
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

    const sql = `
        INSERT INTO ranges
        (division, sub_division, range_name, range_id, rfo_name, acf_name, cert1, cert2, cert3, acf_recommendation)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [division, sub_division, range_name, range_id, rfo_name, acf_name, cert1, cert2, cert3, acf_recommendation], (err, result) => {
        if (err) {
            console.log("ADD RANGE ERROR:", err);
            return res.json({ success: false });
        }

        res.json({ success: true, message: "Range saved successfully" });
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

// START SERVER
app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});