import mongoose, { mongo } from "mongoose";
import { expect } from "chai";
import { describe, it, before, after } from "mocha";
import { configDotenv } from "dotenv";
import Adoption from "../src/dao/Adoption.js";

configDotenv();

before(async () => {
  try {
    mongoose.connect(process.env.MONGO_URI);
  } catch (error) {
    console.error(`Couldn't connect to database: ${error.message}`);
  }
});

describe("Adoption dao CRUD testing", function () {
  this.timeout(5000);
  const adoptionDao = new Adoption();

  const adoptionMock = {
    owner: mongoose.Types.ObjectId(),
    pet: mongoose.Types.ObjectId()
  };

  beforeEach(async () => {
    await mongoose.connection.collection("Adoptions").deleteMany({
      owner: adoptionMock.owner,
    });
    
  });

  afterEach(async () => {
    await mongoose.connection.collection("Adoptions").deleteMany({
      owner: adoptionMock.owner,
    });
  });

  
  it("Expected get() result: adoption objects array", async () => {
    await adoptionDao.save(adoptionMock);
    const result = await adoptionDao.get();
    expect(result).to.be.an("array");
    expect(result.length).to.be.greaterThan(0);
  });
  it("Expected getBy(owner) result: adoption object found through owner", async () => {
    await adoptionDao.save(adoptionMock);
    const result = await adoptionDao.getBy({ owner: adoptionMock.owner });
    expect(result).to.exist;
    expect(result.owner.toString()).to.equal(adoptionMock.owner.toString());
  });
  it("Expected save() result: full adoption object with _id", async () => {
    const result = await adoptionDao.save(adoptionMock);
    expect(result).to.have.property("_id");
    expect(result.owner.toString()).to.equal(adoptionMock.owner.toString());
  });
  it("Expected update() result: pet property changed to updated", async () => {
    const adoption = await adoptionDao.save(adoptionMock);
    const pet = mongoose.Types.ObjectId()
    console.log("pet ",pet);
    
    const updates = { pet: pet};
    await adoptionDao.update(adoption._id, updates);
    const adoptionUpdate = await adoptionDao.getBy({ _id: adoption._id });
    expect(adoptionUpdate.pet.toString()).to.equal(pet.toString());
  });

  it("Expected delete() result: adoption not found in database after deletion", async () => {
    const adoption = await adoptionDao.save(adoptionMock);
    const deleted = await adoptionDao.delete(adoption._id);
    expect(deleted).to.exist;
    const found = await adoptionDao.getBy({ _id: adoption._id });
    expect(found).to.be.null;
  });
});