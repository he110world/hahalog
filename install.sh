#!/usr/bin/env bash

#nodejs
if [ ! -x "$(command -v node)" ]; then
	curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
	sudo apt install -y nodejs build-essential
fi

#lualog
if [ ! -x "$(command -v lualog)" ]; then
	sudo npm i -g lualog
fi
