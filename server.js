const express = require("express");
const mysql = require("mysql");
const path = require("path");

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/master.html", (req, res) => {
    res.sendFile(__dirname + "/public/master.html");
});

app.get("/estimate.html", (req, res) => {
    res.sendFile(__dirname + "/public/estimate.html");
});

// DEFAULT LOGIN PAGE
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
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
app.post("/add-range", (req, res) => {

    const sql = "INSERT INTO ranges (division, sub_division, range_name, range_id, rfo_name, acf_name, cert1, cert2, cert3, acf_recommendation) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    const values = [
        req.body.division,
        req.body.sub_division,
        req.body.range_name,
        req.body.range_id,
        req.body.rfo_name,
        req.body.acf_name,
        req.body.cert1,
        req.body.cert2,
        req.body.cert3,
        req.body.acf_recommendation
    ];

    db.query(sql, values, (err) => {
        if (err) {
            console.log(err);
            res.send("Error");
        } else {
            res.send("Saved");
        }
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

    const { section_name, user_id } = req.body;

    const sql = "INSERT INTO section_master (section_name, user_id) VALUES (?, ?)";

    db.query(sql, [section_name, user_id], (err, result) => {
        if (err) {
            console.log(err);
            return res.send("Error");
        }
        res.send("section Saved");
    });

});

// ================= HOA SAVE =================
app.post("/add-hoa", (req, res) => {

    const { hoa_name, user_id } = req.body;

    const sql = "INSERT INTO hoa (hoa_name, user_id) VALUES (?, ?)";

    db.query(sql, [hoa_name, user_id], (err, result) => {
        if (err) {
            console.log(err);
            return res.send("Error");
        }
        res.send("hoa Saved");
    });

});



// ================= WORK SAVE =================
app.post("/add-work", (req, res) => {

    const { work_name } = req.body;

    if (!work_name) {
        return res.send("Work name required");
    }

    const sql = "INSERT INTO works (work_name) VALUES (?)";

    db.query(sql, [work_name], (err, result) => {
        if (err) {
            console.log("DB ERROR:", err);
            return res.send("Database error");
        }
        res.send("Work Saved Successfully");
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
    db.query("SELECT * FROM works ORDER BY work_name", (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json([]);
        }
        res.json(result);
    });
});


app.get("/get-masters", (req, res) => {

    const data = {};

    db.query("SELECT * FROM works", (err, work) => {
        data.work = work;

        db.query("SELECT * FROM hoa", (err, hoa) => {
            data.hoa = hoa;

            db.query("SELECT * FROM estimate_type_master", (err, type) => {
                data.type = type;

                db.query("SELECT * FROM year_master", (err, year) => {
                    data.year = year;

                    db.query("SELECT * FROM section_master", (err, sections) => {
                     data.section = sections;
                        res.json({ success: true, data });
                    });
                });
            });
        });
    });

});

app.get("/next-est-no", (req, res) => {
    const sql = "SELECT MAX(est_no) AS maxNo FROM estimate_details";

    db.query(sql, (err, result) => {
        if (err) {
            console.log("NEXT EST NO ERROR:", err);
            return res.json({
                success: true,
                est_no: 1
            });
        }

        if (!result || result.length === 0) {
            return res.json({
                success: true,
                est_no: 1
            });
        }

        const maxNo = result[0].maxNo || 0;
        const nextNo = maxNo + 1;

        res.json({
            success: true,
            est_no: nextNo
        });
    });
});


// ================= GET RANGE INFO =================
app.get("/get-range", (req, res) => {
    const sql = "SELECT * FROM ranges LIMIT 1";

    db.query(sql, (err, result) => {
        if (err) {
            console.log("GET RANGE ERROR:", err);
            return res.json({ success: false, data: null });
        }

        if (!result || result.length === 0) {
            return res.json({ success: false, data: null });
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
        UPDATE ranges
        SET division = ?,
            sub_division = ?,
            range_name = ?,
            range_id = ?,
            rfo_name = ?,
            acf_name = ?,
            cert1 = ?,
            cert2 = ?,
            cert3 = ?,
            acf_recommendation = ?
        LIMIT 1
    `;

    db.query(sql, [division, sub_division, range_name, range_id, rfo_name, acf_name, cert1, cert2, cert3, acf_recommendation], (err, result) => {
        if (err) {
            console.log("UPDATE RANGE ERROR:", err);
            return res.json({ success: false });
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
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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

    let sql = `
        SELECT id, est_no, work, year, estimate_type, created_at
        FROM estimate_details
    `;
    let values = [];

    if (search !== "") {
        sql += ` WHERE est_no LIKE ? OR work LIKE ? `;
        values.push(`%${search}%`, `%${search}%`);
    }

    sql += ` ORDER BY est_no DESC`;

    db.query(sql, values, (err, result) => {
        if (err) {
            console.log("GET ESTIMATES ERROR:", err);
            return res.json({ success: false, data: [] });
        }

        res.json({
            success: true,
            data: result
        });
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

    const sql1 = "SELECT * FROM estimate_details WHERE id = ? LIMIT 1";
    const sql2 = "SELECT * FROM estimate_ssr_items WHERE estimate_id = ? ORDER BY id ASC";

    db.query(sql1, [id], (err, estimateRows) => {
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
        WHERE id = ?
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
        id
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

app.post("/delete-estimate/:id", (req, res) => {
    const id = req.params.id;

    db.query("DELETE FROM estimate_ssr_items WHERE estimate_id = ?", [id], (err) => {
        if (err) {
            console.log("DELETE SSR ERROR:", err);
            return res.json({ success: false, message: "Failed to delete SSR items" });
        }

        db.query("DELETE FROM estimate_details WHERE id = ?", [id], (err2) => {
            if (err2) {
                console.log("DELETE ESTIMATE ERROR:", err2);
                return res.json({ success: false, message: "Failed to delete estimate" });
            }

            res.json({ success: true, message: "Estimate deleted successfully" });
        });
    });
});

                    // INDENT MODULE
app.get("/get-unsanctioned-estimates", (req, res) => {
    const search = req.query.search ? req.query.search.trim() : "";

    let sql = `
        SELECT e.id, e.est_no, e.year, e.estimate_type, e.work, e.total_amount, e.created_at
        FROM estimate_details e
        LEFT JOIN estimate_sanctions s ON e.id = s.estimate_id
        WHERE s.estimate_id IS NULL
    `;
    let values = [];

    if (search !== "") {
        sql += ` AND (e.est_no LIKE ? OR e.work LIKE ?) `;
        values.push(`%${search}%`, `%${search}%`);
    }

    sql += ` ORDER BY e.est_no DESC`;

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

    let sql = `
        SELECT 
            e.id AS sanction_id,
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
        WHERE 1=1
    `;
    let values = [];

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
    const { estimate_id, sanction_no, sanction_date } = req.body;

    if (!estimate_id || !sanction_no) {
        return res.json({ success: false, message: "Estimate and sanction number required" });
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

app.post("/update-sanction/:estimate_id", (req, res) => {
    const estimate_id = req.params.estimate_id;
    const { sanction_no, sanction_date } = req.body;

    console.log("UPDATE BY ESTIMATE ID:", estimate_id);

    if (!sanction_no) {
        return res.json({ success: false, message: "Sanction number required" });
    }

    const sql = `
        UPDATE estimate_sanctions
        SET sanction_no = ?, sanction_date = ?
        WHERE estimate_id = ?
    `;

    db.query(sql, [sanction_no, sanction_date || null, estimate_id], (err, result) => {
        if (err) {
            console.log("UPDATE ERROR:", err);
            return res.json({ success: false });
        }

        console.log("UPDATE RESULT:", result);

        res.json({ success: true });
    });
});

// START SERVER
app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});