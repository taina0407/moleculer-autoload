const path = require("path");
const glob = require("glob");

const loadServiceComponents = (dirName, subDir, fileMask) => {
  if (!fileMask) {
    throw new Error("Parameter fileMask are required");
  }
  const fileTrail = fileMask.replace("**/*.", "").replace("*.", "");
  const fileTrailRegexp = new RegExp(`.?${fileTrail}$`, "i");
  const filePaths = glob.sync(path.join(dirName, subDir, fileMask));
  const actions = {};
  if (filePaths) {
    let fName;
    filePaths.forEach((filePath) => {
      fName = require.resolve(path.resolve(filePath));
      const r = require(fName);
      const actionName = path.basename(filePath).replace(fileTrailRegexp, "");
      actions[actionName] = r.default != null ? r.default : r;
    });
  }
  return actions;
};

module.exports = (dirName) => {
  if (!dirName) throw new Error("Parameter dirName is required");
  return {
    name: "moleculer-autoload",

    merged(schema) {
      if (schema.autoloads) {
        Object.entries(schema.autoloads).forEach(([type, fileMask]) => {
          if (!schema[type]) {
            schema[type] = {};
          }
          const autoLoaded = loadServiceComponents(dirName, type, fileMask);
          Object.entries(autoLoaded).forEach(([n, v]) => {
            schema[type][n] = v;
          });
        });
      }
    }
  };
};
