const mongoose = require("mongoose");

const testSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    startingTime: {
        type: Date,
        default: null 
    },
    endingTime: {
        type: Date,
        default: null 
    },
    testId: {
        type: Number,
        required: true,
        unique: true, 
        index: true
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active"
    },
    mcqs: [
        {
            _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
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
                    enum: ["cheated", "submitted"],
                    default: "submitted"
                }
            }
        ],
        default: []
    }
});

module.exports = mongoose.model("Test", testSchema);
