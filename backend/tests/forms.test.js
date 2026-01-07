const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const Form = require('../models/Form');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

describe('Forms Routes', () => {
    let authToken;
    let userId;

    beforeAll(async () => {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test');
        }
    });

    afterAll(async () => {
        await Form.deleteMany({});
        await User.deleteMany({});
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        await Form.deleteMany({});
        await User.deleteMany({});

        // Create test user and token
        const user = new User({
            email: 'test@example.com',
            password: 'hashedpassword'
        });
        await user.save();
        userId = user._id.toString();
        authToken = jwt.sign({ userId }, JWT_SECRET);
    });

    describe('POST /api/forms', () => {
        it('should create a new form', async () => {
            const formData = {
                owner: userId,
                title: 'Test Form',
                description: 'Test Description',
                schema: {
                    title: 'Test Form',
                    fields: [
                        { name: 'name', label: 'Name', type: 'text', required: true }
                    ]
                },
                purpose: 'testing'
            };

            const res = await request(app)
                .post('/api/forms')
                .send(formData);

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('title', 'Test Form');
            expect(res.body).toHaveProperty('schema');
        });
    });

    describe('GET /api/forms/:id', () => {
        it('should get a form by id', async () => {
            const form = new Form({
                owner: userId,
                title: 'Test Form',
                schema: { title: 'Test Form', fields: [] }
            });
            await form.save();

            const res = await request(app)
                .get(`/api/forms/${form._id}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('title', 'Test Form');
        });

        it('should return 404 for non-existent form', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .get(`/api/forms/${fakeId}`);

            expect(res.statusCode).toBe(404);
        });
    });

    describe('GET /api/forms/user/:userId', () => {
        it('should get all forms for a user', async () => {
            await new Form({
                owner: userId,
                title: 'Form 1',
                schema: { title: 'Form 1', fields: [] }
            }).save();

            await new Form({
                owner: userId,
                title: 'Form 2',
                schema: { title: 'Form 2', fields: [] }
            }).save();

            const res = await request(app)
                .get(`/api/forms/user/${userId}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBe(2);
        });
    });
});

