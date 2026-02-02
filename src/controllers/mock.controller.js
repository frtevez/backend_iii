import { faker } from "@faker-js/faker";
import { petsService, usersService } from "../services/index.js";
import { createHash } from "../utils/index.js";

const _generateMultipleMocks = async (callback, quantity) => {
    const result = []
    for (let i = 0; i < quantity; i++) {
        result.push(await callback());
    }
    return result
}

const _generateUser = async () => {
    const first_name = faker.person.firstName()
    const last_name = faker.person.lastName()
    const email = faker.internet.email({ firstName: first_name, lastName: last_name })
    const password = faker.internet.password({ memorable: true })
    const role = faker.helpers.arrayElement(['user', 'admin'])
    const pets = []

    const hashedPassword = await createHash(password)
    const user = await usersService.create({
        first_name,
        last_name,
        email,
        password,
        role,
        pets
    })
    return user
}

const _generatePet = async () => {
    const name = faker.animal.petName()
    const specie = faker.animal.type()
    const birthdate = faker.date.birthdate({
        mode: "age",
        min: 1,
    })
    const adopted = false
    const owner = null
    const image = ""
    const pet = await petsService.create({
        name,
        specie,
        birthdate,
        adopted,
        owner,
        image
    })

    return pet
}

const generateMockUsers = async (req, res) => {
    const quantity = req.body.quantity || 50
    const result = await _generateMultipleMocks(_generateUser, quantity)
    res.send({ status: "success", payload: result })
}

const generateMockPets = async (req, res) => {
    const quantity = req.body.quantity || 50
    const result = await _generateMultipleMocks(_generatePet, quantity)
    res.send({ status: "success", payload: result })
}

const generateData = async (req, res) => {
    const quantity = req.body.quantity
    if (!quantity) {
        res.send({ status: "error", message: "No quantity provided in request body." })
        return
    }
    const generatedUsers = await _generateMultipleMocks(_generateUser, quantity)
    const generatedPets = await _generateMultipleMocks(_generatePet, quantity)
    const result = { generatedUsers, generatedPets }
    res.send({ status: "success", payload: result })
}
export default {
    generateMockUsers,
    generateMockPets,
    generateData
}