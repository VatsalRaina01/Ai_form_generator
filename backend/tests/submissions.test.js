const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const Submission = require('../models/Submission');
const Form = require('../models/Form');
const User = require('../models/User');

describe('Submissions Routes', () => {
    let formId;
    let userId;

    beforeAll(async () => {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test');
        }
    });

    afterAll(async () => {
        await Submission.deleteMany({});
        await Form.deleteMany({});
        await User.deleteMany({});
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        await Submission.deleteMany({});
        await Form.deleteMany({});
        await User.deleteMany({});

        const user = new User({
            email: 'test@example.com',
            password: 'hashedpassword'
        });
        await user.save();
        userId = user._id;

        const form = new Form({
            owner: userId,
            title: 'Test Form',
            schema: { title: 'Test Form', fields: [] }
        });
        await form.save();
        formId = form._id.toString();
    });

    describe('POST /api/submissions', () => {
        it('should create a new submission', async () => {
            const submissionData = {
                formId,
                data: {
                    name: 'John Doe',
                    email: 'john@example.com'
                }
            };

            const res = await request(app)
                .post('/api/submissions')
                .send(submissionData);

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('formId');
            expect(res.body).toHaveProperty('data');
        });
    });

    describe('GET /api/submissions/form/:formId', () => {
        it('should get all submissions for a form', async () => {
            await new Submission({
                formId,
                data: { name: 'John Doe' }
            }).save();

            await new Submission({
                formId,
                data: { name: 'Jane Doe' }
            }).save();

            const res = await request(app)
                .get(`/api/submissions/form/${formId}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBe(2);
        });
    });
});

