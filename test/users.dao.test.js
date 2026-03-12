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
after(async () => {
  await mongoose.disconnect()
})

describe("Users dao CRUD testing", function () {
  this.timeout(5000);
  const usersDao = new Users();

  const userMock = {
    first_name: "test_user",
    last_name: "test_user",
    email: "testuser@mail.com",
    password: "testuser",
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


  it("Expected get() result: user objects array", async () => {
    await usersDao.save(userMock);
    const result = await usersDao.get();
    expect(result).to.be.an("array");
    expect(result.length).to.be.greaterThan(0);
  });
  it("Expected getBy(email) result: user object found through email", async () => {
    await usersDao.save(userMock);
    const result = await usersDao.getBy({ email: userMock.email });
    expect(result).to.exist;
    expect(result.email).to.equal(userMock.email);
  });
  it("Expected save() result: full user object with _id", async () => {
    const result = await usersDao.save(userMock);
    expect(result).to.have.property("_id");
    expect(result.email).to.equal(userMock.email);
  });
  it("Expected update() result: last_name property changed to updated", async () => {
    const user = await usersDao.save(userMock);
    const updates = { last_name: "updated" };
    await usersDao.update(user._id, updates);
    const userUpdate = await usersDao.getBy({ _id: user._id });
    expect(userUpdate.last_name).to.equal("updated");
  });

  it("Expected delete() result: user not found in database after deletion", async () => {
    const user = await usersDao.save(userMock);
    const deleted = await usersDao.delete(user._id);
    expect(deleted).to.exist;
    const found = await usersDao.getBy({ _id: user._id });
    expect(found).to.be.null;
  });
});