import supertest from "supertest"
import { app } from "../src/app.js"
import mongoose from "mongoose";
import { expect } from "chai";
import { describe, it, before, after } from "mocha";

const request = supertest(app);

const petsCollection = mongoose.connection.collection("pets");
describe("Pets Router Test", function () {
    this.timeout(5000);

    before(async function () {
        this.petMock = {
            name: "test_pet",
            specie: "test_specie",
            birthDate: "12-30-2000"
        };
        this.petMockId = null
    });

    after(async function () {
        await petsCollection.deleteMany({
            _id: this.petMockId,
        });
    });

    it("Pet Create Test: testing payload._id type, pet existence and properties", async function () {
        await request
            .post("/api/pets/")
            .send(this.petMock)
            .expect(200)
            .then(async (res) => {
                const payload = res.body.payload
                const pet = await petsCollection.findOne({ _id: mongoose.Types.ObjectId(payload._id) })
                this.petMockId = payload._id
                expect(payload._id).to.be.an('string')
                expect(pet).to.exist
                expect(pet).to.have.property("name")
                expect(pet).to.have.property("specie")
                expect(pet).to.have.property("image")
                expect(pet).to.have.property("adopted")
                expect(pet).to.have.property("birthDate")
            })
    });

    it("Get Pet List Test: expects to obtain an array", async function () {
        await request
            .get("/api/pets/")
            .expect(200)
            .then(async res => {
                const payload = res.body.payload
                expect(payload[0]).to.have.property("specie")
                expect(payload).to.be.an("array")
            })
    });

    it("Create Pet Object with Image: expects to find it's _id after created", async function () {
        await request
            .post("/api/pets/withimage")
            .field("specie", this.petMock.specie)
            .field("birthDate", this.petMock.birthDate)
            .field("name", this.petMock.name)
            .attach("image", "./test/files/coderDog.jpg")
            .expect(200)
            .then(async (res) => {
                const payload = res.body.payload
                expect(payload).to.have.property("_id");
                petsCollection.deleteMany({ image: payload.image })
            })
    });

    it("Update Pet Test: expects pet owner to be changed", async function () {
        const newObjectId = new mongoose.Types.ObjectId()

        await request
            .put(`/api/pets/${this.petMockId}`)
            .send({ owner: newObjectId })
            .expect(200)
            .then(async res => {
                const payload = res.body.payload

                expect(payload).to.have.property("owner", newObjectId.toString())
            })
    })

    it("Delete Pet Test: expects pet to be no longer found", async function () {
        await request
            .delete(`/api/pets/${this.petMockId}`)
            .expect(200)
            .then(async res => {
                const deletedUser = await petsCollection.findOne({ _id: this.petMockId })

                expect(deletedUser).to.not.exist
            })
    })

});