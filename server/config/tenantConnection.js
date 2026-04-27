const mongoose = require('mongoose');

const connectionCache = {};

const getTenantDb = async (dbName) => {
  if (!dbName) return mongoose.connection; // Fallback to main DB

  if (connectionCache[dbName]) {
    return connectionCache[dbName];
  }

  const baseUri = process.env.MONGO_URI.split('?')[0];
  const query = process.env.MONGO_URI.split('?')[1] || '';
  
  // Construct tenant-specific URI
  // If the baseUri ends with a slash and a db name, replace it. 
  // Otherwise append the dbName.
  let tenantUri;
  const uriParts = baseUri.split('/');
  if (uriParts.length > 3) {
    uriParts[uriParts.length - 1] = dbName;
    tenantUri = uriParts.join('/') + (query ? `?${query}` : '');
  } else {
    tenantUri = `${baseUri}/${dbName}${query ? `?${query}` : ''}`;
  }

  console.log(`Creating new connection for tenant DB: ${dbName}`);
  
  const connection = await mongoose.createConnection(tenantUri).asPromise();
  connectionCache[dbName] = connection;

  return connection;
};

module.exports = { getTenantDb };
