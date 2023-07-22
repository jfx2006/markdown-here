module.exports = {
    meta: {
        name: "eslint-plugin-mailextensions-env",
        version: "1.0.0"
    },
    environments: {
        mailextensions: {
            globals: {
                messenger: false
            }
        }
    }
};
