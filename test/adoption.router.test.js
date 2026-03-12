import supertest from "supertest"
import { app } from "../src/app.js"
import mongoose from "mongoose";
import { expect } from "chai";
import { describe, it, before, after } from "mocha";

const request = supertest(app);

const adoptionsCollection = mongoose.connection.collection("adoptions");
const usersCollection = mongoose.connection.collection("users");
const petsCollection = mongoose.connection.collection("pets");
describe("Adoption Router Test", function () {
    this.timeout(5000);

    before(async function () {
        const ownerId = (await usersCollection.insertOne({
            first_name: "adoption_test",
            last_name: "adoption_test2",
            email: "adoption@mail.com",
            password: "adoptiontest"
        })).insertedId
        const petId = (await petsCollection.insertOne({
            name: "adoption_test3",
            specie: "adoption_test4",
            birthDate: "12-30-2000"
        })).insertedId
        this.adoptionMock = {
            owner: ownerId,
            pet: petId
        };

        this.adoptionMockId = null
    });

    after(async function () {
        await adoptionsCollection.deleteMany({
            _id: mongoose.Types.ObjectId(this.adoptionMockId),
        });
        await usersCollection.deleteMany({ _id: this.adoptionMock.owner })
        await petsCollection.deleteMany({ _id: this.adoptionMock.pet })
    });

    it("Create Adoption Test: expects adoption object to be created with certain owner and pet", async function () {
        await request
            .post(`/api/adoptions/${this.adoptionMock.owner}/${this.adoptionMock.pet}`)
            .expect(200)
            .then(async res => {
                const payload = res.body.payload

                expect(payload).to.have.property("_id")
                expect(payload).to.have.property("owner", this.adoptionMock.owner.toString())
                expect(payload).to.have.property("pet", this.adoptionMock.pet.toString())
                this.adoptionMockId = payload._id
            })
    })

    it("Get Adoption List Test: expects to obtain an array", async function () {
        await request
            .get("/api/adoptions/")
            .expect(200)
            .then(async res => {
                const payload = res.body.payload
                expect(payload[0]).to.have.property("owner")
                expect(payload[0]).to.have.property("pet")
                expect(payload).to.be.an("array")
            })
    });
    it("Get Adoption Test: expects to obtain an adoption object", async function () {
        await request
            .get(`/api/adoptions/${this.adoptionMockId}`)
            .expect(200)
            .then(async res => {
                const payload = res.body.payload
                expect(payload).to.have.property("owner", this.adoptionMock.owner.toString())
                expect(payload).to.have.property("pet", this.adoptionMock.pet.toString())
            })
    })
});