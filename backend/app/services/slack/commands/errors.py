from app.schemas.slack import SlackCommandDataSchema


class CommandError(Exception):
    pass


class InvalidUsageError(CommandError):
    def __init__(self, message: str, command: SlackCommandDataSchema, *args: object) -> None:
        super().__init__(*args)

        self.message = message
        self.command = command
