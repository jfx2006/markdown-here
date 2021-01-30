module.exports = {
    // Global options:
    verbose: true,
    // Command options:
    build: {
        overwriteDest: true,
    },
    sourceDir: "src",
    run: {
        // must be in $PATH or a full path
        firefox: "thunderbird",
        // profile must exist or pass --profile-create-if-missing in the commandline
        // profile does not persist, use --keep-profile-changes to update it
        firefoxProfile: "testing_profile"
    },
};
