<img src="https://imgur.com/4zm0ju6.png" />

<div style="display: flex; justify-content: center; gap: 16px; align-items: center;">

![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
[![Pydantic v2](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/pydantic/pydantic/main/docs/badge/v2.json)](https://pydantic.dev)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)

</div>

> Incidental is still in it's early stage of development, so there may be some teething problems along the way. Please let us know of any suggestions, bugs, ideas, etc using Github issues. We'll use your feedback to improve

# Incidental is an open-source incident management platform

- [x] ChatOps: Declare and manage your incidents all within your Slack workspace
- [x] Web UI: Easy to use web interface to manage your incidents
- [ ] Custom fields
- [ ] Custom workflows

# Quick start

Requirements:

- docker
- docker-compose
- pnpm
- node v18

To run locally for development:

1. Create a new slack application here: https://api.slack.com/apps
2. Copy `backend/.env.example` to `backend/.env` and update the slack specific environment variables
3. Copy `frontend/.env.example` to `frontend/.env`
4. In `backend` run `make run-dev`
5. In `frontend` run `make run-dev`
6. Goto `http://localhost:3000` and create an account

# Resources

- [Website](https://incidental.dev)
- If you have any questions, you can email [hello@incidental.dev](mailto:hello@incidental.dev)
