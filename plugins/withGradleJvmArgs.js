const { withGradleProperties } = require('@expo/config-plugins');

/**
 * Local release builds (./gradlew assembleRelease) OOM with
 * `OutOfMemoryError: Metaspace` on the default 2 GiB heap / 512 MiB
 * metaspace — KSP (expo-updates) and vital lint both die from it.
 * Bump the Gradle daemon memory. Applied to android/gradle.properties
 * at prebuild time so it survives `expo prebuild --clean`.
 */
module.exports = function withGradleJvmArgs(config) {
  return withGradleProperties(config, (config) => {
    const value = '-Xmx4g -XX:MaxMetaspaceSize=1g';
    const existing = config.modResults.find((prop) => prop.key === 'org.gradle.jvmargs');
    if (existing) {
      existing.value = value;
    } else {
      config.modResults.push({ type: 'property', key: 'org.gradle.jvmargs', value });
    }
    return config;
  });
};
