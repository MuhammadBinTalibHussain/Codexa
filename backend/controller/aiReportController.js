const AIReport = require("../models/AIReport");
const Snippet = require("../models/Snippet");
const asyncHandler = require("../utils/asyncHandler");
const { generateAnalysis, AIAnalysisError } = require("../services/aiReportService");
const notify = require("../utils/notify");

// @route  GET /api/reports/snippet/:id
const getReportForSnippet = asyncHandler(async (req, res) => {
    const report = await AIReport.findOne({ snippet: req.params.id });
    if (!report) {
        return res.status(404).json({ status: "error", data: null, message: "No AI report exists for this snippet yet" });
    }
    res.status(200).json({ status: "success", data: report, message: "AI report fetched successfully" });
});

// @route  POST /api/reports/generate/:id
const generateReport = asyncHandler(async (req, res) => {
    const snippet = await Snippet.findById(req.params.id);
    if (!snippet) {
        return res.status(404).json({ status: "error", data: null, message: "Snippet not found" });
    }

    let analysis;
    try {
        analysis = await generateAnalysis(snippet);
    } catch (err) {
        // Any failure here (empty/binary code, AI request failure, malformed or
        // unvalidated AI response) must NOT result in a stored report.
        if (err instanceof AIAnalysisError) {
            return res.status(err.status).json({ status: "error", data: null, message: err.message });
        }
        return res.status(500).json({ status: "error", data: null, message: "AI analysis failed unexpectedly" });
    }

    const report = await AIReport.findOneAndUpdate(
        { snippet: snippet._id },
        { snippet: snippet._id, ...analysis },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    await notify({
        recipientId: snippet.author,
        actorId: req.user._id,
        type: "ai-report",
        message: `An AI report has been generated for your snippet "${snippet.title}"`,
        link: `/snippets/${snippet._id}`,
    });

    res.status(201).json({ status: "success", data: report, message: "AI report generated successfully" });
});

// @route  DELETE /api/reports/:id (admin only)
const deleteReport = asyncHandler(async (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ status: "error", data: null, message: "Only an admin can delete AI reports" });
    }
    const report = await AIReport.findById(req.params.id);
    if (!report) {
        return res.status(404).json({ status: "error", data: null, message: "AI report not found" });
    }
    await report.deleteOne();
    res.status(200).json({ status: "success", data: { id: req.params.id }, message: "AI report deleted successfully" });
});

module.exports = { getReportForSnippet, generateReport, deleteReport };
