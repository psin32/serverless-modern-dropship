module.exports = async () => {
  // Set up test environment variables
  process.env.ELASTICPATH_HOST =
    process.env.ELASTICPATH_HOST || "https://api.moltin.com";
  process.env.ELASTICPATH_CLIENT_ID =
    process.env.ELASTICPATH_CLIENT_ID || "test-client-id";
  process.env.ELASTICPATH_CLIENT_SECRET =
    process.env.ELASTICPATH_CLIENT_SECRET || "test-client-secret";
  console.log("Test environment variables set");
};
