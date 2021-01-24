# Audio eXperiment eXplorer

Minimalistic SPA made with `flask` and `React` to explore relationships between audio generative models.

Still in early development!

## Installation

1. Install Docker and docker-compose
    - [on Mac OS](https://docs.docker.com/docker-for-mac/install/)
    - [on Linux](https://docs.docker.com/engine/install/ubuntu/) (make sure to follow the [Post-installation steps](https://docs.docker.com/engine/install/linux-postinstall/) also)

2. open a terminal and clone this repo with

```bash
git clone https://github.com/k-tonal/axx.git
```

3. build the containers with

```bash
cd axx
docker-compose build .
```

## Run the App

make sure `axx/` is your current working directory and type in your terminal

```bash
docker-compose up
```

> Note : you will require a token from neptune.ai stored in your environment

Type `Ctrl+C` to terminate the App