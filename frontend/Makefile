run-dev:
	. ${HOME}/.nvm/nvm.sh && nvm use && pnpm run dev

build:
	. ${HOME}/.nvm/nvm.sh && nvm use && pnpm run build

build-image: build
	docker build . -t incidental/frontend:latest

test:
	source ${HOME}/.nvm/nvm.sh && nvm use && pnpm run test
