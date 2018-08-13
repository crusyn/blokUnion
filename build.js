const fs = require("fs");
const path = require("path");

module.exports = function(options, callback) {
  const artifactsDir = options.contracts_build_directory;
  const outputDir = path.join(options.working_directory, "lib");
  const outputIndexPath = path.join(outputDir, "index.js");

  const files = fs.readdirSync(artifactsDir);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  fs.writeFileSync(outputIndexPath, "module.exports = {\n");

  files.filter(fileName => fileName.indexOf(".json") >= 0).forEach(fileName => {
    const json = JSON.parse(fs.readFileSync(path.join(artifactsDir, fileName)));
    const name = fileName.slice(0, -5);
    const outputPath = path.join(outputDir, name + ".js");
    fs.writeFileSync(outputPath, "module.exports = " + JSON.stringify(json));
    fs.appendFileSync(
      outputIndexPath,
      "\t" + name + ': require("./' + name + '.js"),\n'
    );
  });

  fs.appendFileSync(outputIndexPath, "};");
};
