const AIReport = require("../models/AIReport");
const Snippet = require("../models/Snippet");
const asyncHandler = require("../utils/asyncHandler");
const { generateMockAnalysis } = require("../services/aiReportService");

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
    const analysis = generateMockAnalysis(snippet);
    const report = await AIReport.findOneAndUpdate(
        { snippet: snippet._id },
        { snippet: snippet._id, ...analysis },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );
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