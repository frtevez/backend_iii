import supertest from "supertest"
import { app } from "../src/app.js"
import mongoose from "mongoose";
import { expect } from "chai";
import { describe, it, before, after } from "mocha";

const request = supertest(app);

const usersCollection = mongoose.connection.collection("users");
describe("Users Router Test", function () {
    this.timeout(5000);

    before(async function () {
        this.userMock = {
            first_name: "test_user",
            last_name: "test_user",
            email: "testuser@mail.com",
            password: "testuser",
            role: "user",
            pets: []
        };
        this.userMockId = (await usersCollection.insertOne(this.userMock)).insertedId
    });

    after(async function () {
        await usersCollection.deleteMany({
            _id: this.userMockId,
        });
    });

    it("Get User List Test: expects to obtain an array", async function () {
        await request
            .get("/api/users/")
            .expect(200)
            .then(async res => {
                const payload = res.body.payload
                expect(payload[0]).to.have.property("password")
                expect(payload).to.be.an("array")
            })
    });
    it("Get User Test: expects to obtain a user object", async function () {
        await request
            .get(`/api/users/${this.userMockId}`)
            .expect(200)
            .then(async res => {
                const payload = res.body.payload
                expect(payload).to.have.property("email", this.userMock.email)
            })
    })

    it("Update User Test: expects user email to be changed", async function () {
        await request
            .put(`/api/users/${this.userMockId}`)
            .send({ email: "testemailchanged@mail.com" })
            .expect(200)
            .then(async res => {
                const payload = res.body.payload

                expect(payload).to.have.property("email", "testemailchanged@mail.com")
            })
    })

    it("Delete User Test: expects user to be no longer found", async function () {
        await request
            .delete(`/api/users/${this.userMockId}`)
            .expect(200)
            .then(async res => {
                const deletedUser = await usersCollection.findOne({ _id: this.userMockId })

                expect(deletedUser).to.not.exist
            })
    })

});