import Users from "../src/dao/Users.dao.js";
import mongoose from "mongoose";
import { expect } from "chai";
import { describe, it, before, after } from "mocha";
import { configDotenv } from "dotenv";

configDotenv();

before(async () => {
  try {
    mongoose.connect(process.env.MONGO_URI);
  } catch (error) {
    console.error(`Couldn't connect to database: ${error.message}`);
  }
});

describe("Users dao CRUD testing", function () {
  this.timeout(5000);
  const daoUsers = new Users();

  const userMock = {
    first_name: "sample",
    last_name: "user",
    email: "sampleuser@mail.com",
    password: "sampleuser",
    role: "user",
    pets: []
  };

  beforeEach(async () => {
    await mongoose.connection.collection("users").deleteMany({
      email: userMock.email,
    });
  });

  afterEach(async () => {
    await mongoose.connection.collection("users").deleteMany({
      email: userMock.email,
    });
  });

  it("Expected result: full user object with _id", async () => {
    const result = await daoUsers.save(userMock);
    expect(result).to.have.property("_id");
    expect(result.email).to.equal(userMock.email);
  });
  it("Expected result: user objects array", async () => {
    await daoUsers.save(userMock);
    const result = await daoUsers.get({});
    expect(result).to.be.an("array");
    expect(result.length).to.be.greaterThan(0);
  });
  it("Expected result: user object found through email", async () => {
    await daoUsers.save(userMock);
    const result = await daoUsers.getBy({ email: userMock.email });
    expect(result).to.exist;
    expect(result.email).to.equal(userMock.email);
  });
  it("Expected result: last_name property changed to updated", async () => {
    const user = await daoUsers.save(userMock);
    const dataUpdate = { last_name: "updated" };
    await daoUsers.update(user._id, dataUpdate);
    const userUpdate = await daoUsers.getBy({ _id: user._id });
    expect(userUpdate.last_name).to.equal("updated");
  });

  it("Expected result: user not found in database after deletion", async () => {
    const user = await daoUsers.save(userMock);
    const deleted = await daoUsers.delete(user._id);
    expect(deleted).to.exist;
    const found = await daoUsers.getBy({ _id: user._id });
    expect(found).to.be.null;
  });
});