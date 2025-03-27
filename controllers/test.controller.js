const testModel = require("../models/test.model.js");

module.exports.createTest = async (req, res, next) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ message: "Name field is required" });
    }

    let testId;
    let existingTest;

    do {
        testId = Math.floor(Math.random() * 10000) + 1000;
        existingTest = await testModel.findOne({ testId });
    } while (existingTest);

    const test = new testModel({ name, testId });
    await test.save();

    return res.status(201).json({ message: "Test created successfully", testId });
};

module.exports.fetchAllTests = async (req, res, next) => {
    try {
        const tests = await testModel.find();
        return res.status(200).json({ tests });
    } catch (err) {
        return res.status(500).json({ message: "Error fetching tests", error: err.message });
    }
};

module.exports.updateTest = async (req, res, next) => {
    const { testId } = req.params;

    try {
        const test = await testModel.findOneAndUpdate({ testId }, req.body, { new: true });

        if (!test) {
            return res.status(404).json({ message: "Test not found" });
        }

        return res.status(200).json({ message: "Test updated successfully", test });
    } catch (err) {
        return res.status(500).json({ message: "Error updating test", error: err.message });
    }
};

module.exports.getTest = async (req, res, next) => {
    const { testId } = req.params;

    try {
        const test = await testModel.findOne({ testId });

        if (!test) {
            return res.status(404).json({ message: "Test not found" });
        }

        return res.status(200).json({ test });
    } catch (err) {
        return res.status(500).json({ message: "Error fetching test", error: err.message });
    }
};
