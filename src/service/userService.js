const repositorio = require('../repositorie/repositorio.js');

const getAllUsers = async () => {
  return await userRepository.findAll();
};

const createUser = async (userData) => {
  if (!userData.name || !userData.email) {
    throw new Error('Name and email are required');
  }
  return await userRepository.save(userData);
};

module.exports = { getAllUsers, createUser };