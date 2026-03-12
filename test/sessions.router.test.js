import supertest from "supertest"
import { app } from "../src/app.js"
import mongoose from "mongoose";
import { expect } from "chai";
import { describe, it, before, after } from "mocha";

const request = supertest(app);

const usersCollection = mongoose.connection.collection("users");
describe("Sessions Router Test", function () {
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
    this.cookie = null;
  });

  after(async function () {
    await usersCollection.deleteMany({
      email: this.userMock.email,
    });
  });

  it("User Register Test: testing payload (_id) type, user existence and properties", async function () {
    await request
      .post("/api/sessions/register")
      .send(this.userMock)
      .expect(200)
      .then(async (res) => {
        const payload = res.body.payload
        const user = await usersCollection.findOne({ _id: mongoose.Types.ObjectId(payload) })
        expect(payload).to.be.an('string')
        expect(user).to.exist
        expect(user).to.have.property("first_name")
        expect(user).to.have.property("last_name")
        expect(user).to.have.property("email")
        expect(user).to.have.property("password")
        expect(user).to.have.property("role")
        expect(user).to.have.property("pets")
      })
  });

  it("User Login Session Test: testing login with pre-existing user and store session in cookie", async function () {
    const loginMock = {
      email: this.userMock.email,
      password: this.userMock.password,
    };
    await request.post("/api/sessions/login")
      .send(loginMock)
      .then(async res => {
        const cookieResult = res.header["set-cookie"][0];
        const cookieData = cookieResult.split("=");

        this.cookie = {
          name: cookieData[0],
          value: cookieData[1].split(";")[0],
        };
        expect(this.cookie.name).to.eql("coderCookie");
        expect(this.cookie.value).to.be.ok;
      })
  });

  it("Current Session Test: get cookie from this session with appropiate values", async function () {
    await request
      .get("/api/sessions/current")
      .set("Cookie", `${this.cookie.name}=${this.cookie.value}`)
      .expect(200)
      .then(async res => {
        const payload = res.body.payload
        expect(payload).to.have.property("email", this.userMock.email)
      })
  });
});