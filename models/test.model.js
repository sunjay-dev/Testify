const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    startingTime: {
        type: Date,
        required: true
    },
    endingTime: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    mcqs: [
        {
            question: {
                type: String,
                required: true
            },
            options: [
                {
                    text: { type: String, required: true },
                    isCorrect: { type: Boolean, default: false }
                }
            ]
        }
    ],
    students: {
        type: [
            {
                rollno: {
                    type: String,
                    required: true
                },
                name: {
                    type: String,
                    required: true
                },
                score: {
                    type: Number,
                    default: 0
                },
                answers: [
                    {
                        questionId: {
                            type: mongoose.Schema.Types.ObjectId,
                            required: true
                        },
                        selectedIndex: {
                            type: Number,
                            required: true
                        }
                    }
                ],
                status: {
                    type: String,
                    enum: ['cheated', 'submitted']
                }
            }
        ],
        default: []
    }
});

module.exports = mongoose.model('Test', testSchema);