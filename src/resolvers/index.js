const queries = require('./queries');
const mutations = require('./mutations');
const fieldResolvers = require('./fieldResolvers');

const resolvers = {
  Query: queries,
  Mutation: mutations,
  ...fieldResolvers
};

module.exports = resolvers; 