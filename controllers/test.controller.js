const testModel = require('../models/test.model.js');

module.exports.createtest = async (req, res, next) => {

    const { name, startingTime, endingTime, mcqs } = req.body;

    if (!name || !startingTime || !endingTime || !mcqs) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const test = await testModel.create({
        name,
        startingTime,
        endingTime,
        mcqs
    });

    return res.status(201).json({ message: 'Test created successfully', test });
} 


module.exports.fetchtests = async (req, res, next) => {
    
        const tests = await testModel.find();
    
        return res.status(200).json({ tests });
}

