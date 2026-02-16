
# From https://github.com/nodejs/docker-node/blob/main/22/bookworm/Dockerfile
FROM buildpack-deps:bookworm

RUN groupadd --gid 1000 node \
  && useradd --uid 1000 --gid node --shell /bin/bash --create-home node


# ensure local node/python is preferred over distribution
ENV PATH=/usr/local/bin:$PATH

ENV NODE_VERSION=22.20.0
ENV ARCH=x64

RUN export GNUPGHOME="$(mktemp -d)" \
  && set -ex \
  && for key in \
              5BE8A3F6C8A5C01D106C0AD820B1A390B168D356 \
              DD792F5973C6DE52C432CBDAC77ABFA00DDBF2B7 \
              CC68F5A3106FF448322E48ED27F5E38D5B0A215F \
              8FCCA13FEF1D0C2E91008E09770F7A9A5AE15600 \
              890C08DB8579162FEE0DF9DB8BEAB4DFCF555EF4 \
              C82FA3AE1CBEDC6BE46B9360C43CEC45C17AB93C \
              108F52B48DB57BB0CC439B2997B01419BD92F80A \
              A363A499291CBBC940DD62E41F10027AF002F8B0 \
  ; do \
      gpg --batch --keyserver hkps://keys.openpgp.org --recv-keys "$key" || \
      gpg --batch --keyserver keyserver.ubuntu.com --recv-keys "$key" ; \
  done \
  && curl -fsSLO --compressed "https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-$ARCH.tar.xz" \
  && curl -fsSLO --compressed "https://nodejs.org/dist/v$NODE_VERSION/SHASUMS256.txt.asc" \
  && gpg --batch --decrypt --output SHASUMS256.txt SHASUMS256.txt.asc \
  && gpgconf --kill all \
  && rm -rf "$GNUPGHOME" \
  && grep " node-v$NODE_VERSION-linux-$ARCH.tar.xz\$" SHASUMS256.txt | sha256sum -c - \
  && tar -xJf "node-v$NODE_VERSION-linux-$ARCH.tar.xz" -C /usr/local --strip-components=1 --no-same-owner \
  && rm "node-v$NODE_VERSION-linux-$ARCH.tar.xz" SHASUMS256.txt.asc SHASUMS256.txt \
  && ln -s /usr/local/bin/node /usr/local/bin/nodejs \
  # smoke tests
  && node --version \
  && npm --version \
  && rm -rf /tmp/*


# cannot remove LANG even though https://bugs.python.org/issue19846 is fixed
# last attempted removal of LANG broke many users:
# https://github.com/docker-library/python/pull/570
ENV LANG=C.UTF-8

ENV PYTHON_VER=3.12.12
ENV STANDALONE_TAG=20251010
ENV PYTHON_URL=https://github.com/astral-sh/python-build-standalone/releases/download/${STANDALONE_TAG}/cpython-${PYTHON_VER}+${STANDALONE_TAG}-x86_64-unknown-linux-gnu-install_only_stripped.tar.gz
ENV SHA256SUMS=https://github.com/astral-sh/python-build-standalone/releases/download/${STANDALONE_TAG}/SHA256SUMS

RUN curl -fsSLO --compressed ${PYTHON_URL} \
    && curl -fsSLO --compressed ${SHA256SUMS} \
    && CPYTHON=$(echo cpython-*.gz) \
    && echo $(grep ${CPYTHON} SHA256SUMS) | sha256sum --check \
    && tar -xzf $CPYTHON -C /usr/local --strip-components=1 --no-same-owner \
    && rm -f $CPYTHON $CPYTHON.sha256 \
    && python3 --version


# Add some other utilities that come in handy
RUN set -ex; \
	apt-get update; \
	apt-get install -y --no-install-recommends \
        bash \
        dos2unix \
        jq \
    ; \
	rm -rf /var/lib/apt/lists/*

SHELL ["/bin/bash", "-l"]