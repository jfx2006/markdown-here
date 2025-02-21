FROM node:20


# ensure local node/python is preferred over distribution
ENV PATH /usr/local/bin:$PATH

RUN export GNUPGHOME="$(mktemp -d)" \
  && set -ex \
  && corepack enable \
  && corepack prepare pnpm@latest --activate

ENV RELEASE_CLI_VER 0.18.0

RUN curl --location --output /usr/local/bin/release-cli "https://gitlab.com/api/v4/projects/gitlab-org%2Frelease-cli/packages/generic/release-cli/v${RELEASE_CLI_VER}/release-cli-linux-amd64" \
    && chmod +x /usr/local/bin/release-cli

SHELL ["/bin/bash", "-l"]
