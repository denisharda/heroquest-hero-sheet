const { withAppBuildGradle } = require("expo/config-plugins");

const KEYSTORE_PROPERTIES_PATH =
  "/Users/denisharda/keystores/heroquest-herosheet/keystore.properties";

const RELEASE_SIGNING_CONFIG = `        release {
            def keystorePropertiesFile = file("${KEYSTORE_PROPERTIES_PATH}")
            if (!keystorePropertiesFile.exists()) {
                throw new GradleException("Missing keystore.properties at ${KEYSTORE_PROPERTIES_PATH}")
            }
            def keystoreProperties = new Properties()
            keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
            storeFile file(keystoreProperties['storeFile'])
            storePassword keystoreProperties['storePassword']
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
        }
`;

function addReleaseSigningConfig(contents) {
  if (/signingConfigs\s*\{[\s\S]*?release\s*\{[\s\S]*?storeFile file\(keystoreProperties/.test(contents)) {
    return contents;
  }

  const debugBlockRegex = /(signingConfigs\s*\{\s*\n\s*debug\s*\{[\s\S]*?\n\s*\}\s*\n)/;
  if (!debugBlockRegex.test(contents)) {
    throw new Error("withAndroidSigning: could not find signingConfigs { debug { ... } } block");
  }
  return contents.replace(debugBlockRegex, (match) => `${match}${RELEASE_SIGNING_CONFIG}`);
}

function pointReleaseBuildTypeAtReleaseSigningConfig(contents) {
  const releaseBlockRegex = /(buildTypes\s*\{[\s\S]*?release\s*\{[\s\S]*?)signingConfig\s+signingConfigs\.debug/;
  if (!releaseBlockRegex.test(contents)) {
    throw new Error("withAndroidSigning: could not find buildTypes.release signingConfig line");
  }
  return contents.replace(releaseBlockRegex, "$1signingConfig signingConfigs.release");
}

module.exports = function withAndroidSigning(config) {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.language !== "groovy") {
      throw new Error("withAndroidSigning: expected app/build.gradle to be Groovy");
    }
    let contents = config.modResults.contents;
    contents = addReleaseSigningConfig(contents);
    contents = pointReleaseBuildTypeAtReleaseSigningConfig(contents);
    config.modResults.contents = contents;
    return config;
  });
};
