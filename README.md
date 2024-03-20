<img src="https://private-user-images.githubusercontent.com/318652/314687427-6e972499-7a93-481d-a4bb-ea93bcce8e95.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3MTA5NzEyNjQsIm5iZiI6MTcxMDk3MDk2NCwicGF0aCI6Ii8zMTg2NTIvMzE0Njg3NDI3LTZlOTcyNDk5LTdhOTMtNDgxZC1hNGJiLWVhOTNiY2NlOGU5NS5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjQwMzIwJTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI0MDMyMFQyMTQyNDRaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT1mMjlmYzZhMWRiNWZkMzk0MDQ4Yzc3ZDEwMjM4NjE4ZTNlYmY5Mzk3MzcxZjQ1ZWNhYzA5ZDQwYTgyYTliZjlhJlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCZhY3Rvcl9pZD0wJmtleV9pZD0wJnJlcG9faWQ9MCJ9.c-K69fip7VXjBrM2NqJC6WfTKpCdEO1GV047IpBzrPI">

# Incidental is an open-source incident management platform

- Declare and manage your incidents all within your Slack workspace
- Easy to use web interface to manage your incidents
- Deploy to your own private cloud, or host on-premise
- Coming soon: custom fields
- Coming soon: custom workflows

# Quick start

Requirements:

- docker
- docker-compose
- pnpm
- node v18.18.2

To run locally for development:

1. Create a new slack application here: https://api.slack.com/apps
2. Copy `backend/.env.example` to `backend/.env` and update the slack specific environment variables
3. Copy `frontend/.env.example` to `frontend/.env`
4. In `backend` run `make run-dev`
5. In `frontend` run `pnpm run dev`
6. Goto `http://localhost:3000` and create an account

# Resources

- [Website](https://incidental.dev)
- If you have any questions, you can email [hello@incidental.dev](mailto:hello@incidental.dev)
