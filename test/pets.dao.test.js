import mongoose from "mongoose";
import { expect } from "chai";
import { describe, it, before, after } from "mocha";
import { configDotenv } from "dotenv";
import Pet from "../src/dao/Pets.dao.js";

configDotenv();

before(async () => {
  try {
    mongoose.connect(process.env.MONGO_URI);
  } catch (error) {
    console.error(`Couldn't connect to database: ${error.message}`);
  }
});
after(async () => {
  await mongoose.connection.close()
})
describe("Pet dao CRUD testing", function () {
  this.timeout(5000);
  const petDao = new Pet();

  const petMock = {
    name: "test_pet",
    specie: "test_specie",
    birthDate: Date.now(),
    adopted: false,
    owner: mongoose.Types.ObjectId(),
  };

  beforeEach(async () => {
    await mongoose.connection.collection("pets").deleteMany({
      owner: petMock.owner,
    });
  });

  afterEach(async () => {
    await mongoose.connection.collection("pets").deleteMany({
      owner: petMock.owner,
    });
  });


  it("Expected get() result: pet objects array", async () => {
    await petDao.save(petMock);
    const result = await petDao.get();
    expect(result).to.be.an("array");
    expect(result.length).to.be.greaterThan(0);
  });
  it("Expected getBy(owner) result: pet object found through owner", async () => {
    await petDao.save(petMock);
    const result = await petDao.getBy({ owner: petMock.owner });
    expect(result).to.exist;
    expect(result.owner.toString()).to.equal(petMock.owner.toString());
  });
  it("Expected save() result: full pet object with _id", async () => {
    const result = await petDao.save(petMock);
    expect(result).to.have.property("_id");
    expect(result.owner.toString()).to.equal(petMock.owner.toString());
  });
  it("Expected update() result: name property changed to updated", async () => {
    const pet = await petDao.save(petMock);
    const updates = { name: "updated" };
    await petDao.update(pet._id, updates);
    const petUpdate = await petDao.getBy({ _id: pet._id });
    expect(petUpdate.name).to.equal("updated");
  });

  it("Expected delete() result: pet not found in database after deletion", async () => {
    const pet = await petDao.save(petMock);
    const deleted = await petDao.delete(pet._id);
    expect(deleted).to.exist;
    const found = await petDao.getBy({ _id: pet._id });
    expect(found).to.be.null;
  });
});