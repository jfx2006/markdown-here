module.exports = {
  // Global options:
  verbose: true,
  // Command options:
  build: {
    overwriteDest: true,
    filename: "{name}-{version}.xpi",
  },
  sourceDir: "src",
  ignoreFiles: ["**/test", "**/test/**"],
  run: {
    // must be in $PATH or a full path
    firefox: "thunderbird",
    // profile must exist or pass --profile-create-if-missing in the commandline
    // profile does not persist, use --keep-profile-changes to update it
    firefoxProfile: "./mdhr_test_profiles/testing_profile",
    devtools: true,
    args: ["--devtools"],
  },
}
